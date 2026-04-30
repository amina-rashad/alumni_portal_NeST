"""
Recruiter Management Routes
Provides endpoints for recruiters to manage jobs and applications.
Protected with JWT authentication and recruiter role check.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required
import bcrypt

from app import get_db
from .notifications import create_notification
from utils.mailer import broadcast_email

recruiter_bp = Blueprint("recruiter", __name__)

def recruiter_required(fn):
    """Decorator to check if user has recruiter or admin role."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        db = get_db()
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user or user.get("role") not in ["job_recruiter", "recruiter", "admin", "super_admin"]:
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
    
    # Check if admin (admins see ALL activity, recruiters see only THEIR activity)
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    is_admin = user and user.get("role") in ("admin", "super_admin")
    
    # Filter logic
    job_filter = {} if is_admin else {"posted_by": user_id}
    
    my_jobs = list(db["jobs"].find(job_filter))
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
    
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    is_admin = user and user.get("role") in ("admin", "super_admin")
    
    job_filter = {} if is_admin else {"posted_by": user_id}
    jobs_cursor = db["jobs"].find(job_filter).sort("createdAt", -1)
    
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

    # Notify all users about the new job
    try:
        job_title = job_doc["title"]
        company = job_doc["company"]
        current_recruiter_id = get_jwt_identity()
        
        # Broaden audience for verification: notify everyone except the poster
        users_cursor = db["users"].find({
            "_id": {"$ne": ObjectId(current_recruiter_id)}
        }, {"_id": 1, "full_name": 1})
        
        count = 0
        for u in users_cursor:
            create_notification(
                db,
                user_id=u["_id"],
                type_str="job",
                title="New Career Opportunity",
                message=f"'{job_title}' at {company} has just been posted. View details and apply now!",
                link="/jobs"
            )
            count += 1
            print(f"DEBUG: Sent job notification to user {u.get('full_name')} ({u['_id']})")
            
        print(f"SUCCESS: Dispatched {count} notifications for new job: {job_title}")
    except Exception as notify_err:
        print(f"CRITICAL ERROR in job notification dispatch: {notify_err}")

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
    
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    is_admin = user and user.get("role") in ("admin", "super_admin")
    
    job_filter = {} if is_admin else {"posted_by": user_id}
    
    # Find jobs 
    my_jobs = db["jobs"].find(job_filter)
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
        {"$set": {"status": new_status, "updatedAt": datetime.now(timezone.utc)}}
    )
    
    return jsonify({"success": True, "message": "Application status updated."}), 200

# ── Talent Search & Mailing (🔥 RECRUITER ELITE) ──

@recruiter_bp.route("/talent-filters", methods=["GET"])
@jwt_required()
@recruiter_required
def get_talent_filters():
    db = get_db()
    
    # Aggregate unique specializations and skills
    specializations = db["users"].distinct("specialization")
    raw_skills = db["users"].distinct("skills")
    
    # Standardize skills (could be list or string)
    flat_skills = set()
    for s in raw_skills:
        if isinstance(s, list):
            for item in s: flat_skills.add(item)
        elif s:
            flat_skills.add(s)
            
    # Get course titles
    courses = db["courses"].distinct("title")
    
    return jsonify({
        "success": True,
        "data": {
            "specializations": sorted([s for s in specializations if s]),
            "skills": sorted(list(flat_skills)),
            "courses": sorted([c for c in courses if c])
        }
    }), 200

@recruiter_bp.route("/talents", methods=["GET"])
@jwt_required()
@recruiter_required
def search_talents():
    db = get_db()
    skill_query = request.args.get("skill")
    course_query = request.args.get("course")
    spec_query = request.args.get("specialization")
    
    query = {"role": {"$nin": ["admin", "super_admin", "recruiter", "job_recruiter"]}}
    
    if spec_query:
        query["specialization"] = spec_query
        
    if skill_query:
        query["$or"] = [
            {"skills": {"$regex": skill_query, "$options": "i"}},
            {"skills": {"$in": [skill_query]}}
        ]
        
    if course_query:
        # Find users who have completed or are enrolled in this course
        course = db["courses"].find_one({"title": course_query})
        if course:
            enrollments = db["course_enrollments"].find({"course_id": course["_id"]})
            user_ids = [e["user_id"] for e in enrollments]
            query["_id"] = {"$in": user_ids}

    talents_cursor = db["users"].find(query).limit(100)
    talents_list = []
    for t in talents_cursor:
        talents_list.append({
            "id": str(t["_id"]),
            "full_name": t.get("full_name", ""),
            "email": t.get("email", ""),
            "specialization": t.get("specialization", "N/A"),
            "user_type": t.get("user_type", "Alumni"),
            "skills": ", ".join(t.get("skills", [])) if isinstance(t.get("skills"), list) else t.get("skills", "N/A")
        })
        
    return jsonify({
        "success": True,
        "data": {"talents": talents_list}
    }), 200

@recruiter_bp.route("/broadcast-mail", methods=["POST"])
@jwt_required()
@recruiter_required
def broadcast_mail():
    data = request.get_json()
    recipients = data.get("recipients", [])
    subject = data.get("subject", "")
    body = data.get("body", "")
    
    if not recipients or not subject or not body:
        return jsonify({"success": False, "message": "Missing required fields."}), 400
        
    db = get_db()
    
    # Send actual emails (real SMTP if configured, otherwise logs to console)
    email_count = broadcast_email(recipients, subject, body)
    
    # Also trigger in-app notifications
    sent_count = 0
    for email in recipients:
        user = db["users"].find_one({"email": email})
        if user:
            create_notification(
                db,
                user_id=user["_id"],
                type_str="system",
                title=f"💼 Career Invitation: {subject}",
                message=f"A recruiter has sent you a direct career opportunity. Message: {body[:100]}...",
                link="/jobs"
            )
            sent_count += 1
            
    return jsonify({
        "success": True,
        "message": f"Broadcast successfully sent to {email_count} emails and {sent_count} portal alerts."
    }), 200
