import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Target, Sparkles, Brain, BookOpen, Users, TrendingUp, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
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
          </div>
          <Link to="/survey">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary-hover shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Start Career Survey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-border/50">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-medium">How CareerCompass Works</CardTitle>
              <CardDescription className="text-base">
                Our AI-powered platform guides you through a personalized career discovery journey
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              step: 1,
              title: "Smart Career Survey",
              description: "Answer targeted questions about your interests, skills, and preferences. Our adaptive survey learns from your responses to provide more relevant questions.",
              icon: Brain,
              color: "text-primary"
            },
            {
              step: 2,
              title: "AI-Powered Analysis",
              description: "Advanced algorithms analyze your profile against thousands of career options, considering factors like market demand, salary potential, and skill requirements.",
              icon: Zap,
              color: "text-yellow-500"
            },
            {
              step: 3,
              title: "Personalized Recommendations",
              description: "Receive tailored career suggestions with detailed insights, including match scores, growth potential, and required education paths.",
              icon: Target,
              color: "text-green-500"
            },
            {
              step: 4,
              title: "Custom Learning Roadmaps",
              description: "Get AI-generated learning paths with structured phases, recommended resources, practical projects, and networking strategies for your chosen career.",
              icon: BookOpen,
              color: "text-blue-500"
            }
          ].map((item, index) => (
            <div 
              key={item.step} 
              className="flex items-start gap-4 group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "AI Career Matching",
            description: "Advanced algorithms match your profile with careers based on interests, skills, and market trends",
            icon: Brain,
            color: "text-primary"
          },
          {
            title: "Personalized Learning",
            description: "Get custom learning roadmaps with structured phases, resources, and projects tailored to your goals",
            icon: BookOpen,
            color: "text-blue-500"
          },
          {
            title: "Mentor Network",
            description: "Connect with experienced professionals who can provide guidance and support in your career journey",
            icon: Users,
            color: "text-green-500"
          },
          {
            title: "Industry Insights",
            description: "Stay updated with AI-generated industry trends, emerging technologies, and market analysis",
            icon: TrendingUp,
            color: "text-purple-500"
          },
          {
            title: "Privacy First",
            description: "Your data is secure and private. We use advanced encryption and never share your personal information",
            icon: Shield,
            color: "text-red-500"
          },
          {
            title: "Real-time Updates",
            description: "Our AI continuously learns and updates recommendations based on the latest industry data",
            icon: Zap,
            color: "text-yellow-500"
          }
        ].map((feature, index) => (
          <Card 
            key={feature.title} 
            className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group cursor-pointer border-border/50 animate-slide-up"
            style={{ animationDelay: `${(index + 4) * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {feature.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                <feature.icon className={`h-5 w-5 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started */}
      <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-border/50">
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
              style={{ animationDelay: `${(index + 10) * 100}ms` }}
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
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}