import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SurveyQuestion {
  id: string;
  question: string;
  type: "radio" | "textarea" | "text";
  options?: string[];
  required: boolean;
}

const surveyQuestions: SurveyQuestion[] = [
  {
    id: "interests",
    question: "What are your primary interests?",
    type: "radio",
    options: [
      "Technology and Innovation",
      "Business and Finance",
      "Creative Arts and Design",
      "Healthcare and Medicine", 
      "Education and Training",
      "Science and Research"
    ],
    required: true
  },
  {
    id: "work_environment",
    question: "What type of work environment do you prefer?",
    type: "radio",
    options: [
      "Remote/Work from home",
      "Traditional office setting",
      "Hybrid (mix of remote and office)",
      "Outdoor/Field work",
      "Laboratory/Research facility",
      "No preference"
    ],
    required: true
  },
  {
    id: "experience_level",
    question: "What is your current experience level?",
    type: "radio",
    options: [
      "Entry level (0-2 years)",
      "Mid-level (3-5 years)",
      "Senior level (6-10 years)",
      "Executive level (10+ years)",
      "Student/New graduate"
    ],
    required: true
  },
  {
    id: "education",
    question: "What is your highest level of education?",
    type: "radio",
    options: [
      "High School Diploma",
      "Associate Degree",
      "Bachelor's Degree",
      "Master's Degree",
      "Doctoral Degree",
      "Professional Certification"
    ],
    required: true
  },
  {
    id: "skills",
    question: "What are your key skills? (Please list your top skills separated by commas)",
    type: "textarea",
    required: true
  },
  {
    id: "salary_expectations",
    question: "What are your salary expectations? (Annual in USD)",
    type: "text",
    required: false
  },
  {
    id: "career_goals",
    question: "What are your long-term career goals?",
    type: "textarea",
    required: true
  }
];

export default function Survey() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100;
  const question = surveyQuestions[currentQuestion];

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Format answers for API
    const formattedAnswers = surveyQuestions.map(q => ({
      question: q.question,
      answer: answers[q.id] || "",
      type: q.type
    }));

    // Store answers in localStorage for now (would be API call in real app)
    localStorage.setItem('surveyData', JSON.stringify({
      questions: formattedAnswers,
      completedAt: new Date().toISOString()
    }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    navigate('/recommendations');
  };

  const canProceed = !question.required || answers[question.id];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-medium text-foreground">Career Discovery Survey</h1>
        <p className="text-muted-foreground mt-2">
          Help us understand your preferences to provide personalized career recommendations
        </p>
      </div>

      {/* Progress */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {surveyQuestions.length}
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
            {question.question}
          </CardTitle>
          {question.required && (
            <CardDescription>
              This question is required
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {question.type === "radio" && question.options && (
            <RadioGroup 
              value={answers[question.id] || ""} 
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
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

          {question.type === "textarea" && (
            <Textarea
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Please provide your answer..."
              className="min-h-[120px] resize-none"
            />
          )}

          {question.type === "text" && (
            <Input
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Enter your answer..."
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
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
          {isSubmitting ? (
            "Processing..."
          ) : currentQuestion === surveyQuestions.length - 1 ? (
            "Get Recommendations"
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}