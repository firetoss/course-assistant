import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Exercise,
    ExerciseCreate,
    ExercisePublic,
    ExercisesPublic,
    ExerciseUpdate,
    Message,
)
from app.utils import extract_text_from_p
from app.core import exercise as importer


router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("/", response_model=ExercisesPublic)
def read_items(session: SessionDep) -> Any:
    """
    获取所有题目。
    """
    count_statement = select(func.count()).select_from(Exercise)
    count = session.exec(count_statement).one()
    statement = select(Exercise)
    items = session.exec(statement).all()

    return ExercisesPublic(data=items, count=count)


@router.get("/{id}", response_model=ExercisePublic)
def read_item(session: SessionDep, id: uuid.UUID) -> Any:
    """
    根据ID获取题目。
    """
    item = session.get(Exercise, id)
    if not item:
        raise HTTPException(status_code=404, detail="未找到该题目")
    return item


@router.post("/", response_model=ExercisePublic)
def create_item(*, session: SessionDep, item_in: ExerciseCreate) -> Any:
    """
    创建新题目。
    """
    item = Exercise.model_validate(item_in, update={"title": ExerciseCreate.id})
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.put("/{id}", response_model=ExercisePublic)
def update_item(
    *,
    session: SessionDep,
    id: uuid.UUID,
    item_in: ExerciseUpdate,
) -> Any:
    """
    更新题目信息。
    """
    item = session.get(Exercise, id)
    if not item:
        raise HTTPException(status_code=404, detail="未找到该题目")
    update_dict = item_in.model_dump(exclude_unset=True)
    item.sqlmodel_update(update_dict)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{id}")
def delete_item(session: SessionDep, id: uuid.UUID) -> Message:
    """
    删除题目。
    """
    item = session.get(Exercise, id)
    if not item:
        raise HTTPException(status_code=404, detail="未找到该题目")
    session.delete(item)
    session.commit()
    return Message(message="题目删除成功")
