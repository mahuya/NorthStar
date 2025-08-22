import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { useProjectStore } from "@/lib/store";
import { ArrowRight, X } from "lucide-react";

const STEP_LABELS = ["Profile", "Goals", "Constraints", "Decisions", "Preferences", "Review"];

const OnboardingProfile = () => {
  const navigate = useNavigate();
  const { input, updateInput } = useProjectStore();
  
  const [formData, setFormData] = useState({
    name: input.profile.name || "",
    age: input.profile.age || "",
    city: input.profile.city || "",
    experience_years: input.profile.experience_years || "",
    domains: input.profile.domains || []
  });
  
  const [domainInput, setDomainInput] = useState("");

  const addDomain = () => {
    if (domainInput.trim() && !formData.domains.includes(domainInput.trim())) {
      setFormData(prev => ({
        ...prev,
        domains: [...prev.domains, domainInput.trim()]
      }));
      setDomainInput("");
    }
  };

  const removeDomain = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      domains: prev.domains.filter(d => d !== domain)
    }));
  };

  const handleNext = () => {
    updateInput({
      profile: {
        ...input.profile,
        name: formData.name,
        age: Number(formData.age) || undefined,
        city: formData.city,
        experience_years: Number(formData.experience_years) || undefined,
        domains: formData.domains
      }
    });
    navigate("/onboarding/goals");
  };

  const isValid = formData.name && formData.age && formData.city;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <ProgressSteps
          currentStep={0}
          totalSteps={6}
          stepLabels={STEP_LABELS}
          className="mb-8"
        />

        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Mumbai, Bangalore..."
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="domains">Domains of Expertise</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="domains"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="B2B SaaS, AI, Product..."
                    onKeyPress={(e) => e.key === "Enter" && addDomain()}
                  />
                  <Button onClick={addDomain} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.domains.map((domain) => (
                    <Badge key={domain} variant="secondary" className="gap-1">
                      {domain}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeDomain(domain)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNext}
                  disabled={!isValid}
                  size="lg"
                  className="gap-2"
                >
                  Next: Goals
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

export default OnboardingProfile;