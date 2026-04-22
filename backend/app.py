"""
Flask Application Factory
Initializes the Flask app, MongoDB, JWT, and CORS.
Registers all blueprints (route modules).
"""

import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient

from config import config_by_name

# ── Global extensions ──
mongo_client = None
db = None
jwt = JWTManager()


def get_db():
    """Returns the MongoDB database instance."""
    return db


def create_app(config_name=None):
    """Application factory pattern."""
    global mongo_client, db

    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # ── CORS ── allow all devices on the network to connect
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": False,
        }
    })

    # ── JWT ──
    jwt.init_app(app)

    # ── MongoDB ──
    mongo_client = MongoClient(app.config["MONGO_URI"])
    db = mongo_client[app.config["MONGO_DB_NAME"]]

    # Create indexes for users collection
    with app.app_context():
        _ensure_indexes()

    # ── Register Blueprints ──
    from routes.auth import auth_bp
    from routes.users import users_bp
    from routes.health import health_bp
    from routes.courses import courses_bp
    from routes.jobs import jobs_bp
    from routes.admin import admin_bp
    from routes.events import events_bp
    from routes.applications import applications_bp
    from routes.social import social_bp
    from routes.notifications import notifications_bp
    from routes.assessments import assessments_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(events_bp, url_prefix="/api/events")
    app.register_blueprint(applications_bp, url_prefix="/api/applications")
    app.register_blueprint(social_bp, url_prefix="/api/social")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(assessments_bp, url_prefix="/api/assessments")

    return app


def _ensure_indexes():
    """Create MongoDB indexes on startup."""
    users = db["users"]
    users.create_index("email", unique=True)
    users.create_index("user_type")
    users.create_index("created_at")

    # Jobs
    db["jobs"].create_index("createdAt")
    db["jobs"].create_index("is_active")

    # Courses
    db["courses"].create_index("createdAt")

    # Events
    db["events"].create_index("date")

    # Applications (compound unique: one application per user per job)
    db["applications"].create_index([("user_id", 1), ("job_id", 1)], unique=True)

    # Notifications
    db["notifications"].create_index([("user_id", 1), ("created_at", -1)])

    # Posts
    db["posts"].create_index("created_at")
