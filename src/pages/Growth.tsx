import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Users, DollarSign, Building2, Newspaper, Eye, RefreshCw } from "lucide-react";
import { apiService, type IndustryTrends } from "@/services/api";

export default function Growth() {
  const [trends, setTrends] = useState<IndustryTrends | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string>("technology");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("6months");
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

  const careerFields = [
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "marketing", label: "Marketing" },
    { value: "design", label: "Design" },
    { value: "engineering", label: "Engineering" },
    { value: "data-science", label: "Data Science" }
  ];

  const timePeriods = [
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "1year", label: "Last Year" }
  ];

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getIndustryTrends(selectedField, selectedPeriod);
        
        if (response.error) {
          throw new Error(response.error);
        }

        setTrends(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trends');
        console.error('Error fetching trends:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, [selectedField, selectedPeriod]);

  // Enhanced helper function to format trend text with better handling
  const formatTrendText = (text: string) => {
    if (!text || text === "Information being updated...") return "Data not available";
    
    // If it's already clean, readable text, return as is
    if (typeof text === 'string' && !text.includes('{') && !text.includes('"') && text.length < 1000) {
      return text;
    }
    
    // Handle structured or messy JSON-like text
    if (text.includes('{') || text.includes('"') || text.includes('[')) {
      return cleanStructuredText(text);
    }
    
    return text;
  };

  // Enhanced cleaning function
  const cleanStructuredText = (text: string) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object') {
        return formatObjectToText(parsed);
      }
    } catch {
      // If not valid JSON, clean up manually with better regex
      return text
        .replace(/[{}"[\]]/g, '') // Remove JSON brackets and quotes
        .replace(/,\s*/g, '\n• ') // Convert commas to bullet points
        .replace(/:/g, ': ') // Clean up colons
        .replace(/^\s*/, '• ') // Add initial bullet
        .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n• \n/g, '\n') // Remove empty bullets
        .trim();
    }
    
    return text;
  };

  // Enhanced object formatting
  const formatObjectToText = (obj: any) => {
    if (typeof obj === 'string') return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => `• ${item}`).join('\n');
    }
    
    const sections = [];
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
      
      if (Array.isArray(value)) {
        sections.push(`${cleanKey}:\n${value.map(item => `  • ${item}`).join('\n')}`);
      } else if (typeof value === 'object') {
        const subItems = Object.entries(value).map(([subKey, subValue]) => 
          `  • ${subKey.replace(/_/g, ' ')}: ${subValue}`
        ).join('\n');
        sections.push(`${cleanKey}:\n${subItems}`);
      } else {
        sections.push(`${cleanKey}: ${value}`);
      }
    }
    
    return sections.join('\n\n');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-foreground">Loading Growth Insights...</h1>
          <p className="text-muted-foreground mt-2">Analyzing latest industry developments</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
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
          <h1 className="text-3xl font-medium text-foreground">Error Loading Growth Insights</h1>
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
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Industry Intelligence</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Growth Tracker</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Stay ahead with AI-powered industry insights and market trends
        </p>
      </div>

      {/* Enhanced Filters */}
      <Card className="shadow-card border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Industry & Time Period
          </CardTitle>
          <CardDescription className="text-base">
            Select your industry and timeframe for personalized insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="text-sm font-semibold mb-3 block text-foreground">Industry Field</label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="h-12 border-2 border-border/50 focus:border-primary bg-background hover:bg-muted/50">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg">
                  {careerFields.map((field) => (
                    <SelectItem 
                      key={field.value} 
                      value={field.value} 
                      className="py-3 hover:bg-muted focus:bg-muted cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        {field.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:w-48">
              <label className="text-sm font-semibold mb-3 block text-foreground">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="h-12 border-2 border-border/50 focus:border-primary bg-background hover:bg-muted/50">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg">
                  {timePeriods.map((period) => (
                    <SelectItem 
                      key={period.value} 
                      value={period.value} 
                      className="py-3 hover:bg-muted focus:bg-muted cursor-pointer"
                    >
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              AI-powered insights updated in real-time
            </p>
            {apiKeyValid === false && (
              <Badge variant="destructive" className="text-xs">
                API Key Required
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Trends Display */}
      {trends && (
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="shadow-card border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Industry Trends for {trends.field}</h2>
                  <p className="text-muted-foreground mt-1">Analysis Period: {trends.period}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-success/10 text-success hover:bg-success/20 mb-2">
                    <Eye className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trends.generated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trends Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Emerging Technologies */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Emerging Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatTrendText(trends.trends.emerging_technologies).split('\n').map((tech, index) => (
                    tech.trim() && (
                      <div key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{tech.replace('• ', '')}</p>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Trends */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-success">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatTrendText(trends.trends.market_trends).split('\n').map((trend, index) => (
                    trend.trim() && (
                      <div key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{trend.replace('• ', '')}</p>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skill Demands */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-warning">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-warning" />
                  Skill Demands
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatTrendText(trends.trends.skill_demands).split('\n').map((skill, index) => (
                    skill.trim() && (
                      <div key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{skill.replace('• ', '')}</p>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Industry News */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-destructive">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-destructive" />
                  Industry News
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatTrendText(trends.trends.industry_news).split('\n').map((news, index) => (
                    news.trim() && (
                      <div key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{news.replace('• ', '')}</p>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Future Outlook */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-500" />
                  Future Outlook
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatTrendText(trends.trends.future_outlook).split('\n').map((outlook, index) => (
                    outlook.trim() && (
                      <div key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{outlook.replace('• ', '')}</p>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Salary Trends */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Salary Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatTrendText(trends.trends.salary_trends).split('\n').map((salary, index) => (
                    salary.trim() && (
                      <div key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{salary.replace('• ', '')}</p>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Companies - Full Width */}
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Key Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {formatTrendText(trends.trends.key_companies).split('\n').map((company, index) => (
                  company.trim() && (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-3 w-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{company.replace('• ', '')}</p>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <Card className="shadow-card border-muted bg-gradient-to-r from-muted/20 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>Auto-refreshed every 24 hours</span>
            </div>
            <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>Powered by AI analysis</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
