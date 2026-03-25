"""
Health Check Route
Provides a simple endpoint to verify the API and database are operational.
"""

from flask import Blueprint, jsonify
from app import get_db

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Check API and MongoDB health."""
    try:
        db = get_db()
        # Ping MongoDB to verify connection
        db.command("ping")
        return jsonify({
            "status": "healthy",
            "message": "Alumni Portal API is running",
            "database": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "message": "API is running but database connection failed",
            "database": "disconnected",
            "error": str(e)
        }), 503
