import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Clock, Target, Code, Users, Calendar, CheckCircle, ArrowRight } from "lucide-react";
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
        
        // Check if survey results exist first
        const surveyResults = localStorage.getItem('surveyResults');
        if (!surveyResults) {
          navigate('/survey');
          return;
        }
        
        const { recommendations, sessionData, completedAt } = JSON.parse(surveyResults);
        
        if (!recommendations || recommendations.length === 0) {
          navigate('/survey');
          return;
        }
        
        // Check if roadmaps are already stored and if they're up to date
        const storedRoadmaps = localStorage.getItem('learningRoadmaps');
        const storedTimestamp = localStorage.getItem('learningRoadmapsTimestamp');
        
        if (storedRoadmaps && storedTimestamp) {
          const surveyTimestamp = new Date(completedAt).getTime();
          const roadmapTimestamp = parseInt(storedTimestamp);
          
          // If roadmaps are recent (within 1 hour) and survey hasn't changed, use stored ones
          if (roadmapTimestamp > surveyTimestamp - (60 * 60 * 1000)) {
            const parsedRoadmaps = JSON.parse(storedRoadmaps);
            if (parsedRoadmaps.length > 0) {
              console.log('Using cached roadmaps');
              setRoadmaps(parsedRoadmaps);
              setSelectedCareer(parsedRoadmaps[0]);
              return;
            }
          }
        }
        
        // Generate fresh roadmaps for the top 3 recommended careers
        console.log('Generating fresh learning roadmaps for recommendations:', recommendations.slice(0, 3));
        
        const roadmapPromises = recommendations.slice(0, 3).map(async (career: any) => {
          try {
            console.log(`Generating roadmap for career: ${career.title}`);
            const response = await apiService.generateLearningRoadmap(career, sessionData);
            if (response.data && !response.error) {
              console.log(`Successfully generated roadmap for ${career.title}`);
              return response.data;
            } else {
              console.error('Error generating roadmap for career:', career.title, response.error);
              return null;
            }
          } catch (error) {
            console.error('Error generating roadmap for career:', career.title, error);
            return null;
          }
        });
        
        const roadmapResults = await Promise.all(roadmapPromises);
        const validRoadmaps = roadmapResults.filter(roadmap => roadmap !== null);
        
        console.log('Generated valid roadmaps:', validRoadmaps.length);
        
        if (validRoadmaps.length > 0) {
          setRoadmaps(validRoadmaps);
          setSelectedCareer(validRoadmaps[0]);
          
          // Store roadmaps with timestamp
          localStorage.setItem('learningRoadmaps', JSON.stringify(validRoadmaps));
          localStorage.setItem('learningRoadmapsTimestamp', Date.now().toString());
          
          console.log('Stored fresh roadmaps with timestamp');
        } else {
          setError('Unable to generate learning roadmaps. Please try again.');
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

  // Enhanced helper function to format roadmap text with better structure and cleaning
  const formatRoadmapText = (text: string | any) => {
    if (!text) return "Data not available";
    
    // If it's already a simple string without JSON structure, clean and return
    if (typeof text === 'string' && !text.includes('{') && !text.includes('"Focus Areas"') && text.length < 500) {
      return cleanMarkdownText(text);
    }
    
    // Handle structured JSON-like text
    if (typeof text === 'string' && (text.includes('"Focus Areas"') || text.includes('{"'))) {
      return parseStructuredLearningData(text);
    }
    
    // Handle object data
    if (typeof text === 'object') {
      return formatObjectData(text);
    }
    
    // Clean up any remaining JSON artifacts and markdown
    return cleanMarkdownText(text)
      .replace(/[{}"[\]]/g, '')
      .replace(/_/g, ' ')
      .replace(/,\s*/g, '\n• ')
      .replace(/^\s*/, '• ')
      .trim();
  };

  // Clean markdown and special characters
  const cleanMarkdownText = (text: string) => {
    return text
      .replace(/\*\*/g, '')  // Remove bold markdown
      .replace(/\*/g, '')    // Remove italic/emphasis markdown
      .replace(/_/g, '')     // Remove underline markdown
      .replace(/`/g, '')     // Remove code markdown
      .replace(/~/g, '')     // Remove strikethrough
      .replace(/#/g, '')     // Remove headers
      .replace(/\n\s*\n/g, '\n')  // Remove extra line breaks
      .trim();
  };

  // Parse structured learning data into readable format
  const parseStructuredLearningData = (data: string) => {
    try {
      // Extract key sections from the structured text
      const sections = [];
      
      // Extract focus areas
      const focusAreasMatch = data.match(/"Focus Areas":\s*\[(.*?)\]/g);
      if (focusAreasMatch) {
        const focusAreas = focusAreasMatch.map(match => {
          const areas = match.match(/\[(.*?)\]/)[1].split('", "').map(area => area.replace(/"/g, ''));
          return areas.map(area => `• ${area}`).join('\n');
        }).join('\n');
        sections.push(focusAreas);
      }
      
      // Extract descriptions
      const descMatch = data.match(/"Description":\s*"([^"]+)"/g);
      if (descMatch) {
        const descriptions = descMatch.map(match => {
          const desc = match.match(/"Description":\s*"([^"]+)"/)[1];
          return `📋 ${desc}`;
        });
        sections.push(...descriptions);
      }
      
      // Extract milestones
      const milestoneMatch = data.match(/"Milestones":\s*\[(.*?)\]/g);
      if (milestoneMatch) {
        const milestones = milestoneMatch.map(match => {
          const items = match.match(/\[(.*?)\]/)[1].split('", "').map(item => item.replace(/"/g, ''));
          return items.map(item => `🎯 ${item}`).join('\n');
        }).join('\n');
        sections.push(milestones);
      }
      
      return cleanMarkdownText(sections.join('\n\n'));
    } catch (error) {
      // Fallback to simple cleanup
      return cleanMarkdownText(data)
        .replace(/[{}"[\]]/g, '')
        .replace(/"Focus Areas":/g, '\n📚 Focus Areas:')
        .replace(/"Description":/g, '\n📋 Description:')
        .replace(/"Milestones":/g, '\n🎯 Milestones:')
        .replace(/,\s*"/g, '\n• ')
        .replace(/"/g, '')
        .trim();
    }
  };

  // Format object data into readable text
  const formatObjectData = (obj: any) => {
    if (Array.isArray(obj)) {
      return obj.map(item => `• ${cleanMarkdownText(item)}`).join('\n');
    }
    
    const sections = [];
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
      const icon = getIconForSection(key);
      
      if (Array.isArray(value)) {
        sections.push(`${icon} ${cleanKey}:\n${value.map(item => `  • ${cleanMarkdownText(item)}`).join('\n')}`);
      } else if (typeof value === 'object') {
        const subItems = Object.entries(value).map(([subKey, subValue]) => 
          `  • ${subKey.replace(/_/g, ' ')}: ${cleanMarkdownText(subValue as string)}`
        ).join('\n');
        sections.push(`${icon} ${cleanKey}:\n${subItems}`);
      } else {
        sections.push(`${icon} ${cleanKey}: ${cleanMarkdownText(value as string)}`);
      }
    }
    
    return sections.join('\n\n');
  };

  // Get appropriate icon for section
  const getIconForSection = (key: string) => {
    if (key.includes('focus') || key.includes('skill')) return '📚';
    if (key.includes('milestone') || key.includes('goal')) return '🎯';
    if (key.includes('project')) return '💼';
    if (key.includes('resource') || key.includes('course')) return '📖';
    if (key.includes('timeline') || key.includes('duration')) return '⏰';
    return '•';
  };

  // Enhanced skill gap parser
  const parseSkillGap = (skillGapText: string) => {
    if (!skillGapText) return null;
    
    // If it's structured JSON data, parse it
    if (skillGapText.includes('"Focus Areas"') || skillGapText.includes('{')) {
      const formatted = parseStructuredLearningData(skillGapText);
      const sections = formatted.split('\n\n').filter(s => s.trim().length > 20);
      return sections.slice(0, 3);
    }
    
    // For regular text, split into logical sections
    const sentences = skillGapText.split(/[.!?]+/).filter(s => s.trim().length > 15);
    return sentences.slice(0, 3).map(s => s.trim());
  };

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
      {/* Enhanced Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 rounded-full mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Personalized Learning</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Your Learning Paths</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          AI-crafted roadmaps to accelerate your career journey
        </p>
      </div>

      {/* Career Selection */}
      {roadmaps.length > 1 && (
        <Card className="shadow-card border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Select a Career Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {roadmaps.map((roadmap, index) => (
                <Button
                  key={index}
                  variant={selectedCareer === roadmap ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCareer(roadmap)}
                  className="flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  {roadmap.career_title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Roadmap Display */}
      {selectedCareer && (
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="shadow-card border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Learning Roadmap for {selectedCareer.career_title}
                  </h2>
                  <p className="text-muted-foreground mt-1">AI-generated personalized learning path</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-success/10 text-success hover:bg-success/20 mb-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    AI Optimized
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Generated: {new Date(selectedCareer.generated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Gap Analysis */}
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-warning">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-warning" />
                Skill Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {formatRoadmapText(selectedCareer.roadmap.skill_gap_analysis)}
              </p>
            </CardContent>
          </Card>

          {/* Learning Phases */}
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Learning Phases
              </CardTitle>
              <CardDescription>Structured progression over 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(selectedCareer.roadmap.learning_phases) && selectedCareer.roadmap.learning_phases.map((phase: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{cleanMarkdownText(phase.name)}</h4>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {cleanMarkdownText(phase.duration)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {formatRoadmapText(phase.description)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-success">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-success" />
                Recommended Resources
              </CardTitle>
              <CardDescription>Curated learning materials and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {Array.isArray(selectedCareer.roadmap.resources) && selectedCareer.roadmap.resources.map((resource: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{cleanMarkdownText(resource.name)}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {cleanMarkdownText(resource.type)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Timeline & Milestones
              </CardTitle>
              <CardDescription>Month-by-month learning progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formatRoadmapText(selectedCareer.roadmap.timeline).split('\n').map((milestone, index) => (
                  milestone.trim() && (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-3 w-3 text-purple-500" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cleanMarkdownText(milestone)}</p>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-500" />
                Practical Projects
              </CardTitle>
              <CardDescription>Hands-on projects to build your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(selectedCareer.roadmap.projects) && selectedCareer.roadmap.projects.map((project: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="h-6 w-6 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-500">{index + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{cleanMarkdownText(project)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Networking */}
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Networking & Community
              </CardTitle>
              <CardDescription>Build connections and join the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formatRoadmapText(selectedCareer.roadmap.networking).split('\n').map((network, index) => (
                  network.trim() && (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="h-3 w-3 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cleanMarkdownText(network)}</p>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced No Roadmaps State */}
      {roadmaps.length === 0 && !isLoading && (
        <Card className="shadow-card border-dashed border-2 border-border/50 bg-muted/20">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Learning Paths Available</h3>
              <p className="text-muted-foreground mb-6">
                Complete your career survey to unlock personalized AI-generated learning roadmaps tailored to your goals.
              </p>
              <Link to="/survey">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-hover shadow-lg hover:shadow-xl">
                  Start Career Survey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
