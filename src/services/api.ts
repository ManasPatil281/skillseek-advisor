const API_BASE_URL = 'http://localhost:8000';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

interface CareerRecommendation {
  career_id: string;
  title: string;
  match_score: number;
  demand_score: number;
  avg_salary: number;
  entry_level_salary: number;
  key_skills: string[];
  description: string;
  education_requirements: string;
  growth_trend: {
    "5y_growth_pct": number;
    explain: string;
  };
}

interface SessionData {
  questions: Array<{
    id: string;
    question: string;
    answer: string;
    type: string;
  }>;
  user_id?: string;
  timestamp?: string;
}

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  rating: number;
  bio: string;
  availability: string;
}

export interface LearningRoadmap {
  roadmap: {
    career: string;
    skill_gap_analysis: string;
    learning_phases: Array<{
      name: string;
      description: string;
      duration: string;
    }>;
    resources: Array<{
      type: string;
      name: string;
      category: string;
    }>;
    timeline: string;
    projects: string[];
    networking: string;
  };
  generated_at: string;
  career_title: string;
}

export interface IndustryTrends {
  trends: {
    field: string;
    emerging_technologies: string;
    market_trends: string;
    skill_demands: string;
    industry_news: string;
    future_outlook: string;
    salary_trends: string;
    key_companies: string;
  };
  field: string;
  period: string;
  generated_at: string;
}

class ApiService {
  private async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      return { 
        data: null as T, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async getCareers(): Promise<ApiResponse<{ careers: any[]; count: number } | any[]>> {
    return this.fetchWithErrorHandling('/careers');
  }

  async getCareerById(careerId: string): Promise<ApiResponse<{ career: any }>> {
    return this.fetchWithErrorHandling(`/careers/${careerId}`);
  }

  async getMentors(): Promise<ApiResponse<{ mentors: Mentor[]; count: number } | Mentor[]>> {
    return this.fetchWithErrorHandling('/mentors');
  }

  async getRecommendations(sessionData: SessionData): Promise<ApiResponse<{ recommendations: CareerRecommendation[]; count: number }>> {
    return this.fetchWithErrorHandling('/recommend-careers', {
      method: 'POST',
      body: JSON.stringify({ session_data: sessionData }),
    });
  }

  async getAdaptiveQuestions(context: string, previousQuestions: string[] = []): Promise<ApiResponse<{ questions: string[] }>> {
    return this.fetchWithErrorHandling('/adaptive-questions', {
      method: 'POST',
      body: JSON.stringify({ context, previous_questions: previousQuestions }),
    });
  }

  async getSummaryRoadmap(sessionData: any, selectedCareer: any): Promise<ApiResponse<any>> {
    return this.fetchWithErrorHandling('/summary-roadmap', {
      method: 'POST',
      body: JSON.stringify({ session_data: sessionData, selected_career: selectedCareer }),
    });
  }

  async matchMentors(selectedCareer: any, sessionData: any): Promise<ApiResponse<{ mentors: Mentor[]; count: number }>> {
    return this.fetchWithErrorHandling('/match-mentors', {
      method: 'POST',
      body: JSON.stringify({ selected_career: selectedCareer, session_data: sessionData }),
    });
  }

  async getSkillGap(userSkills: string[], careerSkills: string[]): Promise<ApiResponse<any>> {
    return this.fetchWithErrorHandling('/skill-gap', {
      method: 'POST',
      body: JSON.stringify({ user_skills: userSkills, career_skills: careerSkills }),
    });
  }

  async getHealthCheck(): Promise<ApiResponse<any>> {
    return this.fetchWithErrorHandling('/health');
  }

  // New flow methods - updated to handle session IDs properly
  async startSession(): Promise<ApiResponse<{ session_id: string; questions: any[]; step: string; total_steps: number }>> {
    return this.fetchWithErrorHandling('/start-session', {
      method: 'POST',
    });
  }

  async submitInitialAnswers(requestData: { session_id: string | null; session_data: any }): Promise<ApiResponse<{ adaptive_questions: any[]; step: string; session_data: any; session_id: string }>> {
    return this.fetchWithErrorHandling('/submit-initial-answers', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async completeSurvey(requestData: { session_id: string | null; session_data: any }): Promise<ApiResponse<{ recommendations: CareerRecommendation[]; count: number; session_completed: boolean; session_id: string }>> {
    return this.fetchWithErrorHandling('/complete-survey', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getPersonalizedMentors(selectedCareer: any, sessionData: any): Promise<ApiResponse<{ mentors: Mentor[]; count: number; career: string; personalized: boolean }>> {
    // This method is no longer needed since we're using matchMentors
    // Keeping it for backward compatibility but redirecting to matchMentors
    return this.matchMentors(selectedCareer, sessionData);
  }

  async generateLearningRoadmap(careerData: any, userProfile: any): Promise<ApiResponse<LearningRoadmap>> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-learning-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          career_data: careerData,
          user_profile: userProfile
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error generating learning roadmap:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  async getIndustryTrends(field: string, period: string = "6months"): Promise<ApiResponse<IndustryTrends>> {
    try {
      const response = await fetch(`${API_BASE_URL}/get-industry-trends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          career_field: field,
          time_period: period
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error getting industry trends:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  async getLearningRoadmapForCareer(careerId: string): Promise<ApiResponse<LearningRoadmap>> {
    try {
      const response = await fetch(`${API_BASE_URL}/learning-roadmap/${careerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error getting learning roadmap:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  async getTrendsForField(field: string, period: string = "6months"): Promise<ApiResponse<IndustryTrends>> {
    try {
      const response = await fetch(`${API_BASE_URL}/industry-trends/${encodeURIComponent(field)}?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error getting trends:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }
}

export const apiService = new ApiService();
export type { CareerRecommendation, SessionData, Mentor };
export type { CareerRecommendation, SessionData, Mentor };
