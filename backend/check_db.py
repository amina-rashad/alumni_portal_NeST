from pymongo import MongoClient
import json
from bson import json_util

client = MongoClient("mongodb://localhost:27017/")
db = client["alumni_portal"]
posts = list(db["posts"].find().sort("created_at", -1))

print(json.dumps(posts, default=json_util.default, indent=2))
