from app import create_app, get_db
app = create_app()
with app.app_context():
    db = get_db()
    course = db.courses.find_one({'title': 'VALORANT TRAINING'})
    if course:
        print(f"Title: {course.get('title')}")
        print(f"Duration: {course.get('duration')}")
        print(f"Level: {course.get('level')}")
        print(f"Instructor: {course.get('instructor')}")
        print(f"Category: {course.get('category')}")
        print(f"Access: {course.get('access_level')}")
    else:
        print("Course not found")
