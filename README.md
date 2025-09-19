# CareerCompass - AI-Powered Career Guidance Platform

CareerCompass is an intelligent, agentic AI-driven career guidance platform that revolutionizes career discovery through personalized recommendations, adaptive learning paths, and real-time industry insights. Unlike traditional career assessment tools, CareerCompass uses advanced AI agents to create dynamic, evolving career guidance that adapts to user responses and market changes.

## 🚀 Project Overview

### Vision
CareerCompass bridges the gap between traditional career counseling and modern AI capabilities, providing students and professionals with intelligent, personalized career guidance that evolves with their journey and the job market.

### Key Differentiators
- **Agentic AI**: AI agents that actively learn from user interactions and adapt recommendations
- **Adaptive Learning**: Survey questions that evolve based on user responses
- **Real-time Insights**: Live industry trend analysis and market intelligence
- **Personalized Roadmaps**: AI-generated learning paths tailored to individual profiles
- **Mentor Matching**: Intelligent pairing with industry professionals

## 🎯 Core Functionalities

### 1. Intelligent Career Assessment
- **Multi-stage Survey**: 5-question initial survey + AI-generated adaptive follow-up questions
- **Dynamic Question Generation**: Questions adapt based on previous answers using natural language processing
- **Comprehensive Profiling**: Assesses interests, skills, values, education, and career goals
- **Real-time Validation**: Immediate feedback and progress tracking

### 2. AI-Powered Career Matching
- **Advanced Algorithm**: Combines user profile with 100+ career options
- **Multi-factor Scoring**: Considers interests (30%), skills (20%), education (25%), and market demand (25%)
- **Personalized Explanations**: AI-generated reasoning for each recommendation
- **Fallback Intelligence**: Provides alternatives when primary matches are weak

### 3. Personalized Learning Roadmaps
- **Skill Gap Analysis**: Identifies missing competencies with detailed explanations
- **12-Month Structured Plans**: Phase-by-phase learning progression
- **Resource Curation**: Handpicked courses, books, and tools
- **Project-Based Learning**: Practical assignments to build portfolios
- **Progress Tracking**: Milestone-based advancement system

### 4. Intelligent Mentor Matching
- **Profile-Based Matching**: Matches based on career interests, experience level, and goals
- **Availability Filtering**: Considers mentor schedules and communication preferences
- **Expertise Alignment**: Matches technical skills and industry knowledge
- **Personalized Introductions**: AI-generated connection suggestions

### 5. Industry Intelligence Hub
- **Real-time Trend Analysis**: Weekly updates on market developments
- **Sector-Specific Insights**: Technology, healthcare, finance, and creative industries
- **Salary Intelligence**: Compensation trends and regional variations
- **Future Forecasting**: 1-2 year predictions based on current trajectories

### 6. User Experience Features
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Offline Capability**: Core functionality works without internet
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Progressive Enhancement**: Works with JavaScript disabled

## 🧠 Agentic AI Architecture

### AI Agent Framework
CareerCompass employs multiple specialized AI agents that work collaboratively:

#### 1. Survey Agent
- **Function**: Generates adaptive questions based on user responses
- **Technology**: LangChain + Groq LLaMA 3.3 70B
- **Capabilities**:
  - Context analysis of previous answers
  - Question difficulty adjustment
  - Cultural sensitivity adaptation
  - Follow-up question generation

#### 2. Recommendation Agent
- **Function**: Matches user profiles with career opportunities
- **Algorithm**: Multi-weighted scoring system
- **Features**:
  - Dynamic career database integration
  - Market demand analysis
  - Salary trend incorporation
  - Geographic preference consideration

#### 3. Learning Path Agent
- **Function**: Creates personalized educational roadmaps
- **Capabilities**:
  - Skill gap identification
  - Resource recommendation
  - Timeline optimization
  - Progress milestone creation

#### 4. Industry Intelligence Agent
- **Function**: Analyzes market trends and provides insights
- **Data Sources**: Web scraping, API integrations, statistical analysis
- **Output**: Structured reports on emerging technologies, market shifts, and future predictions

#### 5. Mentor Matching Agent
- **Function**: Intelligently pairs users with mentors
- **Matching Criteria**:
  - Career alignment (40%)
  - Experience level compatibility (30%)
  - Availability and communication style (20%)
  - Geographic preferences (10%)

### AI Decision-Making Process
The AI decision-making process in CareerCompass involves multiple stages:

1. **Data Collection**: Gather user inputs from the career survey
2. **Contextual Analysis**: AI agents analyze responses in real-time, considering context and nuances
3. **Dynamic Questioning**: Survey Agent generates adaptive follow-up questions to deepen understanding
4. **Profile Matching**: Recommendation Agent matches user profiles with potential career paths
5. **Scoring and Ranking**: Multi-factor scoring system ranks careers based on user preferences and market data
6. **Feedback Loop**: Continuous learning from user interactions to improve future recommendations

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **React Router** - Client-side routing
- **Lucide Icons** - Beautiful icon library

### Backend
- **FastAPI** - Modern, fast web framework for building APIs with Python
- **Python 3.8+** - Programming language
- **LangChain** - Framework for building applications with LLMs
- **Groq API** - High-performance LLM inference
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI web server

### AI/ML
- **Groq LLaMA 3.3 70B** - Large language model for generating recommendations
- **Adaptive Question Generation** - Context-aware follow-up questions
- **Natural Language Processing** - Text analysis and skill extraction

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

### For Frontend
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager

### For Backend
- **Python** (version 3.8 or higher) - [Download here](https://python.org/)
- **pip** package manager

## 🚀 Installation and Setup

### 1. Clone the Repository
```bash
git clone <YOUR_GIT_URL>
cd skillseek-advisor
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the `backend` directory:
```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Application Settings
DEBUG=True
SESSION_TIMEOUT=3600

# Model Configuration
DEFAULT_MODEL=llama-3.3-70b-versatile
MODEL_TEMPERATURE=0.7
MAX_TOKENS=1000

# File Paths
DATA_DIR=./data
SESSIONS_DIR=./data/session_logs
```

#### Get API Keys
1. **Groq API Key**: Sign up at [Groq Console](https://console.groq.com/) and get your API key
2. Replace `your_groq_api_key_here` with your actual API key

#### Start Backend Server
```bash
python app.py
```
The backend will start on `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ..
npm install
```

#### Start Development Server
```bash
npm run dev
```
The frontend will start on `http://localhost:8080`

## 📖 Usage

### User Journey

1. **Take Career Survey**
   - Visit the homepage and click "Start Career Survey"
   - Answer questions about your interests, experience, education, and skills
   - AI generates adaptive follow-up questions based on your responses

2. **View Recommendations**
   - Get personalized career suggestions with match scores
   - See salary ranges, growth trends, and required skills
   - Explore detailed career information

3. **Learning Paths**
   - Access comprehensive learning roadmaps for recommended careers
   - View skill gaps, learning phases, and recommended resources
   - Track your progress through structured milestones

4. **Find Mentors**
   - Connect with experienced professionals in your field
   - Filter mentors by expertise, experience, and availability
   - Get personalized mentor recommendations

5. **Industry Trends**
   - Stay updated with latest industry developments
   - Explore market trends, salary insights, and future outlook
   - Get actionable insights for career growth

## 🔌 API Endpoints

### Core Endpoints
- `GET /` - API health check
- `GET /health` - Detailed health status
- `GET /docs` - Interactive API documentation

### Career Services
- `POST /start-session` - Initialize career survey
- `POST /submit-initial-answers` - Submit survey answers
- `POST /complete-survey` - Get career recommendations
- `POST /recommend-careers` - Generate career recommendations

### Learning & Development
- `POST /generate-learning-roadmap` - Create learning roadmap
- `GET /learning-roadmap/{career_id}` - Get roadmap for specific career
- `POST /adaptive-questions` - Generate follow-up questions

### Mentorship
- `GET /mentors` - Get all mentors
- `POST /get-personalized-mentors` - Get matched mentors
- `POST /match-mentors` - Match mentors to career

### Industry Insights
- `POST /get-industry-trends` - Get industry trends
- `GET /industry-trends/{field}` - Get trends for specific field

## 📁 Project Structure

```
skillseek-advisor/
├── backend/
│   ├── app.py                 # FastAPI application
│   ├── langchain_agent.py     # AI agent functions
│   ├── utils.py              # Utility functions
│   ├── requirements.txt      # Python dependencies
│   └── data/
│       ├── mock_career_data.json
│       └── mentors.json
├── src/
│   ├── components/           # Reusable UI components
│   ├── pages/               # Page components
│   ├── services/            # API service functions
│   ├── lib/                 # Utility libraries
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── package.json            # Node.js dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables
- `GROQ_API_KEY`: Your Groq API key for AI functionality
- `DEBUG`: Enable/disable debug mode
- `SESSION_TIMEOUT`: Session timeout in seconds

### Data Files
- `data/mock_career_data.json`: Career information database
- `data/mentors.json`: Mentor profiles database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Backend won't start**
- Ensure Python 3.8+ is installed
- Check if all dependencies are installed: `pip install -r requirements.txt`
- Verify GROQ_API_KEY is set in `backend/.env`

**Frontend won't start**
- Ensure Node.js 16+ is installed
- Check if dependencies are installed: `npm install`
- Verify backend is running on port 8000

**API calls failing**
- Check CORS settings in backend
- Ensure backend and frontend are running on correct ports
- Verify API endpoints match between frontend and backend

**AI features not working**
- Verify GROQ_API_KEY is valid
- Check internet connection for API calls
- Review API rate limits

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `http://localhost:8000/docs`
- Review the troubleshooting section above

## 🎯 Future Enhancements

- User authentication and profiles
- Real-time chat with mentors
- Job application tracking
- Skill assessment quizzes
- Integration with LinkedIn and job boards
- Mobile app development
- Multi-language support

---

Built with ❤️ using React, FastAPI, and AI-powered insights.
