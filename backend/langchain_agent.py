import os
import json
from typing import List, Dict, Any, Optional
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize LLM
def get_llm():
    """Initialize and return the LLM instance"""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables. Please check your .env file.")
    
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        groq_api_key=api_key
    )

# Prompt templates
ADAPTIVE_QUESTIONS_PROMPT = PromptTemplate(
    input_variables=["context"],
    template="""You are CareerCompass Adaptive Question Generator.

Given the user's current answers (JSON below), propose up to 3 short follow-up questions that are:
- Clarifying and actionable
- Targeted to help suggest a career path
- Different from questions already asked
- Focused on uncovering specific interests, skills, or preferences

Context:
{context}

Output format: Return ONLY a JSON array of question strings, like:
["What specific programming languages interest you most?", "Do you prefer leading teams or working independently?", "What industry problems would you like to solve?"]

Questions:"""
)

ROADMAP_PROMPT = PromptTemplate(
    input_variables=["session_data", "top_careers"],
    template="""You are CareerCompass Career Advisor.

Based on the user's survey responses and top career matches, provide:
1. A personalized summary explaining why these careers fit (2-3 sentences)
2. A detailed learning roadmap for the top career choice

User Session Data:
{session_data}

Top Career Matches:
{top_careers}

Output format: Return a JSON object with this structure:
{{
    "summary": "Personalized explanation of why these careers match the user...",
    "roadmap": {{
        "milestones": ["Month 1-3: Learn Python basics", "Month 4-6: Build first project", "Month 7-12: Get certification"],
        "projects": ["Build a personal portfolio website", "Create a data analysis dashboard", "Develop a machine learning model"],
        "certifications": ["Google Data Analytics Certificate", "AWS Cloud Practitioner", "Python Institute PCAP"],
        "first_job_tasks": ["Data cleaning and preprocessing", "Creating basic reports", "Supporting senior analysts"]
    }}
}}

Response:"""
)

def generate_adaptive_questions(context: str) -> List[str]:
    """
    Generate adaptive follow-up questions based on user's current answers
    
    Args:
        context: JSON string containing user info and current answers
        
    Returns:
        List of follow-up question strings
    """
    try:
        llm = get_llm()
        
        # Format the prompt
        prompt = ADAPTIVE_QUESTIONS_PROMPT.format(context=context)
        
        # Get response from LLM
        response = llm.invoke([HumanMessage(content=prompt)])
        
        # Parse the JSON response
        questions_json = response.content.strip()
        
        # Clean up response if it has extra text
        if questions_json.startswith('```json'):
            questions_json = questions_json.replace('```json', '').replace('```', '').strip()
        
        questions = json.loads(questions_json)
        
        # Ensure it's a list and limit to 3 questions
        if isinstance(questions, list):
            return questions[:3]
        else:
            return []
            
    except Exception as e:
        print(f"Error generating adaptive questions: {str(e)}")
        # Fallback questions if LLM fails
        return [
            "What specific aspects of this field interest you most?",
            "How do you prefer to learn new skills?",
            "What kind of impact do you want to have in your career?"
        ]

def summarize_and_roadmap(session_json: Dict[str, Any], top_careers: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate personalized career summary and learning roadmap
    
    Args:
        session_json: Complete user session data
        top_careers: List of top recommended careers
        
    Returns:
        Dictionary with summary and roadmap
    """
    try:
        llm = get_llm()
        
        # Prepare the data for the prompt
        session_data = json.dumps(session_json, indent=2)
        careers_data = json.dumps(top_careers[:3], indent=2)
        
        # Format the prompt
        prompt = ROADMAP_PROMPT.format(
            session_data=session_data,
            top_careers=careers_data
        )
        
        # Get response from LLM
        response = llm.invoke([HumanMessage(content=prompt)])
        
        # Parse the JSON response
        result_json = response.content.strip()
        
        # Clean up response if it has extra text
        if result_json.startswith('```json'):
            result_json = result_json.replace('```json', '').replace('```', '').strip()
        
        result = json.loads(result_json)
        
        return result
        
    except Exception as e:
        print(f"Error generating summary and roadmap: {str(e)}")
        
        # Fallback response if LLM fails
        top_career = top_careers[0] if top_careers else {"title": "Software Developer"}
        
        return {
            "summary": f"Based on your responses, {top_career['title']} appears to be an excellent fit for your interests and skills. Your answers suggest you enjoy problem-solving and working with technology.",
            "roadmap": {
                "milestones": [
                    "Month 1-3: Learn fundamental concepts and basic tools",
                    "Month 4-6: Build your first practical project",
                    "Month 7-9: Gain hands-on experience through internships or volunteer work",
                    "Month 10-12: Prepare for entry-level positions and build your network"
                ],
                "projects": [
                    "Create a personal portfolio website",
                    "Build a project related to your interests",
                    "Contribute to an open-source project"
                ],
                "certifications": [
                    "Industry-relevant certification for your chosen field",
                    "Technical skills certification",
                    "Professional development course"
                ],
                "first_job_tasks": [
                    "Learn company-specific tools and processes",
                    "Work on small, well-defined tasks",
                    "Collaborate with senior team members",
                    "Participate in training and development programs"
                ]
            }
        }

def generate_learning_roadmap(career_data: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a comprehensive learning roadmap for a specific career."""
    try:
        llm = get_llm()
        
        career_title = career_data.get("title", "Unknown Career")
        user_skills = user_profile.get("skills", "")
        user_experience = user_profile.get("experience_level", "Entry level")
        user_education = user_profile.get("education", "")
        
        prompt = f"""
        Create a comprehensive learning roadmap for someone pursuing a career as a {career_title}.
        
        User Profile:
        - Current Skills: {user_skills}
        - Experience Level: {user_experience}
        - Education: {user_education}
        
        Career Details:
        - Required Skills: {', '.join(career_data.get('key_skills', []))}
        - Education Requirements: {career_data.get('education_requirements', '')}
        
        Please provide a detailed roadmap with the following structure:
        1. Skill Gap Analysis
        2. Learning Phases (Beginner, Intermediate, Advanced)
        3. Recommended Resources (courses, books, certifications)
        4. Timeline and Milestones
        5. Practical Projects
        6. Networking and Community Building
        
        Format as JSON with clear sections and actionable items.
        """
        
        messages = [
            SystemMessage(content="You are an expert career coach and learning strategist. Create comprehensive, actionable learning roadmaps tailored to individual profiles."),
            HumanMessage(content=prompt)
        ]
        
        response = llm.invoke(messages)
        
        # Try to parse as JSON, fallback to structured text
        try:
            roadmap_data = json.loads(response.content)
        except:
            # If JSON parsing fails, create structured response
            roadmap_data = {
                "career": career_title,
                "skill_gap_analysis": extract_section(response.content, "skill gap"),
                "learning_phases": extract_learning_phases(response.content),
                "resources": extract_resources(response.content),
                "timeline": extract_timeline(response.content),
                "projects": extract_projects(response.content),
                "networking": extract_section(response.content, "networking"),
                "raw_content": response.content
            }
        
        return {
            "roadmap": roadmap_data,
            "generated_at": "2024-01-01T00:00:00Z",
            "career_title": career_title
        }
        
    except Exception as e:
        print(f"Error generating learning roadmap: {str(e)}")
        return {"error": f"Failed to generate roadmap: {str(e)}"}

def get_industry_trends(career_field: str, time_period: str = "6months") -> Dict[str, Any]:
    """Get latest developments and trends in a specific career field."""
    try:
        llm = get_llm()
        
        prompt = f"""
        Provide the latest developments, trends, and growth opportunities in the {career_field} field 
        for the past {time_period}.
        
        Please include:
        1. Emerging Technologies and Tools
        2. Market Trends and Opportunities
        3. Skill Demands and Evolution
        4. Industry News and Major Developments
        5. Future Outlook and Predictions
        6. Salary Trends and Job Market Analysis
        7. Key Companies and Startups to Watch
        
        Focus on actionable insights for career growth and development.
        Format as JSON with clear sections.
        """
        
        messages = [
            SystemMessage(content="You are an industry analyst and career strategist with expertise in tracking market trends and technological developments."),
            HumanMessage(content=prompt)
        ]
        
        response = llm.invoke(messages)
        
        # Try to parse as JSON, fallback to structured text
        try:
            trends_data = json.loads(response.content)
        except:
            # If JSON parsing fails, create structured response
            trends_data = {
                "field": career_field,
                "emerging_technologies": extract_section(response.content, "technologies"),
                "market_trends": extract_section(response.content, "market trends"),
                "skill_demands": extract_section(response.content, "skill demands"),
                "industry_news": extract_section(response.content, "industry news"),
                "future_outlook": extract_section(response.content, "future outlook"),
                "salary_trends": extract_section(response.content, "salary trends"),
                "key_companies": extract_section(response.content, "companies"),
                "raw_content": response.content
            }
        
        return {
            "trends": trends_data,
            "field": career_field,
            "period": time_period,
            "generated_at": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        print(f"Error getting industry trends: {str(e)}")
        return {"error": f"Failed to get trends: {str(e)}"}

# Helper functions for parsing content
def extract_section(content: str, section_name: str) -> str:
    """Extract a specific section from the content."""
    lines = content.split('\n')
    section_lines = []
    in_section = False
    
    for line in lines:
        if section_name.lower() in line.lower():
            in_section = True
        elif in_section and any(keyword in line.lower() for keyword in ['#', '##', 'section', '**']):
            break
        elif in_section:
            section_lines.append(line)
    
    return '\n'.join(section_lines).strip()

def extract_learning_phases(content: str) -> List[Dict[str, Any]]:
    """Extract learning phases from content."""
    phases = []
    phase_keywords = ['beginner', 'intermediate', 'advanced', 'phase 1', 'phase 2', 'phase 3']
    
    for keyword in phase_keywords:
        section = extract_section(content, keyword)
        if section:
            phases.append({
                "name": keyword.title(),
                "description": section,
                "duration": "3-6 months"
            })
    
    return phases if phases else [
        {"name": "Foundation", "description": "Build core skills", "duration": "3 months"},
        {"name": "Intermediate", "description": "Develop specialized knowledge", "duration": "6 months"},
        {"name": "Advanced", "description": "Master advanced concepts", "duration": "6+ months"}
    ]

def extract_resources(content: str) -> List[Dict[str, str]]:
    """Extract learning resources from content."""
    resources = []
    resource_keywords = ['course', 'book', 'certification', 'tutorial', 'documentation']
    
    lines = content.split('\n')
    for line in lines:
        for keyword in resource_keywords:
            if keyword in line.lower():
                resources.append({
                    "type": keyword.title(),
                    "name": line.strip(),
                    "category": "recommended"
                })
    
    return resources[:10]  # Limit to 10 resources

def extract_timeline(content: str) -> str:
    """Extract timeline information from content."""
    timeline_section = extract_section(content, "timeline")
    return timeline_section if timeline_section else "6-12 months for comprehensive learning"

def extract_projects(content: str) -> List[str]:
    """Extract project suggestions from content."""
    projects = []
    project_section = extract_section(content, "project")
    
    if project_section:
        lines = project_section.split('\n')
        for line in lines:
            if line.strip() and not line.startswith('#'):
                projects.append(line.strip())
    
    return projects[:5]  # Limit to 5 projects

def validate_api_key() -> bool:
    """Validate if Groq API key is available."""
    api_key = os.getenv("GROQ_API_KEY")
    return bool(api_key and api_key.strip())

def get_model_info() -> Dict[str, Any]:
    """Get information about the Groq model."""
    if not validate_api_key():
        return {"error": "Invalid API key", "models": []}
    
    return {
        "status": "connected",
        "models": ["llama-3.3-70b-versatile"],
        "default_model": "llama-3.3-70b-versatile",
        "provider": "Groq"
    }