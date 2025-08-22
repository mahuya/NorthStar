import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { useProjectStore } from "@/lib/store";
import { GoalsKey } from "@/types";
import { ArrowRight, ArrowLeft, GripVertical } from "lucide-react";

const STEP_LABELS = ["Profile", "Goals", "Constraints", "Decisions", "Preferences", "Review"];

const GOALS_INFO = {
  Money: { icon: "💰", desc: "Financial security and wealth building" },
  Mastery: { icon: "🎯", desc: "Skill development and expertise" },
  Health: { icon: "🌱", desc: "Physical and mental well-being" },
  Impact: { icon: "🌍", desc: "Making a difference in the world" },
  Autonomy: { icon: "🗽", desc: "Freedom and control over your time" },
  Optionality: { icon: "🚪", desc: "Keeping multiple doors open" }
};

const OnboardingGoals = () => {
  const navigate = useNavigate();
  const { input, updateInput } = useProjectStore();
  
  const [goals, setGoals] = useState<GoalsKey[]>(
    input.profile.goals_ranked.length > 0 
      ? input.profile.goals_ranked 
      : Object.keys(GOALS_INFO) as GoalsKey[]
  );

  const moveGoal = (fromIndex: number, toIndex: number) => {
    const newGoals = [...goals];
    const [moved] = newGoals.splice(fromIndex, 1);
    newGoals.splice(toIndex, 0, moved);
    setGoals(newGoals);
  };

  const handleNext = () => {
    updateInput({
      profile: {
        ...input.profile,
        goals_ranked: goals
      }
    });
    navigate("/onboarding/constraints");
  };

  const handleBack = () => {
    navigate("/onboarding/profile");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <ProgressSteps
          currentStep={1}
          totalSteps={6}
          stepLabels={STEP_LABELS}
          className="mb-8"
        />

        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Prioritize your goals</CardTitle>
              <p className="text-muted-foreground">
                Drag and drop to rank these goals by importance to you
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map((goal, index) => (
                <div
                  key={goal}
                  className="flex items-center gap-4 p-4 bg-background rounded-xl border hover:shadow-md transition-all cursor-move"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", index.toString())}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                    moveGoal(fromIndex, index);
                  }}
                >
                  <div className="text-2xl font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div className="text-2xl">{GOALS_INFO[goal].icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{goal}</h3>
                    <p className="text-sm text-muted-foreground">
                      {GOALS_INFO[goal].desc}
                    </p>
                  </div>
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}

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
                  Next: Constraints
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

export default OnboardingGoals;