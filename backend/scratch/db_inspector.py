"""
MongoDB Database Inspector
Provides a structured console view of the Alumni Portal database collections and document counts.
Run: .\\venv\\Scripts\\python.exe scratch/db_inspector.py
"""

import os
import sys
import json
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def inspect_db():
    print("\n" + "="*60)
    print("      ALUMNI PORTAL DATABASE INSPECTOR")
    print("="*60)
    
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    db_name = os.getenv("MONGO_DB_NAME", "alumni_portal")
    
    # Hide password in connection URI display for security
    masked_uri = uri.split('@')[-1] if '@' in uri else uri
    print(f"Connecting to MongoDB at: {masked_uri} ...")
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Verify connection
        client.admin.command('ismaster')
        print("[SUCCESS] Connection Successful!")
    except ConnectionFailure:
        print("[FAILED] Connection Failed! Make sure your network can access Atlas and IP Allowlist is set.")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        sys.exit(1)
        
    db = client[db_name]
    collections = db.list_collection_names()
    
    print(f"\nDatabase Name: {db_name}")
    print(f"Total Collections Found: {len(collections)}")
    print("-"*60)
    
    if not collections:
        print("[WARNING] The database is currently EMPTY (0 collections).")
        print("\n* Tip: You can seed the database with rich test data by running:")
        print("   python reestablish_db.py")
        print("="*60 + "\n")
        return
        
    # Sort collections for display
    collections.sort()
    
    print(f"{'Collection Name':<25} | {'Document Count':<15}")
    print("-"*60)
    for col_name in collections:
        count = db[col_name].count_documents({})
        print(f"{col_name:<25} | {count:<15}")
        
    print("-"*60)
    print("\n* Would you like to view a sample document from a collection?")
    print("   Run this script with a collection name as an argument. Example:")
    print("   python scratch/db_inspector.py users")
    print("="*60 + "\n")

def inspect_collection(col_name):
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    db_name = os.getenv("MONGO_DB_NAME", "alumni_portal")
    client = MongoClient(uri)
    db = client[db_name]
    
    if col_name not in db.list_collection_names():
        print(f"[ERROR] Collection '{col_name}' does not exist in database '{db_name}'.")
        print(f"Available collections: {', '.join(db.list_collection_names())}")
        return
        
    col = db[col_name]
    count = col.count_documents({})
    print("\n" + "="*60)
    print(f"Collection: {col_name} (Total: {count} documents)")
    print("="*60)
    
    if count == 0:
        print("No documents found in this collection.")
        return
        
    # Fetch 3 samples
    samples = list(col.find().limit(3))
    from bson import ObjectId
    
    class BSONEncoder(json.JSONEncoder):
        def default(self, o):
            if isinstance(o, ObjectId):
                return f"ObjectId('{o}')"
            if hasattr(o, 'isoformat'):
                return o.isoformat()
            return str(o)
            
    for idx, doc in enumerate(samples, 1):
        print(f"\n[Document Sample #{idx}]")
        print(json.dumps(doc, indent=2, cls=BSONEncoder))
        print("-" * 40)
    print("="*60 + "\n")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        inspect_collection(sys.argv[1])
    else:
        inspect_db()
