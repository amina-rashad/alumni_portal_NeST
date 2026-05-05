"""
Authentication Routes
Handles user registration, login, token refresh, and logout.
All passwords are hashed with bcrypt. Authentication uses JWT tokens.
"""

import re
from datetime import datetime, timezone

import bcrypt
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)

from app import get_db

auth_bp = Blueprint("auth", __name__)

# ── Validation Helpers ──

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
VALID_USER_TYPES = ["Alumni", "Intern", "Trainee", "Industrial Student", "Event Participant"]


def _validate_registration(data: dict) -> list[str]:
    """Return a list of validation error messages (empty = valid)."""
    errors = []

    if not data.get("full_name", "").strip():
        errors.append("Full name is required.")
    elif len(data["full_name"].strip()) < 2:
        errors.append("Full name must be at least 2 characters.")

    email = data.get("email", "").strip().lower()
    if not email:
        errors.append("Email is required.")
    elif not EMAIL_REGEX.match(email):
        errors.append("Please provide a valid email address.")

    password = data.get("password", "")
    if not password:
        errors.append("Password is required.")
    elif len(password) < 8:
        errors.append("Password must be at least 8 characters.")
    elif not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter.")
    elif not re.search(r"[0-9]", password):
        errors.append("Password must contain at least one number.")

    if not data.get("phone", "").strip():
        errors.append("Phone number is required.")

    user_type = data.get("user_type", "")
    if user_type not in VALID_USER_TYPES:
        errors.append(f"User type must be one of: {', '.join(VALID_USER_TYPES)}.")

    if not data.get("batch", "").strip():
        errors.append("Batch / Year is required.")

    if not data.get("specialization", "").strip():
        errors.append("Specialization / Department is required.")

    return errors


# ── Register ──

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user.
    Expects JSON body with: full_name, email, password, phone, user_type, batch, specialization.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "message": "Request body is required."}), 400

    # Validate
    errors = _validate_registration(data)
    if errors:
        return jsonify({"success": False, "message": errors[0], "errors": errors}), 422

    db = get_db()
    users = db["users"]

    email = data["email"].strip().lower()

    # Check duplicate email
    if users.find_one({"email": email}):
        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    # Hash password
    hashed_pw = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())

    now = datetime.now(timezone.utc)

    user_doc = {
        "full_name": data["full_name"].strip(),
        "email": email,
        "password": hashed_pw,
        "phone": data["phone"].strip(),
        "user_type": data["user_type"],
        "batch": data["batch"].strip(),
        "specialization": data["specialization"].strip(),
        "role": "user",  # default role; admin can be set manually in DB
        "is_active": True,
        "is_email_verified": False,
        "profile_picture": None,
        "bio": None,
        "linkedin_url": None,
        "skills": [],
        "created_at": now,
        "updated_at": now,
        "last_login": None,
    }

    result = users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Generate tokens
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    return jsonify({
        "success": True,
        "message": "Registration successful! Welcome to NeST Digital Alumni Portal.",
        "data": {
            "user": {
                "id": user_id,
                "full_name": user_doc["full_name"],
                "email": user_doc["email"],
                "user_type": user_doc["user_type"],
                "role": user_doc["role"],
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    }), 201


# ── Login ──

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate a user.
    Expects JSON body with: email, password.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "message": "Request body is required."}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    db = get_db()
    users = db["users"]

    user = users.find_one({"email": email})
    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    # Verify password
    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    # Check if account is active
    if not user.get("is_active", True):
        return jsonify({
            "success": False,
            "message": "Your account has been deactivated. Please contact support."
        }), 403

    user_id = str(user["_id"])

    # Update last login timestamp
    users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )

    # Generate tokens
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    return jsonify({
        "success": True,
        "message": "Login successful! Welcome back.",
        "data": {
            "user": {
                "id": user_id,
                "full_name": user["full_name"],
                "email": user["email"],
                "user_type": user["user_type"],
                "role": user.get("role", "user"),
                "profile_picture": user.get("profile_picture"),
                "skills": user.get("skills", []),
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    }), 200


# ── Token Refresh ──

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Issue a new access token using a valid refresh token."""
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)

    return jsonify({
        "success": True,
        "data": {
            "access_token": new_access_token,
        }
    }), 200


# ── Verify Token (check if user is still authenticated) ──

@auth_bp.route("/verify", methods=["GET"])
@jwt_required()
def verify_token():
    """Verify the current access token and return user info."""
    current_user_id = get_jwt_identity()
    db = get_db()
    users = db["users"]

    from bson import ObjectId
    user = users.find_one({"_id": ObjectId(current_user_id)})

    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    return jsonify({
        "success": True,
        "data": {
            "user": {
                "id": str(user["_id"]),
                "full_name": user["full_name"],
                "email": user["email"],
                "user_type": user["user_type"],
                "role": user.get("role", "user"),
                "profile_picture": user.get("profile_picture"),
                "skills": user.get("skills", []),
            }
        }
    }), 200


# ── Logout (client-side token disposal — stateless JWT) ──

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    Logout endpoint. With stateless JWT, the client simply discards the token.
    This endpoint exists for API consistency and can be extended with a token blocklist.
    """
    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    }), 200
