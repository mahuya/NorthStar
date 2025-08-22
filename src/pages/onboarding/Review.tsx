import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { useProjectStore } from "@/lib/store";
import { simulateTimelines } from "@/lib/northstarApi";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";

const STEP_LABELS = ["Profile", "Goals", "Constraints", "Decisions", "Preferences", "Review"];

const OnboardingReview = () => {
  const navigate = useNavigate();
  const { input, updateResult } = useProjectStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    console.log("=== GENERATE TIMELINES BUTTON CLICKED ===");
    console.log("Current input state:", input);
    console.log("Is generating already?", isGenerating);
    
    if (isGenerating) {
      console.log("Already generating, ignoring click");
      return;
    }
    
    setIsGenerating(true);
    console.log("Set isGenerating to true");
    
    try {
      console.log("About to call simulateTimelines...");
      const result = await simulateTimelines(input);
      console.log("simulateTimelines completed successfully:", result);
      
      console.log("Setting result in store...");
      updateResult(result);
      
      console.log("Navigating to /simulate...");
      navigate("/simulate");
    } catch (error) {
      console.error("ERROR in handleGenerate:", error);
      alert(`Failed to generate timelines: ${error.message}`);
    } finally {
      console.log("Setting isGenerating to false");
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    navigate("/onboarding/preferences");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <ProgressSteps
          currentStep={5}
          totalSteps={6}
          stepLabels={STEP_LABELS}
          className="mb-8"
        />

        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Review your profile</CardTitle>
              <p className="text-muted-foreground">
                Make sure everything looks correct before we generate your personalized career timelines
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span> {input.profile.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Age:</span> {input.profile.age}
                  </div>
                  <div>
                    <span className="text-muted-foreground">City:</span> {input.profile.city}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Experience:</span> {input.profile.experience_years} years
                  </div>
                </div>
              </div>

              {/* Domains */}
              {input.profile.domains && input.profile.domains.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Domains</h3>
                  <div className="flex flex-wrap gap-2">
                    {input.profile.domains.map((domain) => (
                      <Badge key={domain} variant="secondary">{domain}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Goals */}
              <div>
                <h3 className="font-semibold mb-3">Goal Priorities</h3>
                <div className="space-y-2">
                  {input.profile.goals_ranked.map((goal, index) => (
                    <div key={goal} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <Badge variant="outline">{goal}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Constraints */}
              {input.profile.constraints && input.profile.constraints.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Constraints</h3>
                  <div className="flex flex-wrap gap-2">
                    {input.profile.constraints.map((constraint, index) => (
                      <Badge key={index} variant="secondary">{constraint}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Decisions */}
              <div>
                <h3 className="font-semibold mb-3">Key Decisions</h3>
                <ul className="space-y-2">
                  {input.decisions.map((decision, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {decision}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Preferences Summary */}
              <div>
                <h3 className="font-semibold mb-3">Preferences</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Risk tolerance:</span> {input.sliders.risk}%
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time horizon:</span> {input.horizon_years} years
                  </div>
                  <div>
                    <span className="text-muted-foreground">Analysis mode:</span> {input.ui_prefs.mode}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remote work:</span> {input.sliders.wfh}%
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  disabled={isGenerating}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleGenerate}
                  size="lg"
                  className="gap-2"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Timelines
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OnboardingReview;