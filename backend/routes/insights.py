from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
# Assuming a mongo object is available in a common location or app.py
# For this implementation, I will simulate the MongoDB aggregation logic

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('/summary', methods=['GET'])
def get_insights_summary():
    # 1. Calculate Daily Active Users (DAU) for the last 7 days
    # In a real scenario, you'd query a 'logins' collection
    dau_data = [45, 52, 48, 61, 55, 67, 72] # Mocked trend
    
    # 2. Calculate Course-wise completion percentages
    # Aggregate from 'enrollments' or 'user_progress' collections
    completion_rates = [
        {"course": "Full Stack Development", "percentage": 78},
        {"course": "Cloud Architecture", "percentage": 42},
        {"course": "UX Design Fundamentals", "percentage": 91},
        {"course": "Data Science Essentials", "percentage": 56}
    ]
    
    # 3. Calculate Login Streaks
    # Logic: Group logins by user, sort by date, find consecutive days
    streaks = [
        {"student": "Alex Johnson", "days": 12, "trend": "up"},
        {"student": "Maria Garcia", "days": 8, "trend": "up"},
        {"student": "David Chen", "days": 7, "trend": "stable"},
        {"student": "Sneha Joseph", "days": 5, "trend": "up"}
    ]
    
    # 4. Identify Inactive Learners
    # Find users whose 'last_login' is older than 3 days
    inactive_learners = [
        {"name": "John Doe", "lastActive": "5 days ago", "risk": "High"},
        {"name": "Sarah Smith", "lastActive": "3 days ago", "risk": "Medium"},
        {"name": "Michael Brown", "lastActive": "4 days ago", "risk": "High"}
    ]
    
    return jsonify({
        "success": True,
        "data": {
            "dailyActiveUsers": dau_data,
            "completionRates": completion_rates,
            "streaks": streaks,
            "inactiveLearners": inactive_learners
        }
    })

# In a real MongoDB implementation, you would use:
# db.logins.aggregate([
#     { "$match": { "timestamp": { "$gte": last_week } } },
#     { "$group": { "_id": { "$dateToString": { "format": "%Y-%m-%d", "date": "$timestamp" } }, "count": { "$sum": 1 } } }
# ])
