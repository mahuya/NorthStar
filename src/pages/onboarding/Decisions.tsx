import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { useProjectStore } from "@/lib/store";
import { ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";

const STEP_LABELS = ["Profile", "Goals", "Constraints", "Decisions", "Preferences", "Review"];

const OnboardingDecisions = () => {
  const navigate = useNavigate();
  const { input, updateInput } = useProjectStore();
  
  const [decisions, setDecisions] = useState<string[]>(
    input.decisions.length > 0 
      ? input.decisions 
      : ["", ""]
  );

  const addDecision = () => {
    setDecisions([...decisions, ""]);
  };

  const removeDecision = (index: number) => {
    if (decisions.length > 2) {
      const newDecisions = decisions.filter((_, i) => i !== index);
      setDecisions(newDecisions);
    }
  };

  const updateDecision = (index: number, value: string) => {
    const newDecisions = [...decisions];
    newDecisions[index] = value;
    setDecisions(newDecisions);
  };

  const handleNext = () => {
    const validDecisions = decisions.filter(d => d.trim().length > 0);
    updateInput({
      decisions: validDecisions
    });
    navigate("/onboarding/preferences");
  };

  const handleBack = () => {
    navigate("/onboarding/constraints");
  };

  const validDecisions = decisions.filter(d => d.trim().length > 0);
  const isValid = validDecisions.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <ProgressSteps
          currentStep={3}
          totalSteps={6}
          stepLabels={STEP_LABELS}
          className="mb-8"
        />

        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">What decisions are you facing?</CardTitle>
              <p className="text-muted-foreground">
                Describe the key career choices you need to make (minimum 2)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {decisions.map((decision, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <Input
                        value={decision}
                        onChange={(e) => updateDecision(index, e.target.value)}
                        placeholder={`Decision ${index + 1}: e.g., "Should I start my own company or join a big tech firm?"`}
                      />
                    </div>
                    {decisions.length > 2 && (
                      <Button
                        onClick={() => removeDecision(index)}
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={addDecision}
                variant="outline"
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Decision
              </Button>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">💡 Examples of good decisions:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• "Should I pursue an MBA or gain more work experience?"</li>
                  <li>• "Join a startup as employee #10 or stay at my stable corporate job?"</li>
                  <li>• "Move to Silicon Valley or build my career in India?"</li>
                  <li>• "Specialize in AI/ML or remain a generalist product manager?"</li>
                </ul>
              </div>

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
                  disabled={!isValid}
                  size="lg"
                  className="gap-2"
                >
                  Next: Preferences
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

export default OnboardingDecisions;