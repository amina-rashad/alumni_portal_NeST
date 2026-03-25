import os
import bcrypt
from pymongo import MongoClient
from datetime import datetime, timezone

# Connect to the MongoDB database
URI = "mongodb://localhost:27017/"
client = MongoClient(URI)
db = client["alumni_portal"]
users = db["users"]

# Admin credentials
ADMIN_EMAIL = "admin@nest.com"
ADMIN_PASSWORD = "Admin123!"

# Check if admin already exists
existing_admin = users.find_one({"email": ADMIN_EMAIL})

if existing_admin:
    print(f"Admin user {ADMIN_EMAIL} already exists!")
else:
    # Hash the password securely
    hashed_pw = bcrypt.hashpw(ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt())

    # Create the admin document matching our database schema
    admin_doc = {
        "full_name": "NeST System Admin",
        "email": ADMIN_EMAIL,
        "password": hashed_pw,
        "phone": "000-000-0000",
        "user_type": "Alumni",
        "batch": "N/A",
        "specialization": "System Administration",
        "role": "admin",  # CRITICAL: This grants admin privileges!
        "is_active": True,
        "is_email_verified": True,
        "profile_picture": None,
        "bio": "I am the master system administrator for the NeST Alumni Portal.",
        "linkedin_url": None,
        "skills": ["System Admin", "Security"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "last_login": None,
    }

    # Insert into database
    users.insert_one(admin_doc)
    print(f"\nSUCCESS! Admin user successfully created.")
    print(f"----------------------------------------")
    print(f"Email:    {ADMIN_EMAIL}")
    print(f"Password: {ADMIN_PASSWORD}")
    print(f"----------------------------------------")
