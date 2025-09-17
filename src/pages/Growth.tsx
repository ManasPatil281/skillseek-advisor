import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Calendar, Zap, Building, DollarSign, Users, ArrowUp, ArrowDown } from "lucide-react";
import { apiService, type IndustryTrends } from "@/services/api";

export default function Growth() {
  const [trends, setTrends] = useState<IndustryTrends | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string>("technology");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("6months");

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

  const formatTrendText = (text: string) => {
    if (!text) return "Data not available";
    return text.length > 200 ? text.substring(0, 200) + "..." : text;
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-medium text-foreground">Growth Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Stay ahead with the latest industry trends and developments
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Industry & Time Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Industry Field</label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {careerFields.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:w-48">
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {timePeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {trends && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Emerging Technologies */}
          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Emerging Technologies</CardTitle>
              </div>
              <CardDescription>Latest tech developments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {formatTrendText(trends.trends.emerging_technologies)}
              </p>
              <Badge className="mt-3" variant="secondary">
                <ArrowUp className="h-3 w-3 mr-1" />
                High Impact
              </Badge>
            </CardContent>
          </Card>

          {/* Market Trends */}
          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <CardTitle className="text-lg">Market Trends</CardTitle>
              </div>
              <CardDescription>Industry growth patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {formatTrendText(trends.trends.market_trends)}
              </p>
              <Badge className="mt-3" variant="secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                Growing
              </Badge>
            </CardContent>
          </Card>

          {/* Skill Demands */}
          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-warning" />
                <CardTitle className="text-lg">Skill Demands</CardTitle>
              </div>
              <CardDescription>In-demand capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {formatTrendText(trends.trends.skill_demands)}
              </p>
              <Badge className="mt-3" variant="secondary">
                <ArrowUp className="h-3 w-3 mr-1" />
                High Demand
              </Badge>
            </CardContent>
          </Card>

          {/* Salary Trends */}
          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Salary Trends</CardTitle>
              </div>
              <CardDescription>Compensation insights</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {formatTrendText(trends.trends.salary_trends)}
              </p>
              <Badge className="mt-3" variant="secondary">
                <ArrowUp className="h-3 w-3 mr-1" />
                Increasing
              </Badge>
            </CardContent>
          </Card>

          {/* Industry News */}
          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Industry News</CardTitle>
              </div>
              <CardDescription>Recent developments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {formatTrendText(trends.trends.industry_news)}
              </p>
              <Badge className="mt-3" variant="outline">
                Latest Updates
              </Badge>
            </CardContent>
          </Card>

          {/* Future Outlook */}
          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Future Outlook</CardTitle>
              </div>
              <CardDescription>Predictions and forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {formatTrendText(trends.trends.future_outlook)}
              </p>
              <Badge className="mt-3" variant="secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                Positive Outlook
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generated Info */}
      {trends && (
        <Card className="shadow-card border-muted">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Field: {trends.field}</span>
              <span>Period: {trends.period}</span>
              <span>Generated: {new Date(trends.generated_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
