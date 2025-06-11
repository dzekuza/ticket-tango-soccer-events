
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin } from 'lucide-react';
import { EnhancedTicketFormData } from '@/types/ticket';

interface EnhancedTicketCreationFormProps {
  formData: EnhancedTicketFormData;
  isCreating: boolean;
  onInputChange: (field: keyof EnhancedTicketFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EnhancedTicketCreationForm: React.FC<EnhancedTicketCreationFormProps> = ({
  formData,
  isCreating,
  onInputChange,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const addTier = () => {
    const newTier = {
      tierName: '',
      tierPrice: '',
      tierQuantity: '',
      tierDescription: '',
    };
    onInputChange('tiers', [...formData.tiers, newTier]);
  };

  const removeTier = (index: number) => {
    const updatedTiers = formData.tiers.filter((_, i) => i !== index);
    onInputChange('tiers', updatedTiers);
  };

  const updateTier = (index: number, field: string, value: string) => {
    const updatedTiers = formData.tiers.map((tier, i) =>
      i === index ? { ...tier, [field]: value } : tier
    );
    onInputChange('tiers', updatedTiers);
  };

  const getTotalTickets = () => {
    return formData.tiers.reduce((sum, tier) => sum + (parseInt(tier.tierQuantity) || 0), 0);
  };

  const getTotalRevenue = () => {
    return formData.tiers.reduce((sum, tier) => 
      sum + ((parseFloat(tier.tierPrice) || 0) * (parseInt(tier.tierQuantity) || 0)), 0
    );
  };

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

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Users className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h3 className="text-xl font-semibold">Basic Event Information</h3>
        <p className="text-gray-600">Set up the teams and venue details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="homeTeam">Home Team *</Label>
          <Input
            id="homeTeam"
            value={formData.homeTeam}
            onChange={(e) => onInputChange('homeTeam', e.target.value)}
            placeholder="e.g., Manchester United"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="awayTeam">Away Team *</Label>
          <Input
            id="awayTeam"
            value={formData.awayTeam}
            onChange={(e) => onInputChange('awayTeam', e.target.value)}
            placeholder="e.g., Liverpool"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="competition">Competition</Label>
          <Input
            id="competition"
            value={formData.competition}
            onChange={(e) => onInputChange('competition', e.target.value)}
            placeholder="e.g., Premier League"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stadiumName">Stadium Name *</Label>
          <Input
            id="stadiumName"
            value={formData.stadiumName}
            onChange={(e) => onInputChange('stadiumName', e.target.value)}
            placeholder="e.g., Old Trafford"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 text-green-600 mx-auto mb-2" />
        <h3 className="text-xl font-semibold">Event Schedule</h3>
        <p className="text-gray-600">When will the match take place?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="eventDate">Event Date *</Label>
          <Input
            id="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={(e) => onInputChange('eventDate', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="eventStartTime">Start Time *</Label>
          <Input
            id="eventStartTime"
            type="time"
            value={formData.eventStartTime}
            onChange={(e) => onInputChange('eventStartTime', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="eventEndTime">End Time *</Label>
          <Input
            id="eventEndTime"
            type="time"
            value={formData.eventEndTime}
            onChange={(e) => onInputChange('eventEndTime', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Additional Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Any additional details about the event..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="w-12 h-12 text-purple-600 mx-auto mb-2" />
        <h3 className="text-xl font-semibold">Pricing Tiers</h3>
        <p className="text-gray-600">Set up different ticket categories and prices</p>
      </div>

      <div className="space-y-4">
        {formData.tiers.map((tier, index) => (
          <Card key={index} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Tier {index + 1}</CardTitle>
                {formData.tiers.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTier(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Tier Name *</Label>
                  <Input
                    value={tier.tierName}
                    onChange={(e) => updateTier(index, 'tierName', e.target.value)}
                    placeholder="e.g., VIP, Premium, Standard"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Price per Ticket *</Label>
                  <Input
                    type="number"
                    value={tier.tierPrice}
                    onChange={(e) => updateTier(index, 'tierPrice', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    value={tier.tierQuantity}
                    onChange={(e) => updateTier(index, 'tierQuantity', e.target.value)}
                    placeholder="0"
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input
                  value={tier.tierDescription}
                  onChange={(e) => updateTier(index, 'tierDescription', e.target.value)}
                  placeholder="Optional description for this tier"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addTier}
        className="w-full border-dashed border-2"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Another Tier
      </Button>

      {formData.tiers.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{getTotalTickets()}</p>
                <p className="text-sm text-gray-600">Total Tickets</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">${getTotalRevenue().toFixed(2)}</p>
                <p className="text-sm text-gray-600">Potential Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep4 = () => (
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Create Soccer Event Tickets</CardTitle>
            <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
          </div>
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
        </div>
      </CardHeader>
      
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
