"""
Database Seed Script
Populates the MongoDB database with sample data for development/testing.
Run: python seed_data.py
"""

import bcrypt
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta
import random

# ── Connect ──
client = MongoClient("mongodb://localhost:27017/")
db = client["alumni_portal"]

print("🌱 Seeding Alumni Portal Database...")
print("=" * 50)

# ── 1. USERS ──
users_col = db["users"]

sample_users = [
    {
        "full_name": "NeST System Admin",
        "email": "admin@nest.com",
        "password": bcrypt.hashpw("Admin123!".encode("utf-8"), bcrypt.gensalt()),
        "phone": "9876543210",
        "user_type": "Alumni",
        "batch": "N/A",
        "specialization": "System Administration",
        "role": "admin",
        "is_active": True,
        "is_email_verified": True,
        "bio": "Master system administrator for the NeST Alumni Portal.",
        "skills": ["System Admin", "Security", "DevOps"],
    },
    {
        "full_name": "Arjun Krishnan",
        "email": "arjun.k@gmail.com",
        "password": bcrypt.hashpw("User1234!".encode("utf-8"), bcrypt.gensalt()),
        "phone": "9845612378",
        "user_type": "Alumni",
        "batch": "2022",
        "specialization": "Computer Science",
        "role": "user",
        "is_active": True,
        "is_email_verified": True,
        "bio": "Full-stack developer at Infosys. Passionate about React and Node.js.",
        "skills": ["React", "Node.js", "MongoDB", "Python"],
    },
    {
        "full_name": "Priya Menon",
        "email": "priya.menon@gmail.com",
        "password": bcrypt.hashpw("User1234!".encode("utf-8"), bcrypt.gensalt()),
        "phone": "9812345670",
        "user_type": "Alumni",
        "batch": "2021",
        "specialization": "Electronics & Communication",
        "role": "user",
        "is_active": True,
        "is_email_verified": True,
        "bio": "IoT Engineer at TCS. Working on embedded systems and smart devices.",
        "skills": ["Embedded C", "Arduino", "IoT", "VHDL"],
    },
    {
        "full_name": "Rahul Nair",
        "email": "rahul.nair@gmail.com",
        "password": bcrypt.hashpw("User1234!".encode("utf-8"), bcrypt.gensalt()),
        "phone": "9867534210",
        "user_type": "Intern",
        "batch": "2025",
        "specialization": "Artificial Intelligence",
        "role": "user",
        "is_active": True,
        "is_email_verified": True,
        "bio": "ML intern at NeST Digital. Exploring transformer architectures.",
        "skills": ["Python", "TensorFlow", "PyTorch", "NLP"],
    },
    {
        "full_name": "Sneha Thomas",
        "email": "sneha.t@gmail.com",
        "password": bcrypt.hashpw("User1234!".encode("utf-8"), bcrypt.gensalt()),
        "phone": "9834567890",
        "user_type": "Trainee",
        "batch": "2024",
        "specialization": "Data Science",
        "role": "user",
        "is_active": True,
        "is_email_verified": True,
        "bio": "Data science trainee exploring ML pipelines and analytics.",
        "skills": ["Python", "Pandas", "SQL", "Tableau"],
    },
    {
        "full_name": "Vishnu Prasad",
        "email": "vishnu.p@gmail.com",
        "password": bcrypt.hashpw("User1234!".encode("utf-8"), bcrypt.gensalt()),
        "phone": "9876123450",
        "user_type": "Industrial Student",
        "batch": "2025",
        "specialization": "Mechanical Engineering",
        "role": "user",
        "is_active": True,
        "is_email_verified": True,
        "bio": "IV student from College of Engineering, Trivandrum.",
        "skills": ["AutoCAD", "SolidWorks", "MATLAB"],
    },
    {
        "full_name": "Aishwarya Suresh",
        "email": "aishwarya.s@gmail.com",
        "password": bcrypt.hashpw("User1234!".encode("utf-8"), bcrypt.gensalt()),
        "phone": "9801234567",
        "user_type": "Alumni",
        "batch": "2020",
        "specialization": "Information Technology",
        "role": "user",
        "is_active": True,
        "is_email_verified": True,
        "bio": "Senior DevOps Engineer at AWS. Cloud architecture enthusiast.",
        "skills": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"],
    },
    {
        "full_name": "Mohammed Faiz",
        "email": "faiz.m@gmail.com",
        "password": bcrypt.hashpw("User1234!".encode("utf-8"), bcrypt.gensalt()),
        "phone": "9823456789",
        "user_type": "Event Participant",
        "batch": "2023",
        "specialization": "Computer Science",
        "role": "user",
        "is_active": True,
        "is_email_verified": True,
        "bio": "Attending NeST tech events. Currently a freelance web developer.",
        "skills": ["JavaScript", "Vue.js", "PHP", "WordPress"],
    },
]

now = datetime.now(timezone.utc)
for u in sample_users:
    u["profile_picture"] = None
    u["linkedin_url"] = None
    u["created_at"] = now - timedelta(days=random.randint(1, 365))
    u["updated_at"] = now
    u["last_login"] = now - timedelta(hours=random.randint(1, 72))

# Upsert users
for u in sample_users:
    users_col.update_one({"email": u["email"]}, {"$set": u}, upsert=True)
print(f"✅ Users: {len(sample_users)} seeded")

# ── 2. JOBS ──
jobs_col = db["jobs"]

sample_jobs = [
    {
        "title": "Senior React Developer",
        "company": "NeST Digital",
        "location": "Trivandrum, Kerala",
        "salary": "₹12-18 LPA",
        "type": "Full-time",
        "description": "Looking for an experienced React developer to lead frontend development for enterprise applications.",
        "requirements": ["3+ years React experience", "TypeScript proficiency", "REST API integration"],
        "skills_required": ["React", "TypeScript", "Redux", "REST APIs"],
        "experience_level": "Mid Level",
        "is_active": True,
    },
    {
        "title": "Python Backend Engineer",
        "company": "NeST Digital",
        "location": "Kochi, Kerala",
        "salary": "₹10-15 LPA",
        "type": "Full-time",
        "description": "Build scalable microservices with Flask/FastAPI for our alumni engagement platform.",
        "requirements": ["2+ years Python experience", "Flask or FastAPI", "MongoDB or PostgreSQL"],
        "skills_required": ["Python", "Flask", "MongoDB", "Docker"],
        "experience_level": "Mid Level",
        "is_active": True,
    },
    {
        "title": "DevOps Intern",
        "company": "NeST Technologies",
        "location": "Remote",
        "salary": "₹15,000/month",
        "type": "Internship",
        "description": "Learn CI/CD pipelines, cloud deployment, and container orchestration.",
        "requirements": ["Basic Linux knowledge", "Familiarity with Git", "Interest in cloud technologies"],
        "skills_required": ["Linux", "Git", "Docker", "AWS"],
        "experience_level": "Entry Level",
        "is_active": True,
    },
    {
        "title": "Data Analyst",
        "company": "NeST Information Technologies",
        "location": "Trivandrum, Kerala",
        "salary": "₹8-12 LPA",
        "type": "Full-time",
        "description": "Analyze business data and create actionable insights using modern analytics tools.",
        "requirements": ["SQL proficiency", "Python or R", "Tableau or Power BI experience"],
        "skills_required": ["SQL", "Python", "Tableau", "Excel"],
        "experience_level": "Entry Level",
        "is_active": True,
    },
    {
        "title": "UI/UX Design Lead",
        "company": "NeST Digital",
        "location": "Bangalore, Karnataka",
        "salary": "₹15-22 LPA",
        "type": "Full-time",
        "description": "Lead the design team to create world-class user experiences for enterprise SaaS products.",
        "requirements": ["5+ years design experience", "Figma expertise", "Design system knowledge"],
        "skills_required": ["Figma", "Adobe XD", "Design Systems", "Prototyping"],
        "experience_level": "Senior",
        "is_active": True,
    },
]

for j in sample_jobs:
    j["createdAt"] = now - timedelta(days=random.randint(1, 30))
    j["posted_by"] = "admin"

jobs_col.delete_many({})
jobs_col.insert_many(sample_jobs)
print(f"✅ Jobs: {len(sample_jobs)} seeded")

# ── 3. COURSES ──
courses_col = db["courses"]

sample_courses = [
    {
        "title": "Full-Stack Web Development with MERN",
        "description": "Master MongoDB, Express.js, React, and Node.js to build modern web applications from scratch.",
        "instructor": "Dr. Sarah Jenkins",
        "duration": "12 weeks",
        "level": "Intermediate",
        "category": "Web Development",
        "is_published": True,
    },
    {
        "title": "Machine Learning Fundamentals",
        "description": "Introduction to supervised and unsupervised learning, neural networks, and practical ML with Python.",
        "instructor": "Prof. Ramesh Kumar",
        "duration": "8 weeks",
        "level": "Beginner",
        "category": "AI/ML",
        "is_published": True,
    },
    {
        "title": "Cloud Architecture with AWS",
        "description": "Learn to design, deploy, and manage scalable cloud solutions on Amazon Web Services.",
        "instructor": "Aishwarya Suresh",
        "duration": "10 weeks",
        "level": "Advanced",
        "category": "Cloud Computing",
        "is_published": True,
    },
    {
        "title": "Mobile App Development with Flutter",
        "description": "Build beautiful, natively compiled applications for mobile from a single Dart codebase.",
        "instructor": "Arjun Krishnan",
        "duration": "6 weeks",
        "level": "Intermediate",
        "category": "Mobile Development",
        "is_published": True,
    },
    {
        "title": "Cybersecurity Essentials",
        "description": "Learn the fundamentals of cybersecurity, ethical hacking, and vulnerability assessment.",
        "instructor": "Dr. Michael Chen",
        "duration": "8 weeks",
        "level": "Beginner",
        "category": "Security",
        "is_published": True,
    },
]

for c in sample_courses:
    c["thumbnail"] = ""
    c["video_url"] = ""
    c["modules"] = []
    c["created_by"] = "admin"
    c["createdAt"] = now - timedelta(days=random.randint(1, 60))

courses_col.delete_many({})
courses_col.insert_many(sample_courses)
print(f"✅ Courses: {len(sample_courses)} seeded")

# ── 4. EVENTS ──
events_col = db["events"]

sample_events = [
    {
        "title": "Annual Alumni Tech Summit 2026",
        "description": "Join alumni, industry leaders, and students for a day of tech talks, networking, and workshops.",
        "date": "2026-10-15",
        "time": "09:00 AM IST",
        "location": "NeST Campus, Trivandrum",
        "category": "Summit",
        "organizer": "NeST Alumni Association",
        "attendees": [],
        "is_active": True,
    },
    {
        "title": "AI & Machine Learning Workshop",
        "description": "Hands-on workshop covering practical ML, model deployment, and AI ethics.",
        "date": "2026-11-02",
        "time": "01:00 PM IST",
        "location": "Virtual (Zoom)",
        "category": "Workshop",
        "organizer": "NeST Digital Training",
        "attendees": [],
        "is_active": True,
    },
    {
        "title": "Career Fair: NeST Job Connect",
        "description": "Exclusive job fair for alumni and interns. Meet hiring managers from NeST and partner companies.",
        "date": "2026-09-20",
        "time": "10:00 AM IST",
        "location": "NeST Technopark, Kochi",
        "category": "Career Fair",
        "organizer": "NeST HR Department",
        "attendees": [],
        "is_active": True,
    },
    {
        "title": "Hackathon: Build for Impact",
        "description": "48-hour hackathon building solutions for social good. Team up with fellow alumni!",
        "date": "2026-12-05",
        "time": "06:00 PM IST",
        "location": "NeST Innovation Hub, Trivandrum",
        "category": "Hackathon",
        "organizer": "NeST Innovation Team",
        "attendees": [],
        "is_active": True,
    },
]

for e in sample_events:
    e["cover_image"] = ""
    e["max_attendees"] = random.randint(50, 500)
    e["created_by"] = "admin"
    e["createdAt"] = now

events_col.delete_many({})
events_col.insert_many(sample_events)
print(f"✅ Events: {len(sample_events)} seeded")

# ── 5. SAMPLE POSTS ──
posts_col = db["posts"]

# Get a user ID for posts
arjun = users_col.find_one({"email": "arjun.k@gmail.com"})
priya = users_col.find_one({"email": "priya.menon@gmail.com"})

if arjun and priya:
    sample_posts = [
        {
            "author_id": arjun["_id"],
            "content": "Excited to share that I've been promoted to Senior Developer at Infosys! The skills I built during my time at NeST were instrumental. Always grateful for the foundation. 🚀 #CareerGrowth",
            "image_url": None,
            "likes": [],
            "comments": [],
            "created_at": now - timedelta(hours=5),
        },
        {
            "author_id": priya["_id"],
            "content": "Just completed a workshop on IoT Security at TCS. If anyone from the NeST network is working in IoT, let's connect! Would love to collaborate on some projects. 🔒💡",
            "image_url": None,
            "likes": [],
            "comments": [],
            "created_at": now - timedelta(hours=12),
        },
    ]
    posts_col.delete_many({})
    posts_col.insert_many(sample_posts)
    print(f"✅ Posts: {len(sample_posts)} seeded")

# ── 6. CREATE INDEXES ──
users_col.create_index("email", unique=True)
users_col.create_index("user_type")
users_col.create_index("created_at")
jobs_col.create_index("createdAt")
courses_col.create_index("createdAt")
events_col.create_index("date")
db["applications"].create_index([("user_id", 1), ("job_id", 1)], unique=True)
db["notifications"].create_index([("user_id", 1), ("created_at", -1)])
db["posts"].create_index("created_at")

print(f"✅ Indexes created")

print("\n" + "=" * 50)
print("🎉 Database seeded successfully!")
print("=" * 50)
print("\n📋 Test Credentials:")
print("─" * 30)
print("Admin:  admin@nest.com / Admin123!")
print("User:   arjun.k@gmail.com / User1234!")
print("User:   priya.menon@gmail.com / User1234!")
print("Intern: rahul.nair@gmail.com / User1234!")
print("─" * 30)
