import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, Star, ArrowRight, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiService, type CareerRecommendation } from "@/services/api";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Check if survey results exist (from new flow)
      const surveyResults = localStorage.getItem('surveyResults');
      const oldSurveyData = localStorage.getItem('surveyData');
      
      if (!surveyResults && !oldSurveyData) {
        navigate('/survey');
        return;
      }

      try {
        setIsLoading(true);
        
        let sessionData;
        let existingRecommendations;
        
        if (surveyResults) {
          // New flow - recommendations already generated
          const parsedResults = JSON.parse(surveyResults);
          existingRecommendations = parsedResults.recommendations;
          sessionData = parsedResults.sessionData;
        }
        
        if (existingRecommendations && existingRecommendations.length > 0) {
          // Use existing recommendations
          setRecommendations(existingRecommendations);
          
          // Generate learning roadmaps for the top 3 careers
          const roadmapPromises = existingRecommendations.slice(0, 3).map(async (career: any) => {
            const response = await apiService.generateLearningRoadmap(career, sessionData);
            return response.data;
          });
          
          const roadmaps = await Promise.all(roadmapPromises);
          const validRoadmaps = roadmaps.filter(roadmap => roadmap && !roadmap.error);
          
          // Store roadmaps in localStorage
          localStorage.setItem('learningRoadmaps', JSON.stringify(validRoadmaps));
        } else {
          // Fallback to old flow or generate new recommendations
          const dataToUse = surveyResults ? JSON.parse(surveyResults).sessionData : JSON.parse(oldSurveyData);
          
          const response = await apiService.getRecommendations({
            questions: dataToUse.questions || [],
            user_id: null,
            timestamp: dataToUse.completedAt || new Date().toISOString(),
          });
          
          if (response.error) {
            throw new Error(response.error);
          }

          const recommendationsData = response.data?.recommendations || response.data || [];
          setRecommendations(Array.isArray(recommendationsData) ? recommendationsData : []);
          
          // Generate learning roadmaps for new recommendations
          if (Array.isArray(recommendationsData) && recommendationsData.length > 0) {
            const roadmapPromises = recommendationsData.slice(0, 3).map(async (career: any) => {
              const response = await apiService.generateLearningRoadmap(career, dataToUse);
              return response.data;
            });
            
            const roadmaps = await Promise.all(roadmapPromises);
            const validRoadmaps = roadmaps.filter(roadmap => roadmap && !roadmap.error);
            
            // Store roadmaps in localStorage
            localStorage.setItem('learningRoadmaps', JSON.stringify(validRoadmaps));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
        console.error('Error fetching recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [navigate]);

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-foreground">Analyzing Your Profile...</h1>
          <p className="text-muted-foreground mt-2">
            We're finding the perfect career matches for you
          </p>
        </div>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-muted rounded w-1/2"></div>
              </div>
              <Progress value={66} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-foreground">Error Loading Recommendations</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
          <div className="flex gap-4 justify-center mt-4">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Link to="/survey">
              <Button variant="outline">Retake Survey</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-medium text-foreground">Your Career Recommendations</h1>
        <p className="text-muted-foreground mt-2">
          Based on your survey responses, here are your top career matches
        </p>
      </div>

      {recommendations.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No recommendations available</p>
            <p className="text-sm">Please retake the survey to get personalized recommendations</p>
            <Link to="/survey">
              <Button className="mt-4">Take Survey</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid gap-6">
        {recommendations.map((career, index) => (
          <Card key={career.career_id} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-medium">{career.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Rank #{index + 1}
                        </Badge>
                        <Badge 
                          className="text-xs bg-success/10 text-success hover:bg-success/20"
                        >
                          {career.match_score}% Match
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <Link to={`/career/${career.career_id}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{career.description}</p>
              
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-sm font-medium">{formatSalary(career.avg_salary)}</p>
                    <p className="text-xs text-muted-foreground">Average Salary</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{career.demand_score}/100</p>
                    <p className="text-xs text-muted-foreground">Market Demand</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-warning" />
                  <div>
                    <p className="text-sm font-medium">+{career.growth_trend["5y_growth_pct"]}%</p>
                    <p className="text-xs text-muted-foreground">5-Year Growth</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <p className="text-sm font-medium mb-2">Key Skills Required:</p>
                <div className="flex flex-wrap gap-2">
                  {career.key_skills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className="text-xs bg-muted text-muted-foreground"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="pt-2 border-t border-border">
                <p className="text-sm">
                  <span className="font-medium">Education: </span>
                  <span className="text-muted-foreground">{career.education_requirements}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="text-center pt-6">
          <p className="text-muted-foreground mb-4">
            Ready to explore mentors and learning paths for these careers?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="outline"
              onClick={() => {
                // Store selected careers and session data for mentor matching
                const surveyResults = localStorage.getItem('surveyResults');
                const mentorData = {
                  careers: recommendations,
                  sessionData: surveyResults ? JSON.parse(surveyResults).sessionData : {},
                  fromRecommendations: true
                };
                localStorage.setItem('mentorMatchingData', JSON.stringify(mentorData));
                navigate('/mentors');
              }}
            >
              Find Mentors
            </Button>
            <Link to="/learning">
              <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                View Learning Paths
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}