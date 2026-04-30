"""
Events Management Routes
Handles event listings, registrations, and details.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from functools import wraps
from app import get_db

events_bp = Blueprint("events", __name__)

def manager_or_admin_required(fn):
    """Decorator to allow event_manager, admin, or super_admin roles."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        db = get_db()
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user or user.get("role") not in ("event_manager", "admin", "super_admin"):
            return jsonify({"success": False, "message": "Manager or Admin privileges required."}), 403
        return fn(*args, **kwargs)
    return wrapper

def _serialize_event(e: dict) -> dict:
    return {
        "id": str(e["_id"]),
        "title": e.get("title", ""),
        "description": e.get("description", ""),
        "date": e.get("date", ""),
        "time": e.get("time", ""),
        "location": e.get("location", "Virtual"),
        "category": e.get("category", "General"),
        "attendees_count": len(e.get("attendees", [])),
        "max_attendees": e.get("max_attendees", 0),
        "is_registered": False, # Will be set conditionally
        "organizer": e.get("organizer", "NeST Alumni Association"),
        "cover_image": e.get("cover_image", ""),
    }

@events_bp.route("", methods=["GET"])
@events_bp.route("/", methods=["GET"])
@jwt_required()
def list_events():
    db = get_db()
    user_id = get_jwt_identity()
    
    events_cursor = db["events"].find({})
    events_list = []
    
    for e in events_cursor:
        event = _serialize_event(e)
        # Check if current user is in attendees list
        if "attendees" in e and any(str(a) == user_id for a in e["attendees"]):
            event["is_registered"] = True
        events_list.append(event)
        
    return jsonify({
        "success": True,
        "data": {"events": events_list}
    }), 200

@events_bp.route("/my-events", methods=["GET"])
@jwt_required()
def get_my_events():
    db = get_db()
    user_id = get_jwt_identity()
    
    # Find events where user_id is in attendees list
    # Use $in or $elemMatch if needed, but since it's a simple list of ObjectIds:
    events_cursor = db["events"].find({"attendees": ObjectId(user_id)})
    
    events_list = []
    for e in events_cursor:
        event = _serialize_event(e)
        event["is_registered"] = True # By definition if they are in attendees
        events_list.append(event)
        
    return jsonify({
        "success": True,
        "data": {"events": events_list}
    }), 200

@events_bp.route("/<event_id>", methods=["GET"])
@jwt_required()
def get_event(event_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    try:
        e = db["events"].find_one({"_id": ObjectId(event_id)})
    except:
        return jsonify({"success": False, "message": "Invalid event ID."}), 400
        
    if not e:
        return jsonify({"success": False, "message": "Event not found."}), 404
        
    event = _serialize_event(e)
    if "attendees" in e and any(str(a) == user_id for a in e["attendees"]):
        event["is_registered"] = True
        
    return jsonify({
        "success": True,
        "data": {"event": event}
    }), 200

@events_bp.route("/<event_id>/register", methods=["POST"])
@jwt_required()
def register_for_event(event_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    try:
        oid = ObjectId(event_id)
        u_oid = ObjectId(user_id)
    except:
        return jsonify({"success": False, "message": "Invalid ID format."}), 400
        
    event = db["events"].find_one({"_id": oid})
    if not event:
        return jsonify({"success": False, "message": "Event not found."}), 404
        
    # Check capacity check
    max_attendees = event.get("max_attendees", 0)
    current_attendees = event.get("attendees", [])
    
    # Check if already registered
    if u_oid in current_attendees:
        return jsonify({"success": False, "message": "You are already registered for this event."}), 400

    if max_attendees > 0 and len(current_attendees) >= max_attendees:
        return jsonify({"success": False, "message": "This event has reached its maximum capacity."}), 400
        
    res = db["events"].update_one(
        {"_id": oid},
        {"$addToSet": {"attendees": u_oid}}
    )
    
    # Notify the event creator
    try:
        from .notifications import create_notification
        registrant = db["users"].find_one({"_id": u_oid})
        registrant_name = registrant.get("full_name", "Someone") if registrant else "Someone"
        event_title = event.get("title", "an event")
        creator_id = event.get("created_by")
        if creator_id:
            create_notification(
                db,
                user_id=creator_id,
                type_str="event",
                title="New Registration",
                message=f"{registrant_name} registered for '{event_title}'.",
                link="/event-manager/attendees"
            )
    except Exception as notify_err:
        print(f"Notification error (non-critical): {notify_err}")

    return jsonify({
        "success": True, 
        "message": "Successfully registered for the event!"
    }), 200

# ── Event Manager / Admin Governance Endpoints ──

@events_bp.route("/manager/stats", methods=["GET"])
@jwt_required()
@manager_or_admin_required
def get_event_manager_stats():
    """Aggregate statistics for the event management dashboard."""
    db = get_db()
    
    total_events = db["events"].count_documents({})
    
    # Calculate active participants (unique users registered for any event)
    events = list(db["events"].find({}, {"attendees": 1}))
    unique_participants = set()
    for e in events:
        for attendee_id in e.get("attendees", []):
            unique_participants.add(str(attendee_id))
            
    # Calculate distribution
    alumni_count = db["users"].count_documents({"user_type": "Alumni"})
    intern_count = db["users"].count_documents({"user_type": "Intern"})
    other_count = db["users"].count_documents({"user_type": {"$nin": ["Alumni", "Intern"]}})

    return jsonify({
        "success": True,
        "data": {
            "stats": {
                "total_events": total_events,
                "active_participants": len(unique_participants),
                "page_views": "45.2K", # Placeholder as we don't track this yet
                "engagement_rate": "68%", # Placeholder
            },
            "distribution": [
                {"label": "Alumni", "value": alumni_count, "color": "#233167"},
                {"label": "Interns", "value": intern_count, "color": "#10b981"},
                {"label": "Others", "value": other_count, "color": "#f59e0b"}
            ]
        }
    }), 200

@events_bp.route("/manager/upcoming", methods=["GET"])
@jwt_required()
@manager_or_admin_required
def get_upcoming_managed_events():
    """List events specifically for the management dashboard."""
    db = get_db()
    # In a real scenario, we might filter by events created by the manager, 
    # but for governance, admins see all.
    events_cursor = db["events"].find().sort("date", 1).limit(5)
    
    events_list = []
    for e in events_cursor:
        events_list.append({
            "id": str(e["_id"]),
            "title": e.get("title", ""),
            "date": e.get("date", ""),
            "time": e.get("time", ""),
            "location": e.get("location", "Virtual"),
            "registrations": len(e.get("attendees", [])),
            "status": "Active" if e.get("is_active", True) else "Draft"
        })
        
    return jsonify({
        "success": True,
        "data": {"events": events_list}
    }), 200


# ── Create Event ──

@events_bp.route("/create", methods=["POST"])
@jwt_required()
@manager_or_admin_required
def create_event():
    """Create a new event from the manager interface."""
    data = request.get_json()
    db = get_db()
    
    if not data or not data.get("title"):
        return jsonify({"success": False, "message": "Event title is required."}), 400
        
    event_doc = {
        "title": data.get("title"),
        "description": data.get("description", ""),
        "date": data.get("date", ""),
        "time": data.get("time", ""),
        "location": data.get("location", "Virtual"),
        "category": data.get("category", "Networking & Mixer"),
        "organizer": data.get("organizer", "NeST Alumni Association"),
        "cover_image": data.get("cover_image", ""),
        "max_attendees": data.get("max_attendees", 0),
        "attendees": [],
        "is_active": data.get("is_active", True),
        "mode": data.get("mode", "Offline"),
        "created_by": get_jwt_identity(),
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = db["events"].insert_one(event_doc)
    
    # Send notifications
    try:
        from .notifications import create_notification
        current_user_id = get_jwt_identity()
        
        # Broaden audience for verification: notify everyone except the creator
        users_cursor = db["users"].find({
            "_id": {"$ne": ObjectId(current_user_id)}
        }, {"_id": 1, "full_name": 1})
        
        count = 0
        for user in users_cursor:
            create_notification(
                db,
                user["_id"],
                "event",
                f"New Event: {event_doc['title']}",
                f"A new event has been scheduled for {event_doc['date']}. View details and register now!",
                "/events"
            )
            count += 1
            print(f"DEBUG: Sent event notification to user {user.get('full_name')} ({user['_id']})")
            
        print(f"SUCCESS: Dispatched {count} notifications for new event: {event_doc['title']}")
    except Exception as e:
        print(f"CRITICAL ERROR in event notification dispatch: {e}")

    return jsonify({
        "success": True,
        "message": "Event created successfully!",
        "data": {"id": str(result.inserted_id)}
    }), 201
