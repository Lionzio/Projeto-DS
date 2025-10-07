import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Dict, Optional
from models import UserDB, QuestionDB, InterviewDB, FeedbackDB
from datetime import datetime

class Database:
    def __init__(self):
        self.client = None
        self.db = None
    
    async def connect(self):
        mongo_url = os.environ['MONGO_URL']
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[os.environ.get('DB_NAME', 'nexocarreira')]
        
        # Create default questions if collection is empty
        await self._seed_questions()
    
    async def disconnect(self):
        if self.client:
            self.client.close()
    
    async def _seed_questions(self):
        """Seed the database with default interview questions"""
        count = await self.db.questions.count_documents({})
        if count == 0:
            default_questions = [
                {
                    "question": "Tell me about yourself and why you're interested in this position.",
                    "type": "behavioral",
                    "category": "introduction",
                    "time_limit": 180,
                    "difficulty": "easy",
                    "created_at": datetime.utcnow()
                },
                {
                    "question": "Describe a challenging project you worked on and how you overcame obstacles.",
                    "type": "behavioral",
                    "category": "problem_solving",
                    "time_limit": 240,
                    "difficulty": "medium",
                    "created_at": datetime.utcnow()
                },
                {
                    "question": "What are your greatest strengths and how do they apply to this role?",
                    "type": "behavioral",
                    "category": "strengths",
                    "time_limit": 180,
                    "difficulty": "easy",
                    "created_at": datetime.utcnow()
                },
                {
                    "question": "Where do you see yourself in 5 years?",
                    "type": "career",
                    "category": "career_goals",
                    "time_limit": 120,
                    "difficulty": "medium",
                    "created_at": datetime.utcnow()
                },
                {
                    "question": "Describe a time when you had to work with a difficult team member.",
                    "type": "behavioral",
                    "category": "teamwork",
                    "time_limit": 200,
                    "difficulty": "medium",
                    "created_at": datetime.utcnow()
                },
                {
                    "question": "How do you handle stress and pressure?",
                    "type": "behavioral",
                    "category": "stress_management",
                    "time_limit": 150,
                    "difficulty": "medium",
                    "created_at": datetime.utcnow()
                }
            ]
            
            await self.db.questions.insert_many(default_questions)
    
    # User operations
    async def create_user(self, user_data: UserDB) -> str:
        result = await self.db.users.insert_one(user_data.dict())
        return str(result.inserted_id)
    
    async def get_user_by_email(self, email: str) -> Optional[Dict]:
        return await self.db.users.find_one({"email": email})
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        return await self.db.users.find_one({"_id": ObjectId(user_id)})
    
    # Question operations
    async def get_questions(self, limit: int = 4) -> List[Dict]:
        cursor = self.db.questions.find().limit(limit)
        return await cursor.to_list(length=limit)
    
    async def get_question_by_id(self, question_id: str) -> Optional[Dict]:
        return await self.db.questions.find_one({"_id": ObjectId(question_id)})
    
    # Interview operations
    async def create_interview(self, interview_data: InterviewDB) -> str:
        result = await self.db.interviews.insert_one(interview_data.dict())
        return str(result.inserted_id)
    
    async def get_interview_by_id(self, interview_id: str) -> Optional[Dict]:
        return await self.db.interviews.find_one({"_id": ObjectId(interview_id)})
    
    async def update_interview(self, interview_id: str, update_data: Dict) -> bool:
        update_data["updated_at"] = datetime.utcnow()
        result = await self.db.interviews.update_one(
            {"_id": ObjectId(interview_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    async def get_user_interviews(self, user_id: str, limit: int = 10) -> List[Dict]:
        cursor = self.db.interviews.find(
            {"user_id": user_id, "status": "completed"}
        ).sort("completed_at", -1).limit(limit)
        return await cursor.to_list(length=limit)
    
    # Feedback operations
    async def create_feedback(self, feedback_data: FeedbackDB) -> str:
        result = await self.db.feedback.insert_one(feedback_data.dict())
        return str(result.inserted_id)
    
    async def get_feedback_by_interview_id(self, interview_id: str) -> Optional[Dict]:
        return await self.db.feedback.find_one({"interview_id": interview_id})
    
    # Analytics operations
    async def get_user_stats(self, user_id: str) -> Dict:
        # Get completed interviews
        interviews = await self.db.interviews.find(
            {"user_id": user_id, "status": "completed"}
        ).to_list(length=None)
        
        if not interviews:
            return {
                "total_sessions": 0,
                "average_score": 0,
                "total_practice_time": 0
            }
        
        total_sessions = len(interviews)
        total_score = sum(i.get("overall_score", 0) for i in interviews if i.get("overall_score"))
        total_time = sum(i.get("duration", 0) for i in interviews if i.get("duration"))
        
        average_score = total_score / total_sessions if total_sessions > 0 else 0
        
        return {
            "total_sessions": total_sessions,
            "average_score": round(average_score),
            "total_practice_time": total_time
        }

# Global database instance
database = Database()