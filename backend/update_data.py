import os
import bcrypt
from pymongo import MongoClient
from datetime import datetime, timezone
from bson import ObjectId

# Connect
client = MongoClient("mongodb://localhost:27017/")
db = client["alumni_portal"]

# 1. Update Courses
courses_col = db["courses"]
courses_col.delete_many({}) # Clear old courses

sample_courses = [
    {"title": "Microsoft PowerPoint Mastery", "category": "Office Productivity", "instructor": "John Doe", "duration": "2 weeks", "level": "Beginner"},
    {"title": "Advanced Microsoft Excel", "category": "Office Productivity", "instructor": "Jane Smith", "duration": "4 weeks", "level": "Intermediate"},
    {"title": "Java Programming Fundamentals", "category": "Programming", "instructor": "Dr. Alan Turing", "duration": "8 weeks", "level": "Intermediate"},
    {"title": "Python for Data Science", "category": "Programming", "instructor": "Guido van Rossum", "duration": "6 weeks", "level": "Intermediate"},
]

for c in sample_courses:
    c["description"] = f"Master {c['title']} with industry experts."
    c["is_published"] = True
    c["createdAt"] = datetime.now(timezone.utc)

courses_col.insert_many(sample_courses)
print("✅ Seeded 4 new courses.")

# 2. Ensure melbin@gmail.com exists
users_col = db["users"]
melbin = users_col.find_one({"email": "melbin@gmail.com"})
if not melbin:
    hashed_pw = bcrypt.hashpw("User1234!".encode("utf-8"), bcrypt.gensalt())
    melbin_id = users_col.insert_one({
        "full_name": "Melbin Mani",
        "email": "melbin@gmail.com",
        "password": hashed_pw,
        "role": "user",
        "user_type": "Intern",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }).inserted_id
    melbin = users_col.find_one({"_id": melbin_id})
    print("✅ Created user melbin@gmail.com")

# 3. Clear existing enrollments for melbin to allow manual selection
enroll_col = db["course_enrollments"]
assess_col = db["assessment_attempts"]

enroll_col.delete_many({"user_id": melbin["_id"]})
assess_col.delete_many({"user_id": melbin["_id"]})

print(f"✅ Cleared enrollments for {melbin['email']}. They can now select courses manually.")
