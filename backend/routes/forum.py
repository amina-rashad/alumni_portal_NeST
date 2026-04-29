from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime

forum_bp = Blueprint('forum', __name__)

# Mock Data for demonstration
MOCK_DISCUSSIONS = [
    {
        "id": "1",
        "courseName": "Advanced Full-Stack Architecture",
        "studentName": "Alex Johnson",
        "title": "Difficulty with Microservices orchestration",
        "content": "I am struggling with setting up the Kubernetes cluster for the final module. The YAML configurations seem to have issues with the ingress controller.",
        "status": "Unresolved",
        "createdAt": "2 hours ago",
        "repliesCount": 0
    },
    {
        "id": "2",
        "courseName": "UX Design Fundamentals",
        "studentName": "Maria Garcia",
        "title": "Figma Auto-layout issue",
        "content": "When I use auto-layout on my navigation bar, the icons are overlapping instead of stacking. Is there a specific setting for this?",
        "status": "Unresolved",
        "createdAt": "5 hours ago",
        "repliesCount": 2
    },
    {
        "id": "3",
        "courseName": "Cloud Infrastructure with AWS",
        "studentName": "David Chen",
        "title": "IAM Policy permissions for S3",
        "content": "Thank you for the explanation on IAM. It helped me resolve the bucket access issue.",
        "status": "Resolved",
        "createdAt": "1 day ago",
        "repliesCount": 1
    }
]

@forum_bp.route('/api/forum/discussions', methods=['GET'])
def get_discussions():
    # In a real app: discussions = list(mongo.db.discussions.find())
    return jsonify({"success": True, "data": MOCK_DISCUSSIONS})

@forum_bp.route('/api/forum/resolve/<id>', methods=['PATCH'])
def resolve_discussion(id):
    # mongo.db.discussions.update_one({"_id": ObjectId(id)}, {"$set": {"status": "Resolved"}})
    return jsonify({"success": True, "message": "Discussion resolved"})

@forum_bp.route('/api/forum/delete/<id>', methods=['DELETE'])
def delete_discussion(id):
    # mongo.db.discussions.delete_one({"_id": ObjectId(id)})
    return jsonify({"success": True, "message": "Discussion deleted"})

@forum_bp.route('/api/forum/reply/<id>', methods=['POST'])
def post_reply(id):
    data = request.json
    reply_text = data.get('text')
    # mongo.db.replies.insert_one({
    #     "discussion_id": ObjectId(id),
    #     "text": reply_text,
    #     "author": "Course Manager",
    #     "createdAt": datetime.now()
    # })
    return jsonify({"success": True, "message": "Reply posted"})
