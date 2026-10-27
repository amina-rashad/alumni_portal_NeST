"""
Courses Management Routes
Provides CRUD access to academic programs and courses.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps

from app import get_db
from utils.date_helpers import format_datetime_utc

courses_bp = Blueprint("courses", __name__)

def course_manager_or_admin_required(fn):
    """Decorator to allow course_manager, admin, or super_admin roles."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        db = get_db()
        user = None
        try:
            user = db["users"].find_one({"_id": ObjectId(user_id)})
        except Exception:
            pass
        if not user:
            user = db["users"].find_one({"$or": [{"email": str(user_id).strip().lower()}, {"emp_id": str(user_id)}]})
        role = (user.get("role") or "").strip().lower() if user else ""
        if not user or (role not in ("course_manager", "admin", "super_admin") and user.get("user_type") != "Staff"):
            return jsonify({"success": False, "message": "Course Manager or Admin privileges required."}), 403
        return fn(*args, **kwargs)
    return wrapper

@courses_bp.route("/", methods=["GET"], strict_slashes=False)
@courses_bp.route("", methods=["GET"], strict_slashes=False)
@jwt_required(optional=True)
def get_all_courses():
    """Fetch all courses with pagination."""
    db = get_db()
    
    current_user_id = get_jwt_identity()
    user_enrolled_map = {}
    if current_user_id:
        try:
            u_query = [ObjectId(current_user_id), str(current_user_id)] if ObjectId.is_valid(str(current_user_id)) else [str(current_user_id)]
            user_enrollments = list(db["course_enrollments"].find({"user_id": {"$in": u_query}}))
            for ue in user_enrollments:
                cid_str = str(ue.get("course_id", ""))
                user_enrolled_map[cid_str] = {
                    "is_enrolled": True,
                    "status": ue.get("status", "In Progress"),
                    "progress": ue.get("progress", 0)
                }
        except Exception:
            pass

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 6))
    skip = (page - 1) * limit
    
    total_courses = db["courses"].count_documents({})
    total_pages = (total_courses + limit - 1) // limit
    
    courses_raw = list(db["courses"].find().sort("createdAt", -1).skip(skip).limit(limit))
    course_oids = [c["_id"] for c in courses_raw]
    
    enrolls_by_course = {}
    if course_oids:
        all_enrolls = list(db["course_enrollments"].find({
            "$or": [
                {"course_id": {"$in": course_oids}},
                {"course_id": {"$in": [str(x) for x in course_oids]}}
            ]
        }))
        for e in all_enrolls:
            cid = str(e.get("course_id", ""))
            if cid not in enrolls_by_course:
                enrolls_by_course[cid] = []
            enrolls_by_course[cid].append(e)

    courses_list = []
    for c in courses_raw:
        oid = c["_id"]
        c["id"] = str(oid)
        user_en = user_enrolled_map.get(str(oid))
        c["is_enrolled"] = bool(user_en)
        c["enrollment_status"] = user_en.get("status") if user_en else None
        c["user_progress"] = user_en.get("progress", 0) if user_en else 0
        enrolls = enrolls_by_course.get(str(oid), [])
        enrolled_count = len(enrolls)
        c["enrolled_count"] = enrolled_count
        if enrolled_count > 0:
            progs = [e.get("progress", 0) for e in enrolls]
            avg_progress = round(sum(progs) / len(progs))
            completed_count = sum(1 for e in enrolls if str(e.get("status", "")).lower() == "completed" or e.get("progress", 0) >= 100)
            c["avg_progress"] = avg_progress
            c["active_learners"] = enrolled_count - completed_count
            c["completed_learners"] = completed_count
            c["health_percent"] = avg_progress
        else:
            c["avg_progress"] = 0
            c["active_learners"] = 0
            c["completed_learners"] = 0
            c["health_percent"] = 0

        c["is_active"] = c.get("is_active", False if str(c.get("status", "")).lower() == "inactive" else True)
        if "status" not in c or not c["status"]:
            c["status"] = "active" if c["is_active"] else "inactive"
        del c["_id"]
        if "createdAt" in c:
            c["createdAt"] = format_datetime_utc(c["createdAt"])
        courses_list.append(c)

    return jsonify({
        "success": True,
        "data": {
            "courses": courses_list,
            "total_pages": total_pages,
            "total_courses": total_courses,
            "current_page": page
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
@courses_bp.route("/", methods=["POST"], strict_slashes=False)
@courses_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
@course_manager_or_admin_required
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
        "modules": data.get("modules", []),
        "links": data.get("links", []),
        "cover_image": data.get("cover_image") or data.get("thumbnail", ""),
        "thumbnail": data.get("cover_image") or data.get("thumbnail", ""),
        "is_active": data.get("is_active", True),
        "is_published": data.get("is_published", True),
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
@jwt_required()
@course_manager_or_admin_required
def update_course(course_id):
    """Update an existing course."""
    db = get_db()
    data = request.get_json()

    try:
        oid = ObjectId(course_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid course ID."}), 400

    update_data = {}
    fields = ["title", "description", "level", "duration", "instructor", "status", "is_active", "assessmentFlow", "curriculum"]
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
@jwt_required()
@course_manager_or_admin_required
def delete_course(course_id):
    """Delete a course and cascade cleanups."""
    db = get_db()
    try:
        oid = ObjectId(course_id)
        result = db["courses"].delete_one({"$or": [{"_id": oid}, {"_id": str(course_id)}]})
    except Exception:
        result = db["courses"].delete_one({"_id": str(course_id)})

    if result.deleted_count == 0:
        return jsonify({"success": False, "message": "Course not found."}), 404

    try:
        db["course_enrollments"].delete_many({"$or": [{"course_id": ObjectId(course_id)}, {"course_id": str(course_id)}]})
        db["course_assessments"].delete_many({"$or": [{"course_id": ObjectId(course_id)}, {"course_id": str(course_id)}]})
        db["assessment_submissions"].delete_many({"$or": [{"course_id": ObjectId(course_id)}, {"course_id": str(course_id)}]})
        db["assessment_attempts"].delete_many({"$or": [{"course_id": ObjectId(course_id)}, {"course_id": str(course_id)}]})
        db["course_recommendations"].delete_many({"$or": [{"course_id": ObjectId(course_id)}, {"course_id": str(course_id)}]})
    except Exception as e:
        print(f"Cleanup error on course delete: {e}")

    return jsonify({
        "success": True,
        "message": "Course deleted successfully."
    }), 200
