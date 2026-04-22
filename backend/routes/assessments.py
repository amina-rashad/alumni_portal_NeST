"""
Assessments Management Routes
Handles the 5-stage assessment engine for courses.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import get_db
from .notifications import create_notification

assessments_bp = Blueprint("assessments", __name__)

def get_assessment_status(db, user_id, course_id):
    """Helper to get or initialize an assessment attempt."""
    attempt = db["assessment_attempts"].find_one({
        "user_id": ObjectId(user_id),
        "course_id": ObjectId(course_id)
    })
    
    course = db["courses"].find_one({"_id": ObjectId(course_id)})
    required = course.get("required_assessments", [1, 2, 3, 4, 5]) if course else [1, 2, 3, 4, 5]

    if not attempt:
        # Check if user is enrolled
        enrolled = db["course_enrollments"].find_one({
            "user_id": ObjectId(user_id),
            "course_id": ObjectId(course_id)
        })
        if not enrolled:
            return None
            
        # Find first required stage
        first_stage = min(required) if required else 1

        # Initialize new attempt
        attempt = {
            "user_id": ObjectId(user_id),
            "course_id": ObjectId(course_id),
            "current_stage": first_stage,
            "is_completed": False,
            "stages": {
                str(i): {"status": "not_started" if i == first_stage else "locked", "data": {}}
                for i in [1, 2, 3, 4, 5]
            },
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        result = db["assessment_attempts"].insert_one(attempt)
        attempt["_id"] = result.inserted_id
        
    attempt["required_assessments"] = required
    return attempt

@assessments_bp.route("/status/<course_id>", methods=["GET"])
@jwt_required()
def get_status(course_id):
    """Get assessment status for a specific course."""
    db = get_db()
    user_id = get_jwt_identity()
    
    try:
        attempt = get_assessment_status(db, user_id, course_id)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400
        
    if not attempt:
        return jsonify({"success": False, "message": "Not enrolled in this course."}), 403
        
    attempt["id"] = str(attempt["_id"])
    del attempt["_id"]
    attempt["user_id"] = str(attempt["user_id"])
    attempt["course_id"] = str(attempt["course_id"])
    
    return jsonify({
        "success": True,
        "data": {"attempt": attempt}
    }), 200

@assessments_bp.route("/submit/<course_id>/<int:stage>", methods=["POST"])
@jwt_required()
def submit_stage(course_id, stage):
    """Submit data for a specific assessment stage."""
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({"success": False, "message": "No data provided."}), 400
        
    attempt = db["assessment_attempts"].find_one({
        "user_id": ObjectId(user_id),
        "course_id": ObjectId(course_id)
    })
    
    if not attempt:
        return jsonify({"success": False, "message": "Assessment not found."}), 404
        
    # Validation: Ensure it's the current or a previous stage
    # (Allowing re-submission or sequential progress)
    if stage > attempt["current_stage"]:
        return jsonify({"success": False, "message": f"Please complete previous stages first. Current: {attempt['current_stage']}."}), 400
        
    stage_key = str(stage)
    now = datetime.now(timezone.utc)
    
    # Logic for current stage
    new_status = "passed" if stage == 1 else "pending"
    
    update_doc = {
        f"stages.{stage_key}.status": new_status,
        f"stages.{stage_key}.submission": data,
        f"stages.{stage_key}.submitted_at": now,
        "updated_at": now
    }
    
    if stage == 1:
        update_doc[f"stages.{stage_key}.feedback"] = "Quiz passed automatically."
        update_doc[f"stages.{stage_key}.completed_at"] = now
        
    # Unlock next stage if we are submitting the 'active' current stage
    course = db["courses"].find_one({"_id": ObjectId(course_id)})
    required = course.get("required_assessments", [1, 2, 3, 4, 5]) if course else [1, 2, 3, 4, 5]

    if stage == attempt["current_stage"]:
        # Find next required stage
        next_stages = [s for s in required if s > stage]
        if next_stages:
            next_stage = min(next_stages)
            update_doc["current_stage"] = next_stage
            update_doc[f"stages.{str(next_stage)}.status"] = "not_started"
        else:
            # All required stages submitted
            if stage == 1: # Only round 1 required
               update_doc["is_completed"] = True
               db["course_enrollments"].update_one(
                   {"user_id": ObjectId(user_id), "course_id": ObjectId(course_id)},
                   {"$set": {"status": "Completed", "completed_at": now, "progress": 100}}
               )
            else:
               update_doc["is_completed"] = False # Needs final review
        
    db["assessment_attempts"].update_one(
        {"_id": attempt["_id"]},
        {"$set": update_doc}
    )
    
    # Notify admins for Stages 2-5
    if stage > 1:
        admins = db["users"].find({"role": "admin"})
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        course = db["courses"].find_one({"_id": ObjectId(course_id)})
        for admin in admins:
            create_notification(
                db,
                admin["_id"],
                "system",
                "New Assessment Submission",
                f"Student {user.get('name', 'Unknown')} submitted Stage {stage} for course '{course.get('title', 'Unknown')}'.",
                "/admin/certification" # Links to the review tab
            )
    
    msg = "Quiz passed! Proceeding to Stage 2." if stage == 1 else f"Stage {stage} submitted. You can now proceed to the next stage." if stage < 5 else "All stages submitted! Awaiting final admin review."
    
    return jsonify({"success": True, "message": msg}), 200

@assessments_bp.route("/enroll/<course_id>", methods=["POST"])
@jwt_required()
def enroll_course(course_id):
    """Enroll in a course."""
    db = get_db()
    user_id = get_jwt_identity()
    
    try:
        cid = ObjectId(course_id)
        uid = ObjectId(user_id)
    except:
        return jsonify({"success": False, "message": "Invalid IDs."}), 400
        
    # Check if course exists
    course = db["courses"].find_one({"_id": cid})
    if not course:
        return jsonify({"success": False, "message": "Course not found."}), 404
        
    # Check if already enrolled
    existing = db["course_enrollments"].find_one({"user_id": uid, "course_id": cid})
    if existing:
        return jsonify({"success": False, "message": "Already enrolled."}), 400
        
    now = datetime.now(timezone.utc)
    db["course_enrollments"].insert_one({
        "user_id": uid,
        "course_id": cid,
        "enrolled_at": now,
        "progress": 0,
        "status": "In Progress"
    })
    
    # Initialize assessment attempt
    get_assessment_status(db, user_id, course_id)
    
    return jsonify({"success": True, "message": "Successfully enrolled in course."}), 201

@assessments_bp.route("/my-courses", methods=["GET"])
@jwt_required()
def get_my_courses():
    """Get list of courses the user is enrolled in."""
    db = get_db()
    user_id = get_jwt_identity()
    
    enrollments = db["course_enrollments"].find({"user_id": ObjectId(user_id)})
    
    courses_list = []
    for en in enrollments:
        course = db["courses"].find_one({"_id": en["course_id"]})
        if course:
            course["id"] = str(course["_id"])
            del course["_id"]
            course["enrollment_info"] = {
                "enrolled_at": en["enrolled_at"].isoformat() if hasattr(en["enrolled_at"], "isoformat") else en["enrolled_at"],
                "progress": en.get("progress", 0),
                "status": en.get("status", "In Progress")
            }
            # Link assessment status
            attempt = db["assessment_attempts"].find_one({
                "user_id": ObjectId(user_id),
                "course_id": ObjectId(en["course_id"])
            })
            if attempt:
                course["assessment_info"] = {
                    "current_stage": attempt["current_stage"],
                    "is_completed": attempt["is_completed"]
                }
            courses_list.append(course)
            
    return jsonify({
        "success": True,
        "data": {"courses": courses_list}
    }), 200
@assessments_bp.route("/update-progress", methods=["POST"])
@jwt_required()
def update_course_progress():
    """Update progress for a course enrollment."""
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    course_id = data.get("course_id")
    progress = data.get("progress", 0)
    
    if not course_id:
        return jsonify({"success": False, "message": "Course ID is required."}), 400
        
    try:
        cid = ObjectId(course_id)
        uid = ObjectId(user_id)
    except:
        return jsonify({"success": False, "message": "Invalid IDs."}), 400
        
    # Update enrollment
    status = "In Progress" if progress < 100 else "Completed"
    result = db["course_enrollments"].update_one(
        {"user_id": uid, "course_id": cid},
        {"$set": {"progress": progress, "status": status}}
    )
    
    if result.matched_count == 0:
        return jsonify({"success": False, "message": "Enrollment not found."}), 404
        
    return jsonify({"success": True, "message": "Progress updated successfully."}), 200
