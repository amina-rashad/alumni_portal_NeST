"""
Courses Management Routes
Provides CRUD access to academic programs and courses.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app import get_db

courses_bp = Blueprint("courses", __name__)

@courses_bp.route("/", methods=["GET"], strict_slashes=False)
@courses_bp.route("", methods=["GET"], strict_slashes=False)
# @jwt_required()
def get_all_courses():
    """Fetch all courses."""
    db = get_db()
    
    # Sort by creation date descending if it exists
    courses_cursor = db["courses"].find().sort("createdAt", -1)
    
    courses_list = []
    for c in courses_cursor:
        c["id"] = str(c["_id"])
        
        # Count enrollments for this course
        enrolled_count = db["course_enrollments"].count_documents({"course_id": c["_id"]})
        c["enrolled_count"] = enrolled_count
            
        del c["_id"]
        
        # Format the date nicely if present
        if "createdAt" in c and hasattr(c["createdAt"], "isoformat"):
            c["createdAt"] = c["createdAt"].isoformat()
            
        courses_list.append(c)

    return jsonify({
        "success": True,
        "data": {
            "courses": courses_list
        }
    }), 200

@courses_bp.route("/<course_id>", methods=["GET"])
@jwt_required()
def get_course_by_id(course_id):
    """Fetch a single course by ID."""
    try:
        oid = ObjectId(course_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid course ID."}), 400

    db = get_db()
    course = db["courses"].find_one({"_id": oid})

    if not course:
        return jsonify({"success": False, "message": "Course not found."}), 404

    course["id"] = str(course["_id"])
    
    # Count enrollments for this course
    enrolled_count = db["course_enrollments"].count_documents({"course_id": course["_id"]})
    course["enrolled_count"] = enrolled_count
    
    del course["_id"]
    if "createdAt" in course and hasattr(course["createdAt"], "isoformat"):
        course["createdAt"] = course["createdAt"].isoformat()

    return jsonify({
        "success": True,
        "data": {
            "course": course
        }
    }), 200
@courses_bp.route("/", methods=["POST"])
# @jwt_required()
def create_course():
    """Create a new course."""
    db = get_db()
    data = request.get_json()

    if not data or not data.get("title"):
        return jsonify({"success": False, "message": "Course title is required."}), 400

    new_course = {
        "title": data.get("title"),
        "description": data.get("description", ""),
        "level": data.get("level", "Beginner"),
        "duration": data.get("duration", "4 Weeks"),
        "instructor": data.get("instructor", "Lead NeST Expert"),
        "assessmentFlow": data.get("assessmentFlow", []),
        "curriculum": data.get("curriculum", []),
        "status": data.get("status", "Active"),
        "createdAt": datetime.now(timezone.utc)
    }

    result = db["courses"].insert_one(new_course)
    new_course["id"] = str(result.inserted_id)
    del new_course["_id"]
    new_course["createdAt"] = new_course["createdAt"].isoformat()

    return jsonify({
        "success": True,
        "message": "Course created successfully.",
        "data": new_course
    }), 201

@courses_bp.route("/<course_id>", methods=["PATCH"])
# @jwt_required()
def update_course(course_id):
    """Update an existing course."""
    db = get_db()
    data = request.get_json()

    try:
        oid = ObjectId(course_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid course ID."}), 400

    update_data = {}
    fields = ["title", "description", "level", "duration", "instructor", "status", "assessmentFlow", "curriculum"]
    for field in fields:
        if field in data:
            update_data[field] = data[field]

    if not update_data:
        return jsonify({"success": False, "message": "No data provided for update."}), 400

    db["courses"].update_one({"_id": oid}, {"$set": update_data})

    return jsonify({
        "success": True,
        "message": "Course updated successfully."
    }), 200

@courses_bp.route("/<course_id>", methods=["DELETE"])
# @jwt_required()
def delete_course(course_id):
    """Delete a course."""
    db = get_db()
    try:
        oid = ObjectId(course_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid course ID."}), 400

    db["courses"].delete_one({"_id": oid})

    return jsonify({
        "success": True,
        "message": "Course deleted successfully."
    }), 200
