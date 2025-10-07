# PrepUP API Contracts & Integration Plan

## Overview
This document outlines the API contracts, data models, and integration strategy for converting the PrepUP frontend prototype from mock data to a fully functional backend system.

## API Endpoints

### 1. Authentication Endpoints

**POST /api/auth/register**
```json
Request: {
  "name": "string",
  "email": "string", 
  "password": "string"
}
Response: {
  "user": {
    "id": "string",
    "name": "string", 
    "email": "string",
    "created_at": "datetime"
  },
  "token": "string"
}
```

**POST /api/auth/login**
```json
Request: {
  "email": "string",
  "password": "string"
}
Response: {
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  },
  "token": "string"
}
```

**POST /api/auth/logout**
```json
Response: {
  "message": "string"
}
```

### 2. User Dashboard Endpoints

**GET /api/user/profile**
```json
Response: {
  "id": "string",
  "name": "string",
  "email": "string",
  "stats": {
    "total_sessions": "number",
    "average_score": "number", 
    "total_practice_time": "number"
  }
}
```

**GET /api/user/interview-history**
```json
Response: {
  "interviews": [
    {
      "id": "string",
      "job_role": "string",
      "company": "string", 
      "date": "datetime",
      "score": "number",
      "status": "string",
      "duration": "number"
    }
  ]
}
```

### 3. Interview Setup & Management

**POST /api/interviews/setup**
```json
Request: {
  "job_role": "string",
  "company": "string",
  "job_description": "string",
  "cv_file": "file" (optional)
}
Response: {
  "interview_id": "string",
  "questions": [
    {
      "id": "string",
      "question": "string",
      "type": "string",
      "time_limit": "number"
    }
  ]
}
```

**GET /api/interviews/{interview_id}/question/{question_id}**
```json
Response: {
  "id": "string",
  "question": "string", 
  "type": "string",
  "time_limit": "number",
  "current_question": "number",
  "total_questions": "number"
}
```

**POST /api/interviews/{interview_id}/submit-answer**
```json
Request: {
  "question_id": "string",
  "answer": "string",
  "time_used": "number"
}
Response: {
  "next_question": {
    "id": "string",
    "question": "string",
    "type": "string", 
    "time_limit": "number"
  } | null,
  "is_complete": "boolean"
}
```

**POST /api/interviews/{interview_id}/complete**
```json
Response: {
  "feedback_id": "string",
  "overall_score": "number",
  "redirect_url": "string"
}
```

### 4. Feedback & Analysis

**GET /api/feedback/{interview_id}**
```json
Response: {
  "overall_score": "number",
  "metrics": {
    "clarity": "number",
    "structure": "number", 
    "content": "number",
    "confidence": "number"
  },
  "answers": [
    {
      "question_id": "string",
      "question": "string",
      "answer": "string",
      "score": "number",
      "strengths": ["string"],
      "improvements": ["string"]
    }
  ]
}
```

## Database Models

### User Model
```python
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string", 
  "password_hash": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Interview Session Model
```python
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "job_role": "string",
  "company": "string",
  "job_description": "string", 
  "cv_file_path": "string",
  "status": "string", # setup, in_progress, completed
  "questions": ["ObjectId"],
  "answers": [
    {
      "question_id": "ObjectId", 
      "answer": "string",
      "time_used": "number",
      "submitted_at": "datetime"
    }
  ],
  "overall_score": "number",
  "duration": "number",
  "created_at": "datetime",
  "completed_at": "datetime"
}
```

### Question Model
```python
{
  "_id": "ObjectId",
  "question": "string",
  "type": "string", # behavioral, technical, career
  "category": "string",
  "time_limit": "number",
  "difficulty": "string",
  "created_at": "datetime"
}
```

### Feedback Model
```python
{
  "_id": "ObjectId", 
  "interview_id": "ObjectId",
  "user_id": "ObjectId",
  "overall_score": "number",
  "metrics": {
    "clarity": "number",
    "structure": "number",
    "content": "number", 
    "confidence": "number"
  },
  "detailed_feedback": [
    {
      "question_id": "ObjectId",
      "answer": "string",
      "score": "number", 
      "strengths": ["string"],
      "improvements": ["string"],
      "analysis": "string"
    }
  ],
  "created_at": "datetime"
}
```

## Mock Data to Replace

### Frontend Mock Files to Update:
- `/app/frontend/src/mock/data.js` - Remove and replace with API calls

### Mock Data Currently Used:
1. **mockInterviewHistory** - Replace with GET /api/user/interview-history
2. **mockQuestions** - Replace with dynamic questions from POST /api/interviews/setup  
3. **mockFeedback** - Replace with GET /api/feedback/{interview_id}

## LLM Integration Strategy

### AI Analysis Service
- Use **Emergent LLM Key** for analysis
- Create dedicated service class for LLM interactions
- Implement structured prompts for consistent feedback generation
- Include retry logic and error handling

### Analysis Prompt Structure:
```
Analyze this interview answer and provide structured feedback:

Question: {question}
Answer: {answer}
Job Role: {job_role}
Job Description: {job_description}

Provide scores (0-100) for:
- Clarity: How clear and well-articulated the answer is
- Structure: How well-organized and logical the response is  
- Content: Relevance and depth of the content
- Confidence: How confident and professional the delivery sounds

Also provide:
- 2-3 key strengths
- 2-3 areas for improvement
```

## Frontend Integration Changes

### Authentication Context Updates:
- Update `AuthContext.js` to use real JWT tokens
- Add token storage in localStorage
- Implement token refresh logic

### API Integration Points:
1. **Login.js** - Replace mock login with POST /api/auth/login
2. **Dashboard.js** - Replace mock data with GET /api/user/profile & GET /api/user/interview-history  
3. **InterviewSetup.js** - Submit form to POST /api/interviews/setup
4. **LiveInterview.js** - Get questions and submit answers via API
5. **FeedbackPage.js** - Load feedback from GET /api/feedback/{interview_id}

### Error Handling:
- Add loading states for all API calls
- Implement proper error messages and retry logic
- Add toast notifications for user feedback

## Security Considerations

### Authentication:
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes middleware

### Data Validation:
- Request validation with Pydantic models
- File upload size limits
- Rate limiting for API endpoints

### File Storage:
- Secure CV file storage
- File type validation
- Virus scanning (future enhancement)

## Implementation Priority

### Phase 1: Core Backend Setup
1. Database models and connections
2. User authentication system
3. Basic CRUD operations

### Phase 2: Interview Engine
1. Question management system
2. Interview session handling
3. LLM integration for feedback

### Phase 3: Frontend Integration  
1. Replace mock data with API calls
2. Add loading states and error handling
3. Implement real-time features

### Phase 4: Enhancement
1. File upload functionality
2. Advanced analytics
3. Performance optimizations