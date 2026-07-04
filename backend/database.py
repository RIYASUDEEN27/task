import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

settings = get_settings()

# Single shared client — Motor handles connection pooling internally
client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Open the MongoDB connection on application startup."""
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL, tlsCAFile=certifi.where())
    db = client[settings.DB_NAME]

    # Create indexes for fast lookups
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.tasks.create_index("user_id")
    print(f"[OK] Connected to MongoDB: {settings.MONGODB_URL} / {settings.DB_NAME}")


async def close_db():
    """Close the MongoDB connection on application shutdown."""
    global client
    if client:
        client.close()
        print("[CLOSED] MongoDB connection closed.")


def get_db():
    """Dependency: returns the active database instance."""
    return db
