"""
Course Manager Routes
Provides endpoints for course managers to manage courses, students, assessments, and attendance.
Protected with JWT authentication and course_manager role check.
"""

from datetime import datetime, timezone, timedelta
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import get_db
from .notifications import create_notification

course_manager_bp = Blueprint("course_manager", __name__)

def course_manager_required(fn):
    """Decorator to check if user has course_manager or admin role."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        db = get_db()
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user or user.get("role") not in ["course_manager", "admin", "super_admin"]:
            return jsonify({"success": False, "message": "Course Manager privileges required."}), 403
        return fn(*args, **kwargs)
    return wrapper

# ── Stats ──

@course_manager_bp.route("/stats", methods=["GET"])
@jwt_required()
@course_manager_required
def get_stats():
    """Aggregate stats for the course manager dashboard."""
    db = get_db()
    
    total_courses = db["courses"].count_documents({})
    active_enrollments = db["course_enrollments"].count_documents({"status": "In Progress"})
    
    # Calculate average completion rate
    all_enrollments = list(db["course_enrollments"].find({}, {"progress": 1}))
    avg_completion = 0
    if all_enrollments:
        total_progress = sum(e.get("progress", 0) for e in all_enrollments)
        avg_completion = total_progress / len(all_enrollments)
        
    # At-risk learners (students with progress < 30% after 7 days of enrollment)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    at_risk_count = db["course_enrollments"].count_documents({
        "status": "In Progress",
        "progress": {"$lt": 30},
        "enrolled_at": {"$lt": seven_days_ago}
    })

    # Pending reviews (Stages 2-5)
    pending_reviews = db["assessment_attempts"].count_documents({
        "$or": [
            {f"stages.{s}.status": "pending"} for s in ["2", "3", "4", "5"]
        ]
    })
    
    # Certificates issued
    certs_issued = db["certificates"].count_documents({"status": "Generated"})

    return jsonify({
        "success": True,
        "data": {
            "stats": {
                "total_courses": total_courses,
                "active_enrollments": active_enrollments,
                "avg_completion": f"{round(avg_completion)}%",
                "at_risk_learners": at_risk_count,
                "pending_reviews": pending_reviews,
                "certificates_issued": certs_issued
            }
        }
    }), 200

# ── Student Management (Enrollments) ──

@course_manager_bp.route("/students", methods=["GET"])
@jwt_required()
@course_manager_required
def get_managed_students():
    """List students enrolled in courses with their progress."""
    db = get_db()
    
    enrollments_cursor = db["course_enrollments"].find().sort("enrolled_at", -1)
    
    students_list = []
    for en in enrollments_cursor:
        student = db["users"].find_one({"_id": en["user_id"]})
        course = db["courses"].find_one({"_id": en["course_id"]})
        
        if student and course:
            students_list.append({
                "id": str(en["_id"]),
                "studentId": str(student["_id"]),
                "name": student.get("full_name", "Unknown"),
                "email": student.get("email", ""),
                "course": course.get("title", "Unknown"),
                "progress": en.get("progress", 0),
                "status": en.get("status", "In Progress"),
                "enrolledDate": en["enrolled_at"].isoformat() if hasattr(en["enrolled_at"], "isoformat") else None
            })
            
    return jsonify({
        "success": True,
        "data": {"students": students_list}
    }), 200

# ── Attendance & Insights ──

@course_manager_bp.route("/attendance/insights", methods=["GET"])
@jwt_required()
@course_manager_required
def get_attendance_insights():
    """Fetch attendance split and student logs."""
    db = get_db()
    course_name = request.args.get("course")
    
    query = {}
    if course_name:
        course = db["courses"].find_one({"title": course_name})
        if course:
            query["course_id"] = course["_id"]
            
    enrollments = db["course_enrollments"].find(query)
    
    logs = []
    # Simplified mock attendance for now as we don't have a check-in table yet
    for en in enrollments:
        student = db["users"].find_one({"_id": en["user_id"]})
        if student:
            # We derive "attendance" from progress and login activity for now
            status = "Present" if en.get("progress", 0) > 0 else "Absent"
            logs.append({
                "studentId": str(student["_id"]),
                "studentName": student.get("full_name", "Unknown"),
                "studentEmail": student.get("email", ""),
                "percentage": en.get("progress", 0),
                "todayLogin": "09:30 AM",
                "todayDuration": 120,
                "todayStatus": status
            })
            
    return jsonify({
        "success": True,
        "data": {"logs": logs}
    }), 200

# ── Assessment Management ──

@course_manager_bp.route("/assessments/pending", methods=["GET"])
@jwt_required()
@course_manager_required
def get_pending_assessments():
    """List assessment submissions awaiting review."""
    db = get_db()
    
    stages_to_review = ["2", "3", "4", "5"]
    pending_list = []
    
    attempts_cursor = db["assessment_attempts"].find({
        "$or": [
            {f"stages.{s}.status": "pending"} for s in stages_to_review
        ]
    })
    
    for attempt in attempts_cursor:
        pending_stage = None
        for s in stages_to_review:
            if attempt["stages"].get(s, {}).get("status") == "pending":
                pending_stage = s
                break
        
        if not pending_stage: continue
            
        user = db["users"].find_one({"_id": attempt["user_id"]})
        course = db["courses"].find_one({"_id": attempt["course_id"]})
        
        if user and course:
            pending_list.append({
                "id": str(attempt["_id"]),
                "studentName": user.get("full_name"),
                "studentEmail": user.get("email"),
                "courseName": course.get("title"),
                "stage": int(pending_stage),
                "submission": attempt["stages"][pending_stage].get("submission"),
                "submittedAt": attempt["stages"][pending_stage].get("submitted_at").isoformat() if hasattr(attempt["stages"][pending_stage].get("submitted_at"), "isoformat") else None
            })
            
    return jsonify({
        "success": True,
        "data": {"pending_assessments": pending_list}
    }), 200

@course_manager_bp.route("/assessments/<attempt_id>/review", methods=["PATCH"])
@jwt_required()
@course_manager_required
def review_assessment(attempt_id):
    """Approve or reject an assessment stage."""
    data = request.get_json()
    db = get_db()
    
    if not data or "action" not in data or "stage" not in data:
        return jsonify({"success": False, "message": "Action and stage are required."}), 400
        
    action = data["action"] # 'Approved' or 'Rejected'
    stage = str(data["stage"])
    feedback = data.get("feedback", "")
    score = data.get("score", 0)
    
    status = "completed" if action == "Approved" else "rejected"
    
    # Update the stage status
    result = db["assessment_attempts"].update_one(
        {"_id": ObjectId(attempt_id)},
        {
            "$set": {
                f"stages.{stage}.status": status,
                f"stages.{stage}.feedback": feedback,
                f"stages.{stage}.score": score,
                f"stages.{stage}.reviewed_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    if result.matched_count == 0:
        return jsonify({"success": False, "message": "Assessment attempt not found."}), 404
        
    # If approved and it's not the final stage, we could potentially prep the next stage
    if action == "Approved":
        next_stage = str(int(stage) + 1)
        # Check if next stage exists in our protocol (e.g., up to 5)
        if int(next_stage) <= 5:
            db["assessment_attempts"].update_one(
                {"_id": ObjectId(attempt_id)},
                {"$set": {f"stages.{next_stage}.status": "unlocked"}}
            )
            
    # Notify student
    attempt = db["assessment_attempts"].find_one({"_id": ObjectId(attempt_id)})
    if attempt:
        course = db["courses"].find_one({"_id": attempt["course_id"]})
        create_notification(
            db,
            attempt["user_id"],
            "system",
            "Assessment Reviewed",
            f"Your submission for '{course['title']}' stage {stage} was {action.lower()}.",
            f"/assessment/{str(attempt['course_id'])}"
        )
        
    return jsonify({"success": True, "message": f"Assessment {action.lower()} successfully."}), 200

# ── Certificate Management ──

@course_manager_bp.route("/certificates", methods=["GET"])
@jwt_required()
@course_manager_required
def get_certificates():
    """List students eligible for or already issued certificates."""
    db = get_db()
    
    # Find completed enrollments
    enrollments = db["course_enrollments"].find({"status": "Completed"})
    
    cert_list = []
    for en in enrollments:
        user = db["users"].find_one({"_id": en["user_id"]})
        course = db["courses"].find_one({"_id": en["course_id"]})
        
        if user and course:
            # Check if certificate record exists
            cert = db["certificates"].find_one({"enrollment_id": en["_id"]})
            status = cert.get("status", "Pending Generation") if cert else "Pending Generation"
            
            cert_list.append({
                "id": str(en["_id"]),
                "studentName": user.get("full_name"),
                "courseName": course.get("title"),
                "status": status,
                "issuedDate": cert.get("issued_at").isoformat() if cert and cert.get("issued_at") else "N/A",
                "grade": "A+" # Placeholder
            })
            
    return jsonify({
        "success": True,
        "data": {"certificates": cert_list}
    }), 200

@course_manager_bp.route("/certificates/<enrollment_id>/status", methods=["PATCH"])
@jwt_required()
@course_manager_required
def update_certificate_status(enrollment_id):
    """Update certificate status (Generated/Sent)."""
    data = request.get_json()
    db = get_db()
    
    status = data.get("status")
    if status not in ["Generated", "Sent"]:
        return jsonify({"success": False, "message": "Invalid status."}), 400
        
    eid = ObjectId(enrollment_id)
    now = datetime.now(timezone.utc)
    
    db["certificates"].update_one(
        {"enrollment_id": eid},
        {
            "$set": {
                "status": status,
                "updated_at": now,
                "issued_at": now if status == "Generated" else now # Simplified
            }
        },
        upsert=True
    )
    
    # Notify student
    enrollment = db["course_enrollments"].find_one({"_id": eid})
    if enrollment:
        create_notification(
            db,
            enrollment["user_id"],
            "system",
            "Certificate Update",
            f"Your certificate status has been updated to '{status}'.",
            "/profile"
        )
        
    return jsonify({"success": True, "message": f"Certificate status updated to {status}."}), 200
