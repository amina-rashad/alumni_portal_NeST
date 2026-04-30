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

# New Super Admin credentials
NEW_EMAIL = "shintosebastian@nestgroup.net"
NEW_PASSWORD = "Shinto@30"

# Hash the password
hashed_pw = bcrypt.hashpw(NEW_PASSWORD.encode("utf-8"), bcrypt.gensalt())

# Find any existing super_admin
existing_super = users.find_one({"role": "super_admin"})

if existing_super:
    # Update the existing super_admin's email and password
    users.update_one(
        {"_id": existing_super["_id"]},
        {"$set": {
            "email": NEW_EMAIL,
            "password": hashed_pw,
            "full_name": "Shinto Sebastian",
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    print(f"SUCCESS! Updated existing super_admin to {NEW_EMAIL}")
else:
    # Create a new one if none exists
    super_admin_doc = {
        "full_name": "Shinto Sebastian",
        "email": NEW_EMAIL,
        "password": hashed_pw,
        "role": "super_admin",
        "is_active": True,
        "is_email_verified": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    users.insert_one(super_admin_doc)
    print(f"SUCCESS! Created new super_admin with email {NEW_EMAIL}")

print(f"New Password: {NEW_PASSWORD}")
