import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useProjectStore } from "@/lib/store";
import { ProjectResult } from "@/types";

const Saved = () => {
  const navigate = useNavigate();
  const { loadJourneys, deleteJourney } = useProjectStore();
  const [savedJourneys, setSavedJourneys] = useState<ProjectResult[]>([]);

  useEffect(() => {
    const journeys = loadJourneys();
    setSavedJourneys(journeys);
  }, [loadJourneys]);

  const handleDelete = (id: string) => {
    deleteJourney(id);
    const journeys = loadJourneys();
    setSavedJourneys(journeys);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDuplicate = (journey: ProjectResult) => {
    // Create a copy with a new ID and timestamp
    const duplicatedJourney = {
      ...journey,
      savedAt: new Date().toISOString(),
      savedId: Date.now().toString()
    };

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('saved-journeys') || '[]');
    saved.push(duplicatedJourney);
    localStorage.setItem('saved-journeys', JSON.stringify(saved));

    // Refresh the list
    const journeys = loadJourneys();
    setSavedJourneys(journeys);
  };

  if (savedJourneys.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Saved Journeys</h1>
              <p className="text-muted-foreground">
                Your completed career explorations will appear here
              </p>
            </div>

            <Card className="bg-gradient-card border-0 shadow-card p-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🧭</div>
                <h3 className="text-xl font-semibold mb-2">No journeys yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your first career exploration to see your saved journeys here
                </p>
                <Button onClick={() => navigate("/")} size="lg" className="gap-2">
                  Start New Journey
                </Button>
              </div>
            </Card>

            <Button 
              onClick={() => navigate("/")}
              variant="ghost"
              className="gap-2 mt-4"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Saved Journeys</h1>
          <p className="text-muted-foreground">
            Manage and revisit your career explorations
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {savedJourneys.map((journey: any) => (
            <Card key={journey.savedId} className="bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Journey #{journey.savedId}
                    </CardTitle>
                    {journey.savedAt && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        {formatDate(journey.savedAt)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDuplicate(journey)}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      Duplicate
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Journey</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this journey? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(journey.savedId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {journey.timelines && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Explored Timelines:</h4>
                      <div className="flex flex-wrap gap-2">
                        {journey.timelines.map((timeline) => (
                          <span key={timeline.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {timeline.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {journey.tradeoffs?.recommendation && (
                      <div>
                        <h4 className="font-medium mb-1">Recommended Path:</h4>
                        <p className="text-sm text-muted-foreground">
                          {journey.timelines.find(t => t.id === journey.tradeoffs!.recommendation.chosen_timeline_id)?.label}
                        </p>
                      </div>
                    )}

                    {journey.plan && (
                      <div>
                        <h4 className="font-medium mb-1">90-Day Plan:</h4>
                        <p className="text-sm text-muted-foreground">
                          {journey.plan.okr.length} objectives, {journey.plan.weeks.length} weeks planned
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button onClick={() => navigate("/")} size="lg" className="gap-2">
            Start New Journey
          </Button>
        </div>

        <div className="text-center mt-4">
          <Button 
            onClick={() => navigate("/")}
            variant="ghost"
            className="gap-2"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Saved;