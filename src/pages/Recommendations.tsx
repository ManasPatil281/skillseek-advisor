import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, Star, ArrowRight, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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

// Mock data - in real app this would come from API
const mockRecommendations: CareerRecommendation[] = [
  {
    career_id: "software-engineer",
    title: "Software Engineer",
    match_score: 92,
    demand_score: 95,
    avg_salary: 105000,
    entry_level_salary: 75000,
    key_skills: ["Python", "JavaScript", "React", "Problem Solving", "Teamwork"],
    description: "Design, develop, and maintain software applications and systems",
    education_requirements: "Bachelor's degree in Computer Science or related field",
    growth_trend: {
      "5y_growth_pct": 25,
      explain: "High demand driven by digital transformation across industries"
    }
  },
  {
    career_id: "data-scientist", 
    title: "Data Scientist",
    match_score: 88,
    demand_score: 90,
    avg_salary: 120000,
    entry_level_salary: 85000,
    key_skills: ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization"],
    description: "Analyze complex data to help organizations make informed decisions",
    education_requirements: "Master's degree in Data Science, Statistics, or related field preferred",
    growth_trend: {
      "5y_growth_pct": 35,
      explain: "Rapid growth as companies increasingly rely on data-driven insights"
    }
  },
  {
    career_id: "product-manager",
    title: "Product Manager", 
    match_score: 85,
    demand_score: 88,
    avg_salary: 130000,
    entry_level_salary: 90000,
    key_skills: ["Strategy", "Communication", "Market Analysis", "Leadership", "Agile"],
    description: "Guide product development from conception to launch and beyond",
    education_requirements: "Bachelor's degree in Business, Engineering, or related field",
    growth_trend: {
      "5y_growth_pct": 20,
      explain: "Strong demand as companies focus on product-led growth"
    }
  }
];

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if survey data exists
    const surveyData = localStorage.getItem('surveyData');
    if (!surveyData) {
      navigate('/survey');
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    }, 1500);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-medium text-foreground">Your Career Recommendations</h1>
        <p className="text-muted-foreground mt-2">
          Based on your survey responses, here are your top career matches
        </p>
      </div>

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

      {/* Actions */}
      <div className="text-center pt-6">
        <p className="text-muted-foreground mb-4">
          Ready to explore mentors and learning paths for these careers?
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/mentors">
            <Button variant="outline">
              Find Mentors
            </Button>
          </Link>
          <Link to="/learning">
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
              View Learning Paths
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}