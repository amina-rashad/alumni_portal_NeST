from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime

achievements_bp = Blueprint('achievements', __name__)

# Mock Data for demonstration
MOCK_ACHIEVEMENTS = [
    {"id": "1", "name": "Early Bird", "type": "Badge", "trigger": "First Enrollment", "rewardValue": "BADGE_SILVER", "status": "Active", "createdAt": "2024-04-10"},
    {"id": "2", "name": "Quiz Master", "type": "XP", "trigger": "100% Quiz Score", "rewardValue": "500 XP", "status": "Active", "createdAt": "2024-04-12"},
    {"id": "3", "name": "Course finisher", "type": "Celebration", "trigger": "Course Completion", "rewardValue": "POPUP_CELEB", "status": "Draft", "createdAt": "2024-04-15"},
]

MOCK_HISTORY = [
    {"id": "h1", "studentName": "Alex Johnson", "achievementName": "Early Bird", "rewardType": "Badge", "issuedAt": "2 hours ago"},
    {"id": "h2", "studentName": "Maria Garcia", "achievementName": "Quiz Master", "rewardType": "XP", "issuedAt": "5 hours ago"},
    {"id": "h3", "studentName": "David Chen", "achievementName": "Early Bird", "rewardType": "Badge", "issuedAt": "1 day ago"},
]

@achievements_bp.route('/api/achievements', methods=['GET'])
def get_achievements():
    return jsonify({"success": True, "data": MOCK_ACHIEVEMENTS})

@achievements_bp.route('/api/achievements/history', methods=['GET'])
def get_history():
    return jsonify({"success": True, "data": MOCK_HISTORY})

@achievements_bp.route('/api/achievements', methods=['POST'])
def create_achievement():
    data = request.json
    # mongo.db.achievements.insert_one(data)
    return jsonify({"success": True, "message": "Achievement configured successfully"})

@achievements_bp.route('/api/achievements/<id>', methods=['PATCH'])
def update_achievement(id):
    data = request.json
    # mongo.db.achievements.update_one({"_id": ObjectId(id)}, {"$set": data})
    return jsonify({"success": True, "message": "Achievement updated"})
