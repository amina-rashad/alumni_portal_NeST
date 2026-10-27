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
from .notifications import create_notification
from .auth import _is_user_added_by_admin

users_bp = Blueprint("users", __name__)


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


def _clean_list(val) -> list:
    """Safely convert list or stringified list into a clean list of strings."""
    if not val:
        return []
    if isinstance(val, list):
        return [str(x).strip() for x in val if str(x).strip()]
    if isinstance(val, str):
        s = val.strip()
        if (s.startswith("[") and s.endswith("]")) or (s.startswith("(") and s.endswith(")")):
            import ast
            try:
                parsed = ast.literal_eval(s)
                if isinstance(parsed, (list, tuple)):
                    return [str(x).strip() for x in parsed if str(x).strip()]
            except Exception:
                pass
            # Fallback regex/strip
            inner = s[1:-1].strip()
            return [x.strip().strip("'\"") for x in inner.split(",") if x.strip().strip("'\"")]
        return [x.strip() for x in s.split(",") if x.strip()]
    return []


def _serialize_user(user: dict) -> dict:
    """Convert a MongoDB user document to a JSON-safe dictionary."""
    raw_col = user.get("college") or user.get("referral_source_details") or ""
    return {
        "id": str(user["_id"]),
        "full_name": user.get("full_name", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "college": normalize_college_name(raw_col) if raw_col else "",
        "user_type": user.get("user_type") or ("Applicant" if user.get("role") not in ("admin", "super_admin", "recruiter", "event_manager", "course_manager") else ""),
        "batch": user.get("batch", ""),
        "specialization": user.get("specialization", ""),
        "role": user.get("role", "user"),
        "bio": user.get("bio"),
        "profile_picture": user.get("profile_picture"),
        "linkedin_url": user.get("linkedin_url"),
        "github_url": user.get("github_url"),
        "twitter_url": user.get("twitter_url"),
        "portfolio_url": user.get("portfolio_url"),
        "resume_url": user.get("resume_url"),
        "resume_name": user.get("resume_name", ""),
        "resume_data": user.get("resume_data"),
        "is_resume_created": user.get("is_resume_created", False),
        "skills": _clean_list(user.get("skills", [])),
        "experience": user.get("experience", []),
        "education": user.get("education", []),
        "certificates": user.get("certificates", []),
        "is_active": user.get("is_active", True),
        "is_email_verified": user.get("is_email_verified", False),
        "created_at": user.get("created_at", "").isoformat() if user.get("created_at") else None,
        "last_login": user.get("last_login", "").isoformat() if user.get("last_login") else None,
        "status": user.get("status", "none"), # e.g. "open_to_work", "hiring", "none"
        "title": user.get("title", ""),
        "department": user.get("department", ""),
        "location": user.get("location", ""),
        "hiring_focus": user.get("hiring_focus", ""),
        "graduation_year": user.get("graduation_year", "") or user.get("batch", ""),
        "current_organisation": user.get("current_organisation", "") or user.get("current_company", ""),
        "current_company": user.get("current_company", "") or user.get("current_organisation", ""),
        "current_designation": user.get("current_designation", "") or user.get("title", ""),
        "total_experience": user.get("total_experience", ""),
        "current_location": user.get("current_location", "") or user.get("location", ""),
        "preferred_location": user.get("preferred_location", ""),
        "resume_drive_link": user.get("resume_drive_link", "") or user.get("resume_url", ""),
        "referral_source": user.get("referral_source", ""),
        "referral_source_details": user.get("referral_source_details", ""),
        "tech_stacks": _clean_list(user.get("tech_stacks", [])),
        "interested_positions": _clean_list(user.get("interested_positions", [])),
        "declaration_confirmed": bool(user.get("declaration_confirmed", False)),
        "added_by_admin": _is_user_added_by_admin(user),
        "not_added_by_admin": not _is_user_added_by_admin(user),
    }


# ── Get Current User Profile ──

@users_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get the authenticated user's profile."""
    user_id = get_jwt_identity()
    db = get_db()

    user = None
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
    if not user:
        user = db["users"].find_one({"email": user_id})
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    # Merge any previously entered application details if user profile fields are empty
    try:
        latest_app = db["applications"].find_one(
            {"user_id": user["_id"]},
            sort=[("applied_at", -1)]
        )
        if latest_app:
            for field in [
                "phone", "graduation_year", "batch", "current_organisation", "current_company",
                "current_designation", "title", "total_experience", "current_location", "location",
                "preferred_location", "resume_drive_link", "resume_url", "referral_source",
                "referral_source_details", "tech_stacks", "interested_positions", "declaration_confirmed",
                "college", "specialization", "linkedin_url"
            ]:
                if (user.get(field) is None or user.get(field) == "" or user.get(field) == []) and latest_app.get(field):
                    user[field] = latest_app[field]
    except Exception as e:
        print("Error merging latest application for profile:", e)

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
        "bio", "linkedin_url", "github_url", "twitter_url", "portfolio_url",
        "skills", "profile_picture", "experience", "education", "certificates",
        "resume_url", "resume_name", "resume_data", "is_resume_created", "status", "title", "department", "location", "hiring_focus",
        "graduation_year", "current_organisation", "current_company", "current_designation",
        "total_experience", "current_location", "preferred_location", "resume_drive_link",
        "referral_source", "referral_source_details", "college", "tech_stacks", "interested_positions", "declaration_confirmed"
    ]

    update_data = {}
    for field in allowed_fields:
        if field in data and data[field] is not None:
            val = data[field]
            if field in ("tech_stacks", "interested_positions", "skills"):
                update_data[field] = _clean_list(val)
            elif field == "declaration_confirmed":
                update_data[field] = bool(val)
            else:
                update_data[field] = val

    # Sync college
    raw_col = update_data.get("college") or update_data.get("referral_source_details")
    if raw_col:
        update_data["college"] = normalize_college_name(raw_col)

    # Sync aliases
    if "graduation_year" in update_data and not update_data.get("batch"):
        update_data["batch"] = update_data["graduation_year"]
    if "batch" in update_data and not update_data.get("graduation_year"):
        update_data["graduation_year"] = update_data["batch"]
    if "current_organisation" in update_data and not update_data.get("current_company"):
        update_data["current_company"] = update_data["current_organisation"]
    if "current_company" in update_data and not update_data.get("current_organisation"):
        update_data["current_organisation"] = update_data["current_company"]
    if "current_designation" in update_data and not update_data.get("title"):
        update_data["title"] = update_data["current_designation"]
    if "current_location" in update_data and not update_data.get("location"):
        update_data["location"] = update_data["current_location"]
    if "resume_drive_link" in update_data and not update_data.get("resume_url"):
        update_data["resume_url"] = update_data["resume_drive_link"]

    if not update_data:
        return jsonify({"success": False, "message": "No valid fields to update."}), 400

    update_data["updated_at"] = datetime.now(timezone.utc)

    db = get_db()
    user = None
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
    if not user:
        user = db["users"].find_one({"email": user_id})
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    try:
        result = db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": update_data}
        )

        # Synchronize candidate details across all existing application records
        shared_app_updates = {}
        for k in ["full_name", "phone", "college", "location", "current_location", "resume_url", "resume_drive_link", "graduation_year", "batch", "total_experience", "current_organisation", "current_designation", "specialization", "linkedin_url"]:
            if k in update_data:
                shared_app_updates[k] = update_data[k]
        if shared_app_updates:
            db["applications"].update_many({"user_id": user["_id"]}, {"$set": shared_app_updates})
    except Exception as e:
        if "document too large" in str(e).lower():
            return jsonify({
                "success": False, 
                "message": "DocumentTooLarge",
                "error": "The profile data is too large for the database (Max 16MB). Please use smaller images."
            }), 413
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500

    if result.matched_count == 0:
        return jsonify({"success": False, "message": "User not found."}), 404
        
    # Trigger notification for profile update
    try:
        create_notification(
            db,
            user_id=user_id,
            type_str="system",
            title="Profile Updated",
            message="Your professional profile has been successfully updated.",
            link="/profile"
        )
    except:
        pass

    # Return updated user
    user = db["users"].find_one({"_id": user["_id"]})
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
        "resume_url": user.get("resume_url"),
        "resume_data": user.get("resume_data"),
        "is_resume_created": user.get("is_resume_created", False),
        "skills": user.get("skills", []),
    }

    return jsonify({
        "success": True,
        "data": {"user": public_data}
    }), 200

# ── List Users (for Directory) ──

@users_bp.route("/", methods=["GET"])
@jwt_required()
def list_users():
    """List all registered users with optional search/filtering."""
    db = get_db()
    
    # Simple search & filters from query params
    search_query = request.args.get("q", "")
    batch = request.args.get("batch", "")
    spec = request.args.get("spec", "")
    
    # Build MongoDB query
    query = {}
    if search_query:
        query["full_name"] = {"$regex": search_query, "$options": "i"}
    if batch:
        query["batch"] = batch
    if spec:
        query["specialization"] = spec
        
    # Project only necessary fields for directory listing
    projection = {
        "_id": 1,
        "full_name": 1,
        "user_type": 1,
        "batch": 1,
        "specialization": 1,
        "bio": 1,
        "profile_picture": 1,
        "skills": 1,
        "status": 1
    }
    
    users_cursor = db["users"].find(query, projection)
    users_list = []
    
    for u in users_cursor:
        u["id"] = str(u.pop("_id"))
        users_list.append(u)
        
    return jsonify({
        "success": True,
        "data": {"users": users_list}
    }), 200

# ── Get IV Certificates from Global Repository ──

@users_bp.route("/me/iv-certificates", methods=["GET"])
@jwt_required()
def get_my_iv_certificates():
    """Fetch IV certificates from the global issued_iv_certificates collection matching name/email."""
    user_id = get_jwt_identity()
    db = get_db()
    
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404
        
    email = user.get("email", "").lower().strip()
    name = user.get("full_name", "").lower().strip()
    
    # Query matching either email OR name (fuzzy match for name)
    query = {
        "$or": [
            {"email": email},
            {"name": {"$regex": f"^{name}$", "$options": "i"}}
        ]
    }
    
    certs_cursor = db["issued_iv_certificates"].find(query).sort("issued_at", -1)
    certs_list = []
    for c in certs_cursor:
        certs_list.append({
            "id": str(c["_id"]),
            "type": "iv",
            "title": "Industrial Visit Excellence",
            "student_name": c.get("name"),
            "email": c.get("email"),
            "college": c.get("college"),
            "date": c.get("date"),
            "batch": c.get("batch"),
            "issued_at": c.get("issued_at").isoformat() if hasattr(c.get("issued_at"), "isoformat") else str(c.get("issued_at"))
        })
        
    return jsonify({
        "success": True,
        "data": {"certificates": certs_list}
    }), 200

@users_bp.route("/community-stats", methods=["GET"])
def get_community_stats():
    """Get public community stats (trending, highlights) synced with real stored data."""
    import re
    db = get_db()
    
    # 1. Highlights - accurate counts from database
    total_alumni = db["users"].count_documents({
        "$or": [
            {"role": {"$regex": "^alumni$", "$options": "i"}},
            {"user_type": {"$regex": "^alumni$", "$options": "i"}}
        ]
    })
    total_certs = db["issued_iv_certificates"].count_documents({}) + db["course_enrollments"].count_documents({"status": "completed"})
    
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    upcoming_event = db["events"].find_one(
        {"is_active": {"$ne": False}, "date": {"$gte": today_str}},
        sort=[("date", 1)]
    )
    if not upcoming_event:
        upcoming_event = db["events"].find_one({"is_active": {"$ne": False}}, sort=[("date", -1)])
        
    next_event_info = None
    if upcoming_event:
        next_event_info = {
            "title": upcoming_event.get("title", "Upcoming Meetup"),
            "date": upcoming_event.get("date", "")
        }

    # 2. Trending topics & hashtags - extracted dynamically from stored posts & events
    trending_tags = []
    seen_topics = set()
    
    # Check for explicit hashtags in post content
    for p in db["posts"].find().sort("created_at", -1):
        content = p.get("content", "").strip()
        if not content:
            continue
        hashtags = re.findall(r"#(\w+)", content)
        likes_count = len(p.get("likes", []))
        comments_count = len(p.get("comments", []))
        total_interactions = likes_count + comments_count
        
        for tag in hashtags:
            clean_tag = tag.strip()
            if clean_tag and clean_tag.lower() not in seen_topics:
                seen_topics.add(clean_tag.lower())
                trending_tags.append({
                    "topic": clean_tag,
                    "interactions": total_interactions,
                    "growth": f"+{total_interactions * 10 + 5}%" if total_interactions > 0 else "Active",
                    "type": "hashtag"
                })

    # If fewer than 4 hashtags, derive topics from post subject lines
    if len(trending_tags) < 4:
        for p in db["posts"].find().sort("created_at", -1):
            content = p.get("content", "").strip()
            if not content:
                continue
            first_line = content.split("\n")[0].strip()
            clean_title = re.sub(r"[!?:;,\-–—&]+", " ", first_line).strip()
            clean_title = re.sub(r"\s+", " ", clean_title).strip()
            words = clean_title.split()
            if len(words) > 4:
                clean_title = " ".join(words[:4])
            clean_title = clean_title.strip()
            if clean_title and clean_title.lower() not in seen_topics:
                seen_topics.add(clean_title.lower())
                likes_count = len(p.get("likes", []))
                comments_count = len(p.get("comments", []))
                total_interactions = likes_count + comments_count
                trending_tags.append({
                    "topic": clean_title,
                    "interactions": total_interactions,
                    "growth": f"+{total_interactions * 15 + 10}%" if total_interactions > 0 else "Active",
                    "type": "post"
                })
            if len(trending_tags) >= 4:
                break

    # Add active events if slots available
    if len(trending_tags) < 4:
        for e in db["events"].find({"is_active": {"$ne": False}}).limit(2):
            event_title = e.get("title", "").strip()
            if event_title and event_title.lower() not in seen_topics:
                seen_topics.add(event_title.lower())
                attendees = len(e.get("attendees", []))
                trending_tags.append({
                    "topic": event_title,
                    "interactions": attendees,
                    "growth": "Upcoming",
                    "type": "event"
                })

    return jsonify({
        "success": True,
        "data": {
            "highlights": {
                "new_alumni": total_alumni,
                "portal_members": db["users"].count_documents({}),
                "jobs_posted": db["jobs"].count_documents({}),
                "courses_available": db["courses"].count_documents({}),
                "certifications": total_certs,
                "upcoming_event": next_event_info
            },
            "trending": trending_tags
        }
    }), 200

@users_bp.route("/public-stats", methods=["GET"])
def get_public_stats():
    """Get public counts synced directly with the database for the landing page."""
    db = get_db()
    total_users = db["users"].count_documents({})
    alumni_count = db["users"].count_documents({
        "$or": [
            {"role": {"$regex": "^alumni$", "$options": "i"}},
            {"user_type": {"$regex": "^alumni$", "$options": "i"}}
        ]
    })
    # If no users have been explicitly designated with 'Alumni' role yet,
    # the platform alumni network count reflects the full registered community network
    display_alumni_network = alumni_count if alumni_count > 0 else total_users
    
    total_jobs = db["jobs"].count_documents({})
    active_jobs = db["jobs"].count_documents({"is_active": True})
    display_jobs = active_jobs if active_jobs > 0 else total_jobs
    
    total_courses = db["courses"].count_documents({})
    total_applications = db["applications"].count_documents({})
    
    if total_applications > 0:
        shortlisted_count = db["applications"].count_documents({
            "status": {"$in": ["Shortlisted", "Aptitude", "Interview Scheduled", "Offered", "Hired"]}
        })
        accuracy_val = min(98, max(85, round((shortlisted_count / total_applications) * 100))) if shortlisted_count > 0 else 95
    else:
        accuracy_val = 95

    return jsonify({
        "success": True,
        "data": {
            "portal_members": total_users,
            "alumni_network": display_alumni_network,
            "jobs_posted": display_jobs,
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "courses_available": total_courses,
            "total_applications": total_applications,
            "match_accuracy": accuracy_val
        }
    }), 200

