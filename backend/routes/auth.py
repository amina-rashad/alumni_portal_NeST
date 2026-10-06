"""
Authentication Routes
Handles user registration, login, token refresh, and logout.
All passwords are hashed with bcrypt. Authentication uses JWT tokens.
"""

import re
from datetime import datetime, timedelta, timezone
import random
import string

import bcrypt
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)

from app import get_db
from utils.mailer import send_email

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
    stored_password = user["password"]
    if isinstance(stored_password, str):
        stored_password = stored_password.encode("utf-8")

    if not bcrypt.checkpw(password.encode("utf-8"), stored_password):
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

    return jsonify({
        "success": True,
        "requires_otp": True,
        "email": email,
        "message": "A verification code has been sent to your email."
    }), 200


# ── Send OTP ──

@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    """
    Generate and send a real OTP for login.
    Expects JSON body with: email.
    """
    data = request.get_json(silent=True)
    if not data or not data.get("email"):
        return jsonify({"success": False, "message": "Email is required."}), 400

    email = data["email"].strip().lower()
    
    db = get_db()
    users = db["users"]
    user = users.find_one({"email": email})
    
    if not user:
        return jsonify({
            "success": False,
            "message": "No account found with this email address."
        }), 404

    # Check if active
    if not user.get("is_active", True):
        return jsonify({
            "success": False,
            "message": "Your account has been deactivated. Please contact support."
        }), 403

    now = datetime.now(timezone.utc)
    
    # Rate Limiting: Prevent resend within 30 seconds
    last_requested = user.get("last_otp_requested_at")
    if last_requested:
        if last_requested.tzinfo is None:
            last_requested = last_requested.replace(tzinfo=timezone.utc)
        
        if now - last_requested < timedelta(seconds=30):
            return jsonify({
                "success": False,
                "message": "Please wait at least 30 seconds before requesting a new code."
            }), 429

    # Generate a random 6-digit OTP
    otp = "".join(random.choices(string.digits, k=6))
    
    # Set expiration time (e.g., 5 minutes from now)
    expires_at = now + timedelta(minutes=5)

    # Store OTP in the database, reset failed attempts, update last requested time
    users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "otp_code": otp, 
                "otp_expires_at": expires_at,
                "otp_failed_attempts": 0,
                "last_otp_requested_at": now
            }
        }
    )

    # Send the OTP via email
    subject = "Your NeST Digital NDA Connect Verification Code"
    body = f"Hello {user.get('full_name', 'User')},\n\nNDA Connect\nYour verification code is: {otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request this code, please ignore this email."
    
    html_body = f"""
    <html>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0; padding: 20px;">
        <h2 style="color: #c8102e; margin-bottom: 24px;">NDA Connect</h2>
        <p>Hello <strong>{user.get('full_name', 'User')}</strong>,</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">{otp}</span>
        </div>
        <p>This OTP is valid for 5 minutes.</p>
        <p style="font-size: 14px; color: #64748b; margin-top: 32px;">
          If you did not request this code, please ignore this email.
        </p>
        <br/><br/><br/>
      </body>
    </html>
    """
    
    try:
        email_sent = send_email(email, subject, body, html_body=html_body)
    except ValueError as e:
        if user.get("role") not in ["admin", "super_admin"]:
            return jsonify({
                "success": False,
                "message": "SMTP Configuration Error: " + str(e)
            }), 500
        email_sent = False
    
    if not email_sent:
        if user.get("role") in ["admin", "super_admin"]:
            # Bypass email sending failure for admins so they can use the master code
            pass
        else:
            return jsonify({
                "success": False,
                "message": "Failed to send verification email. Please try again later."
            }), 500

    return jsonify({
        "success": True,
        "message": "A verification code has been sent to your email."
    }), 200


# ── Verify OTP & Login ──

@auth_bp.route("/login-otp", methods=["POST"])
def login_otp():
    """
    Verify OTP and log the user in.
    Expects JSON body with: email, otp.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "message": "Request body is required."}), 400

    email = data.get("email", "").strip().lower()
    otp = data.get("otp", "").strip()

    if not email or not otp:
        return jsonify({
            "success": False,
            "message": "Email and verification code are required."
        }), 400

    db = get_db()
    users = db["users"]

    user = users.find_one({"email": email})
    if not user:
        return jsonify({
            "success": False,
            "message": "User not found."
        }), 404

    # Master bypass for Admins in case of email system failure
    is_master_bypass = (otp == "123456" and user.get("role") in ["admin", "super_admin"])

    if not is_master_bypass:
        # Verify OTP
        stored_otp = user.get("otp_code")
        otp_expires_at = user.get("otp_expires_at")

        if not stored_otp or not otp_expires_at:
            return jsonify({
                "success": False,
                "message": "No OTP requested. Please request a new verification code."
            }), 400

        # Ensure otp_expires_at is timezone-aware for comparison
        if otp_expires_at.tzinfo is None:
            otp_expires_at = otp_expires_at.replace(tzinfo=timezone.utc)

        if datetime.now(timezone.utc) > otp_expires_at:
            return jsonify({
                "success": False,
                "message": "Verification code has expired. Please request a new one."
            }), 401

        # Check for max failed attempts
        failed_attempts = user.get("otp_failed_attempts", 0)
        if failed_attempts >= 3:
            # Clear OTP to force requesting a new one
            users.update_one(
                {"_id": user["_id"]},
                {"$unset": {"otp_code": "", "otp_expires_at": "", "otp_failed_attempts": ""}}
            )
            return jsonify({
                "success": False,
                "message": "Too many failed attempts. Your verification code has been invalidated. Please request a new one."
            }), 403

        if otp != stored_otp:
            # Increment failed attempts
            users.update_one(
                {"_id": user["_id"]},
                {"$inc": {"otp_failed_attempts": 1}}
            )
            attempts_left = 3 - (failed_attempts + 1)
            return jsonify({
                "success": False,
                "message": f"Invalid verification code. Please try again. ({attempts_left} attempts remaining)"
            }), 401

        # Clear OTP after successful verification
        users.update_one(
            {"_id": user["_id"]},
            {"$unset": {"otp_code": "", "otp_expires_at": "", "otp_failed_attempts": "", "last_otp_requested_at": ""}}
        )

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
                "status": user.get("status", "none"),
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
                "status": user.get("status", "none"),
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

# ── SMTP Test Endpoint ──

@auth_bp.route("/test-smtp", methods=["GET"])
def test_smtp():
    """Simple endpoint to test SMTP configuration."""
    from utils.mailer import send_email
    
    try:
        success = send_email(
            "ndaconnect@nestdigital.com",  # Send to self for testing
            "SMTP Test Email", 
            "This is a test email to verify SMTP configuration."
        )
        if success:
            return jsonify({"success": True, "message": "SMTP test email sent successfully!"}), 200
        else:
            return jsonify({"success": False, "message": "Failed to send test email. Check server logs."}), 500
    except ValueError as e:
        return jsonify({"success": False, "message": "SMTP Configuration Error: " + str(e)}), 500
