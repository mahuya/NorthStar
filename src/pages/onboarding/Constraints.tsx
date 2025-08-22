import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { useProjectStore } from "@/lib/store";
import { ArrowRight, ArrowLeft, X } from "lucide-react";

const STEP_LABELS = ["Profile", "Goals", "Constraints", "Decisions", "Preferences", "Review"];

const OnboardingConstraints = () => {
  const navigate = useNavigate();
  const { input, updateInput } = useProjectStore();
  
  const [constraintsText, setConstraintsText] = useState(
    input.profile.constraints?.join("\n") || ""
  );
  
  const constraints = constraintsText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const removeConstraint = (index: number) => {
    const lines = constraintsText.split("\n");
    lines.splice(index, 1);
    setConstraintsText(lines.join("\n"));
  };

  const handleNext = () => {
    updateInput({
      profile: {
        ...input.profile,
        constraints: constraints
      }
    });
    navigate("/onboarding/decisions");
  };

  const handleBack = () => {
    navigate("/onboarding/goals");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <ProgressSteps
          currentStep={2}
          totalSteps={6}
          stepLabels={STEP_LABELS}
          className="mb-8"
        />

        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">What are your constraints?</CardTitle>
              <p className="text-muted-foreground">
                List any limitations or requirements that might affect your career choices
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Textarea
                  value={constraintsText}
                  onChange={(e) => setConstraintsText(e.target.value)}
                  placeholder="Examples:&#10;- Cannot relocate outside India&#10;- Need to support family financially&#10;- Have 2 years left on current visa&#10;- Cannot take more than 20% pay cut"
                  rows={8}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Each line will become a separate constraint tag
                </p>
              </div>

              {constraints.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Your constraints:</h4>
                  <div className="flex flex-wrap gap-2">
                    {constraints.map((constraint, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 py-1">
                        {constraint}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeConstraint(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button 
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  size="lg"
                  className="gap-2"
                >
                  Next: Decisions
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OnboardingConstraints;