import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { useProjectStore } from "@/lib/store";
import { generateTrailer } from "@/lib/northstarApi";
import { TrailerScene } from "@/types";
import { ArrowRight, ArrowLeft, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Trailer = () => {
  const navigate = useNavigate();
  const { result, input, updateResult, saveJourney } = useProjectStore();
  const [trailer, setTrailer] = useState<TrailerScene[]>([]);
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrailer = async () => {
      if (!result?.plan || !result?.timelines?.length) {
        navigate("/");
        return;
      }

      try {
        // Use the first timeline as the chosen one, or find the recommended one from tradeoffs
        const chosenTimeline = result.tradeoffs?.recommendation?.chosen_timeline_id 
          ? result.timelines.find(t => t.id === result.tradeoffs.recommendation.chosen_timeline_id) 
          : result.timelines[0];
          
        if (!chosenTimeline) {
          console.error("No valid timeline found");
          navigate("/");
          return;
        }

        console.log("Generating trailer for timeline:", chosenTimeline.id);
        const trailerData = await generateTrailer(input, chosenTimeline, result.plan);
        setTrailer(trailerData);
        updateResult({
          ...result,
          trailer: trailerData
        });
      } catch (error) {
        console.error("Failed to generate trailer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrailer();
  }, [result, input, updateResult, navigate]);

  useEffect(() => {
    if (!isPlaying || currentScene >= trailer.length) return;

    const timer = setTimeout(() => {
      setCurrentScene(prev => prev + 1);
    }, 3000); // 3 seconds per scene

    return () => clearTimeout(timer);
  }, [currentScene, isPlaying, trailer.length]);

  const startTrailer = () => {
    setCurrentScene(0);
    setIsPlaying(true);
  };

  const handleSaveJourney = () => {
    saveJourney();
    navigate('/saved');
  };

  const handleBack = () => {
    navigate("/plan");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Creating your future trailer...</p>
        </div>
      </div>
    );
  }

  const currentSceneData = trailer[currentScene];
  const isTrailerComplete = currentScene >= trailer.length;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center text-white">
      <div className="container mx-auto px-6 text-center">
        
        {!isPlaying && !isTrailerComplete && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Your Future Awaits</h1>
            <p className="text-xl text-white/90 mb-8">
              Watch a glimpse of your potential future unfold
            </p>
            <HeroButton 
              onClick={startTrailer}
              size="xl"
              variant="hero-outline"
              className="text-white border-white hover:bg-white hover:text-primary"
            >
              Play Trailer
            </HeroButton>
          </div>
        )}

        {isPlaying && currentSceneData && (
          <div className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-6xl md:text-8xl font-bold mb-4">
                {currentSceneData.title}
              </h1>
              {currentSceneData.subtitle && (
                <h2 className="text-2xl md:text-4xl font-medium mb-8 text-white/90">
                  {currentSceneData.subtitle}
                </h2>
              )}
              {currentSceneData.caption && (
                <p className="text-xl md:text-2xl text-white/80">
                  {currentSceneData.caption}
                </p>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-2">
                {trailer.map((_, index) => (
                  <div
                    key={index}
                    className={`w-12 h-1 rounded-full transition-all duration-300 ${
                      index < currentScene ? 'bg-white' : 
                      index === currentScene ? 'bg-white/70' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {isTrailerComplete && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-5xl font-bold mb-4">Your Journey Begins Now</h1>
            <p className="text-xl text-white/90 mb-8">
              The future you just witnessed is within reach. Every great journey starts with a single step.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <HeroButton 
                onClick={handleSaveJourney}
                size="xl"
                variant="hero"
                className="gap-2"
              >
                <Save className="h-5 w-5" />
                Save Journey
              </HeroButton>
              <HeroButton 
                onClick={() => navigate("/")}
                size="xl"
                variant="hero-outline"
                className="text-white border-white hover:bg-white hover:text-primary"
              >
                Start New Journey
              </HeroButton>
            </div>
          </div>
        )}

        {/* Navigation buttons - only show when not playing */}
        {!isPlaying && (
          <div className="fixed bottom-8 left-8 right-8 flex justify-between">
            <Button 
              onClick={handleBack}
              variant="ghost"
              size="lg"
              className="gap-2 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Plan
            </Button>
            {isTrailerComplete && (
              <Button 
                onClick={() => navigate("/saved")}
                variant="ghost"
                size="lg"
                className="gap-2 text-white"
              >
                View Saved Journeys
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trailer;