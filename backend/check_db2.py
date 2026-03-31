import json
from bson import json_util
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
posts = list(client["alumni_portal"]["posts"].find().sort("created_at", -1))

with open("out.json", "w", encoding="utf-8") as f:
    json.dump(posts, f, default=json_util.default, indent=2)
