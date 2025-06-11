
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { EnhancedTicketFormData } from '@/types/ticket';

interface StepReviewProps {
  formData: EnhancedTicketFormData;
}

export const StepReview: React.FC<StepReviewProps> = ({ formData }) => {
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
        <Clock className="w-12 h-12 text-orange-600 mx-auto mb-2" />
        <h3 className="text-xl font-semibold">Review & Generate</h3>
        <p className="text-gray-600">Review your event details before generating tickets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {formData.homeTeam} vs {formData.awayTeam}
          </CardTitle>
          {formData.competition && (
            <Badge variant="secondary" className="w-fit mx-auto">
              {formData.competition}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Date:</strong> {formData.eventDate ? new Date(formData.eventDate).toLocaleDateString() : 'Not set'}
            </div>
            <div>
              <strong>Time:</strong> {formData.eventStartTime} - {formData.eventEndTime}
            </div>
            <div className="md:col-span-2">
              <strong>Stadium:</strong> {formData.stadiumName}
            </div>
            {formData.description && (
              <div className="md:col-span-2">
                <strong>Description:</strong> {formData.description}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Ticket Tiers:</h4>
            {formData.tiers.map((tier, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{tier.tierName}</span>
                <span>{tier.tierQuantity} tickets × ${tier.tierPrice}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center font-semibold">
              <span>Total: {getTotalTickets()} tickets</span>
              <span>Revenue: ${getTotalRevenue().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
