import sqlite3
import os

db_path = 'backend/alumni_portal.db'
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Tables: {tables}")
    
    # Try common user table names
    user_tables = ['user', 'users', 'User', 'Users']
    for table in user_tables:
        if (table,) in tables:
            cursor.execute(f"SELECT email, role FROM {table} WHERE role LIKE '%super%' OR email LIKE '%super%'")
            print(f"Found in {table}: {cursor.fetchall()}")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
