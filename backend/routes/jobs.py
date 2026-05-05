"""
Job Listings Management Routes
Provides read-only access to available job openings.
"""

from bson import ObjectId
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app import get_db

jobs_bp = Blueprint("jobs", __name__)

@jobs_bp.route("", methods=["GET"])
def get_all_jobs():
    """Fetch all jobs (Public)."""
    db = get_db()
    
    # Sort by creation date descending if it exists
    jobs_cursor = db["jobs"].find().sort("createdAt", -1)
    
    jobs_list = []
    for j in jobs_cursor:
        j["id"] = str(j["_id"])
        del j["_id"]
        
        # Format the date nicely if present
        if "createdAt" in j and hasattr(j["createdAt"], "isoformat"):
            j["createdAt"] = j["createdAt"].isoformat()
            
        jobs_list.append(j)

    return jsonify({
        "success": True,
        "data": {
            "jobs": jobs_list
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
    if "createdAt" in job and hasattr(job["createdAt"], "isoformat"):
        job["createdAt"] = job["createdAt"].isoformat()

    return jsonify({
        "success": True,
        "data": {
            "job": job
        }
    }), 200
