
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EnhancedTicketFormData } from '@/types/ticket';
import { StepBasicInfo } from './ticket-creation/StepBasicInfo';
import { StepSchedule } from './ticket-creation/StepSchedule';
import { StepPricingTiers } from './ticket-creation/StepPricingTiers';
import { StepReview } from './ticket-creation/StepReview';
import { CompletionState } from './ticket-creation/CompletionState';

interface EnhancedTicketCreationFormProps {
  formData: EnhancedTicketFormData;
  isCreating: boolean;
  isCompleted?: boolean;
  onInputChange: (field: keyof EnhancedTicketFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset?: () => void;
  onNavigateToTickets?: () => void;
}

export const EnhancedTicketCreationForm: React.FC<EnhancedTicketCreationFormProps> = ({
  formData,
  isCreating,
  isCompleted = false,
  onInputChange,
  onSubmit,
  onReset,
  onNavigateToTickets,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.homeTeam && formData.awayTeam && formData.stadiumName;
      case 2:
        return formData.eventDate && formData.eventStartTime && formData.eventEndTime;
      case 3:
        return formData.tiers.length > 0 && formData.tiers.every(tier => 
          tier.tierName && tier.tierPrice && tier.tierQuantity
        );
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    if (isCompleted) {
      return (
        <CompletionState
          formData={formData}
          onReset={onReset}
          onNavigateToTickets={onNavigateToTickets}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return <StepBasicInfo formData={formData} onInputChange={onInputChange} />;
      case 2:
        return <StepSchedule formData={formData} onInputChange={onInputChange} />;
      case 3:
        return <StepPricingTiers formData={formData} onInputChange={onInputChange} />;
      case 4:
        return <StepReview formData={formData} />;
      default:
        return <StepBasicInfo formData={formData} onInputChange={onInputChange} />;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {isCompleted ? "Tickets Generated!" : "Create Soccer Event Tickets"}
            </CardTitle>
            {!isCompleted && <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>}
          </div>
          {!isCompleted && (
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!isCompleted ? (
          <form onSubmit={onSubmit}>
            {renderStepContent()}
            
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                  disabled={!canProceedToStep(currentStep)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isCreating || !canProceedToStep(currentStep)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCreating ? 'Generating Tickets...' : 'Generate Tickets'}
                </Button>
              )}
            </div>
          </form>
        ) : (
          renderStepContent()
        )}
      </CardContent>
    </Card>
  );
};
