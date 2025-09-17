from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
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
    return {
        "status": "healthy", 
        "api_key_valid": validate_api_key(),
        "data_files_exist": {
            "careers": os.path.exists("data/mock_career_data.json"),
            "mentors": os.path.exists("data/mentors.json")
        }
    }

@app.get("/model-info")
def get_model_information():
    return get_model_info()

# Data endpoints
@app.get("/careers")
def get_careers():
    """Load career data from JSON file"""
    try:
        data = load_json("data/mock_career_data.json")
        if not data:
            raise HTTPException(status_code=404, detail="Career data not found")
        return {"careers": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading career data: {str(e)}")

@app.get("/careers/{career_id}")
def get_career_by_id(career_id: str):
    """Get specific career by ID"""
    try:
        data = load_json("data/mock_career_data.json")
        if not data:
            raise HTTPException(status_code=404, detail="Career data not found")
        
        career = next((c for c in data if c.get("career_id") == career_id), None)
        if not career:
            raise HTTPException(status_code=404, detail=f"Career with ID {career_id} not found")
        
        return {"career": career}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading career: {str(e)}")

@app.get("/mentors")
def get_mentors():
    """Load mentors data from JSON file"""
    try:
        data = load_json("data/mentors.json")
        if not data:
            raise HTTPException(status_code=404, detail="Mentors data not found")
        return {"mentors": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading mentors data: {str(e)}")

# Core functionality endpoints
@app.post("/recommend-careers")
async def recommend_careers_endpoint(request: dict):
    """Generate career recommendations - Updated to handle direct dict input"""
    try:
        print(f"Received request data: {request}")
        
        # Extract session data from the request
        session_data = request.get("session_data", {})
        if not session_data:
            raise HTTPException(status_code=400, detail="Missing session_data in request")
        
        print(f"Processing career recommendation request with session data: {session_data}")
        
        # Load career data
        career_data = load_json("data/mock_career_data.json")
        if not career_data:
            raise HTTPException(status_code=500, detail="Career data not available")
        
        print(f"Loaded {len(career_data)} careers from database")
        
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
    """Start a new career discovery session"""
    try:
        # Return initial predefined questions
        initial_questions = [
            {
                "id": "interests",
                "question": "What are your primary interests?",
                "type": "radio",
                "options": [
                    "Technology and Innovation",
                    "Business and Finance", 
                    "Creative Arts and Design",
                    "Healthcare and Medicine",
                    "Education and Training",
                    "Science and Research"
                ],
                "required": True
            },
            {
                "id": "experience_level",
                "question": "What is your current experience level?",
                "type": "radio",
                "options": [
                    "Entry level (0-2 years)",
                    "Mid-level (3-5 years)",
                    "Senior level (6-10 years)", 
                    "Executive level (10+ years)",
                    "Student/New graduate"
                ],
                "required": True
            },
            {
                "id": "education",
                "question": "What is your highest level of education?",
                "type": "radio",
                "options": [
                    "High School Diploma",
                    "Associate Degree",
                    "Bachelor's Degree",
                    "Master's Degree",
                    "Doctoral Degree",
                    "Professional Certification"
                ],
                "required": True
            },
            {
                "id": "skills",
                "question": "What are your key skills? (Please list your top skills separated by commas)",
                "type": "textarea",
                "required": True
            }
        ]
        
        return {
            "session_id": "new_session",
            "questions": initial_questions,
            "step": "initial",
            "total_steps": 3
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting session: {str(e)}")

@app.post("/submit-initial-answers")
async def submit_initial_answers(request: dict):
    """Submit initial answers and get adaptive questions"""
    try:
        session_data = request.get("session_data", {})
        
        # Generate adaptive questions based on initial answers
        context = f"""
        User Profile:
        - Interests: {session_data.get('interests', '')}
        - Experience: {session_data.get('experience_level', '')}
        - Education: {session_data.get('education', '')}
        - Skills: {session_data.get('skills', '')}
        """
        
        adaptive_questions = generate_adaptive_questions(context)
        
        # Convert to structured format
        structured_questions = []
        for i, question in enumerate(adaptive_questions):
            structured_questions.append({
                "id": f"adaptive_{i+1}",
                "question": question,
                "type": "textarea",
                "required": False
            })
        
        return {
            "adaptive_questions": structured_questions,
            "step": "adaptive",
            "session_data": session_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating adaptive questions: {str(e)}")

@app.post("/complete-survey")
async def complete_survey(request: dict):
    """Complete survey and get recommendations"""
    try:
        session_data = request.get("session_data", {})
        
        # Load career data
        career_data = load_json("data/mock_career_data.json")
        if not career_data:
            raise HTTPException(status_code=500, detail="Career data not available")
        
        # Generate recommendations
        recommendations = recommend_careers(session_data, career_data)
        
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
                "explanation": rec.get("explanation", "Good career match")
            }
            formatted_recommendations.append(formatted_rec)
        
        return {
            "recommendations": formatted_recommendations,
            "count": len(formatted_recommendations),
            "session_completed": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error completing survey: {str(e)}")

@app.post("/get-personalized-mentors")
async def get_personalized_mentors(request: dict):
    """Get mentors based on selected career and user profile"""
    try:
        selected_career = request.get("selected_career", {})
        session_data = request.get("session_data", {})
        
        print(f"Getting personalized mentors for career: {selected_career.get('title', 'Unknown')}")
        
        # Match mentors
        matched_mentors = match_mentors(selected_career, session_data)
        
        return {
            "mentors": matched_mentors,
            "count": len(matched_mentors),
            "career": selected_career.get("title", "Unknown"),
            "personalized": True
        }
    except Exception as e:
        print(f"Error in get_personalized_mentors: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error matching mentors: {str(e)}")

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
    """Get learning roadmap for a specific career with user context"""
    try:
        # Get career data
        career_data = load_json("data/mock_career_data.json")
        if not career_data:
            raise HTTPException(status_code=404, detail="Career data not found")
        
        career = next((c for c in career_data if c.get("career_id") == career_id), None)
        if not career:
            raise HTTPException(status_code=404, detail=f"Career with ID {career_id} not found")
        
        # Get user profile from survey results if available
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
def save_session_endpoint(filepath: str, data: Dict[str, Any]):
    """Save session data to JSON file"""
    try:
        success = save_json(filepath, data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save session data")
        return {"message": "Session data saved successfully", "filepath": filepath}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving session: {str(e)}")

@app.get("/load-session/{filepath:path}")
def load_session_endpoint(filepath: str):
    """Load session data from JSON file"""
    try:
        data = load_json(filepath)
        if not data:
            raise HTTPException(status_code=404, detail="Session data not found")
        return {"data": data, "filepath": filepath}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading session: {str(e)}")

if __name__ == "__main__":
    print("Starting CareerCompass API server...")
    print("API Documentation available at: http://127.0.0.1:8000/docs")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )