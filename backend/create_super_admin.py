import os
import bcrypt
from pymongo import MongoClient
from datetime import datetime, timezone

# Connect to the MongoDB database
# Using the standard local URI, adjust if your DB is elsewhere
URI = "mongodb://localhost:27017/"
client = MongoClient(URI)
db = client["alumni_portal"]
users = db["users"]

# Super Admin credentials
SUPER_ADMIN_EMAIL = "superadmin@nest.com"
SUPER_ADMIN_PASSWORD = "SuperAdmin123!"

# Check if super admin already exists
existing_user = users.find_one({"email": SUPER_ADMIN_EMAIL})

if existing_user:
    # If exists, we'll just update its role to super_admin
    users.update_one(
        {"email": SUPER_ADMIN_EMAIL},
        {"$set": {"role": "super_admin"}}
    )
    print(f"User {SUPER_ADMIN_EMAIL} already exists. Updated role to 'super_admin'.")
else:
    # Hash the password securely
    hashed_pw = bcrypt.hashpw(SUPER_ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt())

    # Create the super admin document
    super_admin_doc = {
        "full_name": "NeST Super Admin",
        "email": SUPER_ADMIN_EMAIL,
        "password": hashed_pw,
        "phone": "999-999-9999",
        "user_type": "Alumni",
        "batch": "N/A",
        "specialization": "Global System Administration",
        "role": "super_admin",  # CRITICAL: This grants COMPLETE privileges!
        "is_active": True,
        "is_email_verified": True,
        "profile_picture": None,
        "bio": "I am the master Super Admin for the NeST Alumni Portal with full control over the system.",
        "linkedin_url": None,
        "skills": ["Global Security", "System Architecture"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "last_login": None,
    }

    # Insert into database
    users.insert_one(super_admin_doc)
    print(f"\nSUCCESS! Super Admin account successfully created.")
    print(f"----------------------------------------")
    print(f"Email:    {SUPER_ADMIN_EMAIL}")
    print(f"Password: {SUPER_ADMIN_PASSWORD}")
    print(f"----------------------------------------")
    print(f"You can now login at the login page.")
