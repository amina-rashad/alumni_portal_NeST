from app import create_app, get_db
import json

app = create_app()
with app.app_context():
    db = get_db()
    posts = list(db.posts.find())
    courses = list(db.courses.find())
    events = list(db.events.find())
    jobs = list(db.jobs.find())
    print(f"DEBUG_POSTS_COUNT: {len(posts)}")
    print(f"DEBUG_COURSES_COUNT: {len(courses)}")
    print(f"DEBUG_EVENTS_COUNT: {len(events)}")
    print(f"DEBUG_JOBS_COUNT: {len(jobs)}")
