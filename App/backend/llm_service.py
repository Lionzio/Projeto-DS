import asyncio
import json
import logging
from typing import Dict, List
from emergentintegrations.llm.chat import LlmChat, UserMessage
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InterviewAnalysisService:
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY environment variable not set")
    
    async def analyze_answer(self, question: str, answer: str, job_role: str, job_description: str) -> Dict:
        """
        Analyze an interview answer using LLM and return structured feedback
        """
        try:
            # Create a unique session ID for each analysis
            session_id = f"interview_analysis_{asyncio.get_event_loop().time()}"
            
            # Initialize the chat with system message
            system_message = """You are an expert interview coach and HR professional. Your task is to analyze interview answers and provide constructive, professional feedback.

You must respond ONLY with valid JSON in this exact format:
{
    "clarity": <score 0-100>,
    "structure": <score 0-100>,
    "content": <score 0-100>, 
    "confidence": <score 0-100>,
    "overall_score": <score 0-100>,
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}

Scoring criteria:
- Clarity (0-100): How clear and well-articulated the answer is
- Structure (0-100): How well-organized and logical the response is
- Content (0-100): Relevance, depth, and quality of the content
- Confidence (0-100): How confident and professional the delivery sounds
- Overall Score: Average of the four metrics

Provide exactly 3 strengths and 3 areas for improvement. Be specific and actionable."""

            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model("openai", "gpt-4o")
            
            # Create the analysis prompt
            analysis_prompt = f"""Analyze this interview answer:

QUESTION: {question}

ANSWER: {answer}

JOB ROLE: {job_role}

JOB DESCRIPTION: {job_description}

Provide your analysis in the required JSON format only."""

            user_message = UserMessage(text=analysis_prompt)
            
            # Get response from LLM
            response = await chat.send_message(user_message)
            
            # Parse the JSON response
            try:
                feedback_data = json.loads(response)
                
                # Validate the response structure
                required_fields = ["clarity", "structure", "content", "confidence", "overall_score", "strengths", "improvements"]
                for field in required_fields:
                    if field not in feedback_data:
                        raise ValueError(f"Missing required field: {field}")
                
                # Ensure scores are within valid range
                for score_field in ["clarity", "structure", "content", "confidence", "overall_score"]:
                    score = feedback_data[score_field]
                    if not isinstance(score, (int, float)) or score < 0 or score > 100:
                        feedback_data[score_field] = 75  # Default fallback score
                
                # Ensure lists have exactly 3 items
                if len(feedback_data["strengths"]) != 3:
                    feedback_data["strengths"] = feedback_data["strengths"][:3] + ["Well-structured response"] * (3 - len(feedback_data["strengths"]))
                
                if len(feedback_data["improvements"]) != 3:
                    feedback_data["improvements"] = feedback_data["improvements"][:3] + ["Consider adding more specific examples"] * (3 - len(feedback_data["improvements"]))
                
                logger.info(f"Successfully analyzed answer for question: {question[:50]}...")
                return feedback_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM response as JSON: {e}")
                return self._get_fallback_feedback()
                
        except Exception as e:
            logger.error(f"Error in LLM analysis: {e}")
            return self._get_fallback_feedback()
    
    def _get_fallback_feedback(self) -> Dict:
        """
        Provide fallback feedback when LLM analysis fails
        """
        return {
            "clarity": 75,
            "structure": 75,
            "content": 75,
            "confidence": 75,
            "overall_score": 75,
            "strengths": [
                "You provided a complete response to the question",
                "Your answer shows relevant experience",
                "You demonstrated understanding of the role"
            ],
            "improvements": [
                "Consider providing more specific examples",
                "Structure your response using the STAR method",
                "Add more quantifiable achievements"
            ]
        }
    
    async def analyze_complete_interview(self, interview_data: List[Dict]) -> Dict:
        """
        Analyze all answers in an interview and provide overall feedback
        """
        try:
            all_feedback = []
            total_score = 0
            total_clarity = 0
            total_structure = 0
            total_content = 0
            total_confidence = 0
            
            for item in interview_data:
                feedback = await self.analyze_answer(
                    question=item["question"],
                    answer=item["answer"],
                    job_role=item.get("job_role", ""),
                    job_description=item.get("job_description", "")
                )
                
                all_feedback.append({
                    "question_id": item["question_id"],
                    "question": item["question"],
                    "answer": item["answer"],
                    "score": feedback["overall_score"],
                    "strengths": feedback["strengths"],
                    "improvements": feedback["improvements"]
                })
                
                total_score += feedback["overall_score"]
                total_clarity += feedback["clarity"]
                total_structure += feedback["structure"]
                total_content += feedback["content"]
                total_confidence += feedback["confidence"]
            
            num_questions = len(interview_data)
            if num_questions == 0:
                return self._get_fallback_complete_feedback()
            
            return {
                "overall_score": round(total_score / num_questions),
                "metrics": {
                    "clarity": round(total_clarity / num_questions),
                    "structure": round(total_structure / num_questions),
                    "content": round(total_content / num_questions),
                    "confidence": round(total_confidence / num_questions)
                },
                "answers": all_feedback
            }
            
        except Exception as e:
            logger.error(f"Error in complete interview analysis: {e}")
            return self._get_fallback_complete_feedback()
    
    def _get_fallback_complete_feedback(self) -> Dict:
        """
        Provide fallback feedback for complete interview analysis
        """
        return {
            "overall_score": 75,
            "metrics": {
                "clarity": 75,
                "structure": 75,
                "content": 75,
                "confidence": 75
            },
            "answers": []
        }