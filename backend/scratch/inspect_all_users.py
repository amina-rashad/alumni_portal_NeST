import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env variables from backend/.env
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path)

mongo_uri = os.environ.get("MONGO_URI")
if not mongo_uri:
    print("Error: MONGO_URI not found in env.")
    sys.exit(1)

client = MongoClient(mongo_uri)
db = client.get_database()

print("Listing all users from database:")
print("=" * 80)
for u in db["users"].find():
    print(f"ID: {u.get('_id')} | Name: {u.get('full_name')} | Email: {u.get('email')} | Role: {u.get('role')} | User Type: {u.get('user_type')}")
print("=" * 80)
