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
from .auth import _is_user_added_by_admin
from .applications import serialize_timeline
from .recruiter import serialize_email_history, build_status_email_content
from utils.mailer import send_email
from utils.date_helpers import format_datetime_utc
import re
import secrets
import uuid

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

def normalize_college_name(name: str) -> str:
    if not name or str(name).strip().upper() in ("N/A", "NONE", "NULL", ""):
        return "Not Specified"
    cleaned = str(name).strip()
    if "saintgits" in cleaned.lower():
        return "Saintgits College of Engineering"
    
    words = cleaned.split()
    capitalized_words = []
    lower_words = {"of", "and", "in", "for", "the", "at"}
    for i, w in enumerate(words):
        if i > 0 and w.lower() in lower_words:
            capitalized_words.append(w.lower())
        else:
            capitalized_words.append(w.capitalize())
    return " ".join(capitalized_words)


def _is_valid_drive_link(link: str) -> bool:
    if not link or not isinstance(link, str):
        return False
    s = link.strip().lower()
    if s.startswith("data:") or s.endswith(".pdf") or s.endswith(".docx") or s.endswith(".doc"):
        return False
    return s.startswith("http://") or s.startswith("https://") or "drive.google.com" in s or "dropbox.com" in s or "onedrive." in s


admin_bp = Blueprint("admin", __name__)

def get_user_from_jwt():
    """Resilient lookup for JWT identity as ObjectId, email, or emp_id."""
    from flask_jwt_extended import get_jwt
    user_id = get_jwt_identity()
    claims = {}
    try:
        claims = get_jwt() or {}
    except Exception:
        pass
    db = get_db()
    user = None
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
    if not user:
        user = db["users"].find_one({"$or": [{"email": str(user_id).strip().lower()}, {"emp_id": str(user_id)}]})
    if not user and claims.get("email"):
        user = db["users"].find_one({"email": str(claims.get("email")).strip().lower()})
    return user

def admin_required(fn):
    """Decorator to check if user has admin or super_admin role."""
    from functools import wraps
    from flask_jwt_extended import get_jwt
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = get_user_from_jwt()
        claims = {}
        try:
            claims = get_jwt() or {}
        except Exception:
            pass
        role = (user.get("role") or claims.get("role") or "").strip().lower() if (user or claims) else ""
        if role not in ("admin", "super_admin"):
            return jsonify({"success": False, "message": "Admin privileges required."}), 403
        return fn(*args, **kwargs)
    return wrapper

def job_management_required(fn):
    """Decorator to check if user has recruiter, admin, or super_admin role."""
    from functools import wraps
    from flask_jwt_extended import get_jwt
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = get_user_from_jwt()
        claims = {}
        try:
            claims = get_jwt() or {}
        except Exception:
            pass
        role = (user.get("role") or claims.get("role") or "").strip().lower() if (user or claims) else ""
        user_type = user.get("user_type") if user else claims.get("user_type")
        allowed = ("admin", "super_admin", "job_recruiter", "recruiter")
        if role not in allowed and user_type != "Staff":
            return jsonify({"success": False, "message": "Recruiter or Admin privileges required."}), 403
        return fn(*args, **kwargs)
    return wrapper

def event_management_required(fn):
    """Decorator to check if user has event_manager, admin, or super_admin role."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = get_user_from_jwt()
        role = (user.get("role") or "").strip().lower() if user else ""
        allowed = ("admin", "super_admin", "event_manager")
        if not user or (role not in allowed and user.get("user_type") != "Staff"):
            return jsonify({"success": False, "message": "Event Manager or Admin privileges required."}), 403
        return fn(*args, **kwargs)
    return wrapper

def course_management_required(fn):
    """Decorator to check if user has course_manager, admin or super_admin role."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = get_user_from_jwt()
        role = (user.get("role") or "").strip().lower() if user else ""
        allowed = ("admin", "super_admin", "course_manager")
        if not user or (role not in allowed and user.get("user_type") != "Staff"):
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
    iv_students = db["users"].count_documents({"user_type": {"$in": ["Industrial Student", "IV Student"]}})
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

    def _to_datetime(val):
        if not val:
            return datetime.min.replace(tzinfo=timezone.utc)
        if isinstance(val, datetime):
            if val.tzinfo is None:
                return val.replace(tzinfo=timezone.utc)
            return val
        if isinstance(val, str):
            val = val.strip()
            try:
                clean = val.replace("Z", "+00:00")
                dt = datetime.fromisoformat(clean)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
            except Exception:
                pass
            for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%d-%m-%Y", "%b %d, %Y"):
                try:
                    dt = datetime.strptime(val, fmt)
                    return dt.replace(tzinfo=timezone.utc)
                except Exception:
                    continue
        return datetime.min.replace(tzinfo=timezone.utc)

    def _get_avatar(name):
        if not name:
            return "U"
        parts = name.strip().split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[1][0]).upper()
        return name[:2].upper() if len(name) >= 2 else name.upper()

    activities = []

    # 1. New Users
    for u in db["users"].find().sort("created_at", -1).limit(10):
        dt = _to_datetime(u.get("created_at"))
        name = u.get("full_name") or u.get("name") or "User"
        activities.append({
            "user": name,
            "action": "joined the platform",
            "time": dt.isoformat(),
            "_dt": dt,
            "avatar": _get_avatar(name)
        })

    # 2. Posted Jobs
    for j in db["jobs"].find().sort("createdAt", -1).limit(10):
        dt = _to_datetime(j.get("createdAt") or j.get("created_at"))
        poster_name = None
        posted_by = j.get("posted_by")
        if posted_by:
            try:
                pu = db["users"].find_one({"$or": [{"_id": ObjectId(posted_by)}, {"_id": str(posted_by)}]})
                if pu:
                    poster_name = pu.get("full_name")
            except Exception:
                pass
        poster_name = poster_name or j.get("company") or "Recruiter"
        activities.append({
            "user": poster_name,
            "action": f"posted new job: {j.get('title')}",
            "time": dt.isoformat(),
            "_dt": dt,
            "avatar": _get_avatar(poster_name)
        })

    # 3. Published Courses
    for c in db["courses"].find().sort("createdAt", -1).limit(10):
        dt = _to_datetime(c.get("createdAt") or c.get("created_at"))
        creator_name = None
        created_by = c.get("created_by")
        if created_by:
            try:
                cu = db["users"].find_one({"$or": [{"_id": ObjectId(created_by)}, {"_id": str(created_by)}]})
                if cu:
                    creator_name = cu.get("full_name")
            except Exception:
                pass
        creator_name = creator_name or c.get("instructor") or "Course Lead"
        activities.append({
            "user": creator_name,
            "action": f"published course: {c.get('title')}",
            "time": dt.isoformat(),
            "_dt": dt,
            "avatar": _get_avatar(creator_name)
        })

    # 4. Scheduled Events
    for e in db["events"].find().sort("createdAt", -1).limit(10):
        dt = _to_datetime(e.get("createdAt") or e.get("created_at") or e.get("date"))
        org_name = None
        created_by = e.get("created_by")
        if created_by:
            try:
                eu = db["users"].find_one({"$or": [{"_id": ObjectId(created_by)}, {"_id": str(created_by)}]})
                if eu:
                    org_name = eu.get("full_name")
            except Exception:
                pass
        org_name = org_name or e.get("organizer") or "Event Lead"
        activities.append({
            "user": org_name,
            "action": f"scheduled event: {e.get('title')}",
            "time": dt.isoformat(),
            "_dt": dt,
            "avatar": _get_avatar(org_name)
        })

    # 5. Shared Posts / Broadcasts
    for p in db["posts"].find().sort("created_at", -1).limit(10):
        dt = _to_datetime(p.get("created_at") or p.get("createdAt"))
        author_name = None
        author_id = p.get("author_id")
        if author_id:
            try:
                au = db["users"].find_one({"$or": [{"_id": ObjectId(author_id)}, {"_id": str(author_id)}]})
                if au:
                    author_name = au.get("full_name")
            except Exception:
                pass
        author_name = author_name or "Community"
        snippet = (p.get("content") or "").strip()
        if len(snippet) > 40:
            snippet = snippet[:40] + "..."
        action = f"shared broadcast: \"{snippet}\"" if snippet else "shared a new post"
        activities.append({
            "user": author_name,
            "action": action,
            "time": dt.isoformat(),
            "_dt": dt,
            "avatar": _get_avatar(author_name)
        })

    # 6. Job Applications
    for a in db["applications"].find().sort("applied_at", -1).limit(10):
        dt = _to_datetime(a.get("applied_at"))
        user = db["users"].find_one({"_id": a.get("user_id")})
        job = db["jobs"].find_one({"_id": a.get("job_id")})
        user_name = user.get("full_name", "Applicant") if user else "Applicant"
        job_title = job.get("title", "a role") if job else "a role"
        activities.append({
            "user": user_name,
            "action": f"applied for {job_title}",
            "time": dt.isoformat(),
            "_dt": dt,
            "avatar": _get_avatar(user_name)
        })

    # Sort descending by real datetime
    activities.sort(key=lambda x: x["_dt"], reverse=True)

    # Strip internal sort key
    for item in activities:
        del item["_dt"]

    return jsonify({
        "success": True,
        "data": {"activities": activities[:15]}
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
    """List all users with manager roles (event_manager, course_manager, job_recruiter, recruiter)."""
    db = get_db()
    manager_roles = ["event_manager", "course_manager", "job_recruiter", "recruiter"]
    managers_cursor = db["users"].find({
        "$or": [
            {"role": {"$in": manager_roles}},
            {"user_type": "Staff", "role": {"$nin": ["user", ""]}}
        ]
    }).sort("created_at", -1)

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
        if user_type in ["IV Student", "Industrial Student"]:
            query["user_type"] = {"$in": ["IV Student", "Industrial Student"]}
        else:
            query["user_type"] = user_type
    
    users_cursor = db["users"].find(query).sort("created_at", -1)
    
    users_list = []
    for u in users_cursor:
        u["id"] = str(u.pop("_id", ""))
        if "created_by" in u and isinstance(u["created_by"], ObjectId):
            u["created_by"] = str(u["created_by"])
        if "password" in u:
            del u["password"]
        if not u.get("user_type") and u.get("role") not in ("admin", "super_admin", "recruiter", "event_manager", "course_manager"):
            u["user_type"] = "Applicant"
        if "created_at" in u:
            u["created_at"] = format_datetime_utc(u["created_at"])
        if "updated_at" in u:
            u["updated_at"] = format_datetime_utc(u["updated_at"])
        if "last_login" in u:
            u["last_login"] = format_datetime_utc(u["last_login"])
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
        
    user["id"] = str(user.pop("_id", ""))
    if "created_by" in user and isinstance(user["created_by"], ObjectId):
        user["created_by"] = str(user["created_by"])
    if "password" in user:
        del user["password"]
    if not user.get("user_type") and user.get("role") not in ("admin", "super_admin", "recruiter", "event_manager", "course_manager"):
        user["user_type"] = "Applicant"
    
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

@admin_bp.route("/check-email", methods=["GET"])
@jwt_required()
@admin_required
def check_email_exists():
    """Check if an email address is already registered in the system."""
    raw_email = (request.args.get("email") or "").strip().lower()
    if not raw_email:
        return jsonify({"success": False, "message": "Email parameter is required."}), 400

    if not EMAIL_REGEX.match(raw_email):
        return jsonify({
            "success": True,
            "data": {
                "valid_format": False,
                "exists": False,
                "message": "Please enter a valid email address."
            }
        }), 200

    db = get_db()
    existing = db["users"].find_one(
        {"email": {"$regex": f"^{re.escape(raw_email)}$", "$options": "i"}},
        {"full_name": 1, "email": 1, "role": 1, "user_type": 1}
    )

    if existing:
        role_label = existing.get("user_type") or existing.get("role") or "User"
        name = existing.get("full_name") or "Existing User"
        return jsonify({
            "success": True,
            "data": {
                "valid_format": True,
                "exists": True,
                "message": f"This email is already in use by {name} ({role_label}). Duplicate emails are not allowed.",
                "existing_user": {
                    "full_name": name,
                    "role": existing.get("role"),
                    "user_type": existing.get("user_type")
                }
            }
        }), 200

    return jsonify({
        "success": True,
        "data": {
            "valid_format": True,
            "exists": False,
            "message": "Email is available."
        }
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

    raw_email = (data.get("email") or "").strip().lower()
    if not raw_email or not EMAIL_REGEX.match(raw_email):
        return jsonify({"success": False, "message": "Please provide a valid email address."}), 400

    full_name = (data.get("full_name") or "").strip()
    if full_name and len(full_name) < 2:
        return jsonify({"success": False, "message": "Full name must be at least 2 characters."}), 400

    # Strict case-insensitive duplicate email check
    existing_user = db["users"].find_one({
        "email": {"$regex": f"^{re.escape(raw_email)}$", "$options": "i"}
    })
    if existing_user:
        existing_role = existing_user.get("user_type") or existing_user.get("role") or "User"
        existing_name = existing_user.get("full_name") or "Existing Account"
        return jsonify({
            "success": False, 
            "message": f"A user or manager with email '{raw_email}' already exists ({existing_name} - {existing_role}). Duplicate emails are not allowed.",
            "code": "DUPLICATE_EMAIL"
        }), 409
        
    hashed_pw = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt()).decode('utf-8')
    now = datetime.now(timezone.utc)
    
    user_doc = {
        "full_name": full_name or "New User",
        "first_name": data.get("first_name", ""),
        "last_name": data.get("last_name", ""),
        "email": raw_email,
        "password": hashed_pw,
        "phone": data.get("phone", ""),
        "emp_id": data.get("emp_id", ""),
        "user_type": data.get("user_type", "Alumni"),
        "batch": data.get("batch", "N/A"),
        "specialization": data.get("specialization", "N/A"),
        "college": data.get("college", "N/A"),
        "salary": data.get("salary", ""),
        "joining_date": data.get("joining_date", ""),
        "role": data.get("role", "user"),
        "is_active": True,
        "is_email_verified": True,
        "added_by_admin": True,
        "created_by": ObjectId(get_jwt_identity()),
        "profile_picture": None,
        "bio": None,
        "linkedin_url": None,
        "skills": [],
        "created_at": now,
        "updated_at": now,
        "last_login": None,
    }
    
    try:
        result = db["users"].insert_one(user_doc)
    except Exception as e:
        if "duplicate" in str(e).lower() or e.__class__.__name__ == "DuplicateKeyError":
            return jsonify({
                "success": False,
                "message": f"An account with email '{raw_email}' already exists in the system. Duplicate emails are not allowed.",
                "code": "DUPLICATE_EMAIL"
            }), 409
        raise e

    return jsonify({
        "success": True,
        "message": "User created successfully.",
        "data": {"id": str(result.inserted_id)}
    }), 201

@admin_bp.route("/users/bulk-add", methods=["POST"])
@jwt_required()
@admin_required
def bulk_add_users():
    """Bulk create users from an admin-provided list with duplicate email prevention."""
    data = request.get_json()
    if not data or "users" not in data or not isinstance(data["users"], list):
        return jsonify({"success": False, "message": "List of users required."}), 400
        
    db = get_db()
    input_users = data["users"]
    added_count = 0
    skipped_count = 0
    errors = []
    seen_in_batch = set()
    
    now = datetime.now(timezone.utc)
    
    for idx, u in enumerate(input_users):
        email = str(u.get("email") or "").strip().lower()
        if not email:
            errors.append(f"Row {idx+1}: Missing email.")
            skipped_count += 1
            continue
            
        if not EMAIL_REGEX.match(email):
            errors.append(f"Row {idx+1} ({email}): Invalid email format.")
            skipped_count += 1
            continue

        if email in seen_in_batch:
            errors.append(f"Row {idx+1} ({email}): Duplicate email within uploaded file.")
            skipped_count += 1
            continue

        seen_in_batch.add(email)

        # Check existing user in DB (case-insensitive)
        existing = db["users"].find_one({
            "email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}
        })
        if existing:
            existing_role = existing.get("user_type") or existing.get("role") or "User"
            errors.append(f"Row {idx+1} ({email}): Email already registered ({existing_role}).")
            skipped_count += 1
            continue
            
        try:
            # Generate a secure random password for each user (portal uses passwordless OTP verification)
            rand_pw = secrets.token_urlsafe(16) + "A1!"
            user_hashed_pw = bcrypt.hashpw(rand_pw.encode("utf-8"), bcrypt.gensalt()).decode('utf-8')
            
            full_name = str(u.get("full_name", "")).strip()
            if not full_name:
                f_name = str(u.get("first_name", "")).strip()
                l_name = str(u.get("last_name", "")).strip()
                if f_name or l_name:
                    full_name = f"{f_name} {l_name}".strip()
                else:
                    full_name = "User"

            user_type = str(u.get("user_type", "Alumni")).strip() or "Alumni"
            user_role = "admin" if user_type.lower() in ("admin", "system admin") else u.get("role", "user")
            salary = str(u.get("salary", "")).strip()
            joining_date = str(u.get("joining_date", "")).strip()

            user_doc = {
                "full_name": full_name,
                "email": email,
                "password": user_hashed_pw,
                "phone": str(u.get("phone", "")).strip(),
                "user_type": user_type,
                "batch": str(u.get("batch", "N/A")).strip() or "N/A",
                "specialization": str(u.get("specialization", "N/A")).strip() or "N/A",
                "salary": salary,
                "joining_date": joining_date,
                "role": user_role,
                "is_active": True,
                "is_email_verified": True,
                "added_by_admin": True,
                "created_by": ObjectId(get_jwt_identity()),
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

    allowed_fields = ["is_active", "role", "full_name", "phone", "salary", "joining_date", "emp_id", "user_type", "batch", "specialization", "password"]
    update_data = {}
    for field in allowed_fields:
        if field in data:
            if field == "password" and data[field]:
                update_data["password"] = bcrypt.hashpw(data[field].encode("utf-8"), bcrypt.gensalt()).decode('utf-8')
            elif field == "full_name" and data[field] is not None:
                name_val = str(data[field]).strip()
                if len(name_val) < 2:
                    return jsonify({"success": False, "message": "Full name must be at least 2 characters."}), 400
                update_data["full_name"] = name_val
            elif field == "phone" and data[field]:
                phone_clean = str(data[field]).strip()
                digits_only = re.sub(r"\D", "", phone_clean)
                if digits_only and (len(digits_only) < 7 or len(digits_only) > 15):
                    return jsonify({"success": False, "message": "Please enter a valid phone number (7-15 digits)."}), 400
                update_data["phone"] = phone_clean
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
@job_management_required
def get_all_jobs():
    """List all jobs for admin management."""
    db = get_db()
    jobs_cursor = db["jobs"].find().sort("createdAt", -1)
    
    jobs_list = []
    for j in jobs_cursor:
        j["id"] = str(j["_id"])
        del j["_id"]
        if "createdAt" in j:
            j["createdAt"] = format_datetime_utc(j["createdAt"])
        jobs_list.append(j)
        
    return jsonify({
        "success": True,
        "data": {"jobs": jobs_list}
    }), 200

@admin_bp.route("/jobs", methods=["POST"])
@jwt_required()
@job_management_required
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
@job_management_required
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
@job_management_required
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
        
        oid = c["_id"]
        # Find all enrollments for this course (matching either ObjectId or string id)
        enrolls = list(db["course_enrollments"].find({
            "$or": [{"course_id": oid}, {"course_id": str(oid)}]
        }))
        enrolled_count = len(enrolls)
        c["enrolled_count"] = enrolled_count
        
        # Real course health & progress calculated directly from learner enrollments
        if enrolled_count > 0:
            progs = [e.get("progress", 0) for e in enrolls]
            avg_progress = round(sum(progs) / len(progs))
            completed_count = sum(1 for e in enrolls if str(e.get("status", "")).lower() == "completed" or e.get("progress", 0) >= 100)
            active_learners = enrolled_count - completed_count
            c["avg_progress"] = avg_progress
            c["active_learners"] = active_learners
            c["completed_learners"] = completed_count
            c["health_percent"] = avg_progress
        else:
            c["avg_progress"] = 0
            c["active_learners"] = 0
            c["completed_learners"] = 0
            c["health_percent"] = 0

        c["is_active"] = c.get("is_active", False if str(c.get("status", "")).lower() == "inactive" else True)
        if "status" not in c or not c["status"]:
            c["status"] = "Active" if c["is_active"] else "Inactive"
        
        del c["_id"]
        if "createdAt" in c:
            c["createdAt"] = format_datetime_utc(c["createdAt"])
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
        "is_active": data.get("is_active", True),
        "status": data.get("status", "Active"),
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
                       "required_assessments", "is_published", "is_active", "status", "certification", 
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
    """Delete a course and cascade cleanups."""
    db = get_db()
    
    try:
        oid = ObjectId(course_id)
        result = db["courses"].delete_one({"$or": [{"_id": oid}, {"_id": str(course_id)}]})
    except:
        result = db["courses"].delete_one({"_id": str(course_id)})
    
    if result.deleted_count == 0:
        return jsonify({"success": False, "message": "Course not found."}), 404
    
    try:
        db["course_enrollments"].delete_many({"$or": [{"course_id": ObjectId(course_id)}, {"course_id": str(course_id)}]})
        db["course_assessments"].delete_many({"$or": [{"course_id": ObjectId(course_id)}, {"course_id": str(course_id)}]})
        db["assessment_submissions"].delete_many({"$or": [{"course_id": ObjectId(course_id)}, {"course_id": str(course_id)}]})
        db["assessment_attempts"].delete_many({"$or": [{"course_id": ObjectId(course_id)}, {"course_id": str(course_id)}]})
        db["course_recommendations"].delete_many({"$or": [{"course_id": ObjectId(course_id)}, {"course_id": str(course_id)}]})
    except Exception as e:
        print(f"Cleanup error on course delete: {e}")

    return jsonify({"success": True, "message": "Course deleted successfully."}), 200

# ── Job Management ──

@admin_bp.route("/jobs", methods=["GET"])
@jwt_required()
@job_management_required
def get_all_jobs_admin():
    """List all jobs for admin."""
    db = get_db()
    jobs = list(db["jobs"].find().sort("createdAt", -1))
    for j in jobs:
        j["id"] = str(j["_id"])
        del j["_id"]
        if "createdAt" in j:
            j["createdAt"] = format_datetime_utc(j["createdAt"])
    return jsonify({"success": True, "data": {"jobs": jobs}}), 200

@admin_bp.route("/jobs", methods=["POST"])
@jwt_required()
@job_management_required
def add_job_admin():
    """Create a new job as admin."""
    data = request.get_json()
    db = get_db()
    if not data or not data.get("title"):
        return jsonify({"success": False, "message": "Job title is required."}), 400

    job_doc = {
        "title": data.get("title"),
        "company": data.get("company", "NeST Digital"),
        "location": data.get("location", "Kochi, Kerala"),
        "salary": data.get("salary", "Competitive"),
        "type": data.get("type", "Full-time"),
        "department": data.get("department", "Technology"),
        "description": data.get("description", ""),
        "requirements": data.get("requirements", []),
        "skills_required": data.get("skills_required", []),
        "experience_level": data.get("experience_level", "Entry Level"),
        "is_active": True,
        "status": "Active",
        "posted_by": get_jwt_identity(),
        "createdAt": datetime.now(timezone.utc)
    }
    result = db["jobs"].insert_one(job_doc)
    return jsonify({"success": True, "message": "Job created successfully.", "data": {"id": str(result.inserted_id)}}), 201

@admin_bp.route("/jobs/<job_id>", methods=["DELETE"])
@jwt_required()
@job_management_required
def delete_job_admin(job_id):
    """Delete a job."""
    db = get_db()
    try:
        oid = ObjectId(job_id)
        result = db["jobs"].delete_one({"$or": [{"_id": oid}, {"_id": str(job_id)}]})
    except Exception:
        result = db["jobs"].delete_one({"_id": str(job_id)})

    if result.deleted_count == 0:
        return jsonify({"success": False, "message": "Job not found."}), 404
    return jsonify({"success": True, "message": "Job deleted successfully."}), 200

# ── Event Management ──

@admin_bp.route("/events", methods=["GET"])
@jwt_required()
@event_management_required
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
@event_management_required
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
@event_management_required
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
@event_management_required
def delete_event(event_id):
    """Delete an event and related records."""
    db = get_db()
    
    try:
        oid = ObjectId(event_id)
        result = db["events"].delete_one({"$or": [{"_id": oid}, {"_id": str(event_id)}]})
    except Exception:
        result = db["events"].delete_one({"_id": str(event_id)})
    
    if result.deleted_count == 0:
        return jsonify({"success": False, "message": "Event not found."}), 404

    try:
        db["event_registrations"].delete_many({"$or": [{"event_id": ObjectId(event_id)}, {"event_id": str(event_id)}]})
    except Exception:
        db["event_registrations"].delete_many({"event_id": str(event_id)})

    try:
        db["event_bookmarks"].delete_many({"$or": [{"event_id": ObjectId(event_id)}, {"event_id": str(event_id)}]})
    except Exception:
        db["event_bookmarks"].delete_many({"event_id": str(event_id)})
    
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
        applied_at_val = a.get("applied_at")
        withdrawn_at_val = a.get("withdrawn_at")
        reapplied_at_val = a.get("reapplied_at")
        status_updated_at_val = a.get("status_updated_at") or a.get("updatedAt") or a.get("updated_at")

        app_data = {
            "id": str(a["_id"]),
            "status": a.get("status", "pending"),
            "cover_letter": a.get("cover_letter", ""),
            "applied_at": format_datetime_utc(applied_at_val),
            "withdrawn_at": format_datetime_utc(withdrawn_at_val),
            "reapplied_at": format_datetime_utc(reapplied_at_val),
            "status_updated_at": format_datetime_utc(status_updated_at_val),
            "updated_at": format_datetime_utc(status_updated_at_val),
            "notes": a.get("notes", ""),
            "last_status_note": a.get("last_status_note", a.get("notes", "")),
            "last_updated_by": a.get("last_updated_by"),
            "timeline": serialize_timeline(a.get("timeline"), a, is_internal=True),
            "email_history": serialize_email_history(a.get("email_history", [])),
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
                    app_data["applicant_name"] = a.get("full_name") or user.get("full_name", "")
                    app_data["applicant_email"] = a.get("email") or user.get("email", "")
                    raw_a_drive = a.get("resume_drive_link", "")
                    raw_u_drive = user.get("resume_drive_link", "")
                    safe_drive_link = raw_a_drive if _is_valid_drive_link(raw_a_drive) else (raw_u_drive if _is_valid_drive_link(raw_u_drive) else "")

                    # Extract proper resume document name
                    resume_file_name = a.get("resume_name") or user.get("resume_name", "")
                    if not resume_file_name:
                        if raw_a_drive and not _is_valid_drive_link(raw_a_drive):
                            resume_file_name = raw_a_drive
                        elif raw_u_drive and not _is_valid_drive_link(raw_u_drive):
                            resume_file_name = raw_u_drive

                    app_data["resume_url"] = a.get("resume_url") or user.get("resume_url", "")
                    app_data["resume_name"] = resume_file_name
                    app_data["resume_filename"] = resume_file_name
                    app_data["phone"] = a.get("phone") or user.get("phone", "")
                    app_data["graduation_year"] = a.get("graduation_year") or user.get("graduation_year", "") or a.get("batch") or user.get("batch", "")
                    app_data["batch"] = a.get("graduation_year") or user.get("graduation_year", "") or a.get("batch") or user.get("batch", "")
                    app_data["current_organisation"] = a.get("current_organisation") or user.get("current_organisation", "") or a.get("current_company") or user.get("current_company", "")
                    app_data["current_designation"] = a.get("current_designation") or user.get("current_designation", "") or a.get("title") or user.get("title", "")
                    app_data["total_experience"] = a.get("total_experience") or user.get("total_experience", "")
                    app_data["current_location"] = a.get("current_location") or user.get("current_location", "") or a.get("location") or user.get("location", "")
                    app_data["location"] = a.get("current_location") or user.get("current_location", "") or a.get("location") or user.get("location", "")
                    app_data["preferred_location"] = a.get("preferred_location") or user.get("preferred_location", "")
                    app_data["resume_drive_link"] = safe_drive_link
                    app_data["referral_source"] = a.get("referral_source") or user.get("referral_source", "")
                    app_data["referral_source_details"] = a.get("referral_source_details") or user.get("referral_source_details", "")
                    app_data["tech_stacks"] = a.get("tech_stacks") or user.get("tech_stacks", [])
                    app_data["interested_positions"] = a.get("interested_positions") or user.get("interested_positions", [])
                    app_data["declaration_confirmed"] = bool(a.get("declaration_confirmed") or user.get("declaration_confirmed", False))
                    app_data["specialization"] = a.get("specialization") or user.get("specialization", "")
                    app_data["linkedin_url"] = a.get("linkedin_url") or user.get("linkedin_url", "")
                    app_data["github_url"] = user.get("github_url", "")
                    app_data["portfolio_url"] = user.get("portfolio_url", "")
                    app_data["skills"] = user.get("skills", [])
                    app_data["bio"] = user.get("bio", "")
                    app_data["experience"] = user.get("experience", [])
                    app_data["education"] = user.get("education", [])
                    app_data["certificates"] = user.get("certificates", [])
                    app_data["emp_id"] = user.get("emp_id") or user.get("student_id", "")
                    app_data["student_id"] = user.get("student_id", "")
                    app_data["user_type"] = user.get("user_type", "")
                    raw_college = (
                        a.get("college") or 
                        user.get("college") or 
                        a.get("referral_source_details") or 
                        user.get("referral_source_details") or 
                        ""
                    )
                    app_data["college"] = normalize_college_name(raw_college)
                    is_admin_user = _is_user_added_by_admin(user)
                    app_data["added_by_admin"] = is_admin_user
                    app_data["not_added_by_admin"] = not is_admin_user
                    app_data["form_data"] = {
                        "full_name": a.get("full_name", ""),
                        "email": a.get("email", ""),
                        "phone": a.get("phone", ""),
                        "college": a.get("college", "") or a.get("referral_source_details", ""),
                        "graduation_year": a.get("graduation_year", "") or a.get("batch", ""),
                        "batch": a.get("graduation_year", "") or a.get("batch", ""),
                        "specialization": a.get("specialization", ""),
                        "current_organisation": a.get("current_organisation", "") or a.get("current_company", ""),
                        "current_designation": a.get("current_designation", "") or a.get("title", ""),
                        "total_experience": a.get("total_experience", ""),
                        "current_location": a.get("current_location", "") or a.get("location", ""),
                        "preferred_location": a.get("preferred_location", ""),
                        "resume_drive_link": raw_a_drive if _is_valid_drive_link(raw_a_drive) else "",
                        "referral_source": a.get("referral_source", ""),
                        "referral_source_details": a.get("referral_source_details", ""),
                        "tech_stacks": a.get("tech_stacks", []),
                        "interested_positions": a.get("interested_positions", []),
                        "declaration_confirmed": bool(a.get("declaration_confirmed", False)),
                        "linkedin_url": a.get("linkedin_url", ""),
                        "resume_url": a.get("resume_url", ""),
                        "resume_name": a.get("resume_name", ""),
                        "cover_letter": a.get("cover_letter", ""),
                        "applied_at": format_datetime_utc(a.get("applied_at")),
                    }
                    app_data["profile_data"] = {
                        "full_name": user.get("full_name", ""),
                        "email": user.get("email", ""),
                        "phone": user.get("phone", ""),
                        "user_type": user.get("user_type", "") or user.get("role", "Alumni"),
                        "emp_id": user.get("emp_id") or user.get("student_id", ""),
                        "student_id": user.get("student_id", ""),
                        "college": user.get("college", "") or user.get("institution", ""),
                        "specialization": user.get("specialization", "") or user.get("department", ""),
                        "batch": user.get("batch", "") or user.get("graduation_year", ""),
                        "graduation_year": user.get("graduation_year", "") or user.get("batch", ""),
                        "bio": user.get("bio", ""),
                        "skills": user.get("skills", []),
                        "current_organisation": user.get("current_organisation") or user.get("current_company", ""),
                        "current_designation": user.get("current_designation") or user.get("title", ""),
                        "total_experience": user.get("total_experience", ""),
                        "current_location": user.get("current_location") or user.get("location", ""),
                        "preferred_location": user.get("preferred_location", ""),
                        "experience": user.get("experience", []),
                        "education": user.get("education", []),
                        "certificates": user.get("certificates", []),
                        "tech_stacks": user.get("tech_stacks", []),
                        "interested_positions": user.get("interested_positions", []),
                        "linkedin_url": user.get("linkedin_url", ""),
                        "github_url": user.get("github_url", ""),
                        "portfolio_url": user.get("portfolio_url", ""),
                        "resume_url": user.get("resume_url", ""),
                        "resume_name": user.get("resume_name", ""),
                        "resume_drive_link": raw_u_drive if _is_valid_drive_link(raw_u_drive) else "",
                        "declaration_confirmed": bool(user.get("declaration_confirmed", False))
                    }
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

    now = datetime.now(timezone.utc)
    admin_id = get_jwt_identity()
    admin_user = db["users"].find_one({"_id": ObjectId(admin_id)})
    admin_name = (admin_user.get("full_name") if admin_user else "") or "Admin"
    admin_emp_id = (admin_user.get("emp_id") or admin_user.get("employee_id") or str(admin_id)) if admin_user else str(admin_id)
    admin_email = (admin_user.get("email") if admin_user else "") or ""
    admin_role = (admin_user.get("role") if admin_user else "Admin") or "Admin"
    prev_status = app_doc.get("status", "Applied")
    notes = data.get("notes", "")

    # Fetch candidate details
    applicant_user = db["users"].find_one({"_id": ObjectId(app_doc["user_id"])}) if app_doc.get("user_id") else None
    candidate_email = app_doc.get("email") or (applicant_user.get("email") if applicant_user else "")
    candidate_name = app_doc.get("full_name") or (applicant_user.get("full_name") if applicant_user else "Candidate")
    job_title = (job.get("title") if job else "") or app_doc.get("job_title") or "Position"
    job_location = (job.get("location") if job else "") or app_doc.get("job_location") or "Kochi, Kerala"
    company_name = (job.get("company") if job else "") or "NeST Digital"

    # Email Trigger Logic
    send_email_flag = data.get("send_email", True)
    custom_subject = data.get("email_subject")
    candidate_note = (data.get("email_candidate_note") or "").strip()
    interview_date = data.get("interviewDate") or data.get("interview_date")
    interview_time = data.get("interview_time") or ""
    interview_location = data.get("interview_location") or ""

    email_sent = False
    email_log_entry = None

    if send_email_flag and candidate_email:
        subject = custom_subject or f"Application Status Update: {job_title} at {company_name} — {new_status}"
        plain_body, html_body = build_status_email_content(
            candidate_name=candidate_name,
            job_title=job_title,
            company_name=company_name,
            job_location=job_location,
            prev_status=prev_status,
            new_status=new_status,
            recruiter_name=admin_name,
            interview_date=interview_date,
            interview_time=interview_time,
            interview_location=interview_location,
            candidate_note=candidate_note
        )

        try:
            email_sent = send_email(candidate_email, subject, plain_body, html_body=html_body)
        except Exception as em_err:
            print(f"Admin status update email error: {em_err}")
            email_sent = False

        email_log_entry = {
            "id": str(uuid.uuid4())[:8],
            "sent_at": now,
            "sent_by": {
                "id": str(admin_id),
                "name": admin_name,
                "email": admin_email,
                "recruiter_id": admin_emp_id,
                "role": "Admin"
            },
            "recipient_email": candidate_email,
            "recipient_name": candidate_name,
            "subject": subject,
            "status_from": prev_status,
            "status_to": new_status,
            "job_title": job_title,
            "job_location": job_location,
            "interview_date": interview_date,
            "interview_time": interview_time,
            "interview_location": interview_location,
            "candidate_note": candidate_note,
            "delivery_status": "Sent" if email_sent else "Failed"
        }

    status_event = {
        "action": "Status Changed",
        "status": new_status,
        "previous_status": prev_status,
        "timestamp": now,
        "actor_id": str(admin_id),
        "actor_name": admin_name,
        "actor_role": "Admin",
        "recruiter_id": admin_emp_id,
        "recruiter_email": admin_email,
        "note": notes or f"Application status updated to {new_status} by {admin_name}.",
        "email_sent": email_sent if send_email_flag else False
    }

    push_ops: dict = {"timeline": status_event}
    if email_log_entry:
        push_ops["email_history"] = email_log_entry

    db["applications"].update_one(
        {"_id": ObjectId(app_id)},
        {
            "$set": {
                "status": new_status,
                "status_updated_at": now,
                "updated_at": now,
                "notes": notes,
                "last_status_note": notes,
                "last_updated_by": {
                    "id": str(admin_id),
                    "name": admin_name,
                    "recruiter_id": admin_emp_id,
                    "email": admin_email,
                    "role": "Admin"
                }
            },
            "$push": push_ops
        }
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
    """Fetch all issued certificates from the global repository and registered users."""
    db = get_db()
    certs_cursor = db["issued_iv_certificates"].find().sort("issued_at", -1)
    certs_list = []
    seen = set()
    for c in certs_cursor:
        email = (c.get("email") or "").lower().strip()
        date = c.get("date") or ""
        seen.add((email, date))
        certs_list.append({
            "id": str(c["_id"]),
            "name": c.get("name") or "Student",
            "email": c.get("email") or "N/A",
            "college": c.get("college") or "N/A",
            "date": c.get("date") or "N/A",
            "batch": c.get("batch") or "N/A",
            "issuedAt": c.get("issued_at").isoformat() if hasattr(c.get("issued_at"), "isoformat") else str(c.get("issued_at"))
        })

    # Also include any users who have IV certificates recorded
    try:
        iv_users = db["users"].find({"certificates.type": "iv"})
        for u in iv_users:
            u_email = (u.get("email") or "").lower().strip()
            for cert in u.get("certificates", []):
                if cert.get("type") == "iv":
                    c_date = cert.get("date") or "N/A"
                    if (u_email, c_date) not in seen:
                        seen.add((u_email, c_date))
                        issued_val = cert.get("issued_at")
                        if hasattr(issued_val, "isoformat"):
                            issued_val = issued_val.isoformat()
                        certs_list.append({
                            "id": str(u["_id"]),
                            "name": u.get("full_name") or cert.get("title") or "Student",
                            "email": u.get("email") or "N/A",
                            "college": u.get("college") or "N/A",
                            "date": c_date,
                            "batch": u.get("batch") or "N/A",
                            "issuedAt": str(issued_val) if issued_val else datetime.now(timezone.utc).isoformat()
                        })
    except Exception as e:
        print(f"Error fetching user iv certificates: {e}")

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
    iv_users = list(db["users"].find({"user_type": {"$in": ["Industrial Student", "IV Student"]}}))
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

    # Enforce passing percentage configured by Course Manager
    assess_doc = db["course_assessments"].find_one({
        "$or": [{"course_id": enrollment["course_id"]}, {"course_id": str(enrollment["course_id"])}]
    })
    passing_score = int(assess_doc.get("passing_score", 70)) if assess_doc else 70

    latest_sub = db["assessment_submissions"].find_one(
        {"user_id": enrollment["user_id"], "course_id": enrollment["course_id"]},
        sort=[("submitted_at", -1)]
    )
    user_score = latest_sub.get("score") if latest_sub else None
    if user_score is None or user_score < passing_score:
        return jsonify({
            "success": False,
            "message": f"Cannot generate certificate: Learner has not passed the assessment (Score: {user_score if user_score is not None else 'Not Attended'}, Required: {passing_score}%)."
        }), 400

    db["certificates"].update_one(
        {"enrollment_id": eid},
        {"$set": {"status": "Generated", "grade": f"{user_score}%", "issued_at": now, "updated_at": now}},
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
