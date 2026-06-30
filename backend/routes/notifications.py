"""
Notifications Routes
Handles user notifications for events, jobs, social interactions.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import get_db

notifications_bp = Blueprint("notifications", __name__)


def _serialize_notification(n: dict, db=None, current_user_role=None) -> dict:
    link = n.get("link")
    if link and current_user_role:
        if current_user_role == "event_manager":
            if link in ("/community", "/dashboard/activity", "/feed", "/community-feed"):
                link = "/event-manager/community-feed"
            elif link == "/events":
                link = "/event-manager/events"
        elif current_user_role == "recruiter":
            if link in ("/community", "/dashboard/activity", "/feed", "/community-feed"):
                link = "/recruiter/community-feed"
        else:
            if link == "/community":
                link = "/dashboard/activity"

    return {
        "id": str(n["_id"]),
        "type": n.get("type", "info"),  # info | job | event | social | system
        "title": n.get("title", ""),
        "message": n.get("message", ""),
        "is_read": n.get("is_read", False),
        "link": link,
        "created_at": n.get("created_at").isoformat() if n.get("created_at") else None,
    }


# ── Get My Notifications ──

@notifications_bp.route("/", methods=["GET"])
@jwt_required()
def get_notifications():
    """Get all notifications for the current user."""
    user_id = get_jwt_identity()
    db = get_db()
    
    # Query current user's role
    user_role = None
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if user:
            user_role = user.get("role")
    except Exception:
        pass

    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 30))
    skip = (page - 1) * per_page

    notifs_cursor = db["notifications"].find(
        {"user_id": ObjectId(user_id)}
    ).sort("created_at", -1).skip(skip).limit(per_page)

    notifs_list = [_serialize_notification(n, db, user_role) for n in notifs_cursor]

    # Count unread
    unread_count = db["notifications"].count_documents({
        "user_id": ObjectId(user_id),
        "is_read": False
    })

    return jsonify({
        "success": True,
        "data": {
            "notifications": notifs_list,
            "unread_count": unread_count,
        }
    }), 200


@notifications_bp.route("/test", methods=["POST"])
@jwt_required()
def test_notification():
    """Send a test notification to the current user."""
    user_id = get_jwt_identity()
    db = get_db()
    
    create_notification(
        db,
        user_id=user_id,
        type_str="system",
        title="Test Notification",
        message="If you see this, the notification system is working correctly!",
        link="/dashboard"
    )
    
    return jsonify({"success": True, "message": "Test notification sent."}), 200


# ── Mark as Read ──

@notifications_bp.route("/<notification_id>/read", methods=["PATCH"])
@jwt_required()
def mark_as_read(notification_id):
    """Mark a single notification as read."""
    user_id = get_jwt_identity()
    db = get_db()

    db["notifications"].update_one(
        {"_id": ObjectId(notification_id), "user_id": ObjectId(user_id)},
        {"$set": {"is_read": True}}
    )

    return jsonify({"success": True, "message": "Notification marked as read."}), 200


# ── Mark All as Read ──

@notifications_bp.route("/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_as_read():
    """Mark all notifications as read for the current user."""
    user_id = get_jwt_identity()
    db = get_db()

    result = db["notifications"].update_many(
        {"user_id": ObjectId(user_id), "is_read": False},
        {"$set": {"is_read": True}}
    )

    return jsonify({
        "success": True,
        "message": f"{result.modified_count} notifications marked as read."
    }), 200


# ── Delete Notifications ──

@notifications_bp.route("/<notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id):
    """Delete a single notification."""
    user_id = get_jwt_identity()
    db = get_db()
    db["notifications"].delete_one({
        "_id": ObjectId(notification_id),
        "user_id": ObjectId(user_id)
    })
    return jsonify({"success": True, "message": "Notification deleted."}), 200

@notifications_bp.route("/all", methods=["DELETE"])
@jwt_required()
def delete_all_notifications():
    """Delete all notifications for the current user."""
    user_id = get_jwt_identity()
    db = get_db()
    result = db["notifications"].delete_many({"user_id": ObjectId(user_id)})
    return jsonify({
        "success": True, 
        "message": f"Successfully deleted {result.deleted_count} notifications."
    }), 200


# ── Utility: Create Notification (for internal use by other modules) ──

def create_notification(db, user_id, type_str, title, message, link=None):
    """Helper function to create a notification (called from other routes)."""
    # Dynamic path mapping based on user role to ensure managers stay inside their panels!
    mapped_link = link
    if link:
        try:
            target_user = db["users"].find_one({"_id": ObjectId(user_id) if isinstance(user_id, str) else user_id})
            if target_user:
                role = target_user.get("role")
                if role == "event_manager":
                    if link in ("/community", "/dashboard/activity", "/feed", "/community-feed"):
                        mapped_link = "/event-manager/community-feed"
                    elif link == "/events":
                        mapped_link = "/event-manager/events"
                elif role == "recruiter":
                    if link in ("/community", "/dashboard/activity", "/feed", "/community-feed"):
                        mapped_link = "/recruiter/community-feed"
                else:
                    if link == "/community":
                        mapped_link = "/dashboard/activity"
        except Exception as err:
            print(f"Error mapping notification link: {err}")

    doc = {
        "user_id": ObjectId(user_id) if isinstance(user_id, str) else user_id,
        "type": type_str,
        "title": title,
        "message": message,
        "link": mapped_link,
        "is_read": False,
        "created_at": datetime.now(timezone.utc),
    }
    db["notifications"].insert_one(doc)
