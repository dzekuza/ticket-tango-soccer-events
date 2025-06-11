
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { EnhancedTicketFormData } from '@/types/ticket';

interface CompletionStateProps {
  formData: EnhancedTicketFormData;
  onReset?: () => void;
  onNavigateToTickets?: () => void;
}

export const CompletionState: React.FC<CompletionStateProps> = ({
  formData,
  onReset,
  onNavigateToTickets,
}) => {
  const getTotalTickets = () => {
    return formData.tiers.reduce((sum, tier) => sum + (parseInt(tier.tierQuantity) || 0), 0);
  };

  const getTotalRevenue = () => {
    return formData.tiers.reduce((sum, tier) => 
      sum + ((parseFloat(tier.tierPrice) || 0) * (parseInt(tier.tierQuantity) || 0)), 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-green-800">Tickets Created Successfully!</h3>
        <p className="text-gray-600">Your {getTotalTickets()} tickets have been generated and PDF is being processed</p>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <h4 className="text-lg font-semibold">{formData.homeTeam} vs {formData.awayTeam}</h4>
              <p className="text-gray-600">{formData.stadiumName}</p>
              <p className="text-sm text-gray-500">
                {formData.eventDate} • {formData.eventStartTime} - {formData.eventEndTime}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{getTotalTickets()}</p>
                <p className="text-sm text-gray-600">Tickets Generated</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">${getTotalRevenue().toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        {onNavigateToTickets && (
          <Button onClick={onNavigateToTickets} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <ArrowRight className="w-4 h-4 mr-2" />
            View Tickets & Download PDF
          </Button>
        )}
        {onReset && (
          <Button onClick={onReset} variant="outline" className="flex-1">
            Create New Event
          </Button>
        )}
      </div>
    </div>
  );
};
