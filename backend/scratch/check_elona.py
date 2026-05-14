from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client['alumni_portal']
user = db.users.find_one({'full_name': 'Elona Elsa'})
if user:
    print(f"Name: {user.get('full_name')}")
    print(f"Role: {user.get('role')}")
    print(f"ID: {user.get('_id')}")
else:
    print("User not found")
