import docx
from docx.oxml.ns import qn
from app.utils import extract_text_from_p


def parse_doc(doc_file: str, exercise_type: str) -> list:
    doc = docx.Document(doc_file)
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

                if text.startswith("问题"):
                    current_stage = "question"
                elif text.startswith("选项"):
                    current_stage = "options"
                elif text.startswith("答案"):
                    current_stage = "answer"
                else:
                    if current_stage not in exercise:
                        exercise[current_stage] = [text.strip()]
                    else:
                        exercise[current_stage].append(text.strip())

            for drawing in child.iter(qn("w:drawing")):
                for blip in drawing.iter(qn("a:blip")):
                    rId = blip.get(qn("r:embed"))
                    image_part = doc.part.related_parts[rId]
                    image_data = image_part.blob

                    content_type = image_part.content_type
                    ext = content_type.split("/")[-1]

                    save_dir = "app/exercise-pic/"
                    filename = f"{save_dir}/{exercise_type}_image_{rId}.{ext}"
                    with open(filename, "wb") as f:
                        f.write(image_data)
                    # exercise[current_stage] += f"$${filename}$$"
                    exercise[current_stage].append(f"$${filename}$$")
    # 最后一个题目压入列表
    exercises.append(exercise)
    return exercises
