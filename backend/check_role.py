from pymongo import MongoClient
from bson import ObjectId

URI = "mongodb://localhost:27017/"
client = MongoClient(URI)
db = client["alumni_portal"]
users = db["users"]

user = users.find_one({"email": "shintosebastian@nestgroup.net"})
if user:
    print(f"User: {user['email']}")
    print(f"Role: {user.get('role')}")
else:
    print("User not found")
