from pymongo import MongoClient
import os

mongo_uri = "mongodb://localhost:27017/"
db_name = "alumni_portal"

client = MongoClient(mongo_uri)
db = client[db_name]

print(f"Checking collection: users")
users = list(db.users.find({"role": "super_admin"}, {"email": 1, "role": 1}))
print(f"Super Admins: {users}")

# Also check for just 'superadmin' email if role search fails
if not users:
    users = list(db.users.find({"email": {"$regex": "^superadmin"}}, {"email": 1, "role": 1}))
    print(f"Users with superadmin email: {users}")

client.close()
