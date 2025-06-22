import os
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.api.deps import CurrentUser, SessionDep


router = APIRouter(prefix="/pic", tags=["pic"])


@router.get("/{filename}")
def read_items(filename: str) -> Any:
    """
    获取所有题目。
    """
    file_path = os.path.join("app/exercise-pic/" + filename)
    print(file_path)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        raise HTTPException(status_code=404, detail="图片文件不存在")
