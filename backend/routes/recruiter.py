"""
Recruiter Management Routes
Provides endpoints for recruiters to manage jobs and applications.
Protected with JWT authentication and recruiter role check.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
import bcrypt

from app import get_db

recruiter_bp = Blueprint("recruiter", __name__)

def recruiter_required(fn):
    """Decorator to check if user has recruiter or admin role."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        db = get_db()
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user or user.get("role") not in ["recruiter", "admin"]:
            return jsonify({"success": False, "message": "Recruiter privileges required."}), 403
        return fn(*args, **kwargs)
    return wrapper

# ── Stats ──

@recruiter_bp.route("/stats", methods=["GET"])
@jwt_required()
@recruiter_required
def get_stats():
    """Aggregate stats for the recruiter dashboard."""
    db = get_db()
    user_id = get_jwt_identity()
    
    # Filter by jobs posted by this recruiter
    my_jobs = list(db["jobs"].find({"posted_by": user_id}))
    my_job_ids = [j["_id"] for j in my_jobs]
    
    total_jobs = len(my_jobs)
    total_applications = db["applications"].count_documents({"job_id": {"$in": my_job_ids}})
    
    # Status breakdown
    shortlisted = db["applications"].count_documents({
        "job_id": {"$in": my_job_ids},
        "status": "shortlisted"
    })
    hired = db["applications"].count_documents({
        "job_id": {"$in": my_job_ids},
        "status": "hired"
    })
    pending = db["applications"].count_documents({
        "job_id": {"$in": my_job_ids},
        "status": "pending"
    })

    return jsonify({
        "success": True,
        "data": {
            "stats": {
                "total_jobs": total_jobs,
                "total_applications": total_applications,
                "shortlisted": shortlisted,
                "hired": hired,
                "pending": pending
            }
        }
    }), 200

# ── Job Management ──

@recruiter_bp.route("/jobs", methods=["GET"])
@jwt_required()
@recruiter_required
def get_my_jobs():
    """List jobs posted by the current recruiter."""
    db = get_db()
    user_id = get_jwt_identity()
    
    jobs_cursor = db["jobs"].find({"posted_by": user_id}).sort("createdAt", -1)
    
    jobs_list = []
    for j in jobs_cursor:
        j["id"] = str(j["_id"])
        del j["_id"]
        if "createdAt" in j and hasattr(j["createdAt"], "isoformat"):
            j["createdAt"] = j["createdAt"].isoformat()
        
        # Count applications for each job
        app_count = db["applications"].count_documents({"job_id": ObjectId(j["id"])})
        j["application_count"] = app_count
        
        jobs_list.append(j)
        
    return jsonify({
        "success": True,
        "data": {"jobs": jobs_list}
    }), 200

@recruiter_bp.route("/jobs", methods=["POST"])
@jwt_required()
@recruiter_required
def add_job():
    """Add a new job listing by recruiter."""
    data = request.get_json()
    db = get_db()
    
    if not data or not data.get("title"):
        return jsonify({"success": False, "message": "Job title is required."}), 400
    
    job_doc = {
        "title": data.get("title"),
        "company": data.get("company", "NeST Digital"),
        "location": data.get("location", ""),
        "salary": data.get("salary", ""),
        "type": data.get("type", "Full-time"),
        "description": data.get("description", ""),
        "requirements": data.get("requirements", []),
        "skills_required": data.get("skills_required", []),
        "experience_level": data.get("experience_level", "Entry Level"),
        "is_active": True,
        "posted_by": get_jwt_identity(),
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = db["jobs"].insert_one(job_doc)
    return jsonify({
        "success": True, 
        "message": "Job posted successfully.",
        "data": {"id": str(result.inserted_id)}
    }), 201

# ── Application Management ──

@recruiter_bp.route("/applications", methods=["GET"])
@jwt_required()
@recruiter_required
def get_job_applications():
    """List applications for jobs posted by this recruiter."""
    db = get_db()
    user_id = get_jwt_identity()
    
    # Find jobs posted by this recruiter
    my_jobs = db["jobs"].find({"posted_by": user_id})
    my_job_ids = [j["_id"] for j in my_jobs]
    
    apps_cursor = db["applications"].find({"job_id": {"$in": my_job_ids}}).sort("applied_at", -1)
    
    apps_list = []
    for a in apps_cursor:
        app_data = {
            "id": str(a["_id"]),
            "status": a.get("status", "pending"),
            "cover_letter": a.get("cover_letter", ""),
            "applied_at": a.get("applied_at").isoformat() if a.get("applied_at") else None,
            "resume_url": a.get("resume_url", "")
        }
        
        # Populate job info
        try:
            job = db["jobs"].find_one({"_id": ObjectId(a["job_id"])})
            if job:
                app_data["job_title"] = job.get("title", "")
        except:
            pass
        
        # Populate user info
        try:
            user = db["users"].find_one({"_id": ObjectId(a["user_id"])})
            if user:
                app_data["applicant_name"] = user.get("full_name", "")
                app_data["applicant_email"] = user.get("email", "")
                app_data["applicant_id"] = str(user["_id"])
        except:
            pass
        
        apps_list.append(app_data)
        
    return jsonify({
        "success": True,
        "data": {"applications": apps_list}
    }), 200

@recruiter_bp.route("/applications/<app_id>/status", methods=["PATCH"])
@jwt_required()
@recruiter_required
def update_application_status(app_id):
    """Update the status of an application."""
    data = request.get_json()
    db = get_db()
    user_id = get_jwt_identity()
    
    valid_statuses = ["pending", "reviewed", "shortlisted", "rejected", "hired"]
    new_status = data.get("status")
    
    if new_status not in valid_statuses:
        return jsonify({"success": False, "message": "Invalid status."}), 400
    
    # Verify the application belongs to a job posted by this recruiter
    app_doc = db["applications"].find_one({"_id": ObjectId(app_id)})
    if not app_doc:
        return jsonify({"success": False, "message": "Application not found."}), 404
        
    job = db["jobs"].find_one({"_id": app_doc["job_id"]})
    if not job or (job.get("posted_by") != user_id and db["users"].find_one({"_id": ObjectId(user_id)}).get("role") != "admin"):
        return jsonify({"success": False, "message": "Access denied."}), 403
    
    db["applications"].update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return jsonify({"success": True, "message": f"Application status updated to '{new_status}'."}), 200
