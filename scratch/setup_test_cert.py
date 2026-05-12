
from pymongo import MongoClient
from bson import ObjectId

# --- CONFIG ---
client = MongoClient("mongodb://localhost:27017/")
db = client["alumni_portal"]

# --- DATA ---
admin_email = "admin@nest.com"
user_email = "arjun.k@gmail.com"

# --- ACTION ---
print("Preparing certificate data for Arjun...")

# 1. Find User
user = db["users"].find_one({"email": user_email})
if not user:
    print("Arjun not found.")
    exit(1)
user_id = user["_id"]
print(f"Found Arjun: {user_id}")

# 2. Ensure a past event exists
past_event_title = "Global Tech Summit 2024"
past_event = db["events"].find_one({"title": past_event_title})

if not past_event:
    past_event_doc = {
        "title": past_event_title,
        "description": "A historic summit of tech leaders.",
        "date": "2024-05-20",
        "time": "10:00 AM",
        "location": "NeST Grand Hall",
        "category": "Summit",
        "organizer": "NeST Alumni Association",
        "attendees": [user_id],
        "attended_by": [user_id],
        "issued_certificates": [user_id],
        "is_active": True,
        "max_attendees": 100,
        "created_by": "system"
    }
    db["events"].insert_one(past_event_doc)
    print("Created past event and issued certificate.")
else:
    # Update existing event
    db["events"].update_one(
        {"_id": past_event["_id"]},
        {"$addToSet": {"attendees": user_id, "attended_by": user_id, "issued_certificates": user_id}}
    )
    print("Updated existing past event with Arjun's certificate.")

print("Setup complete. Arjun can now download his certificate.")
