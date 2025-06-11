
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { EnhancedTicketFormData } from '@/types/ticket';

interface StepBasicInfoProps {
  formData: EnhancedTicketFormData;
  onInputChange: (field: keyof EnhancedTicketFormData, value: any) => void;
}

export const StepBasicInfo: React.FC<StepBasicInfoProps> = ({
  formData,
  onInputChange,
}) => {
  return (
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
};
