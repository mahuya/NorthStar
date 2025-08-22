import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectStore } from "@/lib/store";
import { ArrowRight, ArrowLeft, Download, Copy, Target, Calendar, Clock, BookOpen } from "lucide-react";
import jsPDF from 'jspdf';

import { generateTrailer } from "@/lib/northstarApi";

const Plan = () => {
  const navigate = useNavigate();
  const { result, input } = useProjectStore();

  // Show loading state if no plan yet
  if (!result?.plan) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Generating Your 90-Day Plan</h1>
            <p className="text-muted-foreground">Please wait while we create your personalized action plan...</p>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
            <div className="text-center mt-8">
              <Button onClick={() => navigate("/choose")} variant="outline">
                Back to Timeline Selection
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleNext = async () => {
    if (!result?.timelines) return;
    
    // Find the chosen timeline (you may need to store this in your store)
    const chosenTimeline = result.timelines[0]; // Default to first timeline for now
    const trailer = await generateTrailer(input, chosenTimeline, result);
    // Store trailer in result if needed
    navigate("/trailer");
  };

  const handleBack = () => {
    navigate("/choose");
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    let yPosition = 20;
    
    // Title
    pdf.setFontSize(20);
    pdf.text('NorthStar 90-Day Action Plan', 20, yPosition);
    yPosition += 20;
    
    // OKRs Section
    pdf.setFontSize(16);
    pdf.text('Objectives & Key Results', 20, yPosition);
    yPosition += 10;
    
    result.plan!.okr.forEach((objective, idx) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.text(`${idx + 1}. ${objective.o}`, 20, yPosition);
      yPosition += 8;
      
      objective.kr.forEach(kr => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.setFontSize(10);
        pdf.text(`• ${kr}`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    });
    
    // Weekly Breakdown Section
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(16);
    pdf.text('Weekly Breakdown', 20, yPosition);
    yPosition += 10;
    
    result.plan!.weeks.forEach(week => {
      if (yPosition > 230) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.text(`Week ${week.w}`, 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.text('Tasks:', 25, yPosition);
      yPosition += 6;
      
      week.tasks.forEach(task => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`• ${task}`, 30, yPosition);
        yPosition += 6;
      });
      
      pdf.text('Habits:', 25, yPosition);
      yPosition += 6;
      
      week.hab.forEach(habit => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`• ${habit}`, 30, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    });
    
    // Time Blocks Section
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(16);
    pdf.text('Time Blocks', 20, yPosition);
    yPosition += 10;
    
    result.plan!.blocks.forEach(block => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(10);
      pdf.text(`${block.t}: ${block.dur} minutes on ${block.days.join(', ')} at ${block.time}`, 20, yPosition);
      yPosition += 8;
    });
    
    pdf.save('northstar-90day-plan.pdf');
  };

  const copyToClipboard = () => {
    const content = generateMarkdownContent();
    navigator.clipboard.writeText(content);
    // Could add a toast notification here
  };

  const generateMarkdownContent = () => {
    let content = "# NorthStar 90-Day Action Plan\n\n";
    
    content += "## OKRs (Objectives & Key Results)\n\n";
    result.plan!.okr.forEach((objective, idx) => {
      content += `### ${idx + 1}. ${objective.o}\n`;
      objective.kr.forEach(kr => {
        content += `- ${kr}\n`;
      });
      content += "\n";
    });

    content += "## Weekly Breakdown\n\n";
    result.plan!.weeks.forEach(week => {
      content += `### Week ${week.w}\n`;
      content += "**Tasks:**\n";
      week.tasks.forEach(task => {
        content += `- ${task}\n`;
      });
      content += "**Habits:**\n";
      week.hab.forEach(habit => {
        content += `- ${habit}\n`;
      });
      content += "\n";
    });

    content += "## Time Blocks\n\n";
    result.plan!.blocks.forEach(block => {
      content += `**${block.t}**: ${block.dur} minutes on ${block.days.join(', ')} at ${block.time}\n`;
    });

    return content;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your 90-Day Action Plan</h1>
          <p className="text-muted-foreground">
            Transform your chosen path into actionable steps
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button onClick={downloadPDF} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={copyToClipboard} variant="outline" className="gap-2">
              <Copy className="h-4 w-4" />
              Copy to Clipboard
            </Button>
          </div>

          <Tabs defaultValue="okrs" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="okrs">OKRs</TabsTrigger>
              <TabsTrigger value="weeks">Weekly</TabsTrigger>
              <TabsTrigger value="blocks">Time Blocks</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="okrs" className="space-y-4">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Objectives & Key Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {result.plan.okr.map((objective, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">
                        {objective.o}
                      </h3>
                      <div className="space-y-2">
                        <h4 className="font-medium text-muted-foreground">Key Results:</h4>
                        <ul className="space-y-1">
                          {objective.kr.map((kr, krIndex) => (
                            <li key={krIndex} className="flex items-start gap-2">
                              <span className="text-primary font-medium">•</span>
                              <span>{kr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weeks" className="space-y-4">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Weekly Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {result.plan.weeks.map((week, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Week {week.w}</h3>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 text-blue-600">Tasks</h4>
                            <ul className="space-y-1">
                              {week.tasks.map((task, taskIndex) => (
                                <li key={taskIndex} className="text-sm">
                                  • {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2 text-green-600">Habits</h4>
                            <div className="flex flex-wrap gap-1">
                              {week.hab.map((habit, habitIndex) => (
                                <Badge key={habitIndex} variant="secondary">
                                  {habit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blocks" className="space-y-4">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Time Blocks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {result.plan.blocks.map((block, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{block.t}</h4>
                          <p className="text-sm text-muted-foreground">
                            {block.dur} minutes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{block.time}</p>
                          <p className="text-sm text-muted-foreground">
                            {block.days.join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.plan.resources ? (
                    <div className="space-y-3">
                      {result.plan.resources.map((resource, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Badge variant="outline">{resource.type}</Badge>
                          <span className="flex-1">{resource.title}</span>
                          {resource.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                Open
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No additional resources provided
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <Button 
              onClick={handleBack}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Choose
            </Button>
            <Button 
              onClick={handleNext}
              size="lg"
              className="gap-2"
            >
              See My Future Trailer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan;