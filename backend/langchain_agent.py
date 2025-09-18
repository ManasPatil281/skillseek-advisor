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

def validate_api_key() -> bool:
    """Validate if Groq API key is available and valid."""
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key or not api_key.strip():
            return False
        
        # Try to initialize LLM to validate key
        llm = get_llm()
        # Simple test call
        response = llm.invoke([HumanMessage(content="Hello")])
        return True
    except Exception as e:
        print(f"API key validation failed: {str(e)}")
        return False

def get_model_info() -> Dict[str, Any]:
    """Get information about the Groq model."""
    try:
        if not validate_api_key():
            return {"error": "Invalid API key", "models": []}
        
        return {
            "status": "connected",
            "models": ["llama-3.3-70b-versatile"],
            "default_model": "llama-3.3-70b-versatile",
            "provider": "Groq",
            "api_key_valid": True
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "error",
            "models": [],
            "api_key_valid": False
        }

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
    Generate 5 adaptive follow-up questions based on student's profile
    
    Args:
        context: JSON string containing student info and current answers
        
    Returns:
        List of 5 personalized question strings
    """
    try:
        llm = get_llm()
        
        prompt = f"""
        Based on this high school student's profile, generate exactly 5 personalized career exploration questions.
        
        Student Profile:
        {context}
        
        Requirements:
        - Questions should be age-appropriate for 10th/12th graders
        - Focus on career interests, values, and future aspirations
        - Include a mix of open-ended and specific questions
        - Help uncover deeper motivations and preferences
        - Avoid questions about work experience or education level
        - Make questions engaging and thought-provoking
        
        Generate exactly 5 questions that will help this student explore their career interests more deeply.
        
        Return only the questions as a numbered list, one per line.
        """
        
        messages = [
            SystemMessage(content="You are a career counselor specializing in helping high school students explore their interests and future careers. Generate thoughtful, personalized questions."),
            HumanMessage(content=prompt)
        ]
        
        # Get response from LLM
        response = llm.invoke(messages)
        
        # Parse the response into 5 questions
        content = response.content.strip()
        lines = content.split('\n')
        
        questions = []
        for line in lines:
            line = line.strip()
            # Remove numbering and clean up
            if line and (line[0].isdigit() or line.startswith('-')):
                question = line.lstrip('0123456789.- ').strip()
                if question and len(question) > 10:  # Ensure it's a real question
                    questions.append(question)
        
        # Ensure we have exactly 5 questions
        if len(questions) < 5:
            # Add generic but relevant questions
            additional_questions = [
                "What kind of problems in the world would you most like to help solve?",
                "How do you feel about working with different types of people every day?",
                "What subjects do you wish you could spend more time studying?",
                "How important is creativity in the work you want to do?",
                "What kind of daily routine would make you happiest at work?"
            ]
            questions.extend(additional_questions[len(questions):5])
        elif len(questions) > 5:
            questions = questions[:5]
        
        return questions
        
    except Exception as e:
        print(f"Error generating adaptive questions: {str(e)}")
        # Return fallback questions
        return [
            "What career fields have you considered pursuing after high school?",
            "How do you feel about working with technology every day?",
            "What kind of work environment would make you most productive?",
            "Are there any careers in your family that interest you?",
            "What skills would you most like to develop in the next few years?"
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
        Create a detailed, structured learning roadmap for someone pursuing a career as a {career_title}.
        
        User Profile:
        - Current Skills: {user_skills}
        - Experience Level: {user_experience}
        - Education: {user_education}
        
        Career Details:
        - Required Skills: {', '.join(career_data.get('key_skills', []))}
        - Education Requirements: {career_data.get('education_requirements', '')}
        
        Provide a comprehensive response with these exact sections. Use plain text only - NO asterisks (*), NO bold (**), NO markdown formatting:
        
        SKILL GAP ANALYSIS:
        Write 2-3 detailed sentences about what skills the user needs to develop.
        
        LEARNING PHASES:
        List 4 phases with clear structure:
        Phase 1: Foundations (3 months)
        - Learn programming basics and fundamental concepts
        - Build small practice projects
        
        Phase 2: Programming Languages (3 months)
        - Master a primary programming language
        - Work on intermediate projects
        
        Phase 3: Software Development (3 months)
        - Learn development methodologies and tools
        - Focus on collaboration and best practices
        
        Phase 4: Specialization (3 months)
        - Choose a focus area and build expertise
        - Create portfolio projects
        
        RESOURCES:
        List 5-7 specific resources as plain text:
        1. Coursera: Python for Everybody (Online Course)
        2. Udemy: Complete JavaScript Course (Online Course)
        3. Clean Code by Robert C. Martin (Book)
        4. MDN Web Docs (Documentation)
        
        TIMELINE:
        Provide a month-by-month breakdown for 12 months:
        Month 1-3: Complete foundation courses and basic projects
        Month 4-6: Master programming languages and build intermediate projects
        Month 7-9: Learn software development principles and methodologies
        Month 10-12: Specialize in chosen area and prepare portfolio
        
        PROJECTS:
        List 5 practical projects:
        1. Build a personal portfolio website
        2. Create a task management application
        3. Develop a data visualization dashboard
        4. Build a REST API for a web application
        5. Contribute to an open-source project
        
        NETWORKING:
        Provide specific networking strategies:
        Join online communities like GitHub, Stack Overflow, and Reddit
        Attend local tech meetups and conferences
        Participate in coding challenges on platforms like LeetCode
        Connect with professionals on LinkedIn
        Join relevant Slack or Discord communities
        
        Use plain text only. No special characters, no formatting symbols. Keep responses clear and actionable.
        """
        
        messages = [
            SystemMessage(content="You are an expert career coach. Provide detailed, structured learning advice using plain text only. No asterisks, no bold, no markdown."),
            HumanMessage(content=prompt)
        ]
        
        try:
            response = llm.invoke(messages)
            content = response.content.strip()
        except Exception as e:
            print(f"LLM error in generate_learning_roadmap: {str(e)}")
            return create_fallback_roadmap(career_title)
        
        # Parse and structure the response
        roadmap_data = parse_roadmap_content(content, career_title)
        
        return {
            "roadmap": roadmap_data,
            "generated_at": "2024-01-01T00:00:00Z",
            "career_title": career_title
        }
        
    except Exception as e:
        print(f"Error generating learning roadmap: {str(e)}")
        return create_fallback_roadmap(career_data.get("title", "Unknown Career"))

def parse_roadmap_content(content: str, career_title: str) -> Dict[str, Any]:
    """Parse roadmap content into clean, structured format with better handling."""
    try:
        # Split content into sections
        sections = content.split('\n\n')
        roadmap = {
            "career": career_title,
            "skill_gap_analysis": "",
            "learning_phases": [],
            "resources": [],
            "timeline": "",
            "projects": [],
            "networking": ""
        }
        
        current_section = ""
        for section in sections:
            section = section.strip()
            if not section:
                continue
                
            section_lower = section.lower()
            
            if 'skill gap' in section_lower:
                roadmap["skill_gap_analysis"] = clean_section_content(section)
            elif 'learning phase' in section_lower:
                roadmap["learning_phases"] = parse_phases_clean(section)
            elif 'resource' in section_lower:
                roadmap["resources"] = parse_resources_clean(section)
            elif 'timeline' in section_lower:
                roadmap["timeline"] = clean_section_content(section)
            elif 'project' in section_lower:
                roadmap["projects"] = parse_projects_clean(section)
            elif 'networking' in section_lower:
                roadmap["networking"] = clean_section_content(section)
        
        return roadmap
        
    except Exception as e:
        print(f"Error parsing roadmap content: {str(e)}")
        return create_fallback_roadmap(career_title)["roadmap"]

def clean_section_content(section: str) -> str:
    """Clean section content by removing headers and formatting, including asterisks."""
    lines = section.split('\n')
    content_lines = []
    
    for line in lines[1:]:  # Skip header
        line = line.strip()
        # Remove asterisks and other markdown symbols
        line = line.replace('*', '').replace('**', '').replace('_', '').replace('`', '')
        if line and not line.lower().startswith(('skill', 'learning', 'resource', 'timeline', 'project', 'networking')):
            content_lines.append(line)
    
    return '\n'.join(content_lines)

def parse_phases_clean(section: str) -> List[Dict[str, Any]]:
    """Parse learning phases into structured format with better cleaning."""
    phases = []
    lines = section.split('\n')
    
    current_phase = None
    for line in lines[1:]:  # Skip header
        line = line.strip()
        # Remove asterisks and clean up
        line = line.replace('*', '').replace('**', '').replace('_', '')
        
        if not line:
            continue
            
        # Look for phase headers
        if line.startswith('Phase') and ':' in line:
            if current_phase:
                phases.append(current_phase)
            
            # Parse phase name and duration
            parts = line.split(':', 1)
            phase_info = parts[0].strip()
            description = parts[1].strip() if len(parts) > 1 else ""
            
            # Extract name and duration
            if '(' in phase_info and ')' in phase_info:
                name_part = phase_info.split('(')[0].strip()
                duration_part = phase_info.split('(')[1].split(')')[0].strip()
                current_phase = {"name": name_part, "description": description, "duration": duration_part}
            else:
                current_phase = {"name": phase_info, "description": description, "duration": "3 months"}
        elif current_phase and (line.startswith('-') or line.startswith('•') or len(line) > 10):
            # Add to description
            clean_line = line.lstrip('-• ').strip()
            if clean_line:
                if current_phase["description"]:
                    current_phase["description"] += f"\n{clean_line}"
                else:
                    current_phase["description"] = clean_line
    
    if current_phase:
        phases.append(current_phase)
    
    return phases if phases else [
        {"name": "Foundation Phase", "description": "Build core skills and knowledge", "duration": "3 months"},
        {"name": "Intermediate Phase", "description": "Develop specialized skills", "duration": "3 months"},
        {"name": "Advanced Phase", "description": "Master advanced concepts", "duration": "3 months"},
        {"name": "Professional Phase", "description": "Prepare for career entry", "duration": "3 months"}
    ]

def parse_resources_clean(section: str) -> List[Dict[str, str]]:
    """Parse resources into structured format with cleaning."""
    resources = []
    lines = section.split('\n')
    
    for line in lines[1:]:  # Skip header
        line = line.strip()
        # Remove asterisks and clean up
        line = line.replace('*', '').replace('**', '').replace('_', '')
        
        if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
            resource_text = line.lstrip('-•0123456789. ').strip()
            if resource_text and len(resource_text) > 5:
                # Categorize resource
                if 'course' in resource_text.lower() or 'udemy' in resource_text.lower() or 'coursera' in resource_text.lower():
                    category = "Online Course"
                elif 'book' in resource_text.lower():
                    category = "Book"
                elif 'documentation' in resource_text.lower():
                    category = "Documentation"
                else:
                    category = "Resource"
                
                resources.append({
                    "type": category,
                    "name": resource_text,
                    "category": category
                })
    
    return resources[:7]  # Limit to 7 resources

def parse_projects_clean(section: str) -> List[str]:
    """Parse projects into list format with cleaning."""
    projects = []
    lines = section.split('\n')
    
    for line in lines[1:]:  # Skip header
        line = line.strip()
        # Remove asterisks and clean up
        line = line.replace('*', '').replace('**', '').replace('_', '')
        
        if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
            project_text = line.lstrip('-•0123456789. ').strip()
            if project_text and len(project_text) > 5:
                projects.append(project_text)
    
    return projects[:5]  # Limit to 5 projects

def create_fallback_roadmap(career_title: str) -> Dict[str, Any]:
    """Create an enhanced fallback roadmap when LLM fails"""
    return {
        "roadmap": {
            "career": career_title,
            "skill_gap_analysis": f"To succeed in {career_title}, focus on building technical proficiency, problem-solving skills, and industry knowledge. Develop hands-on experience through projects and continuous learning.",
            "learning_phases": [
                {
                    "name": "Foundation Phase",
                    "description": "Learn core concepts, basic tools, and fundamental skills required for the role",
                    "duration": "3 months"
                },
                {
                    "name": "Technical Skills Phase", 
                    "description": "Master key technical skills, programming languages, and tools specific to the career",
                    "duration": "3 months"
                },
                {
                    "name": "Practical Application Phase",
                    "description": "Build real projects, gain hands-on experience, and work on portfolio development",
                    "duration": "3 months"
                },
                {
                    "name": "Professional Development Phase",
                    "description": "Prepare for job applications, interviews, and career advancement",
                    "duration": "3 months"
                }
            ],
            "resources": [
                {"type": "Online Course", "name": "Coursera: Google Career Certificates", "category": "Education"},
                {"type": "Online Course", "name": "Udemy: Complete Web Development Bootcamp", "category": "Education"},
                {"type": "Book", "name": "Clean Code by Robert C. Martin", "category": "Reference"},
                {"type": "Book", "name": "The Pragmatic Programmer", "category": "Reference"},
                {"type": "Documentation", "name": "Official documentation for key technologies", "category": "Reference"},
                {"type": "Practice Platform", "name": "LeetCode, HackerRank for coding practice", "category": "Practice"}
            ],
            "timeline": "Month 1-3: Complete foundation courses and basic projects\nMonth 4-6: Master technical skills and build intermediate projects\nMonth 7-9: Focus on advanced topics and portfolio development\nMonth 10-12: Prepare for job applications and interviews",
            "projects": [
                "Build a personal portfolio website showcasing your skills",
                "Create a full-stack web application with database integration",
                "Develop a mobile app using modern frameworks",
                "Contribute to open-source projects on GitHub",
                "Build a data visualization dashboard"
            ],
            "networking": "Join professional communities on LinkedIn and GitHub\nAttend local tech meetups and conferences\nParticipate in online forums like Stack Overflow\nConnect with alumni and industry professionals\nJoin relevant Slack/Discord communities"
        },
        "generated_at": "2024-01-01T00:00:00Z",
        "career_title": career_title
    }

def get_industry_trends(career_field: str, time_period: str = "6months") -> Dict[str, Any]:
    """Get latest developments and trends in a specific career field."""
    try:
        llm = get_llm()
        
        prompt = f"""
        Provide comprehensive, actionable insights on the {career_field} field for the past {time_period}.
        
        Generate detailed, varied content for each section. Be specific and use bullet points:
        
        1. EMERGING TECHNOLOGIES: List 4-6 specific technologies, tools, or frameworks gaining traction (e.g., AI/ML, blockchain, IoT, quantum computing). Do NOT list companies here.
        
        2. MARKET TRENDS: Describe 3-5 growth patterns, market size changes, and industry shifts (e.g., remote work adoption, digital transformation).
        
        3. SKILL DEMANDS: List 4-6 most in-demand skills with brief explanations (e.g., Python programming, cloud architecture, data analysis).
        
        4. INDUSTRY NEWS: Mention 2-3 recent major developments, acquisitions, or launches with specific examples.
        
        5. FUTURE OUTLOOK: Predict 3-5 trends for the next 1-2 years with specific examples.
        
        6. SALARY TRENDS: Discuss 3-5 compensation changes, regional variations, and factors affecting pay.
        
        7. KEY COMPANIES: Name 4-6 leading companies and startups with brief descriptions of their focus areas.
        
        Format each section clearly with the exact section name in ALL CAPS, followed by bullet points. Keep responses professional, data-driven, and specific to {career_field}.
        """
        
        messages = [
            SystemMessage(content="You are an industry analyst providing detailed, structured market insights with specific examples and bullet points. Follow the exact format requested."),
            HumanMessage(content=prompt)
        ]
        
        try:
            response = llm.invoke(messages)
            content = response.content.strip()
        except Exception as e:
            print(f"LLM error in get_industry_trends: {str(e)}")
            return create_fallback_trends(career_field, time_period)
        
        # Parse and structure the response
        trends_data = parse_trends_content(content, career_field)
        
        return {
            "trends": trends_data,
            "field": career_field,
            "period": time_period,
            "generated_at": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        print(f"Error getting industry trends: {str(e)}")
        return create_fallback_trends(career_field, time_period)

def parse_trends_content(content: str, field: str) -> Dict[str, str]:
    """Parse trends content into structured format with better section extraction."""
    trends = {
        "field": field,
        "emerging_technologies": "AI/ML frameworks, cloud computing platforms, blockchain solutions, IoT devices, quantum computing",
        "market_trends": "Growing demand for digital transformation, remote work adoption, increased investment in cybersecurity",
        "skill_demands": "Python programming, cloud architecture (AWS/Azure), data analysis, cybersecurity fundamentals, agile methodologies",
        "industry_news": "Major tech acquisitions, new AI model releases, regulatory changes in data privacy",
        "future_outlook": "Continued growth in AI adoption, expansion of remote work, increased focus on sustainability",
        "salary_trends": "Competitive salaries with 5-10% annual increases, premium for specialized skills",
        "key_companies": "Google, Microsoft, Amazon, Apple, Meta, Netflix, Tesla, Uber"
    }
    
    # Split content into sections with better detection
    sections = content.split('\n\n')
    current_section = ""
    
    for section in sections:
        section = section.strip()
        if not section:
            continue
            
        section_lower = section.lower()
        
        # Detect section headers
        if 'emerging technologies' in section_lower or section.startswith('EMERGING TECHNOLOGIES'):
            trends["emerging_technologies"] = extract_bullet_points(section)
        elif 'market trends' in section_lower or section.startswith('MARKET TRENDS'):
            trends["market_trends"] = extract_bullet_points(section)
        elif 'skill demands' in section_lower or section.startswith('SKILL DEMANDS'):
            trends["skill_demands"] = extract_bullet_points(section)
        elif 'industry news' in section_lower or section.startswith('INDUSTRY NEWS'):
            trends["industry_news"] = extract_bullet_points(section)
        elif 'future outlook' in section_lower or section.startswith('FUTURE OUTLOOK'):
            trends["future_outlook"] = extract_bullet_points(section)
        elif 'salary trends' in section_lower or section.startswith('SALARY TRENDS'):
            trends["salary_trends"] = extract_bullet_points(section)
        elif 'key companies' in section_lower or section.startswith('KEY COMPANIES'):
            trends["key_companies"] = extract_bullet_points(section)
    
    return trends

def extract_bullet_points(section: str) -> str:
    """Extract and format bullet points from a section."""
    lines = section.split('\n')
    bullets = []
    
    for line in lines[1:]:  # Skip header
        line = line.strip()
        if not line:
            continue
            
        # Clean up bullet points
        if line.startswith(('-', '•', '*')):
            clean_line = line.lstrip('-•* ').strip()
            if clean_line and len(clean_line) > 5:  # Avoid very short lines
                bullets.append(f"• {clean_line}")
        elif len(line) > 10 and not line.lower().startswith(('emerging', 'market', 'skill', 'industry', 'future', 'salary', 'key')):
            bullets.append(f"• {line}")
    
    return '\n'.join(bullets) if bullets else "Information being updated..."

def create_fallback_trends(field: str, period: str) -> Dict[str, Any]:
    """Create enhanced fallback trends with better structure."""
    return {
        "trends": {
            "field": field,
            "emerging_technologies": "• Artificial Intelligence and Machine Learning\n• Cloud Computing (AWS, Azure, GCP)\n• Blockchain and Web3 technologies\n• Internet of Things (IoT)\n• Quantum Computing research\n• Edge Computing solutions",
            "market_trends": "• Steady 8-12% annual growth\n• Increased remote work adoption\n• Rising demand for digital skills\n• Growing investment in cybersecurity\n• Expansion of e-commerce platforms\n• AI integration across industries",
            "skill_demands": "• Python and JavaScript programming\n• Cloud platform expertise\n• Data analysis and visualization\n• Cybersecurity fundamentals\n• Agile project management\n• Machine learning basics",
            "industry_news": "• Major acquisitions in AI startups\n• New cloud service launches\n• Regulatory updates on data privacy\n• Remote work policy changes\n• Sustainability initiatives\n• AI model advancements",
            "future_outlook": "• Continued AI integration across industries\n• Hybrid work models becoming standard\n• Increased focus on ethical tech\n• Growth in green technology\n• Expansion of digital education\n• Rise of metaverse applications",
            "salary_trends": "• Average salaries: $80,000 - $120,000\n• 5-8% annual increases expected\n• Premium for specialized skills\n• Regional variations by location\n• Bonuses for high performers\n• Remote work salary adjustments",
            "key_companies": "• Google (AI and cloud leader)\n• Microsoft (Enterprise solutions)\n• Amazon (E-commerce and AWS)\n• Apple (Consumer technology)\n• Meta (Social media and VR)\n• Netflix (Streaming and data analytics)"
        },
        "field": field,
        "period": period,
        "generated_at": "2024-01-01T00:00:00Z"
    }