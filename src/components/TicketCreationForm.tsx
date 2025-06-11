
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket as TicketIcon } from 'lucide-react';

interface TicketCreationFormProps {
  formData: {
    eventTitle: string;
    description: string;
    price: string;
    quantity: string;
  };
  isCreating: boolean;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TicketCreationForm: React.FC<TicketCreationFormProps> = ({
  formData,
  isCreating,
  onInputChange,
  onSubmit,
}) => {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TicketIcon className="w-5 h-5 text-green-600" />
          <span>Event Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="eventTitle">Event Title *</Label>
            <Input
              id="eventTitle"
              type="text"
              placeholder="e.g., Chelsea vs Arsenal - Premier League"
              value={formData.eventTitle}
              onChange={(e) => onInputChange('eventTitle', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter event description, venue, date, and other details..."
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Ticket ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => onInputChange('price', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) => onInputChange('quantity', e.target.value)}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isCreating}
          >
            {isCreating ? 'Creating Tickets...' : 'Create Tickets'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
