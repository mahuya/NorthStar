import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProjectStore } from "@/lib/store";
import { computeTradeoffs } from "@/lib/northstarApi";
import { Tradeoffs as TradeoffsType } from "@/types";
import { ArrowRight, ArrowLeft, Lightbulb, TrendingUp, TrendingDown } from "lucide-react";

const Tradeoffs = () => {
  const navigate = useNavigate();
  const { result, input, updateResult } = useProjectStore();
  const [tradeoffs, setTradeoffs] = useState<TradeoffsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTradeoffs = async () => {
      if (!result) {
        navigate("/");
        return;
      }

      try {
        console.log("Loading tradeoffs with goals:", input.profile.goals_ranked);
        console.log("Risk appetite:", input.profile.risk_appetite);
        const tradeoffsData = await computeTradeoffs(
          result.timelines, 
          input.profile.goals_ranked,
          input.profile.risk_appetite || "Balanced"
        );
        console.log("Tradeoffs computed successfully:", tradeoffsData);
        setTradeoffs(tradeoffsData);
        updateResult({
          ...result,
          tradeoffs: tradeoffsData
        });
      } catch (error) {
        console.error("Failed to compute tradeoffs:", error);
        alert(`Failed to analyze tradeoffs: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadTradeoffs();
  }, [result, input.profile.goals_ranked, updateResult]);

  if (!result?.timelines || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Analyzing trade-offs...</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    navigate("/choose");
  };

  const handleBack = () => {
    navigate("/simulate");
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Understanding Trade-offs</h1>
          <p className="text-muted-foreground">
            Compare pathways and see what you gain and sacrifice with each choice
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Comparison Table */}
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle>Timeline Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timeline</TableHead>
                    {input.profile.goals_ranked.map((goal) => (
                      <TableHead key={goal}>{goal}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.timelines.map((timeline) => (
                    <TableRow key={timeline.id}>
                      <TableCell className="font-medium">{timeline.label}</TableCell>
                      {input.profile.goals_ranked.map((goal) => {
                        const score = timeline.scores[goal.toLowerCase() as keyof typeof timeline.scores];
                        return (
                          <TableCell key={goal}>
                            <span className={getScoreColor(score)}>
                              {Math.round(score * 100)}%
                            </span>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pareto Analysis */}
          {tradeoffs && (
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Pareto Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {tradeoffs.pareto.map((analysis) => {
                    const timeline = result.timelines.find(t => t.id === analysis.timeline_id);
                    return (
                      <div key={analysis.timeline_id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">{timeline?.label}</h4>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-green-700 mb-1">Strengths</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.dominant.map((goal) => (
                                <Badge key={goal} variant="default" className="bg-green-100 text-green-800">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {goal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-red-700 mb-1">Trade-offs</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.weak.map((goal) => (
                                <Badge key={goal} variant="secondary" className="bg-red-100 text-red-800">
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                  {goal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Future Perspective */}
          {tradeoffs && (
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Future Me @ 70
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-4">
                  "{tradeoffs.regret_min}"
                </blockquote>
              </CardContent>
            </Card>
          )}

          {/* Recommendation */}
          {tradeoffs && (
            <Card className="bg-gradient-primary text-white border-0 shadow-glow">
              <CardHeader>
                <CardTitle>AI Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-lg font-medium">
                    Recommended path: <span className="underline">
                      {result.timelines.find(t => t.id === tradeoffs.recommendation.chosen_timeline_id)?.label}
                    </span>
                  </p>
                  <p className="text-white/90">
                    {tradeoffs.recommendation.why}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button 
              onClick={handleBack}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Simulation
            </Button>
            <Button 
              onClick={handleNext}
              size="lg"
              className="gap-2"
            >
              Choose My NorthStar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tradeoffs;