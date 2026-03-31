"""
Job Applications Routes
Handles job application submission, status tracking, and management.
Users can apply for jobs and track their applications.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import get_db

applications_bp = Blueprint("applications", __name__)


def _serialize_application(app_doc: dict, db=None) -> dict:
    """Convert a MongoDB application document to a JSON-safe dictionary."""
    result = {
        "id": str(app_doc["_id"]),
        "job_id": str(app_doc.get("job_id", "")),
        "user_id": str(app_doc.get("user_id", "")),
        "cover_letter": app_doc.get("cover_letter", ""),
        "resume_url": app_doc.get("resume_url", ""),
        "status": app_doc.get("status", "pending"),
        "applied_at": app_doc.get("applied_at").isoformat() if app_doc.get("applied_at") else None,
    }

    # Optionally populate job details
    if db is not None and app_doc.get("job_id"):
        try:
            job = db["jobs"].find_one({"_id": ObjectId(app_doc["job_id"])})
            if job:
                result["job_title"] = job.get("title", "")
                result["job_company"] = job.get("company", "")
                result["job_location"] = job.get("location", "")
        except:
            pass

    # Optionally populate user details
    if db is not None and app_doc.get("user_id"):
        try:
            user = db["users"].find_one({"_id": ObjectId(app_doc["user_id"])})
            if user:
                result["applicant_name"] = user.get("full_name", "")
                result["applicant_email"] = user.get("email", "")
        except:
            pass

    return result


# ── Apply for a Job ──

@applications_bp.route("/", methods=["POST"])
@jwt_required()
def apply_for_job():
    """Submit a job application."""
    user_id = get_jwt_identity()
    data = request.get_json(silent=True)

    if not data or not data.get("job_id"):
        return jsonify({"success": False, "message": "Job ID is required."}), 400

    db = get_db()

    # Verify job exists
    try:
        job = db["jobs"].find_one({"_id": ObjectId(data["job_id"])})
    except:
        return jsonify({"success": False, "message": "Invalid job ID."}), 400

    if not job:
        return jsonify({"success": False, "message": "Job not found."}), 404

    # Check if user already applied
    existing = db["applications"].find_one({
        "user_id": ObjectId(user_id),
        "job_id": ObjectId(data["job_id"])
    })
    if existing:
        return jsonify({"success": False, "message": "You have already applied for this job."}), 409

    application_doc = {
        "user_id": ObjectId(user_id),
        "job_id": ObjectId(data["job_id"]),
        "cover_letter": data.get("cover_letter", ""),
        "resume_url": data.get("resume_url", ""),
        "status": "pending",  # pending | reviewed | shortlisted | rejected | hired
        "applied_at": datetime.now(timezone.utc),
    }

    result = db["applications"].insert_one(application_doc)

    return jsonify({
        "success": True,
        "message": "Application submitted successfully!",
        "data": {"id": str(result.inserted_id)}
    }), 201


# ── Get My Applications ──

@applications_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_applications():
    """Get all applications submitted by the current user."""
    user_id = get_jwt_identity()
    db = get_db()

    apps_cursor = db["applications"].find(
        {"user_id": ObjectId(user_id)}
    ).sort("applied_at", -1)

    apps_list = [_serialize_application(a, db) for a in apps_cursor]

    return jsonify({
        "success": True,
        "data": {"applications": apps_list}
    }), 200


# ── Get Single Application ──

@applications_bp.route("/<application_id>", methods=["GET"])
@jwt_required()
def get_application(application_id):
    """Get details of a specific application."""
    user_id = get_jwt_identity()
    db = get_db()

    try:
        app_doc = db["applications"].find_one({"_id": ObjectId(application_id)})
    except:
        return jsonify({"success": False, "message": "Invalid application ID."}), 400

    if not app_doc:
        return jsonify({"success": False, "message": "Application not found."}), 404

    # Users can only see their own applications
    if str(app_doc["user_id"]) != user_id:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user or user.get("role") != "admin":
            return jsonify({"success": False, "message": "Access denied."}), 403

    return jsonify({
        "success": True,
        "data": {"application": _serialize_application(app_doc, db)}
    }), 200


# ── Withdraw Application ──

@applications_bp.route("/<application_id>", methods=["DELETE"])
@jwt_required()
def withdraw_application(application_id):
    """Withdraw a job application (only if still pending)."""
    user_id = get_jwt_identity()
    db = get_db()

    try:
        app_doc = db["applications"].find_one({"_id": ObjectId(application_id)})
    except:
        return jsonify({"success": False, "message": "Invalid application ID."}), 400

    if not app_doc:
        return jsonify({"success": False, "message": "Application not found."}), 404

    if str(app_doc["user_id"]) != user_id:
        return jsonify({"success": False, "message": "Access denied."}), 403

    if app_doc.get("status") != "pending":
        return jsonify({"success": False, "message": "Can only withdraw pending applications."}), 400

    db["applications"].delete_one({"_id": ObjectId(application_id)})

    return jsonify({
        "success": True,
        "message": "Application withdrawn successfully."
    }), 200
