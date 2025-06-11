
import React, { useState } from 'react';
import { Ticket } from './Dashboard';
import { useEnhancedTicketCreation } from '@/hooks/useEnhancedTicketCreation';
import { TicketCreationForm } from './TicketCreationForm';
import { EnhancedTicketCreationForm } from './EnhancedTicketCreationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Settings } from 'lucide-react';

interface TicketCreationProps {
  onTicketCreated: (ticket: Ticket) => void;
  onNavigateToTickets?: () => void;
}

export const TicketCreation: React.FC<TicketCreationProps> = ({ 
  onTicketCreated, 
  onNavigateToTickets 
}) => {
  const [useEnhancedMode, setUseEnhancedMode] = useState(true);
  
  // Basic mode form state
  const [basicFormData, setBasicFormData] = useState({
    eventTitle: '',
    description: '',
    price: '',
    quantity: '',
  });
  const [isBasicCreating, setIsBasicCreating] = useState(false);

  const handleBasicInputChange = (field: string, value: string) => {
    setBasicFormData(prev => ({ ...prev, [field]: value }));
  };

  const createBasicTickets = () => {
    setIsBasicCreating(true);
    // This would need to be implemented if basic mode is used
    // For now, just reset the creating state
    setTimeout(() => setIsBasicCreating(false), 1000);
  };

  const {
    formData: enhancedFormData,
    isCreating: isEnhancedCreating,
    isCompleted: isEnhancedCompleted,
    handleInputChange: handleEnhancedInputChange,
    createTickets: createEnhancedTickets,
    resetForm: resetEnhancedForm,
  } = useEnhancedTicketCreation(onTicketCreated);

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBasicTickets();
  };

  const handleEnhancedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEnhancedTickets();
  };

  const handleResetAndCreateNew = () => {
    resetEnhancedForm();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Event Tickets</h1>
        <p className="text-gray-600 mt-1">Set up tickets for your soccer event</p>
      </div>

      {/* Mode Selection - hide when completed */}
      {!isEnhancedCompleted && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Creation Mode</h3>
                <div className="flex space-x-3">
                  <Button
                    variant={useEnhancedMode ? "default" : "outline"}
                    onClick={() => setUseEnhancedMode(true)}
                    className="flex items-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Enhanced Soccer Mode</span>
                    <Badge variant="secondary" className="ml-2">Recommended</Badge>
                  </Button>
                  <Button
                    variant={!useEnhancedMode ? "default" : "outline"}
                    onClick={() => setUseEnhancedMode(false)}
                    className="flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Basic Mode</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {useEnhancedMode ? (
                <div>
                  <h4 className="font-medium text-green-800 mb-1">Enhanced Soccer Mode</h4>
                  <p className="text-sm text-green-700">
                    Create professional soccer tickets with team matchups, pricing tiers, venue details, and scheduled events.
                    Perfect for tournaments, league matches, and professional events.
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Basic Mode</h4>
                  <p className="text-sm text-blue-700">
                    Simple ticket creation for general events. Quick setup with basic information only.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Content */}
      {useEnhancedMode ? (
        <EnhancedTicketCreationForm
          formData={enhancedFormData}
          isCreating={isEnhancedCreating}
          isCompleted={isEnhancedCompleted}
          onInputChange={handleEnhancedInputChange}
          onSubmit={handleEnhancedSubmit}
          onReset={handleResetAndCreateNew}
          onNavigateToTickets={onNavigateToTickets}
        />
      ) : (
        <TicketCreationForm
          formData={basicFormData}
          isCreating={isBasicCreating}
          onInputChange={handleBasicInputChange}
          onSubmit={handleBasicSubmit}
        />
      )}
    </div>
  );
};
