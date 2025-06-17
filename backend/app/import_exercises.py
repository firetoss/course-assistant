from sqlmodel import func, select
import docx
from docx.oxml.ns import qn
from sqlmodel import Session, SQLModel
from app.api.deps import SessionDep
from app.models import (
    Exercise,
    ExerciseCreate,
    ExercisePublic,
    ExercisesPublic,
    ExerciseUpdate,
)
import json


def extract_text_from_p(p_element):
    """合并段落<w:p>元素所有文字节点"""
    return "".join([t.text for t in p_element.iter(qn("w:t")) if t.text])


doc = docx.Document("exercise-original/basic.docx")
body = doc.element.body
exercises = []
exercise = []
current_stage = ""
for child in body.iterchildren():
    if child.tag == qn("w:p"):
        text = extract_text_from_p(child)
        # 处理文本内容
        if text.strip():
            # 跳过序号和类型 例：【1-单选题】
            if text.startswith("【"):
                if exercise:
                    exercises.append(exercise)
                exercise = dict()
                continue

            text = text.replace("\xa0", "").replace("\u3000", "")

            if text.startswith("问题"):
                exercise["question"] = text.strip().replace("问题：", "")
                current_stage = "question"
            elif text.startswith("选项"):
                exercise["options"] = text.strip().replace("选项：", "").split()
                current_stage = "options"
            elif text.startswith("答案"):
                exercise["answer"] = text.strip().replace("答案：", "")
                current_stage = "answer"
            else:
                exercise[current_stage] += f"\n{text}"

        for drawing in child.iter(qn("w:drawing")):
            for blip in drawing.iter(qn("a:blip")):
                rId = blip.get(qn("r:embed"))
                image_part = doc.part.related_parts[rId]
                image_data = image_part.blob

                content_type = image_part.content_type
                ext = content_type.split("/")[-1]

                save_dir = "exercise-pic"
                filename = f"{save_dir}/image_{rId}.{ext}"
                with open(filename, "wb") as f:
                    f.write(image_data)
                exercise[current_stage] += f"$${filename}$$"


# 写入数据库
for exercise in exercises:
    item = ExerciseCreate()
    item.type = "basic"
    item.category = "single"
    item.question = json.dumps(exercise["question"])
    item.options = json.dumps(exercise["options"])
    item.answer = json.dumps(exercise["answer"])
    print(item)
