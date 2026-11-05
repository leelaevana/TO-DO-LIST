from sqlalchemy.orm import Session
import models
import schemas

def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def get_tasks(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search: str = None, 
    category: str = None, 
    priority: str = None, 
    status: str = None
):
    query = db.query(models.Task)
    
    if search:
        query = query.filter(models.Task.title.like(f"%{search}%"))
    if category:
        query = query.filter(models.Task.category == category)
    if priority:
        query = query.filter(models.Task.priority == priority)
    if status:
        query = query.filter(models.Task.status == status)
        
    return query.offset(skip).limit(limit).all()

def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        category=task.category,
        priority=task.priority,
        due_date=task.due_date,
        status="Pending"
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task: schemas.TaskUpdate):
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    
    update_data = task.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    db.delete(db_task)
    db.commit()
    return db_task

def complete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    db_task.status = "Completed" if db_task.status == "Pending" else "Pending"
    db.commit()
    db.refresh(db_task)
    return db_task