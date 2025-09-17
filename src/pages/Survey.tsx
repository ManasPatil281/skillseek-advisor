import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";

interface SurveyQuestion {
  id: string;
  question: string;
  type: "radio" | "textarea" | "text";
  options?: string[];
  required: boolean;
}

export default function Survey() {
  const [currentStep, setCurrentStep] = useState<'initial' | 'adaptive' | 'complete'>('initial');
  const [initialQuestions, setInitialQuestions] = useState<SurveyQuestion[]>([]);
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<SurveyQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.startSession();
        if (response.error) {
          throw new Error(response.error);
        }
        if (response.data?.questions) {
          setInitialQuestions(response.data.questions);
        } else {
          throw new Error('No questions received from server');
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        setError(error instanceof Error ? error.message : 'Failed to load survey questions');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  const getCurrentQuestions = (): SurveyQuestion[] => {
    if (currentStep === 'initial') return initialQuestions;
    if (currentStep === 'adaptive') return adaptiveQuestions;
    return [];
  };

  const currentQuestions = getCurrentQuestions();
  const currentQuestion = currentQuestions[currentQuestionIndex] || null;
  const progress = currentQuestions.length > 0 ? ((currentQuestionIndex + 1) / currentQuestions.length) * 100 : 0;

  const handleNext = async () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // End of current step
      if (currentStep === 'initial') {
        await handleInitialComplete();
      } else if (currentStep === 'adaptive') {
        await handleSurveyComplete();
      }
    }
  };

  const handleInitialComplete = async () => {
    setIsSubmitting(true);
    try {
      // Prepare initial answers
      const initialAnswers: any = {};
      initialQuestions.forEach(q => {
        if (answers[q.id]) {
          initialAnswers[q.id] = answers[q.id];
        }
      });

      const response = await apiService.submitInitialAnswers(initialAnswers);
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data?.adaptive_questions) {
        setAdaptiveQuestions(response.data.adaptive_questions);
        setSessionData({ ...initialAnswers, ...response.data.session_data });
        setCurrentStep('adaptive');
        setCurrentQuestionIndex(0);
      } else {
        // If no adaptive questions, go directly to completion
        await handleSurveyComplete();
      }
    } catch (error) {
      console.error('Error submitting initial answers:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit answers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSurveyComplete = async () => {
    setIsSubmitting(true);
    try {
      // Combine all answers
      const allAnswers = { ...sessionData };
      
      // Add initial answers if not already in sessionData
      initialQuestions.forEach(q => {
        if (answers[q.id] && !allAnswers[q.id]) {
          allAnswers[q.id] = answers[q.id];
        }
      });
      
      // Add adaptive answers
      adaptiveQuestions.forEach(q => {
        if (answers[q.id]) {
          allAnswers[q.id] = answers[q.id];
        }
      });

      const response = await apiService.completeSurvey(allAnswers);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Store results and navigate to recommendations
      localStorage.setItem('surveyResults', JSON.stringify({
        sessionData: allAnswers,
        recommendations: response.data?.recommendations || [],
        completedAt: new Date().toISOString()
      }));
      navigate('/recommendations');
    } catch (error) {
      console.error('Error completing survey:', error);
      setError(error instanceof Error ? error.message : 'Failed to complete survey');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = !currentQuestion?.required || answers[currentQuestion.id];

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-foreground">Loading Survey...</h1>
          <p className="text-muted-foreground mt-2">Preparing your career discovery questions</p>
        </div>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-8 bg-muted rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-foreground">Error Loading Survey</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No current question available
  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-foreground">No Questions Available</h1>
          <p className="text-muted-foreground mt-2">Unable to load survey questions. Please try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Reload Survey
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-medium text-foreground">
          {currentStep === 'initial' ? 'Career Discovery Survey' : 'Follow-up Questions'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {currentStep === 'initial' 
            ? 'Tell us about your background and interests'
            : 'Help us understand your preferences better'
          }
        </p>
      </div>

      {/* Progress */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {currentStep === 'initial' ? 'Initial Questions' : 'Follow-up Questions'} - 
              Question {currentQuestionIndex + 1} of {currentQuestions.length}
            </span>
            <span className="text-sm font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            {currentQuestion.question}
          </CardTitle>
          {currentQuestion.required && (
            <CardDescription>
              This question is required
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.type === "radio" && currentQuestion.options && (
            <RadioGroup 
              value={answers[currentQuestion.id] || ""} 
              onValueChange={(value) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`}
                    className="text-sm font-normal cursor-pointer flex-1 py-2"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === "textarea" && (
            <Textarea
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
              placeholder="Please provide your answer..."
              className="min-h-[120px] resize-none"
            />
          )}

          {currentQuestion.type === "text" && (
            <Input
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
              placeholder="Enter your answer..."
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="bg-primary hover:bg-primary-hover text-primary-foreground flex items-center gap-2"
        >
          {isSubmitting ? "Processing..." : 
           currentQuestionIndex === currentQuestions.length - 1 ? 
           (currentStep === 'adaptive' ? "Get Recommendations" : "Continue") : 
           <>Next <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <Card className="shadow-card border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}