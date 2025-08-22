import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useProjectStore } from "@/lib/store";
import { compilePlan } from "@/lib/northstarApi";
import { ArrowRight, ArrowLeft, Star, Loader2 } from "lucide-react";

const Choose = () => {
  const navigate = useNavigate();
  const { result, input, updateResult } = useProjectStore();
  const [selectedTimeline, setSelectedTimeline] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!result?.timelines || !result?.tradeoffs) {
    navigate("/");
    return null;
  }

  const handleNext = async () => {
    if (!selectedTimeline) {
      console.log("No timeline selected");
      return;
    }
    
    console.log("Starting plan generation...", { selectedTimeline, input });
    setIsGenerating(true);
    
    try {
      const chosenTimeline = result.timelines.find(t => t.id === selectedTimeline);
      console.log("Found chosen timeline:", chosenTimeline);
      
      if (!chosenTimeline) {
        throw new Error("Selected timeline not found");
      }
      
      const plan = await compilePlan(input, chosenTimeline);
      console.log("Plan generated:", plan);
      
      const updatedResult = {
        ...result,
        plan
      };
      console.log("Setting result with plan:", updatedResult);
      
      updateResult(updatedResult);
      
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        console.log("Navigating to plan page");
        navigate("/plan");
      }, 100);
    } catch (error) {
      console.error("Failed to generate plan:", error);
      // Show user-friendly error message
      alert("Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    navigate("/tradeoffs");
  };

  const recommendedId = result.tradeoffs.recommendation.chosen_timeline_id;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your NorthStar</h1>
          <p className="text-muted-foreground">
            Select the timeline that resonates most with your aspirations
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <RadioGroup value={selectedTimeline} onValueChange={setSelectedTimeline}>
            <div className="grid gap-6">
              {result.timelines.map((timeline) => (
                <Card 
                  key={timeline.id} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-elegant ${
                    selectedTimeline === timeline.id ? 'ring-2 ring-primary shadow-glow' : 'shadow-card'
                  } ${timeline.id === recommendedId ? 'bg-gradient-primary text-white' : 'bg-gradient-card'}`}
                  onClick={() => setSelectedTimeline(timeline.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={timeline.id} id={timeline.id} />
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{timeline.label}</CardTitle>
                            {timeline.id === recommendedId && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                                <Star className="h-3 w-3" />
                                <span className="text-xs font-medium">Recommended</span>
                              </div>
                            )}
                          </div>
                          <p className={`mt-1 ${timeline.id === recommendedId ? 'text-white/90' : 'text-muted-foreground'}`}>
                            {timeline.rationale}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Key Milestones:</h4>
                        <ul className={`space-y-1 ${timeline.id === recommendedId ? 'text-white/90' : 'text-muted-foreground'}`}>
                          {timeline.years.slice(0, 2).map((year) => 
                            year.milestones.map((milestone, idx) => (
                              <li key={`${year.y}-${idx}`} className="text-sm">
                                • Year {year.y}: {milestone}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/20">
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {Math.round(timeline.scores.money * 100)}%
                          </div>
                          <div className={`text-xs ${timeline.id === recommendedId ? 'text-white/70' : 'text-muted-foreground'}`}>
                            Money
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {Math.round(timeline.scores.impact * 100)}%
                          </div>
                          <div className={`text-xs ${timeline.id === recommendedId ? 'text-white/70' : 'text-muted-foreground'}`}>
                            Impact
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {Math.round(timeline.scores.autonomy * 100)}%
                          </div>
                          <div className={`text-xs ${timeline.id === recommendedId ? 'text-white/70' : 'text-muted-foreground'}`}>
                            Autonomy
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>

          <div className="flex justify-between mt-8">
            <Button 
              onClick={handleBack}
              variant="outline"
              size="lg"
              className="gap-2"
              disabled={isGenerating}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Trade-offs
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!selectedTimeline || isGenerating}
              size="lg"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  Generate 90-Day Plan
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Choose;