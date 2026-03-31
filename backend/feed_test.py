import sys
sys.path.append("d:/alumni_portal(NeST)/alumni_portal_NeST/backend")

from app import create_app
from routes.social import _serialize_post
from pymongo import MongoClient
import json

app = create_app()
with app.app_context():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["alumni_portal"]
    
    posts_cursor = db["posts"].find().sort("created_at", -1).skip(0).limit(20)
    posts_list = [_serialize_post(p, db, None) for p in posts_cursor]

    with open("feed_dump.json", "w", encoding="utf-8") as f:
        json.dump(posts_list, f, indent=2)
