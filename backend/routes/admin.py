"""
Admin Management Routes
Provides endpoints for administrative statistics and management.
Protected with JWT authentication and admin role check.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
import bcrypt

from app import get_db
from .notifications import create_notification

admin_bp = Blueprint("admin", __name__)

def admin_required(fn):
    """Decorator to check if user has admin or super_admin role."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        db = get_db()
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user or user.get("role") not in ("admin", "super_admin"):
            return jsonify({"success": False, "message": "Admin privileges required."}), 403
        return fn(*args, **kwargs)
    return wrapper

def course_management_required(fn):
    """Decorator to check if user has course_manager, admin or super_admin role."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        db = get_db()
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user or user.get("role") not in ("admin", "super_admin", "course_manager"):
            return jsonify({"success": False, "message": "Course Management privileges required."}), 403
        return fn(*args, **kwargs)
    return wrapper

# ── Stats ──

@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
@admin_required
def get_stats():
    """Aggregate stats for the admin dashboard."""
    db = get_db()
    
    now = datetime.now(timezone.utc)
    from datetime import timedelta
    first_day_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    first_day_last_month = (first_day_this_month - timedelta(days=1)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    def get_trend(collection, date_field):
        this_month = db[collection].count_documents({date_field: {"$gte": first_day_this_month}})
        last_month = db[collection].count_documents({date_field: {"$gte": first_day_last_month, "$lt": first_day_this_month}})
        
        if last_month == 0:
            return f"+{this_month * 100}%" if this_month > 0 else "+0%"
        
        pct = ((this_month - last_month) / last_month) * 100
        return f"+{int(pct)}%" if pct >= 0 else f"{int(pct)}%"
        
    total_users = db["users"].count_documents({})
    interns = db["users"].count_documents({"user_type": "Intern"})
    active_jobs = db["jobs"].count_documents({"is_active": True})
    total_applications = db["applications"].count_documents({})
    total_events = db["events"].count_documents({})
    total_courses = db["courses"].count_documents({})
    iv_students = db["users"].count_documents({"user_type": "Industrial Student"})
    trainees = db["users"].count_documents({"user_type": "Trainee"})
    alumni = db["users"].count_documents({"user_type": "Alumni"})
    staff = db["users"].count_documents({"user_type": "Staff"})
    total_managers = db["users"].count_documents({"role": {"$in": ["event_manager", "course_manager", "job_recruiter"]}})

    trends = {
        "users": get_trend("users", "created_at"),
        "jobs": get_trend("jobs", "createdAt"),
        "applications": get_trend("applications", "applied_at"),
        "events": "Live"  # Events typically say Live or could also be a trend
    }

    # Calculate monthly growth (users registered per month for the current year)
    monthly_growth = [0] * 12
    current_year = now.year
    pipeline = [
        {"$match": {"created_at": {"$gte": datetime(current_year, 1, 1, tzinfo=timezone.utc)}}},
        {"$group": {"_id": {"$month": "$created_at"}, "count": {"$sum": 1}}}
    ]
    for doc in db["users"].aggregate(pipeline):
        if doc["_id"]:
            monthly_growth[doc["_id"] - 1] = doc["count"]
            
    # For a better visual if data is sparse (since this is a new portal), we might want to scale it or just send raw.
    # Raw is accurate.
    
    return jsonify({
        "success": True,
        "data": {
            "stats": {
                "total_users": total_users,
                "interns": interns,
                "active_jobs": active_jobs,
                "applications": total_applications,
                "total_events": total_events,
                "total_courses": total_courses,
                "iv_students": iv_students,
                "trainees": trainees,
                "alumni": alumni,
                "staff": staff,
                "total_managers": total_managers,
                "trends": trends,
                "monthly_growth": monthly_growth,
                "distribution": {
                    "Alumni": alumni,
                    "IV Students": iv_students,
                    "Interns": interns,
                    "Staff": staff,
                    "Trainees": trainees
                }
            }
        }
    }), 200

@admin_bp.route("/activity", methods=["GET"])
@jwt_required()
@admin_required
def get_activity():
    """Get recent global activity for the admin dashboard."""
    db = get_db()
    
    # Recent Users
    recent_users = db["users"].find({}, {"full_name": 1, "created_at": 1}).sort("created_at", -1).limit(5)
    # Recent Jobs
    recent_jobs = db["jobs"].find({}, {"title": 1, "createdAt": 1}).sort("createdAt", -1).limit(5)
    # Recent Apps
    recent_apps = db["applications"].find({}, {"job_id": 1, "user_id": 1, "applied_at": 1}).sort("applied_at", -1).limit(5)
    
    activities = []
    
    for u in recent_users:
        activities.append({
            "user": u.get("full_name", "User"),
            "action": "joined the platform",
            "time": u.get("created_at").isoformat() if hasattr(u.get("created_at"), "isoformat") else "Recently",
            "avatar": u.get("full_name", "U")[0].upper()
        })
        
    for j in recent_jobs:
        activities.append({
            "user": "System",
            "action": f"posted new job: {j.get('title')}",
            "time": j.get("createdAt").isoformat() if hasattr(j.get("createdAt"), "isoformat") else "Recently",
            "avatar": "SJ"
        })
        
    for a in recent_apps:
        user = db["users"].find_one({"_id": a["user_id"]}, {"full_name": 1})
        job = db["jobs"].find_one({"_id": a["job_id"]}, {"title": 1})
        activities.append({
            "user": user.get("full_name", "Applicant") if user else "Applicant",
            "action": f"applied for {job.get('title')}" if job else "applied for a job",
            "time": a.get("applied_at").isoformat() if hasattr(a.get("applied_at"), "isoformat") else "Recently",
            "avatar": "AP"
        })
        
    # Sort all by time (we'd need real datetime objects for perfect sort, but this is a good start)
    # Since we added them in blocks, we can just return the combined list or sort if we have dates.
    
    return jsonify({
        "success": True,
        "data": {"activities": activities[:10]}
    }), 200

@admin_bp.route("/audit-logs", methods=["GET"])
@jwt_required()
@admin_required
def get_audit_logs():
    """Get the 5 most recent administrative audit logs."""
    db = get_db()
    
    # We can aggregate various events as "audit logs"
    logs = []
    
    # 1. Recent Role Changes (look at updated users)
    recent_managers = db["users"].find({"role": {"$ne": "user"}}, {"full_name": 1, "role": 1, "updated_at": 1}).sort("updated_at", -1).limit(3)
    for m in recent_managers:
        logs.append({
            "id": f"role_{m['_id']}",
            "action": "Role Hierarchy Update",
            "user": "System Admin",
            "target": f"{m.get('full_name')} ({m.get('role')})",
            "time": m.get("updated_at").isoformat() if hasattr(m.get("updated_at"), "isoformat") else "Recently",
            "type": "security"
        })
        
    # 2. Recent Jobs
    recent_jobs = db["jobs"].find({}, {"title": 1, "createdAt": 1}).sort("createdAt", -1).limit(2)
    for j in recent_jobs:
        logs.append({
            "id": f"job_{j['_id']}",
            "action": "New Job Publication",
            "user": "Recruiter Portal",
            "target": j.get("title"),
            "time": j.get("createdAt").isoformat() if hasattr(j.get("createdAt"), "isoformat") else "Recently",
            "type": "data"
        })
        
    # Sort and return
    return jsonify({
        "success": True,
        "data": {"logs": logs[:5]}
    }), 200

# ── Manager Listing ──

@admin_bp.route("/managers", methods=["GET"])
@jwt_required()
@admin_required
def get_all_managers():
    """List all users with manager roles (event_manager, course_manager, job_recruiter)."""
    db = get_db()
    manager_roles = ["event_manager", "course_manager", "job_recruiter"]
    managers_cursor = db["users"].find({"role": {"$in": manager_roles}}).sort("created_at", -1)

    managers_list = []
    for m in managers_cursor:
        managers_list.append({
            "id": str(m["_id"]),
            "full_name": m.get("full_name", "Unknown"),
            "email": m.get("email", ""),
            "role": m.get("role", ""),
            "emp_id": m.get("emp_id", ""),
            "phone": m.get("phone", ""),
            "user_type": m.get("user_type", ""),
            "profile_picture": m.get("profile_picture"),
            "is_active": m.get("is_active", True),
            "created_at": m.get("created_at").isoformat() if hasattr(m.get("created_at", ""), "isoformat") else None,
        })

    return jsonify({
        "success": True,
        "data": {"managers": managers_list}
    }), 200

# ── User Management ──

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def get_all_users():
    """List all users for management. Supports ?type= filter."""
    db = get_db()
    
    query = {}
    user_type = request.args.get("type")
    if user_type:
        query["user_type"] = user_type
    
    users_cursor = db["users"].find(query).sort("created_at", -1)
    
    users_list = []
    for u in users_cursor:
        u["id"] = str(u["_id"])
        del u["_id"]
        if "password" in u:
            del u["password"]
        if "created_at" in u and hasattr(u["created_at"], "isoformat"):
            u["created_at"] = u["created_at"].isoformat()
        if "updated_at" in u and hasattr(u["updated_at"], "isoformat"):
            u["updated_at"] = u["updated_at"].isoformat()
        if "last_login" in u and u["last_login"] and hasattr(u["last_login"], "isoformat"):
            u["last_login"] = u["last_login"].isoformat()
        users_list.append(u)
        
    return jsonify({
        "success": True,
        "data": {"users": users_list}
    }), 200

@admin_bp.route("/users/<user_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_user_details(user_id):
    """Get full details of a specific user for admin view/edit."""
    db = get_db()
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
    except:
        return jsonify({"success": False, "message": "Invalid user ID."}), 400
        
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404
        
    user["id"] = str(user.pop("_id"))
    if "password" in user:
        del user["password"]
    
    # Convert dates to ISO
    for field in ["created_at", "updated_at", "last_login"]:
        if field in user and hasattr(user[field], "isoformat"):
            user[field] = user[field].isoformat()
            
    # Include administrative stats
    user["application_count"] = db["applications"].count_documents({"user_id": ObjectId(user_id)})
            
    return jsonify({
        "success": True,
        "data": {"user": user}
    }), 200

@admin_bp.route("/users/bulk-history", methods=["GET"])
@jwt_required()
@admin_required
def get_bulk_upload_history():
    """List recent bulk upload operations."""
    db = get_db()
    history_cursor = db["bulk_upload_history"].find().sort("timestamp", -1).limit(20)
    
    history_list = []
    for h in history_cursor:
        h["id"] = str(h.pop("_id"))
        if "timestamp" in h and hasattr(h["timestamp"], "isoformat"):
            h["timestamp"] = h["timestamp"].isoformat()
        history_list.append(h)
        
    return jsonify({
        "success": True,
        "data": {"history": history_list}
    }), 200

@admin_bp.route("/users", methods=["POST"])
@jwt_required()
@admin_required
def create_user():
    """Create a new user manually by an admin."""
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({"success": False, "message": "Email and password required."}), 400
        
    db = get_db()
    
    # Secure role assignment: Only super_admin can create admin or super_admin users
    creator_id = get_jwt_identity()
    creator = db["users"].find_one({"_id": ObjectId(creator_id)})
    requested_role = data.get("role", "user")
    
    if requested_role in ("admin", "super_admin"):
        if not creator or creator.get("role") != "super_admin":
            return jsonify({
                "success": False, 
                "message": "Access denied. Only Super Admin can create Admin or Super Admin accounts."
            }), 403

    if db["users"].find_one({"email": data["email"].strip().lower()}):
        return jsonify({"success": False, "message": "Email already exists."}), 409
        
    hashed_pw = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt()).decode('utf-8')
    now = datetime.now(timezone.utc)
    
    user_doc = {
        "full_name": data.get("full_name", "New User"),
        "email": data["email"].strip().lower(),
        "password": hashed_pw,
        "phone": data.get("phone", ""),
        "emp_id": data.get("emp_id", ""),
        "user_type": data.get("user_type", "Alumni"),
        "batch": data.get("batch", "N/A"),
        "specialization": data.get("specialization", "N/A"),
        "role": data.get("role", "user"),
        "is_active": True,
        "is_email_verified": True,
        "profile_picture": None,
        "bio": None,
        "linkedin_url": None,
        "skills": [],
        "created_at": now,
        "updated_at": now,
        "last_login": None,
    }
    
    result = db["users"].insert_one(user_doc)
    return jsonify({
        "success": True,
        "message": "User created successfully.",
        "data": {"id": str(result.inserted_id)}
    }), 201

@admin_bp.route("/users/bulk-add", methods=["POST"])
@jwt_required()
@admin_required
def bulk_add_users():
    """Bulk create users from an admin-provided list."""
    data = request.get_json()
    if not data or "users" not in data or not isinstance(data["users"], list):
        return jsonify({"success": False, "message": "List of users required."}), 400
        
    db = get_db()
    input_users = data["users"]
    added_count = 0
    skipped_count = 0
    errors = []
    
    now = datetime.now(timezone.utc)
    # Default password for bulk created users
    default_pw_str = "Welcome@NeST2024"
    default_hashed_pw = bcrypt.hashpw(default_pw_str.encode("utf-8"), bcrypt.gensalt())
    
    for idx, u in enumerate(input_users):
        email = u.get("email", "").strip().lower()
        if not email:
            errors.append(f"Row {idx+1}: Missing email.")
            skipped_count += 1
            continue
            
        if db["users"].find_one({"email": email}):
            skipped_count += 1
            continue
            
        try:
            # Individual hash for better security and ensuring string storage
            user_hashed_pw = bcrypt.hashpw(default_pw_str.encode("utf-8"), bcrypt.gensalt()).decode('utf-8')
            
            user_doc = {
                "full_name": u.get("full_name", "User"),
                "email": email,
                "password": user_hashed_pw,
                "phone": u.get("phone", ""),
                "user_type": u.get("user_type", "Alumni"),
                "batch": u.get("batch", "N/A"),
                "specialization": u.get("specialization", "N/A"),
                "role": u.get("role", "user"),
                "is_active": True,
                "is_email_verified": True,
                "profile_picture": None,
                "bio": u.get("bio"),
                "linkedin_url": u.get("linkedin_url"),
                "skills": u.get("skills", []),
                "created_at": now,
                "updated_at": now,
                "last_login": None,
            }
            db["users"].insert_one(user_doc)
            added_count += 1
        except Exception as e:
            errors.append(f"Row {idx+1} ({email}): {str(e)}")
            skipped_count += 1

    # Log to History Collection as requested ("store details in database too")
    db["bulk_upload_history"].insert_one({
        "admin_id": ObjectId(get_jwt_identity()),
        "timestamp": now,
        "filename": data.get("filename", "unknown_import.xlsx"),
        "added_count": added_count,
        "skipped_count": skipped_count,
        "total_attempted": len(input_users),
        "errors": errors
    })
            
    return jsonify({
        "success": True,
        "message": f"Successfully added {added_count} users. Skipped/Failed {skipped_count}.",
        "data": {
            "added_count": added_count,
            "skipped_count": skipped_count,
            "errors": errors
        }
    }), 201

@admin_bp.route("/users/<user_id>", methods=["PATCH"])
@jwt_required()
@admin_required
def update_user_status(user_id):
    """Update user: toggle active status, change role, or edit fields."""
    data = request.get_json()
    db = get_db()
    # Secure role updates: Only super_admin can set a role to admin or super_admin
    requested_role = data.get("role")
    if requested_role and requested_role in ("admin", "super_admin"):
        creator_id = get_jwt_identity()
        creator = db["users"].find_one({"_id": ObjectId(creator_id)})
        if not creator or creator.get("role") != "super_admin":
            return jsonify({
                "success": False, 
                "message": "Access denied. Only Super Admin can assign Admin or Super Admin roles."
            }), 403

    allowed_fields = ["is_active", "role", "full_name", "phone", "emp_id", "user_type", "batch", "specialization", "password"]
    update_data = {}
    for field in allowed_fields:
        if field in data:
            if field == "password" and data[field]:
                update_data["password"] = bcrypt.hashpw(data[field].encode("utf-8"), bcrypt.gensalt()).decode('utf-8')
            else:
                update_data[field] = data[field]
        
    if not update_data:
        return jsonify({"success": False, "message": "Nothing to update."}), 400
    
    update_data["updated_at"] = datetime.now(timezone.utc)
        
    db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    return jsonify({"success": True, "message": "User updated successfully."}), 200

@admin_bp.route("/users/<user_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Delete a user account."""
    db = get_db()
    
    try:
        result = db["users"].delete_one({"_id": ObjectId(user_id)})
    except:
        return jsonify({"success": False, "message": "Invalid user ID."}), 400
    
    if result.deleted_count == 0:
        return jsonify({"success": False, "message": "User not found."}), 404
    
    # Clean up related data
    uid = ObjectId(user_id)
    db["applications"].delete_many({"user_id": uid})
    db["notifications"].delete_many({"user_id": uid})
    
    return jsonify({"success": True, "message": "User deleted successfully."}), 200

@admin_bp.route("/users/bulk-delete", methods=["POST"])
@jwt_required()
@admin_required
def bulk_delete_users():
    """Bulk delete multiple user accounts."""
    db = get_db()
    data = request.get_json() or {}
    user_ids = data.get("user_ids", [])
    
    if not user_ids:
        return jsonify({"success": False, "message": "No user IDs provided."}), 400
        
    try:
        object_ids = [ObjectId(uid) for uid in user_ids]
    except Exception:
        return jsonify({"success": False, "message": "One or more invalid user IDs."}), 400
        
    result = db["users"].delete_many({"_id": {"$in": object_ids}})
    
    # Clean up related data
    db["applications"].delete_many({"user_id": {"$in": object_ids}})
    db["notifications"].delete_many({"user_id": {"$in": object_ids}})
    
    return jsonify({"success": True, "message": f"Successfully deleted {result.deleted_count} users."}), 200

# ── Job Management ──

@admin_bp.route("/jobs", methods=["GET"])
@jwt_required()
@admin_required
def get_all_jobs():
    """List all jobs for admin management."""
    db = get_db()
    jobs_cursor = db["jobs"].find().sort("createdAt", -1)
    
    jobs_list = []
    for j in jobs_cursor:
        j["id"] = str(j["_id"])
        del j["_id"]
        if "createdAt" in j and hasattr(j["createdAt"], "isoformat"):
            j["createdAt"] = j["createdAt"].isoformat()
        jobs_list.append(j)
        
    return jsonify({
        "success": True,
        "data": {"jobs": jobs_list}
    }), 200

@admin_bp.route("/jobs", methods=["POST"])
@jwt_required()
@admin_required
def add_job():
    """Add a new job listing."""
    data = request.get_json()
    db = get_db()
    
    if not data or not data.get("title"):
        return jsonify({"success": False, "message": "Job title is required."}), 400
    
    job_doc = {
        "title": data.get("title"),
        "company": data.get("company", ""),
        "location": data.get("location", ""),
        "salary": data.get("salary", ""),
        "type": data.get("type", "Full-time"),  # Full-time, Part-time, Internship, Contract
        "description": data.get("description", ""),
        "requirements": data.get("requirements", []),
        "skills_required": data.get("skills_required", []),
        "experience_level": data.get("experience_level", "Entry Level"),
        "is_active": True,
        "is_urgent": data.get("is_urgent", False),
        "posted_by": get_jwt_identity(),
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = db["jobs"].insert_one(job_doc)
    
    # Notify all users
    try:
        from .notifications import create_notification
        users_cursor = db["users"].find({"role": {"$ne": "admin"}})
        for user in users_cursor:
            create_notification(
                db,
                user["_id"],
                "job",
                f"New Job Opportunity: {job_doc['title']}",
                f"{job_doc['company']} is hiring for {job_doc['title']} in {job_doc['location']}. Apply now!",
                "/jobs"
            )
    except Exception as e:
        print(f"Notification error: {e}")

    return jsonify({
        "success": True, 
        "message": "Job posted successfully and notifications sent.",
        "data": {"id": str(result.inserted_id)}
    }), 201

@admin_bp.route("/jobs/<job_id>", methods=["PATCH"])
@jwt_required()
@admin_required
def update_job(job_id):
    """Update a job listing."""
    data = request.get_json()
    db = get_db()
    
    allowed_fields = ["title", "company", "location", "salary", "type", "description", 
                       "requirements", "skills_required", "experience_level", "is_active", "is_urgent"]
    update_data = {}
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
    
    if not update_data:
        return jsonify({"success": False, "message": "Nothing to update."}), 400
    
    update_data["updatedAt"] = datetime.now(timezone.utc)
    
    db["jobs"].update_one({"_id": ObjectId(job_id)}, {"$set": update_data})
    return jsonify({"success": True, "message": "Job updated successfully."}), 200

@admin_bp.route("/jobs/<job_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_job(job_id):
    """Delete a job listing."""
    db = get_db()
    
    try:
        result = db["jobs"].delete_one({"_id": ObjectId(job_id)})
    except:
        return jsonify({"success": False, "message": "Invalid job ID."}), 400
    
    if result.deleted_count == 0:
        return jsonify({"success": False, "message": "Job not found."}), 404
    
    return jsonify({"success": True, "message": "Job deleted successfully."}), 200

# ── Course Management ──

@admin_bp.route("/courses", methods=["GET"])
@jwt_required()
@course_management_required
def get_all_courses():
    """List all courses for admin management."""
    db = get_db()
    courses_cursor = db["courses"].find().sort("createdAt", -1)
    
    courses_list = []
    for c in courses_cursor:
        c["id"] = str(c["_id"])
        
        # Count enrollments for this course
        enrolled_count = db["course_enrollments"].count_documents({"course_id": c["_id"]})
        c["enrolled_count"] = enrolled_count
        
        del c["_id"]
        if "createdAt" in c and hasattr(c["createdAt"], "isoformat"):
            c["createdAt"] = c["createdAt"].isoformat()
        courses_list.append(c)
        
    return jsonify({
        "success": True,
        "data": {"courses": courses_list}
    }), 200

@admin_bp.route("/courses", methods=["POST"])
@jwt_required()
@course_management_required
def add_course():
    """Add a new course."""
    data = request.get_json()
    print(f"DEBUG: add_course payload: {data}")
    db = get_db()
    
    if not data or not data.get("title"):
        return jsonify({"success": False, "message": "Course title is required."}), 400
    
    course_doc = {
        "title": data.get("title"),
        "description": data.get("description", ""),
        "instructor": data.get("instructor", "NeST Expert Instructor"), 
        "duration": data.get("duration", "4h"),
        "level": data.get("level", "Beginner"),
        "category": data.get("category", "General"),
        "start_date": data.get("start_date", "On Demand"),
        "certification": data.get("certification", "Standard Achievement"),
        "access_level": data.get("access_level", "Open Access"),
        "thumbnail": data.get("cover_image") or data.get("thumbnail", ""),
        "cover_image": data.get("cover_image") or data.get("thumbnail", ""),
        "video_url": data.get("videoUrl") or data.get("video_url", ""),
        "links": data.get("links", []),
        "modules": data.get("modules", []),
        "required_assessments": data.get("required_assessments", [1, 2, 3, 4, 5]),
        "is_published": data.get("is_published", True),
        "created_by": get_jwt_identity(),
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = db["courses"].insert_one(course_doc)
    
    # Notify all users across all roles
    try:
        from .notifications import create_notification
        users_cursor = db["users"].find({}) # Empty query = All Users
        for user in users_cursor:
            create_notification(
                db,
                user["_id"],
                "system",
                f"New Course: {course_doc['title']}",
                f"New learning content available: {course_doc['title']} by {course_doc['instructor']}. Check it out!",
                "/courses"
            )
    except Exception as e:
        print(f"Notification error: {e}")

    return jsonify({
        "success": True,
        "message": "Course created successfully and notifications dispatched.",
        "data": {"id": str(result.inserted_id)}
    }), 201

@admin_bp.route("/courses/<course_id>", methods=["PATCH"])
@jwt_required()
@course_management_required
def update_course(course_id):
    """Update a course."""
    data = request.get_json()
    db = get_db()
    
    allowed_fields = ["title", "description", "instructor", "duration", "level",
                       "category", "thumbnail", "cover_image", "video_url", "modules", 
                       "required_assessments", "is_published", "certification", 
                       "access_level", "start_date"]
    update_data = {}
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
    
    if not update_data:
        return jsonify({"success": False, "message": "Nothing to update."}), 400
    
    update_data["updatedAt"] = datetime.now(timezone.utc)
    
    db["courses"].update_one({"_id": ObjectId(course_id)}, {"$set": update_data})
    return jsonify({"success": True, "message": "Course updated successfully."}), 200

@admin_bp.route("/courses/<course_id>", methods=["DELETE"])
@jwt_required()
@course_management_required
def delete_course(course_id):
    """Delete a course."""
    db = get_db()
    
    try:
        result = db["courses"].delete_one({"_id": ObjectId(course_id)})
    except:
        return jsonify({"success": False, "message": "Invalid course ID."}), 400
    
    if result.deleted_count == 0:
        return jsonify({"success": False, "message": "Course not found."}), 404
    
    return jsonify({"success": True, "message": "Course deleted successfully."}), 200

# ── Event Management ──

@admin_bp.route("/events", methods=["GET"])
@jwt_required()
@admin_required
def get_all_events():
    """List all events for admin management."""
    db = get_db()
    events_cursor = db["events"].find().sort("date", -1)
    
    events_list = []
    for e in events_cursor:
        e["id"] = str(e["_id"])
        del e["_id"]
        e["attendees_count"] = len(e.get("attendees", []))
        if "attendees" in e:
            del e["attendees"]
        events_list.append(e)
        
    return jsonify({
        "success": True,
        "data": {"events": events_list}
    }), 200

@admin_bp.route("/events", methods=["POST"])
@jwt_required()
@admin_required
def add_event():
    """Create a new event."""
    data = request.get_json()
    db = get_db()
    
    if not data or not data.get("title"):
        return jsonify({"success": False, "message": "Event title is required."}), 400
    
    event_doc = {
        "title": data.get("title"),
        "description": data.get("description", ""),
        "date": data.get("date", ""),
        "time": data.get("time", ""),
        "location": data.get("location", "Virtual"),
        "category": data.get("category", "General"),
        "organizer": data.get("organizer", "NeST Alumni Association"),
        "cover_image": data.get("cover_image", ""),
        "max_attendees": data.get("max_attendees", 0),
        "attendees": [],
        "is_active": True,
        "created_by": get_jwt_identity(),
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = db["events"].insert_one(event_doc)
    
    # Send notifications to all target users
    try:
        from .notifications import create_notification
        users_cursor = db["users"].find({"role": {"$ne": "admin"}})
        for user in users_cursor:
            create_notification(
                db,
                user["_id"],
                "event",
                f"New Event: {event_doc['title']}",
                f"A new event has been scheduled for {event_doc['date']}. View details and register now!",
                "/events"
            )
    except Exception as e:
        print(f"Notification error: {e}")

    return jsonify({
        "success": True,
        "message": "Event created successfully and notifications dispatched.",
        "data": {"id": str(result.inserted_id)}
    }), 201

@admin_bp.route("/events/<event_id>", methods=["PATCH"])
@jwt_required()
@admin_required
def update_event(event_id):
    """Update an event."""
    data = request.get_json()
    db = get_db()
    
    allowed_fields = ["title", "description", "date", "time", "location",
                       "category", "organizer", "cover_image", "max_attendees", "is_active"]
    update_data = {}
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
    
    if not update_data:
        return jsonify({"success": False, "message": "Nothing to update."}), 400
    
    update_data["updatedAt"] = datetime.now(timezone.utc)
    
    db["events"].update_one({"_id": ObjectId(event_id)}, {"$set": update_data})
    return jsonify({"success": True, "message": "Event updated successfully."}), 200

@admin_bp.route("/events/<event_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_event(event_id):
    """Delete an event."""
    db = get_db()
    
    try:
        result = db["events"].delete_one({"_id": ObjectId(event_id)})
    except:
        return jsonify({"success": False, "message": "Invalid event ID."}), 400
    
    if result.deleted_count == 0:
        return jsonify({"success": False, "message": "Event not found."}), 404
    
    return jsonify({"success": True, "message": "Event deleted successfully."}), 200

# ── Visit Management (IV Students) ──

@admin_bp.route("/visits", methods=["GET"])
@jwt_required()
@admin_required
def get_all_visits():
    """List all industrial visits."""
    db = get_db()
    visits_cursor = db["visits"].find().sort("date", -1)
    
    visits_list = []
    for v in visits_cursor:
        v["id"] = str(v["_id"])
        del v["_id"]
        visits_list.append(v)
        
    return jsonify({
        "success": True,
        "data": {"visits": visits_list}
    }), 200

@admin_bp.route("/visits", methods=["POST"])
@jwt_required()
@admin_required
def add_visit():
    """Schedule a new industrial visit."""
    data = request.get_json()
    db = get_db()
    
    visit_doc = {
        "college": data.get("college"),
        "branch": data.get("branch"),
        "date": data.get("date"),
        "students_count": data.get("students_count"),
        "coordinator_name": data.get("coordinator_name"),
        "coordinator_email": data.get("coordinator_email"),
        "coordinator_phone": data.get("coordinator_phone"),
        "notes": data.get("notes"),
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db["visits"].insert_one(visit_doc)
    return jsonify({
        "success": True,
        "message": "Visit scheduled successfully.",
        "data": {"id": str(result.inserted_id)}
    }), 201

@admin_bp.route("/visits/<visit_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_visit(visit_id):
    """Delete a visit record."""
    db = get_db()
    db["visits"].delete_one({"_id": ObjectId(visit_id)})
    return jsonify({"success": True, "message": "Visit deleted successfully."}), 200

# ── Application Management ──

@admin_bp.route("/applications", methods=["GET"])
@jwt_required()
@admin_required
def get_all_applications():
    """List all job applications with applicant and job details."""
    db = get_db()
    
    apps_cursor = db["applications"].find().sort("applied_at", -1)
    
    apps_list = []
    for a in apps_cursor:
        app_data = {
            "id": str(a["_id"]),
            "status": a.get("status", "pending"),
            "cover_letter": a.get("cover_letter", ""),
            "applied_at": a.get("applied_at").isoformat() if a.get("applied_at") else None,
        }
        
        # Populate job info
        if a.get("job_id"):
            try:
                job = db["jobs"].find_one({"_id": ObjectId(a["job_id"])})
                if job:
                    app_data["job_title"] = job.get("title", "")
                    app_data["job_company"] = job.get("company", "")
            except:
                pass
        
        # Populate user info
        if a.get("user_id"):
            try:
                user = db["users"].find_one({"_id": ObjectId(a["user_id"])})
                if user:
                    app_data["applicant_name"] = user.get("full_name", "")
                    app_data["applicant_email"] = user.get("email", "")
            except:
                pass
        
        apps_list.append(app_data)
        
    return jsonify({
        "success": True,
        "data": {"applications": apps_list}
    }), 200

@admin_bp.route("/applications/<app_id>/status", methods=["PATCH"])
@jwt_required()
@admin_required
def update_application_status(app_id):
    """Update the status of an application (pending/reviewed/shortlisted/rejected/hired)."""
    data = request.get_json()
    db = get_db()
    
    valid_statuses = ["Applied", "Aptitude", "Shortlisted", "Interview Scheduled", "Offered", "Rejected"]
    new_status = data.get("status")
    
    if new_status not in valid_statuses:
        return jsonify({
            "success": False, 
            "message": f"Status must be one of: {', '.join(valid_statuses)}"
        }), 400
    
    # Get application to notify user
    app_doc = db["applications"].find_one({"_id": ObjectId(app_id)})
    if not app_doc:
        return jsonify({"success": False, "message": "Application not found."}), 404
        
    job = db["jobs"].find_one({"_id": app_doc["job_id"]})

    db["applications"].update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
    )

    # Notify student
    create_notification(
        db,
        user_id=app_doc["user_id"],
        type_str="info",
        title="Application Update",
        message=f"Admin updated your application status for '{job.get('title')}' to '{new_status}'.",
        link="/jobs/applications"
    )
    
    return jsonify({"success": True, "message": f"Application status updated to '{new_status}'."}), 200

# ── Assessment Management ──

@admin_bp.route("/assessments/pending", methods=["GET"])
@jwt_required()
@admin_required
def get_pending_assessments():
    """List all assessment submissions awaiting review."""
    db = get_db()
    
    # Stages 2, 3, 4, 5 require review
    stages_to_review = ["2", "3", "4", "5"]
    
    # Find attempts where current_stage status is 'pending'
    pending_list = []
    
    attempts_cursor = db["assessment_attempts"].find({
        "$or": [
            {f"stages.{s}.status": "pending"} for s in stages_to_review
        ]
    })
    
    for attempt in attempts_cursor:
        # Identify which stage is pending
        pending_stage = None
        for s in stages_to_review:
            if attempt["stages"].get(s, {}).get("status") == "pending":
                pending_stage = s
                break
        
        if not pending_stage:
            continue
            
        # Get user info
        user = db["users"].find_one({"_id": attempt["user_id"]})
        # Get course info
        course = db["courses"].find_one({"_id": attempt["course_id"]})
        
        pending_list.append({
            "id": str(attempt["_id"]),
            "user_id": str(attempt["user_id"]),
            "user_name": user.get("full_name") if user else "Unknown User",
            "course_id": str(attempt["course_id"]),
            "course_title": course.get("title") if course else "Unknown Course",
            "stage": int(pending_stage),
            "submission": attempt["stages"][pending_stage].get("submission"),
            "submitted_at": attempt["stages"][pending_stage].get("submitted_at").isoformat() if hasattr(attempt["stages"][pending_stage].get("submitted_at"), "isoformat") else None
        })
        
    return jsonify({
        "success": True,
        "data": {"pending_assessments": pending_list}
    }), 200

@admin_bp.route("/assessments/<attempt_id>/review", methods=["PATCH"])
@jwt_required()
@admin_required
def review_assessment(attempt_id):
    """Approve or reject an assessment stage."""
    data = request.get_json()
    db = get_db()
    
    if not data or "action" not in data or "stage" not in data:
        return jsonify({"success": False, "message": "Action and stage are required."}), 400
        
    action = data["action"] # 'approve' or 'reject'
    stage = str(data["stage"])
    feedback = data.get("feedback", "")
    score = data.get("score", 0)
    
    attempt = db["assessment_attempts"].find_one({"_id": ObjectId(attempt_id)})
    if not attempt:
        return jsonify({"success": False, "message": "Assessment attempt not found."}), 404
        
    now = datetime.now(timezone.utc)
    
    if action == "approve":
        new_status = "passed"
        next_stage = int(stage) + 1
        is_completed = next_stage > 5
        
        update_doc = {
            f"stages.{stage}.status": "passed",
            f"stages.{stage}.feedback": feedback,
            f"stages.{stage}.score": score,
            f"stages.{stage}.reviewed_at": now,
            "updated_at": now
        }
        
        if is_completed:
            update_doc["is_completed"] = True
            # Update enrollment status to completed if this is the final stage
            db["course_enrollments"].update_one(
                {"user_id": attempt["user_id"], "course_id": attempt["course_id"]},
                {"$set": {"status": "Completed", "completed_at": now, "progress": 100}}
            )
        else:
            update_doc["current_stage"] = next_stage
            update_doc[f"stages.{str(next_stage)}.status"] = "not_started"
            
        db["assessment_attempts"].update_one({"_id": ObjectId(attempt_id)}, {"$set": update_doc})
        
        # Notify student
        create_notification(
            db, 
            attempt["user_id"], 
            "info", 
            f"Assessment Stage {stage} Approved!", 
            f"Congratulations! Your submission for Stage {stage} has been approved. {feedback}",
            f"/assessment/{attempt['course_id']}"
        )
        
        return jsonify({"success": True, "message": f"Stage {stage} approved."}), 200
        
    elif action == "reject":
        db["assessment_attempts"].update_one(
            {"_id": ObjectId(attempt_id)},
            {
                "$set": {
                    f"stages.{stage}.status": "rejected",
                    f"stages.{stage}.feedback": feedback,
                    f"stages.{stage}.reviewed_at": now,
                    "updated_at": now
                }
            }
        )
        # Notify student
        create_notification(
            db, 
            attempt["user_id"], 
            "system", 
            f"Revision Needed: Stage {stage}", 
            f"Your submission for Stage {stage} requires revision. Admin feedback: {feedback}",
            f"/assessment/{attempt['course_id']}"
        )
        return jsonify({"success": True, "message": f"Stage {stage} rejected with feedback."}), 200
        
    return jsonify({"success": False, "message": "Invalid action."}), 400

# ── Bulk IV Certification ──

@admin_bp.route("/iv/bulk-issue", methods=["POST"])
@jwt_required()
@admin_required
def bulk_issue_iv_certificates():
    """
    Bulk issue IV certificates to students.
    Payload: { "students": [{ "name", "email", "college", "date", "batch" }, ...] }
    """
    data = request.get_json()
    if not data or "students" not in data:
        return jsonify({"success": False, "message": "Students list is required."}), 400
    
    db = get_db()
    students = data["students"]
    issued_count = 0
    now = datetime.now(timezone.utc)
    
    for s in students:
        email = s.get("email", "").strip().lower()
        if not email:
            continue
            
        cert_doc = {
            "id": f"iv_{ObjectId()}",
            "type": "iv",
            "title": "Industrial Visit Excellence",
            "student_name": s.get("name", "Student"),
            "date": s.get("date", "N/A"),
            "issuer": "NeST Academy",
            "college": s.get("college", "N/A"),
            "batch": s.get("batch", "N/A"),
            "color": "#EF4444",
            "issued_at": now.isoformat()
        }
        
        # Always save to a global issued_iv_certificates collection for name/email lookup
        db["issued_iv_certificates"].update_one(
            {"email": email, "date": s.get("date")},
            {"$set": {
                "name": s.get("name", "").strip(),
                "email": email,
                "college": s.get("college", "N/A"),
                "date": s.get("date", "N/A"),
                "batch": s.get("batch", "N/A"),
                "issued_at": now
            }},
            upsert=True
        )

        # Try to find user by email and update/push to their certificates array
        user_record = db["users"].find_one({"email": email})
        if user_record:
            # Check if an IV cert for this date already exists to overwrite
            user_certs = user_record.get("certificates", [])
            found = False
            for c in user_certs:
                if c.get("type") == "iv" and c.get("date") == s.get("date"):
                    c.update(cert_doc) # Overwrite existing
                    found = True
                    break
            
            if found:
                db["users"].update_one({"_id": user_record["_id"]}, {"$set": {"certificates": user_certs}})
            else:
                db["users"].update_one({"_id": user_record["_id"]}, {"$push": {"certificates": cert_doc}})
            # Notify user
            try:
                create_notification(
                    db,
                    user_id=user_record["_id"],
                    type_str="system",
                    title="IV Certificate Issued!",
                    message=f"Your certificate for the industrial visit is now available on your profile.",
                    link="/profile"
                )
            except:
                pass
            issued_count += 1
        else:
            # If user not found, we already saved it to issued_iv_certificates
            # so they can claim it later or view by name/email match
            print(f"User not found for email: {email} - Saved to global repository")
            
    return jsonify({
        "success": True,
        "message": f"Successfully issued certificates to {issued_count} registered students.",
        "data": {"issued_count": issued_count}
    }), 200

@admin_bp.route("/iv/issued-certificates", methods=["GET"])
@jwt_required()
def get_issued_iv_certificates():
    """Fetch all issued certificates from the global repository."""
    db = get_db()
    certs_cursor = db["issued_iv_certificates"].find().sort("issued_at", -1)
    certs_list = []
    for c in certs_cursor:
        certs_list.append({
            "id": str(c["_id"]),
            "name": c.get("name"),
            "email": c.get("email"),
            "college": c.get("college"),
            "date": c.get("date"),
            "batch": c.get("batch"),
            "issuedAt": c.get("issued_at").isoformat() if hasattr(c.get("issued_at"), "isoformat") else str(c.get("issued_at"))
        })
    return jsonify({
        "success": True,
        "data": {"certificates": certs_list}
    }), 200


# ── Certificate Overview (All Roles) ──

@admin_bp.route("/certificates/overview", methods=["GET"])
@jwt_required()
@admin_required
def get_certificates_overview():
    """
    Get a unified certificate overview across all user types.
    Returns per-user cert records so the admin can see what has been issued.
    """
    db = get_db()
    now = datetime.now(timezone.utc)

    # --- IV students ---
    iv_users = list(db["users"].find({"user_type": "Industrial Student"}))
    iv_list = []
    for u in iv_users:
        issued_certs = [c for c in u.get("certificates", []) if c.get("type") == "iv"]
        iv_list.append({
            "id": str(u["_id"]),
            "full_name": u.get("full_name", ""),
            "email": u.get("email", ""),
            "profile_picture": u.get("profile_picture", ""),
            "college": u.get("college", "N/A"),
            "batch": u.get("batch", "N/A"),
            "cert_status": "Issued" if issued_certs else "Pending",
            "issued_at": issued_certs[-1].get("issued_at", "N/A") if issued_certs else None,
            "cert_count": len(issued_certs),
        })

    # --- Interns ---
    intern_users = list(db["users"].find({"user_type": "Intern"}))
    intern_list = []
    for u in intern_users:
        issued_certs = [c for c in u.get("certificates", []) if c.get("type") == "intern"]
        intern_list.append({
            "id": str(u["_id"]),
            "full_name": u.get("full_name", ""),
            "email": u.get("email", ""),
            "profile_picture": u.get("profile_picture", ""),
            "specialization": u.get("specialization", "General"),
            "batch": u.get("batch", "N/A"),
            "cert_status": "Issued" if issued_certs else "Pending",
            "issued_at": issued_certs[-1].get("issued_at", "N/A") if issued_certs else None,
            "cert_count": len(issued_certs),
        })

    # --- Alumni ---
    # Work experience certificates have been removed completely.
    alumni_list = []

    # --- Course completions ---
    completed_enrollments = list(db["course_enrollments"].find({"status": "Completed"}))
    course_list = []
    for en in completed_enrollments:
        user = db["users"].find_one({"_id": en["user_id"]})
        course = db["courses"].find_one({"_id": en["course_id"]})
        if user and course:
            cert = db["certificates"].find_one({"enrollment_id": en["_id"]})
            course_list.append({
                "id": str(en["_id"]),
                "full_name": user.get("full_name", ""),
                "email": user.get("email", ""),
                "profile_picture": user.get("profile_picture", ""),
                "course_name": course.get("title", ""),
                "cert_status": cert.get("status", "Pending Generation") if cert else "Pending Generation",
                "issued_at": cert.get("issued_at").isoformat() if cert and hasattr(cert.get("issued_at"), "isoformat") else None,
            })

    return jsonify({
        "success": True,
        "data": {
            "iv": iv_list,
            "intern": intern_list,
            "alumni": [],
            "course": course_list,
            "stats": {
                "iv_total": len(iv_list),
                "iv_issued": sum(1 for u in iv_list if u["cert_status"] == "Issued"),
                "intern_total": len(intern_list),
                "intern_issued": sum(1 for u in intern_list if u["cert_status"] == "Issued"),
                "alumni_total": 0,
                "alumni_issued": 0,
                "course_total": len(course_list),
                "course_issued": sum(1 for u in course_list if u["cert_status"] == "Generated"),
            }
        }
    }), 200


@admin_bp.route("/certificates/intern/<user_id>/issue", methods=["POST"])
@jwt_required()
@admin_required
def issue_intern_certificate(user_id):
    """Issue an internship completion certificate to an intern."""
    db = get_db()
    now = datetime.now(timezone.utc)

    user = db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    cert_doc = {
        "id": f"intern_{ObjectId()}",
        "type": "intern",
        "title": "Internship Completion Certificate",
        "student_name": user.get("full_name", ""),
        "specialization": user.get("specialization", "General"),
        "batch": user.get("batch", "N/A"),
        "date": now.strftime("%Y-%m-%d"),
        "issuer": "NeST Academy",
        "color": "#1a2652",
        "issued_at": now.isoformat(),
    }

    # Upsert — replace existing intern cert if present
    user_certs = user.get("certificates", [])
    existing_idx = next((i for i, c in enumerate(user_certs) if c.get("type") == "intern"), None)
    if existing_idx is not None:
        user_certs[existing_idx] = cert_doc
        db["users"].update_one({"_id": user["_id"]}, {"$set": {"certificates": user_certs}})
    else:
        db["users"].update_one({"_id": user["_id"]}, {"$push": {"certificates": cert_doc}})

    # Notify
    try:
        create_notification(
            db, user["_id"], "system",
            "Internship Certificate Issued!",
            "Your internship completion certificate is now available on your profile.",
            "/profile"
        )
    except Exception:
        pass

    return jsonify({"success": True, "message": f"Internship certificate issued to {user.get('full_name')}."}), 200


@admin_bp.route("/certificates/alumni/<user_id>/issue", methods=["POST"])
@jwt_required()
@admin_required
def issue_alumni_certificate(user_id):
    """Deprecated: Work experience certificates are removed."""
    return jsonify({"success": False, "message": "Work experience certificates are no longer supported."}), 400


@admin_bp.route("/certificates/course/<enrollment_id>/generate", methods=["POST"])
@jwt_required()
@admin_required
def generate_course_certificate(enrollment_id):
    """Mark a course completion certificate as Generated."""
    db = get_db()
    now = datetime.now(timezone.utc)

    eid = ObjectId(enrollment_id)
    enrollment = db["course_enrollments"].find_one({"_id": eid})
    if not enrollment:
        return jsonify({"success": False, "message": "Enrollment not found."}), 404

    db["certificates"].update_one(
        {"enrollment_id": eid},
        {"$set": {"status": "Generated", "issued_at": now, "updated_at": now}},
        upsert=True
    )

    try:
        create_notification(
            db, enrollment["user_id"], "system",
            "Course Certificate Ready!",
            "Your course completion certificate has been generated and is available on your profile.",
            "/profile"
        )
    except Exception:
        pass

    return jsonify({"success": True, "message": "Certificate generated."}), 200
