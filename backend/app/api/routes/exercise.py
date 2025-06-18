import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Exercise,
    ExercisesPublic,
)


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
