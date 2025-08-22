import React from 'react';
import { cn } from '@/lib/utils';

type ProgressStepsProps = {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  className?: string;
};

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        {stepLabels.map((label, index) => (
          <div
            key={index}
            className={cn(
              "text-xs font-medium transition-colors",
              index < currentStep ? "text-primary" : index === currentStep ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-gradient-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />
      </div>
      <div className="text-center mt-2 text-sm text-muted-foreground">
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  );
};