from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime

recommendations_bp = Blueprint('recommendations', __name__)

# Mock Data for demonstration
MOCK_RECOMMENDATIONS = [
    {
        "id": "1",
        "sourceCourseId": "c1",
        "sourceCourseName": "Full Stack Development",
        "targetCourseId": "c2",
        "targetCourseName": "Advanced Full-Stack Architecture",
        "conversionRate": "24%",
        "enrolledStudents": 156
    },
    {
        "id": "2",
        "sourceCourseId": "c3",
        "sourceCourseName": "UX Design Fundamentals",
        "targetCourseId": "c4",
        "targetCourseName": "Advanced UI Design & Prototyping",
        "conversionRate": "18%",
        "enrolledStudents": 84
    }
]

@recommendations_bp.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    return jsonify({"success": True, "data": MOCK_RECOMMENDATIONS})

@recommendations_bp.route('/api/recommendations', methods=['POST'])
def create_recommendation():
    data = request.json
    # mongo.db.recommendations.insert_one(data)
    return jsonify({"success": True, "message": "Course pathway established"})

@recommendations_bp.route('/api/recommendations/<id>', methods=['DELETE'])
def delete_recommendation(id):
    # mongo.db.recommendations.delete_one({"_id": ObjectId(id)})
    return jsonify({"success": True, "message": "Recommendation mapping removed"})

@recommendations_bp.route('/api/recommendations/stats', methods=['GET'])
def get_stats():
    return jsonify({
        "success": True, 
        "data": {
            "active_pathways": 12,
            "total_conversions": 450,
            "avg_conversion_rate": "19.5%"
        }
    })
