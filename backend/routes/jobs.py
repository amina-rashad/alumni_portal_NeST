"""
Job Listings Management Routes
Provides read-only access to available job openings.
"""

from bson import ObjectId
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app import get_db
from utils.date_helpers import format_datetime_utc

jobs_bp = Blueprint("jobs", __name__)

@jobs_bp.route("", methods=["GET"])
def get_all_jobs():
    """Fetch jobs with pagination (Public)."""
    from flask import request
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 6, type=int)
    skip = (page - 1) * limit

    db = get_db()
    # Only return active jobs
    jobs_cursor = db["jobs"].find({"is_active": {"$ne": False}}).sort("createdAt", -1).skip(skip).limit(limit)
    total_jobs = db["jobs"].count_documents({"is_active": {"$ne": False}})
    
    jobs_list = []
    for j in jobs_cursor:
        j["id"] = str(j["_id"])
        del j["_id"]
        
        # Format the date nicely if present
        if "createdAt" in j:
            j["createdAt"] = format_datetime_utc(j["createdAt"])
            
        jobs_list.append(j)

    return jsonify({
        "success": True,
        "data": {
            "jobs": jobs_list,
            "total": total_jobs,
            "page": page,
            "limit": limit,
            "pages": (total_jobs + limit - 1) // limit if limit > 0 else 1
        }
    }), 200

@jobs_bp.route("/<job_id>", methods=["GET"])
def get_job_by_id(job_id):
    """Fetch a single job by ID (Public)."""
    try:
        oid = ObjectId(job_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid job ID."}), 400

    db = get_db()
    job = db["jobs"].find_one({"_id": oid})

    if not job:
        return jsonify({"success": False, "message": "Job not found."}), 404

    job["id"] = str(job["_id"])
    del job["_id"]
    if "createdAt" in job:
        job["createdAt"] = format_datetime_utc(job["createdAt"])

    return jsonify({
        "success": True,
        "data": {
            "job": job
        }
    }), 200


@jobs_bp.route("/<job_id>", methods=["DELETE"])
@jwt_required()
def delete_job(job_id):
    """Delete a job listing."""
    db = get_db()
    user_id = get_jwt_identity()
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    role = (user.get("role") or "").strip().lower() if user else ""
    if not user or (role not in ("admin", "super_admin", "job_recruiter") and user.get("user_type") != "Staff"):
        return jsonify({"success": False, "message": "Unauthorized to delete jobs."}), 403

    try:
        oid = ObjectId(job_id)
        result = db["jobs"].delete_one({"$or": [{"_id": oid}, {"_id": str(job_id)}]})
    except Exception:
        result = db["jobs"].delete_one({"_id": str(job_id)})

    if result.deleted_count == 0:
        return jsonify({"success": False, "message": "Job not found."}), 404

    try:
        db["applications"].delete_many({"$or": [{"job_id": ObjectId(job_id)}, {"job_id": str(job_id)}]})
    except Exception:
        pass

    return jsonify({"success": True, "message": "Job deleted successfully."}), 200

