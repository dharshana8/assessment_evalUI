import sys
import asyncio
from pymongo import MongoClient
from app.core.config import settings
from app.database.mongodb import init_mongodb, get_sync_mongodb

def test_mongodb_connection():
    print("=" * 60)
    print("      EVALUI MONGODB CONNECTION & COLLECTION VERIFICATION")
    print("=" * 60)
    print(f"\n[+] MONGODB_URL from .env: {settings.MONGODB_URL}")
    print(f"[+] MONGODB_DB_NAME: {settings.MONGODB_DB_NAME}")

    try:
        # Step 1: Sync Ping
        sync_db = get_sync_mongodb()
        ping_res = sync_db.command("ping")
        print(f"\n[OK] Successfully pinged MongoDB server! Response: {ping_res}")

        # Step 2: Async Index Init
        print("\n[+] Initializing MongoDB collections & indexes...")
        asyncio.run(init_mongodb())

        # Step 3: Insert & Query Sample Test Document
        print("\n[+] Testing collection write/read operations...")
        test_col = sync_db["_connection_test"]
        test_doc = {"test_id": "evalui_test_123", "status": "active", "db": "mongodb"}
        
        test_col.replace_one({"test_id": "evalui_test_123"}, test_doc, upsert=True)
        retrieved = test_col.find_one({"test_id": "evalui_test_123"})
        
        print(f"[OK] Successfully wrote and retrieved document: {retrieved}")
        test_col.delete_one({"test_id": "evalui_test_123"})

        # Step 4: List Collections
        collections = sync_db.list_collection_names()
        print(f"\n[OK] Existing Collections in '{settings.MONGODB_DB_NAME}': {collections}")
        print("\n[OK] MongoDB is fully connected and ready for EvalUI!")

    except Exception as e:
        print(f"\n[X] MongoDB connection failed!")
        print(f"    Error details: {e}")
        print("\n--- Troubleshooting Steps ---")
        print("1. Make sure MongoDB service is running locally on port 27017")
        print("2. Or update MONGODB_URL in evalui/backend/.env:")
        print("   MONGODB_URL=\"mongodb://<username>:<password>@<host>:27017\"")
        print("3. Or start via Docker: docker-compose up -d mongo")
        sys.exit(1)

if __name__ == "__main__":
    test_mongodb_connection()
