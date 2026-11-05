from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from datetime import datetime
from database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="Personal")
    priority = Column(String(20), default="Medium")
    due_date = Column(Date, nullable=True)
    status = Column(String(20), default="Pending")  # "Pending" or "Completed"
    created_at = Column(DateTime, default=datetime.utcnow)