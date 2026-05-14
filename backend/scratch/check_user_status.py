import sqlite3
import json

conn = sqlite3.connect('alumni_portal.db')
cursor = conn.cursor()

# Check users table schema
cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()
print("Columns in users table:")
for col in columns:
    print(col)

# Check a sample user (Melbin)
cursor.execute("SELECT * FROM users WHERE full_name LIKE '%Melbin%'")
user = cursor.fetchone()
if user:
    # Get column names
    col_names = [description[0] for description in cursor.description]
    user_dict = dict(zip(col_names, user))
    print("\nUser data for Melbin:")
    print(json.dumps(user_dict, indent=2))
else:
    print("\nUser Melbin not found")

conn.close()
