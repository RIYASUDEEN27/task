from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime
from typing import List

from database import get_db
from models.task import TaskCreate, TaskUpdate, TaskResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def serialize_task(task: dict) -> dict:
    """Convert a MongoDB task document to a JSON-serializable dict."""
    return {
        "id": str(task["_id"]),
        "user_id": str(task["user_id"]),
        "title": task["title"],
        "description": task.get("description"),
        "priority": task.get("priority", "medium"),
        "due_date": task.get("due_date"),
        "completed": task.get("completed", False),
        "created_at": task["created_at"],
        "updated_at": task["updated_at"],
    }


# ─── GET /api/tasks ───────────────────────────────────────────────────────────

@router.get("/", response_model=List[dict])
async def get_tasks(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Fetch all tasks belonging to the authenticated user, newest first."""
    user_id = current_user["_id"]
    cursor = db.tasks.find({"user_id": user_id}).sort("created_at", -1)
    tasks = await cursor.to_list(length=500)
    return [serialize_task(t) for t in tasks]


# ─── POST /api/tasks ──────────────────────────────────────────────────────────

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(
    body: TaskCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Create a new task for the authenticated user."""
    now = datetime.utcnow()
    task_doc = {
        "user_id": current_user["_id"],
        "title": body.title,
        "description": body.description,
        "priority": body.priority.value,
        "due_date": body.due_date,
        "completed": False,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.tasks.insert_one(task_doc)
    task_doc["_id"] = result.inserted_id
    return serialize_task(task_doc)


# ─── PUT /api/tasks/{task_id} ─────────────────────────────────────────────────

@router.put("/{task_id}")
async def update_task(
    task_id: str,
    body: TaskUpdate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Update a task. Only the owning user can modify it."""
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    # Build update document from only the fields provided by the client
    updates = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if "priority" in updates:
        updates["priority"] = updates["priority"].value if hasattr(updates["priority"], "value") else updates["priority"]
    updates["updated_at"] = datetime.utcnow()

    result = await db.tasks.find_one_and_update(
        {"_id": oid, "user_id": current_user["_id"]},
        {"$set": updates},
        return_document=True,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Task not found or access denied")

    return serialize_task(result)


# ─── PATCH /api/tasks/{task_id}/toggle ───────────────────────────────────────

@router.patch("/{task_id}/toggle")
async def toggle_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Toggle the completed status of a task."""
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    # Fetch current state first so we can invert it
    task = await db.tasks.find_one({"_id": oid, "user_id": current_user["_id"]})
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found or access denied")

    new_status = not task.get("completed", False)
    result = await db.tasks.find_one_and_update(
        {"_id": oid},
        {"$set": {"completed": new_status, "updated_at": datetime.utcnow()}},
        return_document=True,
    )
    return serialize_task(result)


# ─── DELETE /api/tasks/{task_id} ──────────────────────────────────────────────

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Permanently delete a task. Only the owning user can delete it."""
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    result = await db.tasks.delete_one({"_id": oid, "user_id": current_user["_id"]})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found or access denied")
