"""Quick script to view all data in the MongoDB taskmanager database."""
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["taskmanager"]

print("=" * 60)
print("  DATABASE: taskmanager")
print("  CONNECTION: mongodb://localhost:27017")
print("=" * 60)

collections = db.list_collection_names()
print(f"\n  Collections found: {collections}\n")

# ─── Users ────────────────────────────────────────────────
print("-" * 60)
print("  USERS COLLECTION")
print("-" * 60)
users = list(db.users.find())
if not users:
    print("  (empty)")
for u in users:
    print(f"  ID       : {u['_id']}")
    print(f"  Username : {u['username']}")
    print(f"  Email    : {u['email']}")
    print(f"  Created  : {u.get('created_at', 'N/A')}")
    print()

# ─── Tasks ────────────────────────────────────────────────
print("-" * 60)
print("  TASKS COLLECTION")
print("-" * 60)
tasks = list(db.tasks.find())
if not tasks:
    print("  (empty)")
for t in tasks:
    print(f"  ID          : {t['_id']}")
    print(f"  Title       : {t['title']}")
    print(f"  Description : {t.get('description', '')}")
    print(f"  Priority    : {t.get('priority', 'medium')}")
    print(f"  Completed   : {t.get('completed', False)}")
    print(f"  User ID     : {t['user_id']}")
    print(f"  Created     : {t.get('created_at', 'N/A')}")
    print()

# ─── Indexes ──────────────────────────────────────────────
print("-" * 60)
print("  INDEXES")
print("-" * 60)
print(f"  users indexes : {list(db.users.list_indexes())}")
print(f"  tasks indexes : {list(db.tasks.list_indexes())}")
print()
print("=" * 60)
print("  MongoDB connection is WORKING!")
print("=" * 60)

client.close()
