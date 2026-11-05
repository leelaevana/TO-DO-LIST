from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

# Base schema with shared properties
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "Personal"
    priority: Optional[str] = "Medium"
    due_date: Optional[date] = None

# Schema for creating a task (inherits from TaskBase)
class TaskCreate(TaskBase):
    pass

# Schema for updating an existing task (all fields optional)
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None

# Schema for returning a task response to the frontend
class TaskResponse(TaskBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True  # Allows Pydantic to read data from SQLAlchemy models