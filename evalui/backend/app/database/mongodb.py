from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from app.core.config import settings
from app.core.logging_config import logger

class MongoDBManager:
    client: AsyncIOMotorClient = None
    sync_client: MongoClient = None

mongodb_manager = MongoDBManager()

def get_mongodb_client() -> AsyncIOMotorClient:
    if mongodb_manager.client is None:
        mongodb_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000
        )
    return mongodb_manager.client

def get_mongodb():
    client = get_mongodb_client()
    return client[settings.MONGODB_DB_NAME]

def get_sync_mongodb():
    if mongodb_manager.sync_client is None:
        mongodb_manager.sync_client = MongoClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000
        )
    return mongodb_manager.sync_client[settings.MONGODB_DB_NAME]

async def init_mongodb():
    """Initializes MongoDB indexes for assignments, submissions, and evaluations."""
    try:
        db = get_mongodb()
        logger.info(f"Initializing MongoDB connection to database '{settings.MONGODB_DB_NAME}'...")
        
        # Ensure collections and unique indexes
        await db.assignments.create_index("id", unique=True)
        await db.submissions.create_index("id", unique=True)
        await db.submissions.create_index("assignment_id")
        await db.evaluations.create_index("id", unique=True)
        await db.evaluations.create_index("submission_id")
        await db.users.create_index("id", unique=True)
        await db.users.create_index("email", unique=True, sparse=True)
        
        logger.info("MongoDB collections and indexes initialized successfully!")
    except Exception as e:
        logger.warning(f"MongoDB initialization warning/error: {e}")

def close_mongodb():
    if mongodb_manager.client:
        mongodb_manager.client.close()
        mongodb_manager.client = None
    if mongodb_manager.sync_client:
        mongodb_manager.sync_client.close()
        mongodb_manager.sync_client = None
