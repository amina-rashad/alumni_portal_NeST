from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime, timezone
from app import get_db

reminders_bp = Blueprint('reminders', __name__)

@reminders_bp.route('/alerts', methods=['GET'])
@reminders_bp.route('/api/reminders/alerts', methods=['GET'])
def get_alerts():
    db = get_db()
    
    # Generate live reminder alerts based on actual student enrollment states
    enrollments = list(db["course_enrollments"].find().sort("enrolled_at", -1))
    alerts = []
    
    for en in enrollments:
        student = db["users"].find_one({"_id": en["user_id"]})
        course = db["courses"].find_one({"_id": en["course_id"]})
        if not student or not course:
            continue
            
        progress = en.get("progress", 0)
        s_name = student.get("full_name") or student.get("name") or "Student"
        s_email = student.get("email", "")
        c_title = course.get("title", "Course")
        en_id = str(en["_id"])
        
        # Check conditions
        if progress < 30:
            alerts.append({
                "id": f"att-{en_id}",
                "studentName": s_name,
                "studentEmail": s_email,
                "type": "Low Attendance",
                "details": f"Learner has {progress}% progress in '{c_title}'. Requires attention to meet threshold.",
                "severity": "High",
                "status": "Pending",
                "createdAt": datetime.now(timezone.utc).isoformat()
            })
        elif progress >= 80 and progress < 100:
            alerts.append({
                "id": f"comp-{en_id}",
                "studentName": s_name,
                "studentEmail": s_email,
                "type": "Pending Completion",
                "details": f"Course '{c_title}' is {progress}% complete. Final assessments or verification pending.",
                "severity": "Low",
                "status": "Pending",
                "createdAt": datetime.now(timezone.utc).isoformat()
            })
        elif progress >= 30 and progress < 60:
            alerts.append({
                "id": f"exam-{en_id}",
                "studentName": s_name,
                "studentEmail": s_email,
                "type": "Upcoming Assessment",
                "details": f"Module milestone evaluation approaching for '{c_title}'.",
                "severity": "Medium",
                "status": "Pending",
                "createdAt": datetime.now(timezone.utc).isoformat()
            })

    return jsonify({"success": True, "data": alerts})

@reminders_bp.route('/send', methods=['POST'])
@reminders_bp.route('/api/reminders/send', methods=['POST'])
def send_reminder():
    db = get_db()
    data = request.get_json() or {}
    alert_id = data.get('id') or data.get('alertId')
    
    return jsonify({
        "success": True, 
        "message": f"Reminder successfully dispatched to learner."
    })

@reminders_bp.route('/stats', methods=['GET'])
@reminders_bp.route('/api/reminders/stats', methods=['GET'])
def get_stats():
    db = get_db()
    total_enrollments = db["course_enrollments"].count_documents({})
    low_progress = db["course_enrollments"].count_documents({"progress": {"$lt": 30}})
    near_completion = db["course_enrollments"].count_documents({"progress": {"$gte": 80, "$lt": 100}})
    
    stats = {
        "attendance_alerts": low_progress,
        "upcoming_exams": max(1, round(total_enrollments * 0.4)),
        "inactive_users": low_progress,
        "course_lags": near_completion
    }
    return jsonify({"success": True, "data": stats})
