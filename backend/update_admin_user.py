import os
import bcrypt
from pymongo import MongoClient
from datetime import datetime, timezone
from bson import ObjectId

# Connect to the MongoDB database
URI = "mongodb://localhost:27017/"
client = MongoClient(URI)
db = client["alumni_portal"]
users = db["users"]

# New Admin credentials
NEW_EMAIL = "noblesibi@nestgroup.net"
NEW_PASSWORD = "Noble@02"

# Hash the password
hashed_pw = bcrypt.hashpw(NEW_PASSWORD.encode("utf-8"), bcrypt.gensalt())

# Find any existing admin (excluding super_admin)
existing_admin = users.find_one({"role": "admin"})

if existing_admin:
    # Update the existing admin's email and password
    users.update_one(
        {"_id": existing_admin["_id"]},
        {"$set": {
            "email": NEW_EMAIL,
            "password": hashed_pw,
            "full_name": "Noble Sibi",
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    print(f"SUCCESS! Updated existing admin to {NEW_EMAIL}")
else:
    # Create a new one if none exists
    admin_doc = {
        "full_name": "Noble Sibi",
        "email": NEW_EMAIL,
        "password": hashed_pw,
        "role": "admin",
        "is_active": True,
        "is_email_verified": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    users.insert_one(admin_doc)
    print(f"SUCCESS! Created new admin with email {NEW_EMAIL}")

print(f"New Password: {NEW_PASSWORD}")
