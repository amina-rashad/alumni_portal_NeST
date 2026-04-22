from pymongo import MongoClient
import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return str(o)

client = MongoClient("mongodb://localhost:27017/")
db = client["alumni_portal"]
courses = list(db["courses"].find())
print(json.dumps(courses, indent=2, cls=JSONEncoder))
