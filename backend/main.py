from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from nexo_gemini_api import Questionnaire, analyze_questionnaire

app = FastAPI()

class Answers(BaseModel):
    answer1: str
    answer2: str
    answer3: str
    answer4: str
    objective: str

@app.post("/api/gemini-assessment")
async def gemini_assessment(answers: Answers):
    q = Questionnaire(
        answer1=answers.answer1,
        answer2=answers.answer2,
        answer3=answers.answer3,
        answer4=answers.answer4,
        objective=answers.objective
    )
    try:
        result = analyze_questionnaire(q)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
