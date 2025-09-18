import json
import os
from typing import List, Dict, Any
import firebase_admin
from firebase_admin import firestore

# Get Firestore client
def get_db():
    """Get Firestore database client"""
    return firestore.client()

def load_json(filepath: str) -> List[Dict[str, Any]]:
    """Load data from a JSON file (fallback method)."""
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return []

def save_json(filepath: str, data: Dict[str, Any]) -> bool:
    """Save data to a JSON file (fallback method)."""
    try:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=4)
        return True
    except Exception:
        return False

def extract_user_skills(session_data: Dict[str, Any]) -> List[str]:
    """Extract user skills from session data."""
    # Extract from 'skills' field or similar
    skills_str = session_data.get('skills', '')
    if isinstance(skills_str, str):
        return [skill.strip() for skill in skills_str.split(',') if skill.strip()]
    elif isinstance(skills_str, list):
        return skills_str
    return []

def recommend_careers(session_data: Dict[str, Any], career_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Recommend careers based on session data and career data with improved matching."""
    try:
        print(f"Starting career recommendation with session data: {session_data}")
        print(f"Number of careers to match against: {len(career_data)}")
        
        # If no career data provided, use mock data
        if not career_data:
            print("No career data provided, using mock data")
            career_data = get_mock_careers_data()
        
        # Extract user preferences with better handling
        interests = session_data.get('interests', '').lower()
        favorite_subjects = session_data.get('favorite_subjects', '')
        activities = session_data.get('activities', '')
        strengths = session_data.get('strengths', '')
        future_goals = session_data.get('future_goals', '').lower()
        
        # Convert to lists if they're strings
        if isinstance(favorite_subjects, str):
            favorite_subjects = [s.strip() for s in favorite_subjects.split(',') if s.strip()]
        if isinstance(activities, str):
            activities = [a.strip() for a in activities.split(',') if a.strip()]
        if isinstance(strengths, str):
            strengths = [s.strip() for s in strengths.split(',') if s.strip()]
        
        print(f"Parsed interests: {interests}")
        print(f"Parsed subjects: {favorite_subjects}")
        print(f"Parsed activities: {activities}")
        print(f"Parsed future goals: {future_goals}")
        
        recommendations = []
        
        for career in career_data:
            match_score = 0
            career_title = career.get('title', '').lower()
            career_desc = career.get('description', '').lower()
            career_skills = [skill.lower() for skill in career.get('key_skills', [])]
            
            print(f"Evaluating career: {career.get('title')}")
            
            # Enhanced Interest matching (30 points max)
            if 'sports' in interests or 'physical' in interests:
                if any(keyword in career_title or keyword in career_desc 
                      for keyword in ['physical', 'therapy', 'health', 'fitness', 'sport', 'trainer', 'coach']):
                    match_score += 30
                    print(f"  Sports/Physical match: +30")
                elif any(keyword in career_title or keyword in career_desc 
                        for keyword in ['nurse', 'healthcare', 'medical']):
                    match_score += 25
                    print(f"  Healthcare match: +25")
            elif 'science' in interests or 'technology' in interests:
                if any(keyword in career_title for keyword in ['software', 'developer', 'engineer', 'data', 'analyst']):
                    match_score += 30
                    print(f"  Tech/Science match: +30")
            elif 'arts' in interests or 'creativity' in interests or 'culture' in interests:
                if any(keyword in career_title for keyword in ['design', 'creative', 'artist', 'writer', 'teacher', 'educator']):
                    match_score += 30
                    print(f"  Arts/Creative match: +30")
                elif any(keyword in career_title for keyword in ['marketing', 'content', 'media']):
                    match_score += 25
                    print(f"  Creative/Media match: +25")
            elif 'business' in interests:
                if any(keyword in career_title for keyword in ['manager', 'analyst', 'consultant', 'marketing']):
                    match_score += 30
                    print(f"  Business match: +30")
            
            # Future goals matching (25 points max)
            if 'healthcare' in future_goals or 'wellness' in future_goals:
                if any(keyword in career_title or keyword in career_desc 
                      for keyword in ['health', 'medical', 'nurse', 'doctor', 'therapy', 'wellness']):
                    match_score += 25
                    print(f"  Healthcare goals match: +25")
            elif 'technology' in future_goals:
                if any(keyword in career_title for keyword in ['software', 'developer', 'engineer', 'tech']):
                    match_score += 25
                    print(f"  Technology goals match: +25")
            elif 'business' in future_goals:
                if any(keyword in career_title for keyword in ['manager', 'business', 'analyst']):
                    match_score += 25
                    print(f"  Business goals match: +25")
            elif 'education' in future_goals or 'teaching' in future_goals or 'equality' in future_goals:
                if any(keyword in career_title for keyword in ['teacher', 'educator', 'counselor', 'trainer']):
                    match_score += 25
                    print(f"  Education/Teaching goals match: +25")
            
            # Subject matching (20 points max)
            subject_score = 0
            for subject in favorite_subjects:
                subject_lower = subject.lower()
                if 'physical' in subject_lower and any(keyword in career_title 
                    for keyword in ['physical', 'therapy', 'fitness', 'sports']):
                    subject_score += 10
                elif 'computer' in subject_lower or 'programming' in subject_lower:
                    if any(keyword in career_title for keyword in ['software', 'developer', 'engineer']):
                        subject_score += 10
                elif 'math' in subject_lower:
                    if any(keyword in career_title for keyword in ['analyst', 'engineer', 'data']):
                        subject_score += 8
                elif 'biology' in subject_lower or 'chemistry' in subject_lower:
                    if any(keyword in career_title for keyword in ['health', 'medical', 'research']):
                        subject_score += 10
                elif 'english' in subject_lower or 'literature' in subject_lower:
                    if any(keyword in career_title for keyword in ['writer', 'teacher', 'editor', 'content']):
                        subject_score += 10
                elif 'history' in subject_lower or 'social studies' in subject_lower:
                    if any(keyword in career_title for keyword in ['teacher', 'researcher', 'historian']):
                        subject_score += 8
            
            match_score += min(subject_score, 20)
            if subject_score > 0:
                print(f"  Subject match: +{min(subject_score, 20)}")
            
            # Strengths matching (15 points max)
            strength_score = 0
            for strength in strengths:
                strength_lower = strength.lower()
                if 'leading' in strength_lower or 'leadership' in strength_lower:
                    if any(keyword in career_title for keyword in ['manager', 'director', 'lead']):
                        strength_score += 8
                elif 'communication' in strength_lower:
                    if any(keyword in career_title for keyword in ['teacher', 'counselor', 'manager', 'sales']):
                        strength_score += 8
                elif 'problem' in strength_lower:
                    if any(keyword in career_title for keyword in ['engineer', 'analyst', 'developer']):
                        strength_score += 8
                elif 'creative' in strength_lower or 'innovative' in strength_lower:
                    if any(keyword in career_title for keyword in ['design', 'artist', 'writer', 'creative']):
                        strength_score += 8
            
            match_score += min(strength_score, 15)
            if strength_score > 0:
                print(f"  Strength match: +{min(strength_score, 15)}")
            
            # Activities matching (10 points max)
            activity_score = 0
            for activity in activities:
                activity_lower = activity.lower()
                if 'sports' in activity_lower or 'outdoor' in activity_lower:
                    if any(keyword in career_title or keyword in career_desc 
                          for keyword in ['physical', 'fitness', 'sports', 'outdoor', 'recreation']):
                        activity_score += 10
                elif 'coding' in activity_lower or 'games' in activity_lower:
                    if any(keyword in career_title for keyword in ['developer', 'engineer', 'programmer']):
                        activity_score += 10
                elif 'writing' in activity_lower or 'reading' in activity_lower:
                    if any(keyword in career_title for keyword in ['writer', 'editor', 'teacher', 'content']):
                        activity_score += 10
                elif 'art' in activity_lower or 'drawing' in activity_lower:
                    if any(keyword in career_title for keyword in ['design', 'artist', 'creative']):
                        activity_score += 10
            
            match_score += min(activity_score, 10)
            if activity_score > 0:
                print(f"  Activity match: +{min(activity_score, 10)}")
            
            print(f"  Total match score for {career.get('title')}: {match_score}")
            
            # Only include careers with reasonable match scores
            if match_score > 15:
                career_copy = career.copy()
                career_copy['match_score'] = min(match_score, 100)  # Cap at 100
                career_copy['explanation'] = f"Matched based on {interests} interests and relevant background"
                recommendations.append(career_copy)
        
        print(f"Found {len(recommendations)} careers with match scores > 15")
        
        # Sort by match score and return top recommendations
        recommendations.sort(key=lambda x: x['match_score'], reverse=True)
        
        # If we have very few recommendations, add some general ones based on interests
        if len(recommendations) < 3:
            print("Adding general recommendations due to low match count")
            general_careers = []
            
            if 'arts' in interests or 'creativity' in interests or 'culture' in interests:
                general_careers = [
                    {
                        "career_id": "general_creative_1",
                        "title": "Graphic Designer", 
                        "description": "Create visual content and designs for various media",
                        "key_skills": ["Design Software", "Creativity", "Typography", "Color Theory"],
                        "avg_salary": 55000,
                        "entry_level_salary": 40000,
                        "demand_score": 78,
                        "education_requirements": "Bachelor's degree in Graphic Design or related field",
                        "growth_trend": {"5y_growth_pct": 15, "explain": "Growing demand in digital media"},
                        "match_score": 75,
                        "explanation": "Perfect match for creative arts interests"
                    },
                    {
                        "career_id": "general_creative_2",
                        "title": "Content Writer",
                        "description": "Create written content for websites, blogs, and marketing materials",
                        "key_skills": ["Writing", "Research", "SEO", "Communication", "Creativity"],
                        "avg_salary": 52000,
                        "entry_level_salary": 38000,
                        "demand_score": 72,
                        "education_requirements": "Bachelor's degree in English, Journalism, or related field",
                        "growth_trend": {"5y_growth_pct": 12, "explain": "Digital content creation booming"},
                        "match_score": 70,
                        "explanation": "Excellent match for writing and communication interests"
                    },
                    {
                        "career_id": "general_creative_3",
                        "title": "High School Teacher",
                        "description": "Educate and inspire high school students in various subjects",
                        "key_skills": ["Teaching", "Communication", "Subject Expertise", "Mentoring"],
                        "avg_salary": 58000,
                        "entry_level_salary": 42000,
                        "demand_score": 75,
                        "education_requirements": "Bachelor's degree and teaching certification",
                        "growth_trend": {"5y_growth_pct": 8, "explain": "Stable demand in education sector"},
                        "match_score": 65,
                        "explanation": "Great match for teaching and educational interests"
                    }
                ]
            else:
                general_careers = [
                    {
                        "career_id": "general_1",
                        "title": "Physical Therapist", 
                        "description": "Help patients recover from injuries and improve physical function",
                        "key_skills": ["Movement Assessment", "Therapeutic Exercise", "Patient Care"],
                        "avg_salary": 89000,
                        "entry_level_salary": 70000,
                        "demand_score": 87,
                        "education_requirements": "Doctor of Physical Therapy degree",
                        "growth_trend": {"5y_growth_pct": 21, "explain": "Aging population driving demand"},
                        "match_score": 75,
                        "explanation": "Good match for sports and healthcare interests"
                    },
                    {
                        "career_id": "general_2",
                        "title": "Athletic Trainer",
                        "description": "Prevent and treat sports-related injuries",
                        "key_skills": ["Injury Prevention", "Sports Medicine", "Rehabilitation"],
                        "avg_salary": 48000,
                        "entry_level_salary": 38000,
                        "demand_score": 75,
                        "education_requirements": "Bachelor's degree in Athletic Training",
                        "growth_trend": {"5y_growth_pct": 16, "explain": "Growing sports participation"},
                        "match_score": 70,
                        "explanation": "Excellent match for sports and physical activity interests"
                    }
                ]
            
            for career in general_careers:
                if career not in recommendations:
                    recommendations.append(career)
        
        final_recommendations = recommendations[:8]  # Return top 8 matches
        print(f"Returning {len(final_recommendations)} final recommendations")
        for rec in final_recommendations:
            print(f"  - {rec.get('title')}: {rec.get('match_score')} points")
        
        return final_recommendations
        
    except Exception as e:
        print(f"Error in recommend_careers: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return fallback careers if matching fails
        return get_mock_careers_data()[:5]

def match_mentors(selected_career: Dict[str, Any], session_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Match mentors based on selected career and session data using Firestore or mock data."""
    try:
        # Get mentors from Firestore
        db = get_db()
        mentors_ref = db.collection('mentors')
        docs = list(mentors_ref.stream())
        all_mentors = [doc.to_dict() for doc in docs]
        
        if not all_mentors:
            # Firestore is empty or not accessible, use mock data
            all_mentors = get_mock_mentors_data()
        
    except Exception as e:
        print(f"Error accessing Firestore mentors: {str(e)}")
        # Firebase not available, use mock data
        all_mentors = get_mock_mentors_data()
    
    career_title = selected_career.get("title", "").lower()
    career_skills = selected_career.get("key_skills", [])
    user_interests = session_data.get("interests", "").lower()
    
    matched_mentors = []
    
    for mentor in all_mentors:
        match_score = 0
        
        # Match by industry/career field
        if any(keyword in career_title for keyword in ["software", "engineer", "developer", "tech"]):
            if mentor.get("industry") == "technology":
                match_score += 40
        elif any(keyword in career_title for keyword in ["data", "analyst", "scientist"]):
            if "data science" in [exp.lower() for exp in mentor.get("expertise", [])]:
                match_score += 50
        elif any(keyword in career_title for keyword in ["design", "ux", "ui"]):
            if any("design" in exp.lower() for exp in mentor.get("expertise", [])):
                match_score += 50
        elif any(keyword in career_title for keyword in ["marketing", "digital"]):
            if any("marketing" in exp.lower() for exp in mentor.get("expertise", [])):
                match_score += 50
        elif any(keyword in career_title for keyword in ["finance", "financial"]):
            if mentor.get("industry") == "finance":
                match_score += 40
        elif any(keyword in career_title for keyword in ["health", "medical", "nurse"]):
            if mentor.get("industry") == "healthcare":
                match_score += 40
        elif any(keyword in career_title for keyword in ["education", "teacher"]):
            if mentor.get("industry") == "education":
                match_score += 40
        
        # Match by skills/expertise
        mentor_expertise = [exp.lower() for exp in mentor.get("expertise", [])]
        career_skills_lower = [skill.lower() for skill in career_skills]
        
        skill_matches = sum(1 for skill in career_skills_lower 
                          if any(skill in expertise for expertise in mentor_expertise))
        match_score += skill_matches * 10
        
        # Match by user interests
        if "technology" in user_interests and mentor.get("industry") == "technology":
            match_score += 20
        elif "business" in user_interests and any(keyword in mentor.get("title", "").lower() 
            for keyword in ["manager", "director", "vp", "lead"]):
            match_score += 20
        elif "creative" in user_interests and any("design" in exp.lower() 
            for exp in mentor.get("expertise", [])):
            match_score += 20
        elif "healthcare" in user_interests and mentor.get("industry") == "healthcare":
            match_score += 20
        elif "education" in user_interests and mentor.get("industry") == "education":
            match_score += 20
        elif "science" in user_interests and any(keyword in mentor.get("title", "").lower() 
            for keyword in ["scientist", "researcher", "analyst"]):
            match_score += 20
        
        # Only include mentors with some relevance
        if match_score > 20:
            mentor_with_score = mentor.copy()
            mentor_with_score["match_score"] = match_score
            matched_mentors.append(mentor_with_score)
    
    # Sort by match score and return top matches
    matched_mentors.sort(key=lambda x: x["match_score"], reverse=True)
    return matched_mentors[:6]  # Return top 6 matches

def get_mock_mentors_data():
    """Return mock mentors data for matching when Firebase is not available"""
    return [
        {
            "id": "mentor_1",
            "name": "Sarah Chen",
            "title": "Senior Software Engineer",
            "company": "Google",
            "industry": "technology",
            "expertise": ["Python", "Machine Learning", "Data Science", "AI"],
            "rating": 4.8,
            "bio": "Experienced software engineer with 8+ years in tech. Passionate about mentoring newcomers to the field.",
            "availability": "Weekends"
        },
        {
            "id": "mentor_2",
            "name": "Michael Rodriguez", 
            "title": "Product Manager",
            "company": "Microsoft",
            "industry": "technology",
            "expertise": ["Product Management", "Agile", "Leadership", "Strategy"],
            "rating": 4.7,
            "bio": "Product leader helping teams build innovative solutions. Love coaching aspiring product managers.",
            "availability": "Evenings"
        },
        {
            "id": "mentor_3",
            "name": "Emily Johnson",
            "title": "UX Designer",
            "company": "Apple",
            "industry": "technology",
            "expertise": ["UI/UX Design", "User Research", "Prototyping", "Design Systems"],
            "rating": 4.9,
            "bio": "Creative designer focused on user-centered design. Excited to guide new designers.",
            "availability": "Flexible"
        },
        {
            "id": "mentor_4",
            "name": "David Kim",
            "title": "Data Scientist",
            "company": "Netflix", 
            "industry": "technology",
            "expertise": ["Data Analysis", "Statistics", "Python", "SQL", "Machine Learning"],
            "rating": 4.6,
            "bio": "Data scientist with expertise in predictive modeling and analytics. Happy to share knowledge.",
            "availability": "Weekends"
        },
        {
            "id": "mentor_5",
            "name": "Lisa Thompson",
            "title": "Marketing Director",
            "company": "Adobe",
            "industry": "marketing",
            "expertise": ["Digital Marketing", "Content Strategy", "Brand Management", "Analytics"],
            "rating": 4.5,
            "bio": "Marketing professional with 10+ years experience. Passionate about digital transformation.",
            "availability": "Evenings"
        },
        {
            "id": "mentor_6",
            "name": "Robert Wilson",
            "title": "Financial Analyst",
            "company": "Goldman Sachs",
            "industry": "finance",
            "expertise": ["Financial Modeling", "Investment Analysis", "Risk Management", "Excel"],
            "rating": 4.4,
            "bio": "Finance professional specializing in investment analysis. Eager to help finance newcomers.",
            "availability": "Flexible"
        }
    ]

def get_mock_careers_data():
    """Return mock careers data for recommendations when Firebase is not available"""
    return [
        {
            "career_id": "career_1",
            "title": "Software Developer",
            "description": "Design, develop, and maintain software applications and systems",
            "key_skills": ["Programming", "Problem Solving", "Debugging", "Teamwork", "Python", "JavaScript"],
            "avg_salary": 85000,
            "entry_level_salary": 65000,
            "demand_score": 95,
            "education_requirements": "Bachelor's degree in Computer Science or related field",
            "experience_required": "entry",
            "growth_trend": {"5y_growth_pct": 22, "explain": "High demand due to digital transformation"}
        },
        {
            "career_id": "career_2",
            "title": "Data Scientist",
            "description": "Analyze complex data to help organizations make better decisions", 
            "key_skills": ["Statistics", "Python", "Machine Learning", "SQL", "Data Analysis", "Communication"],
            "avg_salary": 95000,
            "entry_level_salary": 75000,
            "demand_score": 90,
            "education_requirements": "Bachelor's or Master's degree in Statistics, Math, or Computer Science",
            "experience_required": "entry",
            "growth_trend": {"5y_growth_pct": 31, "explain": "Explosive growth in data-driven decision making"}
        },
        {
            "career_id": "career_3", 
            "title": "UX Designer",
            "description": "Create user-friendly and intuitive digital experiences",
            "key_skills": ["Design Thinking", "Prototyping", "User Research", "Wireframing", "Figma", "Creativity"],
            "avg_salary": 75000,
            "entry_level_salary": 55000,
            "demand_score": 85,
            "education_requirements": "Bachelor's degree in Design, HCI, or related field",
            "experience_required": "entry", 
            "growth_trend": {"5y_growth_pct": 18, "explain": "Growing focus on user experience across industries"}
        },
        {
            "career_id": "career_4",
            "title": "Digital Marketing Specialist",
            "description": "Develop and execute online marketing campaigns to reach target audiences",
            "key_skills": ["Content Marketing", "SEO", "Social Media", "Analytics", "Campaign Management", "Creativity"],
            "avg_salary": 60000,
            "entry_level_salary": 45000,
            "demand_score": 80,
            "education_requirements": "Bachelor's degree in Marketing, Communications, or related field",
            "experience_required": "entry",
            "growth_trend": {"5y_growth_pct": 15, "explain": "Digital transformation driving marketing evolution"}
        },
        {
            "career_id": "career_5",
            "title": "Cybersecurity Analyst", 
            "description": "Protect organizations from cyber threats and security breaches",
            "key_skills": ["Security Tools", "Risk Assessment", "Network Security", "Problem Solving", "Attention to Detail"],
            "avg_salary": 88000,
            "entry_level_salary": 68000,
            "demand_score": 92,
            "education_requirements": "Bachelor's degree in Cybersecurity, IT, or related field",
            "experience_required": "entry",
            "growth_trend": {"5y_growth_pct": 28, "explain": "Increasing cyber threats driving demand"}
        }
    ]

def calculate_career_growth_projection(career: Dict[str, Any], years: int = 5) -> Dict[str, Any]:
    """Calculate career growth projection."""
    # Placeholder: Simple projection
    base_salary = career.get('avg_salary', 50000)
    growth_rate = 0.05  # 5% annual growth
    projected_salary = base_salary * ((1 + growth_rate) ** years)
    return {
        "current_salary": base_salary,
        "projected_salary": projected_salary,
        "years": years,
        "growth_rate": growth_rate
    }

def generate_skill_gap_report(user_skills: List[str], career_skills: List[str]) -> Dict[str, Any]:
    """Generate a skill gap analysis report."""
    # Placeholder: Compare skills
    missing_skills = [skill for skill in career_skills if skill not in user_skills]
    return {
        "user_skills": user_skills,
        "career_skills": career_skills,
        "missing_skills": missing_skills,
        "gap_percentage": len(missing_skills) / len(career_skills) * 100 if career_skills else 0
    }