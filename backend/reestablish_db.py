"""
Database Re-establishment Script for NeST Alumni Portal
This script completely drops the existing MongoDB database and recreates it
from scratch by running the seed data and creating both the Super Admin and Admin accounts.
"""

import os
import subprocess
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

def main():
    # Load environment variables
    load_dotenv()
    
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    db_name = os.getenv("MONGO_DB_NAME", "alumni_portal")
    
    print("🧹 Re-establishing MongoDB Database...")
    print(f"Connecting to MongoDB at: {mongo_uri}")
    print(f"Target Database: {db_name}")
    print("-" * 50)
    
    try:
        # Connect to MongoDB
        client = MongoClient(mongo_uri)
        
        # Drop the existing database
        print(f"🗑️ Dropping database '{db_name}'...")
        client.drop_database(db_name)
        print("✅ Database dropped successfully.")
        
        client.close()
    except Exception as e:
        print(f"❌ Error dropping database: {e}")
        sys.exit(1)
        
    print("-" * 50)
    
    # Set environment variables for subprocess execution to prevent unicode errors on Windows
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    
    # Step 1: Run seed_data.py
    print("🌱 Step 1: Seeding database collections and indexes...")
    try:
        result = subprocess.run(
            [sys.executable, "seed_data.py"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            env=env,
            check=True
        )
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print("❌ Error running seed_data.py:")
        print(e.stdout)
        print(e.stderr)
        sys.exit(1)
        
    # Step 2: Run create_super_admin.py
    print("👑 Step 2: Creating Super Admin account...")
    try:
        result = subprocess.run(
            [sys.executable, "create_super_admin.py"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            env=env,
            check=True
        )
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print("❌ Error running create_super_admin.py:")
        print(e.stdout)
        print(e.stderr)
        sys.exit(1)

    # Step 3: Run create_admin.py
    print("💼 Step 3: Creating Admin account...")
    try:
        result = subprocess.run(
            [sys.executable, "create_admin.py"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            env=env,
            check=True
        )
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print("❌ Error running create_admin.py:")
        print(e.stdout)
        print(e.stderr)
        sys.exit(1)

    print("=" * 50)
    print("🎉 Database successfully re-established in MongoDB!")
    print("=" * 50)
    print("\n📋 Active Admin/Super-Admin Accounts:")
    print("─" * 45)
    print("Super Admin:  shintosebastian@nestgroup.net / Shinto@30")
    print("Admin User:   noblesibi@nestgroup.net / Noble@02")
    print("─" * 45)
    print("All other demo/seeding users have also been reset.")

if __name__ == "__main__":
    main()
