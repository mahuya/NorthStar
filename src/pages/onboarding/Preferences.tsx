import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { useProjectStore } from "@/lib/store";
import { ArrowRight, ArrowLeft } from "lucide-react";

const STEP_LABELS = ["Profile", "Goals", "Constraints", "Decisions", "Preferences", "Review"];

const OnboardingPreferences = () => {
  const navigate = useNavigate();
  const { input, updateInput } = useProjectStore();
  
  const [sliders, setSliders] = useState({
    risk: input.sliders.risk,
    black_swan: input.sliders.black_swan,
    travel: input.sliders.travel,
    wfh: input.sliders.wfh
  });
  
  const [horizonYears, setHorizonYears] = useState<3 | 5>(input.horizon_years);
  const [mode, setMode] = useState<"Quick" | "Deep">(input.ui_prefs.mode);

  const handleSliderChange = (key: keyof typeof sliders, value: number[]) => {
    setSliders(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleNext = () => {
    updateInput({
      sliders,
      horizon_years: horizonYears,
      ui_prefs: {
        ...input.ui_prefs,
        mode
      }
    });
    navigate("/onboarding/review");
  };

  const handleBack = () => {
    navigate("/onboarding/decisions");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <ProgressSteps
          currentStep={4}
          totalSteps={6}
          stepLabels={STEP_LABELS}
          className="mb-8"
        />

        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Set your preferences</CardTitle>
              <p className="text-muted-foreground">
                Help us customize the simulation to your style
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Risk Tolerance */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Risk Tolerance</Label>
                <div className="px-3">
                  <Slider
                    value={[sliders.risk]}
                    onValueChange={(value) => handleSliderChange("risk", value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Conservative</span>
                    <span>{sliders.risk}%</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>

              {/* Black Swan Events */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Include Unexpected Events</Label>
                <div className="px-3">
                  <Slider
                    value={[sliders.black_swan]}
                    onValueChange={(value) => handleSliderChange("black_swan", value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Stable scenarios</span>
                    <span>{sliders.black_swan}%</span>
                    <span>Wild card events</span>
                  </div>
                </div>
              </div>

              {/* Travel Preference */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Travel Preference</Label>
                <div className="px-3">
                  <Slider
                    value={[sliders.travel]}
                    onValueChange={(value) => handleSliderChange("travel", value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Minimal travel</span>
                    <span>{sliders.travel}%</span>
                    <span>Frequent travel</span>
                  </div>
                </div>
              </div>

              {/* Work from Home */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Remote Work Preference</Label>
                <div className="px-3">
                  <Slider
                    value={[sliders.wfh]}
                    onValueChange={(value) => handleSliderChange("wfh", value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Office-based</span>
                    <span>{sliders.wfh}%</span>
                    <span>Fully remote</span>
                  </div>
                </div>
              </div>

              {/* Time Horizon */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Planning Horizon</Label>
                <Select value={horizonYears.toString()} onValueChange={(value) => setHorizonYears(Number(value) as 3 | 5)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Analysis Mode */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Analysis Style</Label>
                <RadioGroup value={mode} onValueChange={(value) => setMode(value as "Quick" | "Deep")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Quick" id="quick" />
                    <Label htmlFor="quick">Quick - Get results faster with 3 scenarios</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Deep" id="deep" />
                    <Label htmlFor="deep">Deep - More detailed analysis with 5 scenarios</Label>
                  </div>
                </RadioGroup>
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
                  size="lg"
                  className="gap-2"
                >
                  Next: Review
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

export default OnboardingPreferences;