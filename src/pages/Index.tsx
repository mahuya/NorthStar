import { HeroButton } from "@/components/ui/hero-button";
import { Card } from "@/components/ui/card";
import { Compass, Star, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "@/lib/store";

const Index = () => {
  const navigate = useNavigate();
  const { reset } = useProjectStore();

  // Fixed GitHub sync deployment issue
  const startJourney = () => {
    reset();
    navigate("/onboarding/profile");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary rounded-xl p-2">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">NorthStar</h1>
            <p className="text-sm text-muted-foreground">Where Decisions Become Directions</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              Where Decisions Become Directions
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Navigate your career with AI-powered simulation. Explore different paths, understand trade-offs, and find your true north.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <HeroButton size="xl" onClick={startJourney}>
              <Star className="h-5 w-5" />
              Start Your Journey
            </HeroButton>
            <HeroButton variant="hero-outline" size="xl" onClick={() => navigate("/saved")}>
              View Saved Journeys
            </HeroButton>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <Card className="p-8 bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="bg-primary/10 rounded-2xl p-4 w-fit mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Simulate Your Future</h3>
              <p className="text-muted-foreground">
                Explore multiple career paths with detailed year-by-year projections for income, skills, and impact.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="bg-accent/10 rounded-2xl p-4 w-fit mx-auto mb-4">
                <Compass className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Understand Trade-offs</h3>
              <p className="text-muted-foreground">
                See clear comparisons between paths and understand what you gain and sacrifice with each choice.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="bg-primary-glow/20 rounded-2xl p-4 w-fit mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Your Plan</h3>
              <p className="text-muted-foreground">
                Receive a detailed 90-day action plan with OKRs, weekly tasks, and habit tracking.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
