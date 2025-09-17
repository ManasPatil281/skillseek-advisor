import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Target, Users, TrendingUp, BookOpen, Sparkles, Award, Clock } from "lucide-react";
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
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-2xl p-8 border border-border/50">
        <div className="absolute top-4 right-4 opacity-10">
          <Sparkles className="h-24 w-24 text-primary animate-float" />
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-3">
            <h1 className="text-4xl font-medium text-foreground tracking-tight">Welcome to CareerCompass</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover your ideal career path with AI-powered recommendations and personalized guidance
            </p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <Award className="h-4 w-4" />
              <span>Trusted by 10,000+ professionals</span>
            </div>
          </div>
          <Link to="/survey">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary-hover shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Start Career Survey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group cursor-pointer border-border/50 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                <stat.icon className={`h-5 w-5 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-card hover:shadow-elevated transition-all duration-300 border-border/50">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-medium">Get Started</CardTitle>
                <CardDescription className="text-base">
                  Follow these steps to discover your ideal career path
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                step: 1,
                title: "Complete the Career Survey",
                description: "Answer questions about your interests, skills, and preferences",
                active: true
              },
              {
                step: 2,
                title: "Review Recommendations",
                description: "Explore personalized career matches with detailed insights",
                active: false
              },
              {
                step: 3,
                title: "Connect with Mentors",
                description: "Find experienced professionals to guide your journey",
                active: false
              }
            ].map((item, index) => (
              <div 
                key={item.step} 
                className="flex items-start gap-4 group animate-slide-up"
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  item.active 
                    ? 'bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-md' 
                    : 'bg-secondary text-secondary-foreground group-hover:bg-primary/10'
                }`}>
                  {item.step}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    {item.description}
                  </p>
                  {item.active && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-primary">
                      <Clock className="h-3 w-3" />
                      <span>Start now - takes 5 minutes</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-success/10 to-success/5">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-xl font-medium">Recent Activity</CardTitle>
                <CardDescription>
                  Your latest interactions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-success/5 to-transparent rounded-xl border border-success/20">
                <div className="h-3 w-3 bg-success rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Welcome to CareerCompass!</p>
                  <p className="text-xs text-muted-foreground mt-1">Ready to start your career discovery journey</p>
                </div>
              </div>
              <div className="text-center py-8 px-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-transparent border border-border/50">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Complete your first survey to see more activity here
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}