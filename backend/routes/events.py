"""
Events Management Routes
Handles event listings, registrations, and details.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import get_db

events_bp = Blueprint("events", __name__)

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
    
    return jsonify({
        "success": True, 
        "message": "Successfully registered for the event!"
    }), 200
