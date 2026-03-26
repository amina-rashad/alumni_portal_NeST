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

admin_bp = Blueprint("admin", __name__)

def admin_required(fn):
    """Decorator to check if user has admin role."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        db = get_db()
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user or user.get("role") != "admin":
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
    # Assuming an applications collection exists or will be created
    total_applications = db.get_collection("applications").count_documents({}) if "applications" in db.list_collection_names() else 0

    return jsonify({
        "success": True,
        "data": {
            "stats": {
                "total_users": total_users,
                "interns": interns,
                "active_jobs": active_jobs,
                "applications": total_applications
            }
        }
    }), 200

# ── User Management ──

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def get_all_users():
    """List all users for management."""
    db = get_db()
    users_cursor = db["users"].find().sort("created_at", -1)
    
    users_list = []
    for u in users_cursor:
        u["id"] = str(u["_id"])
        del u["_id"]
        if "password" in u:
            del u["password"]
        if "created_at" in u and hasattr(u["created_at"], "isoformat"):
            u["created_at"] = u["created_at"].isoformat()
        users_list.append(u)
        
    return jsonify({
        "success": True,
        "data": {"users": users_list}
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
    if db["users"].find_one({"email": data["email"]}):
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
        "created_at": now,
        "updated_at": now
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
    """Toggle user active status or update role."""
    data = request.get_json()
    db = get_db()
    
    update_data = {}
    if "is_active" in data:
        update_data["is_active"] = data["is_active"]
    if "role" in data:
        update_data["role"] = data["role"]
        
    if not update_data:
        return jsonify({"success": False, "message": "Nothing to update."}), 400
        
    db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    return jsonify({"success": True, "message": "User updated successfully."}), 200

# ── Job Management ──

@admin_bp.route("/jobs", methods=["POST"])
@jwt_required()
@admin_required
def add_job():
    """Add a new job listing."""
    data = request.get_json()
    db = get_db()
    
    job_doc = {
        "title": data.get("title"),
        "company": data.get("company"),
        "location": data.get("location"),
        "salary": data.get("salary"),
        "description": data.get("description"),
        "requirements": data.get("requirements", []),
        "is_active": True,
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = db["jobs"].insert_one(job_doc)
    return jsonify({
        "success": True, 
        "message": "Job posted successfully.",
        "data": {"id": str(result.inserted_id)}
    }), 201

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
        # In a real app, you might want to format the date here
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
    """List all job applications."""
    db = get_db()
    
    # In a real app, you'd join with the jobs and users collections
    # For now, let's return whatever is in the applications collection
    # If empty, we can return some mock data generated from existing users for testing
    apps_cursor = db["applications"].find().sort("date", -1)
    
    apps_list = []
    for a in apps_cursor:
        a["id"] = str(a["_id"])
        del a["_id"]
        apps_list.append(a)
        
    return jsonify({
        "success": True,
        "data": {"applications": apps_list}
    }), 200
