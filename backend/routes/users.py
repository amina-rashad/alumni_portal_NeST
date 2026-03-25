"""
User Management Routes
Provides endpoints for user profile retrieval and updates.
All routes are protected with JWT authentication.
"""

from datetime import datetime, timezone

from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import get_db

users_bp = Blueprint("users", __name__)


def _serialize_user(user: dict) -> dict:
    """Convert a MongoDB user document to a JSON-safe dictionary."""
    return {
        "id": str(user["_id"]),
        "full_name": user.get("full_name", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "user_type": user.get("user_type", ""),
        "batch": user.get("batch", ""),
        "specialization": user.get("specialization", ""),
        "role": user.get("role", "user"),
        "bio": user.get("bio"),
        "profile_picture": user.get("profile_picture"),
        "linkedin_url": user.get("linkedin_url"),
        "skills": user.get("skills", []),
        "is_active": user.get("is_active", True),
        "is_email_verified": user.get("is_email_verified", False),
        "created_at": user.get("created_at", "").isoformat() if user.get("created_at") else None,
        "last_login": user.get("last_login", "").isoformat() if user.get("last_login") else None,
    }


# ── Get Current User Profile ──

@users_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get the authenticated user's profile."""
    user_id = get_jwt_identity()
    db = get_db()

    user = db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    return jsonify({
        "success": True,
        "data": {"user": _serialize_user(user)}
    }), 200


# ── Update Profile ──

@users_bp.route("/me", methods=["PATCH"])
@jwt_required()
def update_profile():
    """Update the authenticated user's profile fields."""
    user_id = get_jwt_identity()
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"success": False, "message": "Request body is required."}), 400

    # Fields allowed for update
    allowed_fields = [
        "full_name", "phone", "batch", "specialization",
        "bio", "linkedin_url", "skills", "profile_picture"
    ]

    update_data = {}
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]

    if not update_data:
        return jsonify({"success": False, "message": "No valid fields to update."}), 400

    update_data["updated_at"] = datetime.now(timezone.utc)

    db = get_db()
    result = db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return jsonify({"success": False, "message": "User not found."}), 404

    # Return updated user
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    return jsonify({
        "success": True,
        "message": "Profile updated successfully.",
        "data": {"user": _serialize_user(user)}
    }), 200


# ── Get User by ID (public profile) ──

@users_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
def get_user_by_id(user_id):
    """Get a user's public profile by their ID."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid user ID."}), 400

    db = get_db()
    user = db["users"].find_one({"_id": oid})

    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    # Return limited public info
    public_data = {
        "id": str(user["_id"]),
        "full_name": user.get("full_name", ""),
        "user_type": user.get("user_type", ""),
        "batch": user.get("batch", ""),
        "specialization": user.get("specialization", ""),
        "bio": user.get("bio"),
        "profile_picture": user.get("profile_picture"),
        "linkedin_url": user.get("linkedin_url"),
        "skills": user.get("skills", []),
    }

    return jsonify({
        "success": True,
        "data": {"user": public_data}
    }), 200
