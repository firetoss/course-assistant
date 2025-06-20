import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep
from app.models import (
    Exercise,
    ExerciseCreate,
    ExercisePublic,
    ExercisesPublic,
    ExerciseUpdate,
    Message,
)
from app.utils import extract_text_from_p
from app.core import exercise as ExcrciseImporter
import json


router = APIRouter(prefix="/importer", tags=["importer"])


@router.get("/")
def doc_import(session: SessionDep) -> Message:
    """
    导入题目。
    """
    exercise_type = "code-python"
    exercies = ExcrciseImporter.parse_doc(f"app/exercise-original/{exercise_type}.docx", exercise_type)
    for item in exercies:
        exercie_in = Exercise()
        exercie_in.id = uuid.uuid4()
        exercie_in.type = exercise_type
        exercie_in.category = "single"
        exercie_in.question = json.dumps(item["question"])
        exercie_in.options = "[]" if exercise_type == "code-python" else json.dumps(item["options"], ensure_ascii=False)
        exercie_in.answer = json.dumps(item["answer"])
        exercie = Exercise.model_validate(exercie_in)
        session.add(exercie)
        session.commit()
        session.refresh(exercie)
    return Message(message=f"题目导入成功({len(exercies)})")
