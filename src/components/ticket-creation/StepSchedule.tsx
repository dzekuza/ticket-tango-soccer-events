
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { EnhancedTicketFormData } from '@/types/ticket';

interface StepScheduleProps {
  formData: EnhancedTicketFormData;
  onInputChange: (field: keyof EnhancedTicketFormData, value: any) => void;
}

export const StepSchedule: React.FC<StepScheduleProps> = ({
  formData,
  onInputChange,
}) => {
  return (
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
};
