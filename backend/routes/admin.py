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

# ── Stats ──

@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
@admin_required
def get_stats():
    """Aggregate stats for the admin dashboard."""
    db = get_db()
    
    total_users = db["users"].count_documents({})
    interns = db["users"].count_documents({"user_type": "Intern"})
    active_jobs = db["jobs"].count_documents({"is_active": {"$ne": False}})
    total_applications = db["applications"].count_documents({}) if "applications" in db.list_collection_names() else 0
    total_events = db["events"].count_documents({}) if "events" in db.list_collection_names() else 0
    total_courses = db["courses"].count_documents({}) if "courses" in db.list_collection_names() else 0
    iv_students = db["users"].count_documents({"user_type": "Industrial Student"})
    trainees = db["users"].count_documents({"user_type": "Trainee"})
    alumni = db["users"].count_documents({"user_type": "Alumni"})
    staff = db["users"].count_documents({"user_type": "Staff"})
    total_managers = db["users"].count_documents({"role": {"$in": ["event_manager", "course_manager", "job_recruiter"]}})

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
    """Get full details of a specific user for admin editing."""
    db = get_db()
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
    except:
        return jsonify({"success": False, "message": "Invalid user ID."}), 400
        
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404
        
    user["id"] = str(user["_id"])
    del user["_id"]
    if "password" in user:
        del user["password"]
    
    # Convert dates to ISO
    for field in ["created_at", "updated_at", "last_login"]:
        if field in user and hasattr(user[field], "isoformat"):
            user[field] = user[field].isoformat()
            
    return jsonify({
        "success": True,
        "data": {"user": user}
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
    if db["users"].find_one({"email": data["email"].strip().lower()}):
        return jsonify({"success": False, "message": "Email already exists."}), 409
        
    hashed_pw = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())
    now = datetime.now(timezone.utc)
    
    user_doc = {
        "full_name": data.get("full_name", "New User"),
        "email": data["email"].strip().lower(),
        "password": hashed_pw,
        "phone": data.get("phone", ""),
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

@admin_bp.route("/users/<user_id>", methods=["PATCH"])
@jwt_required()
@admin_required
def update_user_status(user_id):
    """Update user: toggle active status, change role, or edit fields."""
    data = request.get_json()
    db = get_db()
    
    allowed_fields = ["is_active", "role", "full_name", "phone", "user_type", "batch", "specialization"]
    update_data = {}
    for field in allowed_fields:
        if field in data:
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
@admin_required
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
@admin_required
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
        "thumbnail": data.get("thumbnail", ""),
        "video_url": data.get("videoUrl") or data.get("video_url", ""),
        "modules": data.get("modules", []),
        "required_assessments": data.get("required_assessments", [1, 2, 3, 4, 5]),
        "is_published": data.get("is_published", True),
        "created_by": get_jwt_identity(),
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = db["courses"].insert_one(course_doc)
    
    # Notify all users
    try:
        from .notifications import create_notification
        users_cursor = db["users"].find({"role": {"$ne": "admin"}})
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
@admin_required
def update_course(course_id):
    """Update a course."""
    data = request.get_json()
    db = get_db()
    
    allowed_fields = ["title", "description", "instructor", "duration", "level",
                       "category", "thumbnail", "video_url", "modules", 
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
@admin_required
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
    
    valid_statuses = ["pending", "reviewed", "shortlisted", "rejected", "hired"]
    new_status = data.get("status")
    
    if new_status not in valid_statuses:
        return jsonify({
            "success": False, 
            "message": f"Status must be one of: {', '.join(valid_statuses)}"
        }), 400
    
    db["applications"].update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
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
