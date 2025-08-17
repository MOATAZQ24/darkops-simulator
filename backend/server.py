from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# DarkOps Lab Models
class UserSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)
    nickname: Optional[str] = None
    total_attacks_completed: int = 0
    total_quiz_score: int = 0

class AttackProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    attack_id: str
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    current_step: int = 0
    total_steps: int = 0
    is_completed: bool = False
    time_spent: int = 0  # seconds

class QuizSubmission(BaseModel):
    session_id: str
    attack_id: str
    question_id: str
    selected_answer: int
    is_correct: bool
    submitted_at: datetime = Field(default_factory=datetime.utcnow)

class QuizScore(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    attack_id: str
    score: int
    total_questions: int
    completed_at: datetime = Field(default_factory=datetime.utcnow)

class Attack(BaseModel):
    id: str
    name: str
    category: str
    description: str
    difficulty: str
    estimated_time: int
    animation_config: Dict[str, Any]
    steps: List[Dict[str, Any]]
    defenses: List[Dict[str, Any]]
    quiz: Dict[str, Any]

# Request/Response Models
class CreateSessionRequest(BaseModel):
    nickname: Optional[str] = None

class SubmitQuizRequest(BaseModel):
    session_id: str
    attack_id: str
    answers: List[Dict[str, Any]]  # [{"question_id": "q1", "selected_answer": 1}]

class UpdateProgressRequest(BaseModel):
    session_id: str
    attack_id: str
    current_step: int
    time_spent: int

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# ========================
# DarkOps Lab API Endpoints
# ========================

# Session Management
@api_router.post("/sessions", response_model=UserSession)
async def create_session(request: CreateSessionRequest):
    session = UserSession(nickname=request.nickname)
    await db.user_sessions.insert_one(session.dict())
    return session

@api_router.get("/sessions/{session_id}", response_model=UserSession)
async def get_session(session_id: str):
    session_data = await db.user_sessions.find_one({"id": session_id})
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Update last_active
    await db.user_sessions.update_one(
        {"id": session_id},
        {"$set": {"last_active": datetime.utcnow()}}
    )
    session_data["last_active"] = datetime.utcnow()
    
    return UserSession(**session_data)

# Attack Data
@api_router.get("/attacks", response_model=List[Attack])
async def get_attacks():
    # Load attacks from JSON file
    attacks_file = Path(__file__).parent / "attacks.json"
    with open(attacks_file, 'r') as f:
        data = json.load(f)
    return [Attack(**attack) for attack in data["attacks"]]

@api_router.get("/attacks/{attack_id}", response_model=Attack)
async def get_attack(attack_id: str):
    # Load attacks from JSON file
    attacks_file = Path(__file__).parent / "attacks.json"
    with open(attacks_file, 'r') as f:
        data = json.load(f)
    
    for attack in data["attacks"]:
        if attack["id"] == attack_id:
            return Attack(**attack)
    
    raise HTTPException(status_code=404, detail="Attack not found")

# Progress Tracking
@api_router.get("/progress/{session_id}")
async def get_user_progress(session_id: str):
    progress_data = await db.attack_progress.find({"session_id": session_id}).to_list(1000)
    return [AttackProgress(**progress) for progress in progress_data]

@api_router.post("/progress", response_model=AttackProgress)
async def create_progress(request: UpdateProgressRequest):
    # Check if progress already exists
    existing_progress = await db.attack_progress.find_one({
        "session_id": request.session_id,
        "attack_id": request.attack_id
    })
    
    if existing_progress:
        # Update existing progress
        updated_progress = await db.attack_progress.find_one_and_update(
            {"session_id": request.session_id, "attack_id": request.attack_id},
            {
                "$set": {
                    "current_step": request.current_step,
                    "time_spent": request.time_spent,
                    "last_active": datetime.utcnow()
                }
            },
            return_document=True
        )
        return AttackProgress(**updated_progress)
    else:
        # Create new progress
        # Get total steps from attacks.json
        attacks_file = Path(__file__).parent / "attacks.json"
        with open(attacks_file, 'r') as f:
            data = json.load(f)
        
        total_steps = 0
        for attack in data["attacks"]:
            if attack["id"] == request.attack_id:
                total_steps = len(attack["steps"])
                break
        
        progress = AttackProgress(
            session_id=request.session_id,
            attack_id=request.attack_id,
            current_step=request.current_step,
            total_steps=total_steps,
            time_spent=request.time_spent,
            is_completed=(request.current_step >= total_steps)
        )
        
        if progress.is_completed:
            progress.completed_at = datetime.utcnow()
        
        await db.attack_progress.insert_one(progress.dict())
        
        # Update user session stats if attack completed
        if progress.is_completed:
            await db.user_sessions.update_one(
                {"id": request.session_id},
                {"$inc": {"total_attacks_completed": 1}}
            )
        
        return progress

# Quiz Management
@api_router.post("/quiz/submit", response_model=QuizScore)
async def submit_quiz(request: SubmitQuizRequest):
    # Load attack data to get correct answers
    attacks_file = Path(__file__).parent / "attacks.json"
    with open(attacks_file, 'r') as f:
        data = json.load(f)
    
    attack_data = None
    for attack in data["attacks"]:
        if attack["id"] == request.attack_id:
            attack_data = attack
            break
    
    if not attack_data:
        raise HTTPException(status_code=404, detail="Attack not found")
    
    # Calculate score
    quiz_questions = attack_data["quiz"]["questions"]
    total_questions = len(quiz_questions)
    correct_answers = 0
    
    # Store individual submissions
    for answer in request.answers:
        question_id = answer["question_id"]
        selected_answer = answer["selected_answer"]
        
        # Find correct answer
        is_correct = False
        for question in quiz_questions:
            if question["id"] == question_id:
                is_correct = (question["correct_answer"] == selected_answer)
                break
        
        if is_correct:
            correct_answers += 1
        
        # Store submission
        submission = QuizSubmission(
            session_id=request.session_id,
            attack_id=request.attack_id,
            question_id=question_id,
            selected_answer=selected_answer,
            is_correct=is_correct
        )
        await db.quiz_submissions.insert_one(submission.dict())
    
    # Create quiz score
    quiz_score = QuizScore(
        session_id=request.session_id,
        attack_id=request.attack_id,
        score=correct_answers,
        total_questions=total_questions
    )
    
    await db.quiz_scores.insert_one(quiz_score.dict())
    
    # Update user session total score
    await db.user_sessions.update_one(
        {"id": request.session_id},
        {"$inc": {"total_quiz_score": correct_answers}}
    )
    
    return quiz_score

@api_router.get("/quiz/scores/{session_id}")
async def get_quiz_scores(session_id: str):
    scores = await db.quiz_scores.find({"session_id": session_id}).to_list(1000)
    return [QuizScore(**score) for score in scores]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
