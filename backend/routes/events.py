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
from utils.mailer import broadcast_email
import os, json

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
        "mode": e.get("mode", "Offline"),
        "is_active": e.get("is_active", True),
        "issued_certificates": [str(uid) for uid in e.get("issued_certificates", [])]
    }

# ── Event Manager / Admin Governance Endpoints ──

@events_bp.route("/manager/attendees", methods=["GET"])
@jwt_required()
@manager_or_admin_required
def get_all_attendees():
    """List all registered participants across all managed events."""
    db = get_db()
    
    events = list(db["events"].find({}))
    all_user_ids = set()
    for e in events:
        attendees = e.get("attendees", [])
        if isinstance(attendees, list):
            for uid in attendees:
                all_user_ids.add(str(uid))
            
    users_map = {}
    if all_user_ids:
        object_ids = []
        for uid_str in all_user_ids:
            try:
                object_ids.append(ObjectId(uid_str))
            except Exception:
                pass
        
        # Use $or to handle both potential string and ObjectId formats in the users collection
        users = list(db["users"].find({"$or": [
            {"_id": {"$in": object_ids}},
            {"_id": {"$in": list(all_user_ids)}}
        ]}))
        for u in users:
            users_map[str(u["_id"])] = {
                "name": u.get("full_name", "Unknown"),
                "email": u.get("email", ""),
                "type": u.get("user_type", "Alumni"),
                "status": u.get("status", "none")
            }
            
    attendees_list = []
    idx = 1001
    for e in events:
        attendees = e.get("attendees", [])
        attended_by = e.get("attended_by", [])
        if not isinstance(attendees, list): continue
            
        for uid in attendees:
            uid_str = str(uid)
            u_info = users_map.get(uid_str, {"name": "Anonymous User", "email": "N/A", "type": "N/A", "status": "none"})
            
            is_attended = uid_str in [str(x) for x in attended_by]
            issued_certificates = e.get("issued_certificates", [])
            is_certificate_issued = uid_str in [str(x) for x in issued_certificates]
            
            attendees_list.append({
                "id": f"{uid_str}_{str(e['_id'])}",
                "userId": uid_str,
                "eventId": str(e["_id"]),
                "pId": f"EV-{idx}",
                "name": u_info["name"],
                "email": u_info["email"],
                "event": e.get("title", "Unknown Event"),
                "date": e.get("date", ""),
                "time": e.get("time", ""),
                "mode": e.get("mode", "Offline").capitalize(), 
                "city": e.get("location", ""),
                "status": "Attended" if is_attended else "Registered", 
                "type": u_info["type"],
                "author_status": u_info.get("status", "none"),
                "is_certificate_issued": is_certificate_issued
            })
            idx += 1
            
    return jsonify({
        "success": True,
        "data": {"attendees": attendees_list}
    }), 200

@events_bp.route("/manager/stats", methods=["GET"])
@jwt_required()
@manager_or_admin_required
def get_event_manager_stats():
    """Aggregate statistics for the event management dashboard."""
    db = get_db()
    total_events = db["events"].count_documents({})
    events = list(db["events"].find({}, {"attendees": 1}))
    unique_participants = set()
    for e in events:
        for attendee_id in e.get("attendees", []):
            unique_participants.add(str(attendee_id))
    unique_participant_ids = list(unique_participants)
    
    # Calculate distribution based ONLY on attendees, not total users
    attendees_docs = list(db["users"].find({"_id": {"$in": [ObjectId(uid) for uid in unique_participant_ids if ObjectId.is_valid(uid)]}}, {"user_type": 1}))
    
    alumni_count = sum(1 for a in attendees_docs if a.get("user_type") == "Alumni")
    intern_count = sum(1 for a in attendees_docs if a.get("user_type") == "Intern")
    other_count = len(attendees_docs) - (alumni_count + intern_count)

    return jsonify({
        "success": True,
        "data": {
            "stats": {
                "total_events": total_events,
                "active_participants": len(unique_participants),
                "page_views": f"{total_events * 128 + len(unique_participants) * 45}", 
                "engagement_rate": f"{min(100, max(0, int((len(unique_participants) / max(1, total_events)) * 12)))}%",
            },
            "distribution": [
                {"label": "Alumni", "value": alumni_count, "color": "#233167"},
                {"label": "Interns", "value": intern_count, "color": "#10b981"},
                {"label": "Others", "value": other_count, "color": "#f59e0b"}
            ]
        }
    }), 200

def is_event_past(date_str, time_str=""):
    if not date_str:
        return False
    try:
        now = datetime.now(timezone.utc)
        hours = 0
        minutes = 0
        if time_str:
            time_part = time_str.strip()
            import re
            match = re.match(r"(\d+):(\d+)\s*(AM|PM)?", time_part, re.IGNORECASE)
            if match:
                hours = int(match.group(1))
                minutes = int(match.group(2))
                ampm = match.group(3)
                if ampm:
                    if ampm.upper() == "PM" and hours < 12:
                        hours += 12
                    elif ampm.upper() == "AM" and hours == 12:
                        hours = 0
        year, month, day = map(int, date_str.split("-"))
        event_dt = datetime(year, month, day, hours, minutes, tzinfo=timezone.utc)
        return event_dt < now
    except Exception as err:
        print(f"Error parsing event date/time: {err}")
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        return date_str < today

@events_bp.route("/manager/upcoming", methods=["GET"])
@jwt_required()
@manager_or_admin_required
def get_upcoming_events():
    """Get the next few upcoming events for the dashboard feed."""
    db = get_db()
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Query only active events scheduled for today or in the future
    events_cursor = db["events"].find({
        "is_active": {"$ne": False},
        "date": {"$gte": today}
    }).sort("date", 1).limit(5)
    
    upcoming = []
    for e in events_cursor:
        is_past = is_event_past(e.get("date", ""), e.get("time", ""))
        status = "Past" if is_past else ("Active" if e.get("is_active", True) else "Draft")
        upcoming.append({
            "id": str(e["_id"]),
            "title": e.get("title", "Untitled Event"),
            "date": e.get("date", "TBD"),
            "time": e.get("time", "TBD"),
            "location": e.get("location", "TBD"),
            "registrations": len(e.get("attendees", [])),
            "status": status
        })
        
    return jsonify({
        "success": True,
        "data": {"events": upcoming}
    }), 200

@events_bp.route("/manager/attendees/toggle", methods=["POST"])
@jwt_required()
@manager_or_admin_required
def toggle_attendance():
    """Toggle the attended status of a participant."""
    data = request.get_json()
    db = get_db()
    
    event_id = data.get("event_id")
    user_id = data.get("user_id")
    
    try:
        eid = ObjectId(event_id)
        uid = ObjectId(user_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid ID format."}), 400
        
    event = db["events"].find_one({"_id": eid})
    if not event:
        return jsonify({"success": False, "message": "Event not found."}), 404
        
    attended_by = event.get("attended_by", [])
    attended_by_strs = [str(x) for x in attended_by]
    
    if str(uid) in attended_by_strs:
        # Remove from attended list
        db["events"].update_one({"_id": eid}, {"$pull": {"attended_by": uid}})
        status = "Registered"
    else:
        # Add to attended list
        db["events"].update_one({"_id": eid}, {"$addToSet": {"attended_by": uid}})
        status = "Attended"
        
    return jsonify({
        "success": True, 
        "message": f"Participant marked as {status}.",
        "data": {"status": status}
    }), 200

@events_bp.route("/manager/attendees/issue-certificate", methods=["POST"])
@jwt_required()
@manager_or_admin_required
def issue_certificate():
    """Issue a certificate to a participant."""
    data = request.get_json()
    db = get_db()
    
    event_id = data.get("event_id")
    user_id = data.get("user_id")
    
    try:
        eid = ObjectId(event_id)
        uid = ObjectId(user_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid ID format."}), 400
        
    event = db["events"].find_one({"_id": eid})
    if not event:
        return jsonify({"success": False, "message": "Event not found."}), 404
        
    # Add to issued_certificates list
    db["events"].update_one({"_id": eid}, {"$addToSet": {"issued_certificates": uid}})
    
    # Notify user
    try:
        from .notifications import create_notification
        create_notification(
            db,
            user_id=uid,
            type_str="event",
            title="Certificate Issued!",
            message=f"Your certificate for '{event.get('title')}' is now available for download.",
            link="/events/my-events"
        )
    except Exception as e:
        print(f"Notification error: {e}")
        
    return jsonify({
        "success": True, 
        "message": "Certificate issued successfully."
    }), 200

@events_bp.route("/manager/recent-certificates", methods=["GET"])
@jwt_required()
@manager_or_admin_required
def get_recent_certificates():
    """Get the latest 5 issued certificates for the dashboard."""
    db = get_db()
    # We'll look at the last 5 events that had certificates issued
    # Or just return a list of recent 'is_certificate_issued' = True attendees
    
    # Let's find events that have 'issued_certificates'
    recent_events = db["events"].find({"issued_certificates": {"$exists": True, "$ne": []}}).sort("createdAt", -1).limit(5)
    
    certificates = []
    for event in recent_events:
        for user_id in event.get("issued_certificates", [])[-3:]: # Get last 3 per event
            user = db["users"].find_one({"_id": ObjectId(user_id)}, {"full_name": 1})
            if user:
                certificates.append({
                    "event_name": event.get("title"),
                    "user_name": user.get("full_name"),
                    "date": event.get("date", "Recently"),
                    "id": str(user["_id"]) + str(event["_id"])
                })
    
    return jsonify({
        "success": True,
        "data": {"certificates": certificates[:5]}
    }), 200

@events_bp.route("/manager/attendees/remove", methods=["POST"])
@jwt_required()
@manager_or_admin_required
def remove_registration():
    """Remove a participant's registration from an event."""
    data = request.get_json()
    db = get_db()
    
    event_id = data.get("event_id")
    user_id = data.get("user_id")
    
    try:
        eid = ObjectId(event_id)
        uid = ObjectId(user_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid ID format."}), 400
        
    # Pull from both attendees and attended_by lists
    db["events"].update_one(
        {"_id": eid}, 
        {"$pull": {"attendees": uid, "attended_by": uid}}
    )
    
    return jsonify({
        "success": True, 
        "message": "Participant record removed successfully."
    }), 200

# ── User Facing Routes ──

@events_bp.route("", methods=["GET"])
@events_bp.route("/", methods=["GET"])
@jwt_required()
def list_events():
    """List events with smart chronological sorting: Upcoming first, Past at bottom."""
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)
    skip = (page - 1) * limit
    upcoming_only = request.args.get("upcoming_only", "false").lower() == "true"

    db = get_db()
    user_id = get_jwt_identity()
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Aggregation for smart sorting and pagination
    pipeline = []
    if upcoming_only:
        pipeline.append({"$match": {"date": {"$gte": today}}})
        
    pipeline.extend([
        # Sort strictly by date ascending
        {"$sort": {"date": 1}},
        {"$facet": {
            "metadata": [{"$count": "total"}],
            "data": [{"$skip": skip}, {"$limit": limit}]
        }}
    ])
    
    result = list(db["events"].aggregate(pipeline))
    events_raw = result[0]["data"] if result else []
    total_events = result[0]["metadata"][0]["total"] if result and result[0]["metadata"] else 0
    
    events_list = []
    for e in events_raw:
        event = _serialize_event(e)
        if "attendees" in e and any(str(a) == user_id for a in e["attendees"]):
            event["is_registered"] = True
        events_list.append(event)

    return jsonify({
        "success": True, 
        "data": {
            "events": events_list,
            "total_events": total_events, # Consistent naming for frontend
            "total_pages": (total_events + limit - 1) // limit if limit > 0 else 1,
            "current_page": page,
            "items_per_page": limit
        }
    }), 200

@events_bp.route("/my-events", methods=["GET"])
@jwt_required()
def get_my_events():
    db = get_db()
    user_id = get_jwt_identity()
    events_cursor = db["events"].find({
        "$or": [
            {"attendees": ObjectId(user_id)},
            {"attendees": user_id}
        ]
    }).sort("date", 1)
    events_list = []
    for e in events_cursor:
        event = _serialize_event(e)
        event["is_registered"] = True
        event["is_certificate_issued"] = user_id in [str(uid) for uid in e.get("issued_certificates", [])]
        events_list.append(event)
    return jsonify({"success": True, "data": {"events": events_list}}), 200

@events_bp.route("/<event_id>", methods=["GET"])
@jwt_required()
def get_event(event_id):
    db = get_db()
    user_id = get_jwt_identity()
    try:
        e = db["events"].find_one({"_id": ObjectId(event_id)})
    except Exception:
        return jsonify({"success": False, "message": "Invalid event ID."}), 400
    if not e:
        return jsonify({"success": False, "message": "Event not found."}), 404
    event = _serialize_event(e)
    if "attendees" in e and any(str(a) == user_id for a in e["attendees"]):
        event["is_registered"] = True
    return jsonify({"success": True, "data": {"event": event}}), 200

@events_bp.route("/<event_id>/register", methods=["POST"])
@jwt_required()
def register_for_event(event_id):
    db = get_db()
    user_id = get_jwt_identity()
    try:
        oid = ObjectId(event_id)
        u_oid = ObjectId(user_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid ID format."}), 400
    event = db["events"].find_one({"_id": oid})
    if not event:
        return jsonify({"success": False, "message": "Event not found."}), 404
    max_attendees = event.get("max_attendees", 0)
    current_attendees = event.get("attendees", [])
    current_attendees_strs = [str(a) for a in current_attendees]
    if user_id in current_attendees_strs:
        return jsonify({"success": False, "message": "You are already registered for this event."}), 400
    if max_attendees > 0 and len(current_attendees) >= max_attendees:
        return jsonify({"success": False, "message": "This event has reached its maximum capacity."}), 400
    res = db["events"].update_one({"_id": oid}, {"$addToSet": {"attendees": u_oid}})
    try:
        from .notifications import create_notification
        registrant = db["users"].find_one({"_id": u_oid})
        registrant_name = registrant.get("full_name", "Someone") if registrant else "Someone"
        event_title = event.get("title", "an event")
        creator_id = event.get("created_by")
        if creator_id:
            create_notification(db, user_id=creator_id, type_str="event", title="New Registration", message=f"{registrant_name} registered for '{event_title}'.", link="/event-manager/attendees")
    except Exception as notify_err:
        print(f"Notification error (non-critical): {notify_err}")
    return jsonify({"success": True, "message": "Successfully registered for the event!"}), 200

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
            
        print(f"SUCCESS: Dispatched {count} notifications for new event: {event_doc['title']}")
    except Exception as e:
        print(f"CRITICAL ERROR in event notification dispatch: {e}")

    return jsonify({
        "success": True,
        "message": "Event created successfully!",
        "data": {"id": str(result.inserted_id)}
    }), 201

# ── Update Event ──

@events_bp.route("/<event_id>", methods=["PATCH", "PUT"])
@jwt_required()
@manager_or_admin_required
def update_event(event_id):
    """Update an existing event."""
    data = request.get_json()
    db = get_db()
    
    try:
        eid = ObjectId(event_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid event ID format."}), 400

    allowed_fields = [
        "title", "description", "date", "time", "location", 
        "category", "organizer", "cover_image", "max_attendees", 
        "is_active", "mode"
    ]
    
    update_data = {}
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
            
    if not update_data:
        return jsonify({"success": False, "message": "No valid fields to update."}), 400

    result = db["events"].update_one(
        {"_id": eid},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        return jsonify({"success": False, "message": "Event not found."}), 404
        
    return jsonify({
        "success": True,
        "message": "Event updated successfully!"
    }), 200

# ── Delete Event ──

@events_bp.route("/<event_id>", methods=["DELETE"])
@jwt_required()
@manager_or_admin_required
def delete_event(event_id):
    """Delete an event."""
    db = get_db()
    
    try:
        eid = ObjectId(event_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid event ID format."}), 400

    result = db["events"].delete_one({"_id": eid})
    
    if result.deleted_count == 0:
        return jsonify({"success": False, "message": "Event not found."}), 404
        
    return jsonify({
        "success": True,
        "message": "Event deleted successfully!"
    }), 200
# ── Gemini AI Email Draft ──

@events_bp.route("/manager/ai-draft-email", methods=["POST"])
@jwt_required()
@manager_or_admin_required
def ai_draft_email():
    """Use Gemini AI to draft an event email for selected attendees."""
    data = request.get_json() or {}
    context = data.get("context", "")
    event_name = data.get("event_name", "the event")
    tone = data.get("tone", "professional")
    purpose = data.get("purpose", "general update")

    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_api_key or gemini_api_key == "your-gemini-api-key-here":
        # Fallback: return a structured template when no API key is set
        subject = f"Important Update: {event_name}"
        body = (
            f"Dear Participant,\n\n"
            f"We are reaching out regarding {event_name}.\n\n"
            f"{context if context else 'We have an important update to share with you.'}"
            f"\n\nThank you for your participation.\n\nBest regards,\nNeST Digital Events Team"
        )
        return jsonify({
            "success": True,
            "data": {"subject": subject, "body": body, "note": "Template used (no Gemini API key configured)"}
        }), 200

    try:
        import urllib.request
        prompt = (
            f"You are a professional event coordinator at NeST Digital, an engineering transformation company.\n"
            f"Write a {tone} email for participants of '{event_name}'.\n"
            f"Purpose: {purpose}.\n"
            f"Additional context: {context}\n\n"
            f"Return ONLY a JSON object with two keys: 'subject' (short email subject line) and 'body' (full email body with greeting and signature).\n"
            f"The email should feel warm, professional, and on-brand for NeST Digital."
        )
        payload = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}]
        }).encode()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_api_key}"
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())

        text = result["candidates"][0]["content"]["parts"][0]["text"]
        # Strip markdown code fences if Gemini wraps the JSON
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        email_data = json.loads(text)
        return jsonify({
            "success": True,
            "data": {"subject": email_data.get("subject", ""), "body": email_data.get("body", "")}
        }), 200

    except Exception as e:
        print(f"Gemini AI draft error: {e}")
        return jsonify({"success": False, "message": f"AI draft failed: {str(e)}"}), 500


# ── Event Manager Broadcast Mail ──

@events_bp.route("/manager/broadcast-mail", methods=["POST"])
@jwt_required()
@manager_or_admin_required
def event_manager_broadcast_mail():
    """Send a broadcast email + in-app notification to selected event attendees."""
    data = request.get_json() or {}
    recipients = data.get("recipients", [])  # list of email strings
    subject = data.get("subject", "")
    body = data.get("body", "")
    event_name = data.get("event_name", "")

    if not recipients or not subject or not body:
        return jsonify({"success": False, "message": "recipients, subject, and body are required."}), 400

    db = get_db()

    # Send actual emails via SMTP (or log to console if not configured)
    email_count = broadcast_email(recipients, subject, body)

    # Also push in-app notifications
    notif_count = 0
    for email in recipients:
        user = db["users"].find_one({"email": email.lower()})
        if user:
            try:
                from .notifications import create_notification
                create_notification(
                    db,
                    user_id=user["_id"],
                    type_str="event",
                    title=f"📧 {subject}",
                    message=body[:200] + ("..." if len(body) > 200 else ""),
                    link="/events"
                )
                notif_count += 1
            except Exception as e:
                print(f"Notification error for {email}: {e}")

    return jsonify({
        "success": True,
        "message": f"Message delivered to {email_count} email(s) and {notif_count} in-app notification(s).",
        "data": {"email_count": email_count, "notif_count": notif_count}
    }), 200
