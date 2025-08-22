import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectStore } from "@/lib/store";
import { Timeline } from "@/types";
import { ArrowRight, TrendingUp, Calendar, DollarSign, Expand } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const Simulate = () => {
  const navigate = useNavigate();
  const { result } = useProjectStore();
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null);

  // Show loading state if no timelines yet
  if (!result?.timelines) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Generating Your Timelines</h1>
            <p className="text-muted-foreground">Please wait while we create your personalized career paths...</p>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
            <div className="text-center mt-8">
              <Button onClick={() => navigate("/onboarding/review")} variant="outline">
                Back to Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    navigate("/tradeoffs");
  };

  const formatRadarData = (timeline: Timeline) => {
    return [
      { goal: 'Money', value: timeline.scores.money * 100 },
      { goal: 'Mastery', value: timeline.scores.mastery * 100 },
      { goal: 'Health', value: timeline.scores.health * 100 },
      { goal: 'Impact', value: timeline.scores.impact * 100 },
      { goal: 'Autonomy', value: timeline.scores.autonomy * 100 },
      { goal: 'Optionality', value: timeline.scores.optionality * 100 },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Career Timelines</h1>
          <p className="text-muted-foreground">
            Explore different paths and see how they align with your goals
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {result.timelines.map((timeline) => (
            <Card key={timeline.id} className="bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{timeline.label}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {timeline.rationale}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTimeline(
                      expandedTimeline === timeline.id ? null : timeline.id
                    )}
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={formatRadarData(timeline)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="goal" tick={{ fontSize: 10 }} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {expandedTimeline === timeline.id && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">Year-by-Year Journey</h4>
                    {timeline.years.map((year) => (
                      <div key={year.y} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">Year {year.y}</span>
                          {year.incomeL && (
                            <Badge variant="secondary" className="gap-1">
                              <DollarSign className="h-3 w-3" />
                              ₹{year.incomeL}L
                            </Badge>
                          )}
                        </div>
                        <ul className="text-sm space-y-1">
                          {year.milestones.map((milestone, idx) => (
                            <li key={idx} className="text-muted-foreground">
                              • {milestone}
                            </li>
                          ))}
                        </ul>
                        {year.skills && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {year.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={handleNext} size="lg" className="gap-2">
            View Trade-offs
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Simulate;