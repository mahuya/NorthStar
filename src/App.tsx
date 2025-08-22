import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectStoreProvider } from "@/lib/store";
import Index from "./pages/Index";
import OnboardingProfile from "./pages/onboarding/Profile";
import OnboardingGoals from "./pages/onboarding/Goals";
import OnboardingConstraints from "./pages/onboarding/Constraints";
import OnboardingDecisions from "./pages/onboarding/Decisions";
import OnboardingPreferences from "./pages/onboarding/Preferences";
import OnboardingReview from "./pages/onboarding/Review";
import Simulate from "./pages/Simulate";
import Tradeoffs from "./pages/Tradeoffs";
import Choose from "./pages/Choose";
import Plan from "./pages/Plan";
import Trailer from "./pages/Trailer";
import Saved from "./pages/Saved";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProjectStoreProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding/profile" element={<OnboardingProfile />} />
            <Route path="/onboarding/goals" element={<OnboardingGoals />} />
            <Route path="/onboarding/constraints" element={<OnboardingConstraints />} />
            <Route path="/onboarding/decisions" element={<OnboardingDecisions />} />
            <Route path="/onboarding/preferences" element={<OnboardingPreferences />} />
            <Route path="/onboarding/review" element={<OnboardingReview />} />
            <Route path="/simulate" element={<Simulate />} />
            <Route path="/tradeoffs" element={<Tradeoffs />} />
            <Route path="/choose" element={<Choose />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/trailer" element={<Trailer />} />
          <Route path="/saved" element={<Saved />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ProjectStoreProvider>
  </QueryClientProvider>
);

export default App;
