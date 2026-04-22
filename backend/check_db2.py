import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/alumni_portal")
DB_NAME = "alumni_portal"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print(f"Checking collection: jobs")
jobs = list(db["jobs"].find().sort("createdAt", -1))
print(f"Total jobs: {len(jobs)}")
for j in jobs[:5]:
    print(f"- {j.get('title')} at {j.get('company')} ({j.get('location')}) - Created: {j.get('createdAt')}")

print("\nChecking collection: users (admin check)")
admin = db["users"].find_one({"email": "shinto@nest.com"})
if admin:
    print(f"Admin found: {admin.get('full_name')}, Role: {admin.get('role')}")
else:
    print("Admin shinto@nest.com not found!")
