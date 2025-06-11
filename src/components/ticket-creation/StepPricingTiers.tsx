
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { EnhancedTicketFormData } from '@/types/ticket';

interface StepPricingTiersProps {
  formData: EnhancedTicketFormData;
  onInputChange: (field: keyof EnhancedTicketFormData, value: any) => void;
}

export const StepPricingTiers: React.FC<StepPricingTiersProps> = ({
  formData,
  onInputChange,
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

  return (
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
};
