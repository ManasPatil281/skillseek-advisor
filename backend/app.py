from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
import uuid
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import functions from other modules
from langchain_agent import (
    generate_adaptive_questions,
    summarize_and_roadmap,
    validate_api_key,
    get_model_info,
    generate_learning_roadmap,
    get_industry_trends
)
from utils import (
    load_json,
    save_json,
    extract_user_skills,
    recommend_careers,
    match_mentors,
    calculate_career_growth_projection,
    generate_skill_gap_report
)

# Load Firebase credentials from .env
firebase_credentials_json = os.getenv("FIREBASE_CREDENTIALS")
if not firebase_credentials_json:
    raise ValueError("FIREBASE_CREDENTIALS not found in environment variables. Please check your .env file.")

firebase_credentials = json.loads(firebase_credentials_json)

# Initialize Firebase
cred = credentials.Certificate(firebase_credentials)
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI(
    title="CareerCompass API", 
    description="API for career guidance and recommendations", 
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enhanced CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173",
        "http://localhost:8080",  # Frontend dev server
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Enhanced Pydantic models
class Question(BaseModel):
    id: str
    text: str
    type: str
    options: Optional[List[str]] = None
    answer: Optional[Any] = None

class SessionData(BaseModel):
    questions: List[Question]
    user_id: Optional[str] = None
    timestamp: Optional[str] = None

class CareerRecommendation(BaseModel):
    career_id: str
    title: str
    match_score: float
    demand_score: int
    avg_salary: int
    entry_level_salary: int
    key_skills: List[str]
    description: str
    education_requirements: str
    growth_trend: Dict[str, Any]

class CareerRequest(BaseModel):
    session_data: SessionData
    career_data: Optional[List[Dict[str, Any]]] = None

class AdaptiveQuestionsRequest(BaseModel):
    context: str
    previous_questions: Optional[List[str]] = []

class RoadmapRequest(BaseModel):
    session_data: Dict[str, Any]
    selected_career: Dict[str, Any]

class MentorMatchRequest(BaseModel):
    selected_career: Dict[str, Any]
    session_data: Dict[str, Any]

class SkillGapRequest(BaseModel):
    user_skills: List[str]
    career_skills: List[str]

class GrowthProjectionRequest(BaseModel):
    career: Dict[str, Any]
    years: Optional[int] = 5

class LearningRoadmapRequest(BaseModel):
    career_data: Dict[str, Any]
    user_profile: Dict[str, Any]

class IndustryTrendsRequest(BaseModel):
    career_field: str
    time_period: Optional[str] = "6months"

# Health and info endpoints
@app.get("/")
def root():
    return {
        "message": "Welcome to CareerCompass API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    try:
        # Check Firebase connection
        careers_ref = db.collection('careers')
        careers_count = len(list(careers_ref.limit(1).stream()))
        
        mentors_ref = db.collection('mentors')
        mentors_count = len(list(mentors_ref.limit(1).stream()))
        
        return {
            "status": "healthy", 
            "api_key_valid": validate_api_key(),
            "firebase_connected": True,
            "data_collections_exist": {
                "careers": careers_count > 0,
                "mentors": mentors_count > 0
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "api_key_valid": validate_api_key(),
            "firebase_connected": False,
            "error": str(e)
        }

@app.get("/model-info")
def get_model_information():
    return get_model_info()

# Data endpoints
@app.get("/careers")
def get_careers():
    """Load career data from Firestore"""
    try:
        # Try to get careers from Firestore
        careers_ref = db.collection('careers')
        docs = list(careers_ref.stream())
        careers = [doc.to_dict() for doc in docs]
        
        if careers:
            return {"careers": careers, "count": len(careers)}
        else:
            raise HTTPException(status_code=404, detail="No career data found in database")
            
    except Exception as e:
        print(f"Firestore error in get_careers: {str(e)}")
        raise HTTPException(status_code=500, detail="Unable to load career data from database")

@app.get("/careers/{career_id}")
def get_career_by_id(career_id: str):
    """Get specific career by ID from Firestore"""
    try:
        career_ref = db.collection('careers').document(career_id)
        doc = career_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail=f"Career with ID {career_id} not found")
        return {"career": doc.to_dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading career: {str(e)}")

@app.get("/mentors")
def get_mentors():
    """Load mentors data from Firestore"""
    try:
        # Try to get mentors from Firestore
        mentors_ref = db.collection('mentors')
        docs = list(mentors_ref.stream())
        mentors = [doc.to_dict() for doc in docs]
        
        if mentors:
            return {"mentors": mentors, "count": len(mentors)}
        else:
            raise HTTPException(status_code=404, detail="No mentor data found in database")
            
    except Exception as e:
        print(f"Firestore error in get_mentors: {str(e)}")
        raise HTTPException(status_code=500, detail="Unable to load mentor data from database")

# Core functionality endpoints
@app.post("/recommend-careers")
async def recommend_careers_endpoint(request: dict):
    """Generate career recommendations using Firestore"""
    try:
        print(f"Received request data: {request}")
        
        # Extract session data from the request
        session_data = request.get("session_data", {})
        if not session_data:
            raise HTTPException(status_code=400, detail="Missing session_data in request")
        
        print(f"Processing career recommendation request with session data: {session_data}")
        
        # Load career data from Firestore
        careers_ref = db.collection('careers')
        docs = careers_ref.stream()
        career_data = [doc.to_dict() for doc in docs]
        if not career_data:
            raise HTTPException(status_code=500, detail="Career data not available")
        
        print(f"Loaded {len(career_data)} careers from Firestore")
        
        # Generate recommendations using the session data directly
        recommendations = recommend_careers(session_data, career_data)
        print(f"Generated {len(recommendations)} recommendations")
        
        # Format and validate recommendations
        formatted_recommendations = []
        for i, rec in enumerate(recommendations):
            formatted_rec = {
                "career_id": rec.get("career_id", f"career_{i}"),
                "title": rec.get("title", "Unknown Career"),
                "match_score": float(rec.get("match_score", rec.get("confidence_score", 80))),
                "demand_score": int(rec.get("demand_score", 75)),
                "avg_salary": int(rec.get("avg_salary", 70000)),
                "entry_level_salary": int(rec.get("entry_level_salary", 50000)),
                "key_skills": rec.get("key_skills", []),
                "description": rec.get("description", "Career description not available"),
                "education_requirements": rec.get("education_requirements", "Bachelor's degree preferred"),
                "growth_trend": rec.get("growth_trend", {
                    "5y_growth_pct": 20, 
                    "explain": "Market growth expected"
                })
            }
            formatted_recommendations.append(formatted_rec)
        
        # Sort by match score descending
        formatted_recommendations.sort(key=lambda x: x["match_score"], reverse=True)
        
        return {
            "recommendations": formatted_recommendations,
            "count": len(formatted_recommendations),
            "generated_at": "2024-01-01T00:00:00Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in recommend_careers_endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/adaptive-questions")
def adaptive_questions_endpoint(request: AdaptiveQuestionsRequest):
    """Generate adaptive follow-up questions"""
    try:
        questions = generate_adaptive_questions(request.context)
        return {
            "questions": questions,
            "context": request.context,
            "count": len(questions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@app.post("/summary-roadmap")
def summary_roadmap_endpoint(request: RoadmapRequest):
    """Generate personalized summary and learning roadmap"""
    try:
        result = summarize_and_roadmap(request.session_data, [request.selected_career])
        if not result:
            raise HTTPException(status_code=500, detail="Failed to generate roadmap")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating roadmap: {str(e)}")

@app.post("/match-mentors")
def match_mentors_endpoint(request: MentorMatchRequest):
    """Match mentors based on selected career and session data"""
    try:
        print(f"Matching mentors for career: {request.selected_career.get('title', 'Unknown')}")
        print(f"User session data: {request.session_data}")
        
        mentors = match_mentors(request.selected_career, request.session_data)
        print(f"Found {len(mentors)} matching mentors")
        
        return {
            "mentors": mentors,
            "count": len(mentors),
            "career": request.selected_career.get("title", "Unknown"),
            "personalized": True
        }
    except Exception as e:
        print(f"Error in match_mentors_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error matching mentors: {str(e)}")

# New flow endpoints
@app.post("/start-session")
async def start_session():
    """Start a new career discovery session and store in Firestore"""
    try:
        session_id = str(uuid.uuid4())
        
        # Fetch initial questions from Firestore
        try:
            questions_ref = db.collection('survey_questions')
            docs = questions_ref.order_by('order').stream()
            initial_questions = [doc.to_dict() for doc in docs]
            
            if not initial_questions:
                # Fallback if no questions in Firestore
                initial_questions = [
                    {
                        "id": "interests",
                        "question": "What subjects or topics interest you the most?",
                        "type": "radio",
                        "options": ["Science and Technology", "Arts and Creativity"],
                        "required": True
                    }
                ]
        except Exception as firebase_error:
            print(f"Firebase error loading questions: {str(firebase_error)}")
            # Fallback questions
            initial_questions = [
                {
                    "id": "interests",
                    "question": "What subjects or topics interest you the most?",
                    "type": "radio",
                    "options": ["Science and Technology", "Arts and Creativity"],
                    "required": True
                }
            ]
        
        session_data = {
            "session_id": session_id,
            "step": "initial",
            "total_steps": 3,
            "questions": initial_questions,
            "created_at": firestore.SERVER_TIMESTAMP,
            "answers": {},
            "status": "active"
        }
        
        # Store session in Firestore
        try:
            db.collection('sessions').document(session_id).set(session_data)
            print(f"Session {session_id} created successfully")
        except Exception as firebase_error:
            print(f"Firebase error: {str(firebase_error)}")
            # Return session data even if Firebase fails
            pass
        
        return {
            "session_id": session_id,
            "questions": initial_questions,
            "step": "initial",
            "total_steps": 3
        }
        
    except Exception as e:
        print(f"Error in start_session: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error starting session: {str(e)}")

@app.post("/submit-initial-answers")
async def submit_initial_answers(request: dict):
    """Submit initial answers and generate 5 AI-driven personalized questions"""
    try:
        session_id = request.get("session_id")
        session_data = request.get("session_data", {})
        
        print(f"Submitting initial answers for session: {session_id}")
        print(f"Session data: {session_data}")
        
        # Update Firestore if session_id exists
        if session_id:
            try:
                db.collection('sessions').document(session_id).update({
                    "answers": session_data,
                    "step": "adaptive",
                    "updated_at": firestore.SERVER_TIMESTAMP
                })
            except Exception as firebase_error:
                print(f"Firebase update error: {str(firebase_error)}")
                # Continue even if Firebase update fails
        
        # Generate 5 AI-driven personalized questions based on initial responses
        context = f"""
        Student Profile (10th/12th Grade):
        - Interests: {session_data.get('interests', '')}
        - Favorite Subjects: {', '.join(session_data.get('favorite_subjects', []))}
        - Activities: {', '.join(session_data.get('activities', []))}
        - Strengths: {', '.join(session_data.get('strengths', []))}
        - Future Goals: {session_data.get('future_goals', '')}
        
        Generate 5 personalized follow-up questions that are:
        - Age-appropriate for high school students
        - Focused on career exploration and self-discovery
        - Based on their responses above
        - Designed to uncover deeper interests, values, and aspirations
        - Varied in format (some open-ended, some specific choices)
        """
        
        try:
            adaptive_questions = generate_adaptive_questions(context)
            # Ensure we have exactly 5 questions
            if len(adaptive_questions) < 5:
                # Add fallback questions if needed
                fallback_questions = [
                    "What career fields have you considered pursuing after high school?",
                    "How do you feel about working with technology every day?",
                    "What kind of work environment would make you most productive?",
                    "Are there any careers in your family that interest you?",
                    "What skills would you most like to develop in the next few years?"
                ]
                adaptive_questions.extend(fallback_questions[len(adaptive_questions):5])
            elif len(adaptive_questions) > 5:
                adaptive_questions = adaptive_questions[:5]
        except Exception as llm_error:
            print(f"LLM error generating questions: {str(llm_error)}")
            # Fallback questions
            adaptive_questions = [
                "What career fields have you considered pursuing after high school?",
                "How do you feel about working with technology every day?",
                "What kind of work environment would make you most productive?",
                "Are there any careers in your family that interest you?",
                "What skills would you most like to develop in the next few years?"
            ]
        
        structured_questions = [
            {
                "id": f"adaptive_{i+1}",
                "question": question,
                "type": "textarea",
                "required": False
            } for i, question in enumerate(adaptive_questions)
        ]
        
        return {
            "adaptive_questions": structured_questions,
            "step": "adaptive",
            "session_data": session_data,
            "session_id": session_id
        }
        
    except Exception as e:
        print(f"Error in submit_initial_answers: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing initial answers: {str(e)}")

@app.post("/complete-survey")
async def complete_survey(request: dict):
    """Complete survey and store recommendations in Firestore"""
    try:
        session_id = request.get("session_id")
        session_data = request.get("session_data", {})
        
        print(f"Completing survey for session: {session_id}")
        print(f"Final session data keys: {list(session_data.keys())}")
        print(f"Sample data - interests: {session_data.get('interests')}, future_goals: {session_data.get('future_goals')}")
        
        # Load career data from Firestore
        try:
            careers_ref = db.collection('careers')
            docs = careers_ref.stream()
            career_data = [doc.to_dict() for doc in docs]
            print(f"Loaded {len(career_data)} careers from Firestore")
        except Exception as firebase_error:
            print(f"Firebase career data error: {str(firebase_error)}")
            # Fallback to mock data
            from utils import get_mock_careers_data
            career_data = get_mock_careers_data()
            print(f"Using {len(career_data)} mock careers as fallback")
        
        # Generate recommendations
        try:
            if career_data:
                print("Generating recommendations with career data")
                recommendations = recommend_careers(session_data, career_data)
                print(f"Generated {len(recommendations)} recommendations")
            else:
                print("No career data available, creating fallback recommendations")
                # Create fallback recommendations based on user profile
                interests = session_data.get('interests', '').lower()
                future_goals = session_data.get('future_goals', '').lower()
                
                if 'sports' in interests or 'physical' in interests or 'healthcare' in future_goals:
                    recommendations = [
                        {
                            "career_id": "fallback_1",
                            "title": "Physical Therapist",
                            "match_score": 85,
                            "demand_score": 87,
                            "avg_salary": 89000,
                            "entry_level_salary": 70000,
                            "key_skills": ["Movement Assessment", "Therapeutic Exercise", "Patient Care"],
                            "description": "Help patients recover from injuries and improve physical function",
                            "education_requirements": "Doctor of Physical Therapy degree",
                            "growth_trend": {"5y_growth_pct": 21, "explain": "Aging population driving demand"},
                            "explanation": "Great match for your sports and healthcare interests"
                        },
                        {
                            "career_id": "fallback_2", 
                            "title": "Athletic Trainer",
                            "match_score": 80,
                            "demand_score": 75,
                            "avg_salary": 48000,
                            "entry_level_salary": 38000,
                            "key_skills": ["Injury Prevention", "Sports Medicine", "Rehabilitation"],
                            "description": "Prevent and treat sports-related injuries",
                            "education_requirements": "Bachelor's degree in Athletic Training",
                            "growth_trend": {"5y_growth_pct": 16, "explain": "Growing sports participation"},
                            "explanation": "Perfect match for your physical activity focus"
                        }
                    ]
                else:
                    recommendations = [
                        {
                            "career_id": "fallback_general",
                            "title": "Project Manager",
                            "match_score": 70,
                            "demand_score": 82,
                            "avg_salary": 80000,
                            "entry_level_salary": 60000,
                            "key_skills": ["Leadership", "Communication", "Planning"],
                            "description": "Lead teams and manage projects across industries",
                            "education_requirements": "Bachelor's degree",
                            "growth_trend": {"5y_growth_pct": 15, "explain": "Steady demand across industries"},
                            "explanation": "Good match for your leadership and communication strengths"
                        }
                    ]
        except Exception as rec_error:
            print(f"Recommendation generation error: {str(rec_error)}")
            import traceback
            traceback.print_exc()
            recommendations = []
        
        # Ensure we have at least some recommendations
        if not recommendations:
            print("No recommendations generated, using emergency fallback")
            recommendations = [
                {
                    "career_id": "emergency_fallback",
                    "title": "Business Analyst",
                    "match_score": 65,
                    "demand_score": 80,
                    "avg_salary": 75000,
                    "entry_level_salary": 55000,
                    "key_skills": ["Analysis", "Communication", "Problem Solving"],
                    "description": "Analyze business processes and recommend improvements",
                    "education_requirements": "Bachelor's degree",
                    "growth_trend": {"5y_growth_pct": 18, "explain": "Digital transformation driving demand"},
                    "explanation": "Versatile career option suitable for various interests"
                }
            ]
        
        # Format recommendations
        formatted_recommendations = []
        for i, rec in enumerate(recommendations):
            formatted_rec = {
                "career_id": rec.get("career_id", f"career_{i}"),
                "title": rec.get("title", "Unknown Career"),
                "match_score": int(rec.get("match_score", 70)),
                "demand_score": int(rec.get("demand_score", 75)),
                "avg_salary": int(rec.get("avg_salary", 70000)),
                "entry_level_salary": int(rec.get("entry_level_salary", 50000)),
                "key_skills": rec.get("key_skills", []),
                "description": rec.get("description", "Career description not available"),
                "education_requirements": rec.get("education_requirements", "Bachelor's degree preferred"),
                "growth_trend": rec.get("growth_trend", {
                    "5y_growth_pct": 20,
                    "explain": "Market growth expected"
                }),
                "explanation": rec.get("explanation", "Good career match based on your profile")
            }
            formatted_recommendations.append(formatted_rec)
        
        print(f"Formatted {len(formatted_recommendations)} recommendations")
        for rec in formatted_recommendations:
            print(f"  - {rec['title']}: {rec['match_score']} match score")
        
        # Store in Firestore if session_id exists
        if session_id:
            try:
                db.collection('sessions').document(session_id).update({
                    "recommendations": formatted_recommendations,
                    "session_completed": True,
                    "final_answers": session_data,
                    "updated_at": firestore.SERVER_TIMESTAMP
                })
                print(f"Successfully stored results in Firestore for session {session_id}")
            except Exception as firebase_error:
                print(f"Firebase final update error: {str(firebase_error)}")
                # Continue even if Firebase update fails
        
        return {
            "recommendations": formatted_recommendations,
            "count": len(formatted_recommendations),
            "session_completed": True,
            "session_id": session_id
        }
        
    except Exception as e:
        print(f"Error in complete_survey: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error completing survey: {str(e)}")

@app.post("/generate-learning-roadmap")
async def generate_learning_roadmap_endpoint(request: LearningRoadmapRequest):
    """Generate a comprehensive learning roadmap for a career"""
    try:
        print(f"Generating learning roadmap for career: {request.career_data.get('title', 'Unknown')}")
        
        roadmap = generate_learning_roadmap(request.career_data, request.user_profile)
        
        if "error" in roadmap:
            raise HTTPException(status_code=500, detail=roadmap["error"])
        
        return roadmap
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate_learning_roadmap_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating roadmap: {str(e)}")

@app.post("/get-industry-trends")
async def get_industry_trends_endpoint(request: IndustryTrendsRequest):
    """Get latest industry trends and developments"""
    try:
        print(f"Getting industry trends for: {request.career_field}")
        
        trends = get_industry_trends(request.career_field, request.time_period)
        
        if "error" in trends:
            raise HTTPException(status_code=500, detail=trends["error"])
        
        return trends
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_industry_trends_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting trends: {str(e)}")

@app.get("/learning-roadmap/{career_id}")
async def get_learning_roadmap_for_career(career_id: str):
    """Get learning roadmap for a specific career with user context from Firestore"""
    try:
        # Get career data from Firestore
        career_ref = db.collection('careers').document(career_id)
        doc = career_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail=f"Career with ID {career_id} not found")
        career = doc.to_dict()
        
        # Get user profile from survey results if available (from Firestore sessions)
        # In a real app, this would come from user authentication
        default_profile = {
            "skills": "Basic programming, Communication",
            "experience_level": "Entry level",
            "education": "Bachelor's Degree",
            "interests": "Technology and Innovation"
        }
        
        roadmap = generate_learning_roadmap(career, default_profile)
        
        if "error" in roadmap:
            raise HTTPException(status_code=500, detail=roadmap["error"])
        
        return roadmap
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating roadmap: {str(e)}")

@app.get("/industry-trends/{field}")
async def get_trends_for_field(field: str, period: str = "6months"):
    """Get industry trends for a specific field"""
    try:
        trends = get_industry_trends(field, period)
        
        if "error" in trends:
            raise HTTPException(status_code=500, detail=trends["error"])
        
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting trends: {str(e)}")

# Additional utility endpoints
@app.post("/skill-gap")
def skill_gap_endpoint(request: SkillGapRequest):
    """Generate skill gap analysis report"""
    try:
        report = generate_skill_gap_report(request.user_skills, request.career_skills)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating skill gap report: {str(e)}")

@app.post("/growth-projection")
def growth_projection_endpoint(request: GrowthProjectionRequest):
    """Calculate career growth projection"""
    try:
        projections = calculate_career_growth_projection(request.career, request.years)
        return {"projections": projections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating growth projection: {str(e)}")

@app.post("/extract-skills")
def extract_skills_endpoint(request: SessionData):
    """Extract user skills from session data"""
    try:
        skills = extract_user_skills(request.model_dump())
        return {"skills": skills, "count": len(skills)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting skills: {str(e)}")

# Session management endpoints
@app.post("/save-session")
def save_session_endpoint(request: dict):
    """Save session data to Firestore"""
    try:
        session_id = request.get("session_id", str(uuid.uuid4()))
        data = request.get("data", {})
        db.collection('sessions').document(session_id).set(data)
        return {"message": "Session data saved successfully", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving session: {str(e)}")

@app.get("/load-session/{session_id}")
def load_session_endpoint(session_id: str):
    """Load session data from Firestore"""
    try:
        doc = db.collection('sessions').document(session_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Session data not found")
        return {"data": doc.to_dict(), "session_id": session_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading session: {str(e)}")

if __name__ == "__main__":
    print("Starting CareerCompass API server with Firebase...")
    print("API Documentation available at: http://127.0.0.1:8000/docs")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )