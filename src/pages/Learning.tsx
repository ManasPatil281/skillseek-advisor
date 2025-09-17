import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, CheckCircle, ArrowRight, Target, Trophy, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiService, type LearningRoadmap } from "@/services/api";

export default function Learning() {
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearningRoadmaps = async () => {
      try {
        setIsLoading(true);
        
        // Check if roadmaps are already stored from recommendations
        const storedRoadmaps = localStorage.getItem('learningRoadmaps');
        
        if (storedRoadmaps) {
          const roadmaps = JSON.parse(storedRoadmaps);
          setRoadmaps(roadmaps);
          if (roadmaps.length > 0) {
            setSelectedCareer(roadmaps[0]);
          }
          return;
        }
        
        // Fallback: Check if survey results exist and generate roadmaps
        const surveyResults = localStorage.getItem('surveyResults');
        if (surveyResults) {
          const { recommendations, sessionData } = JSON.parse(surveyResults);
          
          if (recommendations && recommendations.length > 0) {
            // Generate roadmaps for the top 3 recommended careers
            const roadmapPromises = recommendations.slice(0, 3).map(async (career: any) => {
              const response = await apiService.generateLearningRoadmap(career, sessionData);
              return response.data;
            });
            
            const roadmapResults = await Promise.all(roadmapPromises);
            const validRoadmaps = roadmapResults.filter(roadmap => roadmap && !roadmap.error);
            setRoadmaps(validRoadmaps);
            
            if (validRoadmaps.length > 0) {
              setSelectedCareer(validRoadmaps[0]);
            }
            
            // Store roadmaps for future use
            localStorage.setItem('learningRoadmaps', JSON.stringify(validRoadmaps));
          } else {
            // No recommendations, redirect to survey
            navigate('/survey');
          }
        } else {
          // No survey results, redirect to survey
          navigate('/survey');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch learning roadmaps');
        console.error('Error fetching roadmaps:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningRoadmaps();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-foreground">Generating Learning Paths...</h1>
          <p className="text-muted-foreground mt-2">Creating personalized roadmaps for your career journey</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-foreground">Error Loading Learning Paths</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-medium text-foreground">Your Learning Paths</h1>
        <p className="text-muted-foreground mt-2">
          Personalized roadmaps to achieve your career goals
        </p>
      </div>

      {/* Career Selection */}
      {roadmaps.length > 1 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Select a Career Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roadmaps.map((roadmap, index) => (
                <Button
                  key={index}
                  variant={selectedCareer === roadmap ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCareer(roadmap)}
                >
                  {roadmap.career_title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCareer && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Roadmap */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skill Gap Analysis */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>Skill Gap Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedCareer.roadmap.skill_gap_analysis || "Analyzing your current skills against career requirements..."}
                </p>
              </CardContent>
            </Card>

            {/* Learning Phases */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Learning Phases</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCareer.roadmap.learning_phases?.length > 0 ? (
                  selectedCareer.roadmap.learning_phases.map((phase: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{phase.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {phase.duration}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                      <Progress value={(index + 1) * 33} className="mt-3 h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <p className="text-muted-foreground">Learning phases will be generated based on your profile</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle>Timeline & Milestones</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedCareer.roadmap.timeline || "Estimated completion time: 6-12 months with consistent effort"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resources */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-success" />
                  <CardTitle className="text-lg">Resources</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedCareer.roadmap.resources?.length > 0 ? (
                  selectedCareer.roadmap.resources.slice(0, 5).map((resource: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{resource.type}</p>
                        <p className="text-xs text-muted-foreground">{resource.name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Resources will be recommended based on your learning path</p>
                )}
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-warning" />
                  <CardTitle className="text-lg">Practice Projects</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedCareer.roadmap.projects?.length > 0 ? (
                  selectedCareer.roadmap.projects.map((project: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-warning rounded-full mt-2"></div>
                      <p className="text-sm text-muted-foreground flex-1">{project}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Project suggestions will be provided for hands-on learning</p>
                )}
              </CardContent>
            </Card>

            {/* Networking */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Networking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedCareer.roadmap.networking || "Build connections through professional communities and industry events"}
                </p>
                <Link to="/mentors">
                  <Button size="sm" className="mt-3 w-full">
                    Find Mentors
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {roadmaps.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No learning paths available</p>
            <p className="text-sm">Complete the career survey to get personalized learning roadmaps</p>
            <Link to="/survey">
              <Button className="mt-4">Take Survey</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
