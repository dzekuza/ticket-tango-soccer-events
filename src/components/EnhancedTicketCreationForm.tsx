import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, CheckCircle, ArrowRight } from 'lucide-react';
import { EnhancedTicketFormData } from '@/types/ticket';
import { TicketCreationProgress } from './TicketCreationProgress';
import { TicketProgress } from '@/types/ticketCreation';

interface EnhancedTicketCreationFormProps {
  formData: EnhancedTicketFormData;
  isCreating: boolean;
  isCompleted: boolean;
  progress?: TicketProgress;
  onInputChange: (field: keyof EnhancedTicketFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onCancel?: () => void;
  onNavigateToTickets?: () => void;
}

export const EnhancedTicketCreationForm: React.FC<EnhancedTicketCreationFormProps> = ({
  formData,
  isCreating,
  isCompleted,
  progress,
  onInputChange,
  onSubmit,
  onReset,
  onCancel,
  onNavigateToTickets,
}) => {
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
    if (formData.tiers.length > 1) {
      const newTiers = formData.tiers.filter((_, i) => i !== index);
      onInputChange('tiers', newTiers);
    }
  };

  const updateTier = (index: number, field: string, value: string) => {
    const newTiers = [...formData.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    onInputChange('tiers', newTiers);
  };

  // Show completion state
  if (isCompleted && progress?.status === 'completed') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Tickets Created Successfully!
              </h2>
              <p className="text-gray-600">
                Created {progress.current} tickets for {formData.homeTeam} vs {formData.awayTeam}
              </p>
            </div>
            
            <div className="flex justify-center space-x-3 pt-4">
              <Button onClick={onReset} variant="outline">
                Create More Tickets
              </Button>
              {onNavigateToTickets && (
                <Button onClick={onNavigateToTickets} className="flex items-center space-x-2">
                  <span>View Tickets</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Step 1: Basic Event Info */}
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homeTeam">Home Team *</Label>
                <Input
                  id="homeTeam"
                  value={formData.homeTeam}
                  onChange={(e) => onInputChange('homeTeam', e.target.value)}
                  placeholder="e.g., Barcelona"
                  disabled={isCreating}
                  required
                />
              </div>
              <div>
                <Label htmlFor="awayTeam">Away Team *</Label>
                <Input
                  id="awayTeam"
                  value={formData.awayTeam}
                  onChange={(e) => onInputChange('awayTeam', e.target.value)}
                  placeholder="e.g., Real Madrid"
                  disabled={isCreating}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="competition">Competition *</Label>
                <Input
                  id="competition"
                  value={formData.competition}
                  onChange={(e) => onInputChange('competition', e.target.value)}
                  placeholder="e.g., UEFA Champions League"
                  disabled={isCreating}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stadiumName">Stadium *</Label>
                <Input
                  id="stadiumName"
                  value={formData.stadiumName}
                  onChange={(e) => onInputChange('stadiumName', e.target.value)}
                  placeholder="e.g., Camp Nou"
                  disabled={isCreating}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Event Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onInputChange('description', e.target.value)}
                placeholder="Describe the event (optional)"
                disabled={isCreating}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Event Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Event Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => onInputChange('eventDate', e.target.value)}
                  disabled={isCreating}
                  required
                />
              </div>
              <div>
                <Label htmlFor="eventStartTime">Start Time *</Label>
                <Input
                  id="eventStartTime"
                  type="time"
                  value={formData.eventStartTime}
                  onChange={(e) => onInputChange('eventStartTime', e.target.value)}
                  disabled={isCreating}
                  required
                />
              </div>
              <div>
                <Label htmlFor="eventEndTime">End Time *</Label>
                <Input
                  id="eventEndTime"
                  type="time"
                  value={formData.eventEndTime}
                  onChange={(e) => onInputChange('eventEndTime', e.target.value)}
                  disabled={isCreating}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Pricing Tiers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pricing Tiers
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTier}
                disabled={isCreating}
                className="flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tier</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.tiers.map((tier, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Tier {index + 1}</h4>
                  {formData.tiers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTier(index)}
                      disabled={isCreating}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`tierName-${index}`}>Tier Name *</Label>
                    <Input
                      id={`tierName-${index}`}
                      value={tier.tierName}
                      onChange={(e) => updateTier(index, 'tierName', e.target.value)}
                      placeholder="e.g., VIP, Standard, Premium"
                      disabled={isCreating}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`tierPrice-${index}`}>Price per Ticket *</Label>
                    <Input
                      id={`tierPrice-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={tier.tierPrice}
                      onChange={(e) => updateTier(index, 'tierPrice', e.target.value)}
                      placeholder="0.00"
                      disabled={isCreating}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`tierQuantity-${index}`}>Quantity *</Label>
                    <Input
                      id={`tierQuantity-${index}`}
                      type="number"
                      min="1"
                      value={tier.tierQuantity}
                      onChange={(e) => updateTier(index, 'tierQuantity', e.target.value)}
                      placeholder="1"
                      disabled={isCreating}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`tierDescription-${index}`}>Description</Label>
                  <Textarea
                    id={`tierDescription-${index}`}
                    value={tier.tierDescription}
                    onChange={(e) => updateTier(index, 'tierDescription', e.target.value)}
                    placeholder="Tier description (optional)"
                    disabled={isCreating}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        {!isCreating && (
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="px-8">
              Create Tickets
            </Button>
          </div>
        )}
      </form>

      {/* Progress Component */}
      {progress && (
        <TicketCreationProgress
          progress={progress}
          onCancel={onCancel}
          onComplete={onReset}
          showCancelButton={isCreating}
        />
      )}
    </div>
  );
};
