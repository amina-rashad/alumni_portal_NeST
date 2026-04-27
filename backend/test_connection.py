import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, OperationFailure
from dotenv import load_dotenv
import socket

load_dotenv()

uri = os.getenv("MONGO_URI")
db_name = os.getenv("MONGO_DB_NAME")

print(f"--- MongoDB Connection Test ---")
print(f"Connecting to URI: {uri.split('@')[-1]}") # Hide password

# 1. Test DNS/Port
try:
    print("\nChecking if we can reach the Atlas server on port 27017...")
    # Extract host from srv (rough check)
    host = uri.split('@')[-1].split('/')[0]
    if "+srv" in uri:
        print("Note: You are using a +srv URI which uses DNS. Checking base cluster...")
    
    print("Testing connection...")
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("✅ SUCCESS: Connected to MongoDB Atlas cluster!")
except ServerSelectionTimeoutError as e:
    print("❌ FAILED: Timeout Error.")
    print("This means your network is blocking the connection to MongoDB Atlas.")
    print("Possible causes: Corporate/School Firewall, Antivirus, or IP Allowlist (0.0.0.0/0) not yet active.")
except OperationFailure as e:
    print(f"❌ FAILED: Authentication Error. {e}")
    print("This means you connected, but your username or password in the URL is wrong.")
except Exception as e:
    print(f"❌ FAILED: Unknown Error: {type(e).__name__}: {e}")

print("\n--- End of Test ---")
