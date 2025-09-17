import json
import os
from typing import List, Dict, Any

def load_json(filepath: str) -> List[Dict[str, Any]]:
    """Load data from a JSON file."""
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return []

def save_json(filepath: str, data: Dict[str, Any]) -> bool:
    """Save data to a JSON file."""
    try:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=4)
        return True
    except Exception:
        return False

def extract_user_skills(session_data: Dict[str, Any]) -> List[str]:
    """Extract user skills from session data."""
    # Placeholder: Extract from 'skills' field or similar
    skills_str = session_data.get('skills', '')
    return [skill.strip() for skill in skills_str.split(',') if skill.strip()]

def recommend_careers(session_data: Dict[str, Any], career_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Recommend careers based on session data and career data."""
    # Placeholder: Simple matching based on interests
    interests = session_data.get('interests', '').lower()
    recommendations = []
    for career in career_data:
        if interests in career.get('description', '').lower():
            recommendations.append(career)
    return recommendations[:5]  # Limit to top 5

def match_mentors(selected_career: Dict[str, Any], session_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Match mentors based on selected career and session data."""
    try:
        # Load all mentors
        mentors_data = load_json("data/mentors.json")
        if not mentors_data or "mentors" not in mentors_data:
            return []
        
        all_mentors = mentors_data["mentors"]
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
        
    except Exception as e:
        print(f"Error in match_mentors: {str(e)}")
        # Fallback to returning some mentors
        mentors_data = load_json("data/mentors.json")
        if mentors_data and "mentors" in mentors_data:
            return mentors_data["mentors"][:3]
        return []

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