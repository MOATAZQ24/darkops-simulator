from fastapi import FastAPI, APIRouter
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
