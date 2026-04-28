from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime
# Assuming a standard project structure where 'db' is available
# from app import mongo 

reminders_bp = Blueprint('reminders', __name__)

# Mock Data for demonstration since we are in a dev environment
MOCK_ALERTS = [
    {
        "id": "1",
        "studentName": "Amina Rashad",
        "studentEmail": "amina.r@nestdigital.com",
        "type": "Low Attendance",
        "details": "Current attendance is 64%. Requires immediate attention to meet the 75% threshold.",
        "severity": "High",
        "status": "Pending",
        "createdAt": datetime.now().isoformat()
    },
    {
        "id": "2",
        "studentName": "Melbin Mani",
        "studentEmail": "melbin.m@nestdigital.com",
        "type": "Upcoming Assessment",
        "details": "Full Stack Development Quiz scheduled for tomorrow at 10:00 AM.",
        "severity": "Medium",
        "status": "Pending",
        "createdAt": datetime.now().isoformat()
    },
    {
        "id": "3",
        "studentName": "Rahul Kumar",
        "studentEmail": "rahul.k@nestdigital.com",
        "type": "Inactive Student",
        "details": "No login activity detected since April 15, 2024 (13 days ago).",
        "severity": "High",
        "status": "Pending",
        "createdAt": datetime.now().isoformat()
    },
    {
        "id": "4",
        "studentName": "Sneha Joseph",
        "studentEmail": "sneha.j@nestdigital.com",
        "type": "Pending Completion",
        "details": "Course \"Advanced React Patterns\" is 92% complete. 2 assessments pending.",
        "severity": "Low",
        "status": "Pending",
        "createdAt": datetime.now().isoformat()
    }
]

@reminders_bp.route('/api/reminders/alerts', methods=['GET'])
def get_alerts():
    # In a real app, you would query MongoDB here:
    # alerts = list(mongo.db.reminders.find())
    return jsonify({"success": True, "data": MOCK_ALERTS})

@reminders_bp.route('/api/reminders/send', methods=['POST'])
def send_reminder():
    data = request.json
    alert_id = data.get('alertId')
    
    # Logic to send email/notification would go here
    # 1. Fetch student details
    # 2. Trigger SMTP / Notification Service
    # 3. Update alert status in DB
    
    return jsonify({
        "success": True, 
        "message": f"Reminder successfully dispatched for alert {alert_id}"
    })

@reminders_bp.route('/api/reminders/stats', methods=['GET'])
def get_stats():
    stats = {
        "attendance_alerts": 12,
        "upcoming_exams": 24,
        "inactive_users": 8,
        "course_lags": 15
    }
    return jsonify({"success": True, "data": stats})
