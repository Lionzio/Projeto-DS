from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

# Custom ObjectId type for Pydantic
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Models
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    class Config:
        json_encoders = {ObjectId: str}

class UserStats(BaseModel):
    total_sessions: int = 0
    average_score: float = 0.0
    total_practice_time: int = 0

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    stats: UserStats

    class Config:
        json_encoders = {ObjectId: str}

# Interview Models
class InterviewSetup(BaseModel):
    job_role: str = Field(..., min_length=1, max_length=200)
    company: str = Field(default="", max_length=200)
    job_description: str = Field(..., min_length=10)

class Question(BaseModel):
    id: str
    question: str
    type: str  # behavioral, technical, career
    time_limit: int  # in seconds

    class Config:
        json_encoders = {ObjectId: str}

class InterviewSetupResponse(BaseModel):
    interview_id: str
    questions: List[Question]

    class Config:
        json_encoders = {ObjectId: str}

class AnswerSubmission(BaseModel):
    question_id: str
    answer: str = Field(..., min_length=1)
    time_used: int  # in seconds

class AnswerResponse(BaseModel):
    next_question: Optional[Question] = None
    is_complete: bool = False

# Feedback Models
class AnswerFeedback(BaseModel):
    question_id: str
    question: str
    answer: str
    score: int
    strengths: List[str]
    improvements: List[str]

    class Config:
        json_encoders = {ObjectId: str}

class FeedbackMetrics(BaseModel):
    clarity: int
    structure: int
    content: int
    confidence: int

class InterviewFeedback(BaseModel):
    overall_score: int
    metrics: FeedbackMetrics
    answers: List[AnswerFeedback]

# Interview History Models
class InterviewHistoryItem(BaseModel):
    id: str
    job_role: str
    company: str
    date: datetime
    score: int
    status: str
    duration: int  # in minutes

    class Config:
        json_encoders = {ObjectId: str}

class InterviewHistory(BaseModel):
    interviews: List[InterviewHistoryItem]

# Database Models (for MongoDB)
class UserDB(BaseModel):
    name: str
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class QuestionDB(BaseModel):
    question: str
    type: str  # behavioral, technical, career
    category: str
    time_limit: int
    difficulty: str = "medium"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InterviewAnswer(BaseModel):
    question_id: str
    answer: str
    time_used: int
    submitted_at: datetime = Field(default_factory=datetime.utcnow)

class InterviewDB(BaseModel):
    user_id: str
    job_role: str
    company: str
    job_description: str
    status: str = "setup"  # setup, in_progress, completed
    questions: List[str] = []  # List of question IDs
    answers: List[InterviewAnswer] = []
    overall_score: Optional[int] = None
    duration: Optional[int] = None  # in minutes
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class FeedbackDB(BaseModel):
    interview_id: str
    user_id: str
    overall_score: int
    metrics: Dict[str, int]
    detailed_feedback: List[Dict[str, Any]]
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Token Model
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None