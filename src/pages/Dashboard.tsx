import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Target, Users, TrendingUp, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const quickStats = [
    {
      title: "Career Matches",
      value: "12",
      description: "Based on your profile",
      icon: Target,
      color: "text-primary",
    },
    {
      title: "Available Mentors",
      value: "47",
      description: "In your field of interest",
      icon: Users,
      color: "text-success",
    },
    {
      title: "Skills to Learn",
      value: "8",
      description: "Recommended for growth",
      icon: BookOpen,
      color: "text-warning",
    },
    {
      title: "Growth Potential",
      value: "High",
      description: "In selected careers",
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-foreground">Welcome to CareerCompass</h1>
          <p className="text-muted-foreground mt-1">
            Discover your ideal career path with AI-powered recommendations
          </p>
        </div>
        <Link to="/survey">
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
            Start Career Survey
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Get Started</CardTitle>
            <CardDescription>
              Follow these steps to discover your ideal career path
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-foreground">Complete the Career Survey</h4>
                <p className="text-sm text-muted-foreground">
                  Answer questions about your interests, skills, and preferences
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-foreground">Review Recommendations</h4>
                <p className="text-sm text-muted-foreground">
                  Explore personalized career matches with detailed insights
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-foreground">Connect with Mentors</h4>
                <p className="text-sm text-muted-foreground">
                  Find experienced professionals to guide your journey
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Recent Activity</CardTitle>
            <CardDescription>
              Your latest interactions with CareerCompass
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-2 w-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Welcome to CareerCompass!</p>
                  <p className="text-xs text-muted-foreground">Ready to start your career discovery journey</p>
                </div>
              </div>
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Complete your first survey to see more activity here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}