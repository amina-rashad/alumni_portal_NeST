"""
Courses Management Routes
Provides read-only access to available courses.
"""

from bson import ObjectId
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app import get_db

courses_bp = Blueprint("courses", __name__)

@courses_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_courses():
    """Fetch all courses."""
    db = get_db()
    
    # Sort by creation date descending if it exists
    courses_cursor = db["courses"].find().sort("createdAt", -1)
    
    courses_list = []
    for c in courses_cursor:
        c["id"] = str(c["_id"])
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
    del course["_id"]
    if "createdAt" in course and hasattr(course["createdAt"], "isoformat"):
        course["createdAt"] = course["createdAt"].isoformat()

    return jsonify({
        "success": True,
        "data": {
            "course": course
        }
    }), 200
