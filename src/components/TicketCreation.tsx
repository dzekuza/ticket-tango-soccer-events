
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket as TicketIcon } from 'lucide-react';
import { Ticket, IndividualTicket } from './Dashboard';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface TicketCreationProps {
  onTicketCreated: (ticket: Ticket) => void;
}

export const TicketCreation: React.FC<TicketCreationProps> = ({ onTicketCreated }) => {
  const [formData, setFormData] = useState({
    eventTitle: '',
    description: '',
    price: '',
    quantity: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const generateQRCodeImage = async (ticketData: any): Promise<string> => {
    try {
      // Create structured ticket data with security features
      const qrData = {
        ticketId: ticketData.id,
        eventTitle: ticketData.eventTitle,
        price: ticketData.price,
        timestamp: Date.now(),
        checksum: btoa(`${ticketData.id}_${ticketData.eventTitle}_${Date.now()}`).slice(0, 8)
      };
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.eventTitle || !formData.price || !formData.quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const quantity = parseInt(formData.quantity);
      const price = parseFloat(formData.price);
      
      const batchId = `batch_${Date.now()}`;
      const individualTickets: IndividualTicket[] = [];

      // Generate individual tickets with QR codes
      for (let i = 0; i < quantity; i++) {
        const ticketId = `${batchId}_ticket_${i + 1}`;
        const ticketData = {
          id: ticketId,
          eventTitle: formData.eventTitle,
          price: price,
        };
        
        // Generate QR code image
        const qrCodeImage = await generateQRCodeImage(ticketData);
        
        individualTickets.push({
          id: ticketId,
          qrCode: JSON.stringify({
            ticketId,
            eventTitle: formData.eventTitle,
            price,
            timestamp: Date.now(),
            checksum: btoa(`${ticketId}_${formData.eventTitle}_${Date.now()}`).slice(0, 8)
          }),
          qrCodeImage: qrCodeImage,
          eventTitle: formData.eventTitle,
          price: price,
          isUsed: false,
        });
      }

      const newTicket: Ticket = {
        id: batchId,
        eventTitle: formData.eventTitle,
        description: formData.description,
        price: price,
        quantity: quantity,
        createdAt: new Date(),
        tickets: individualTickets,
      };

      onTicketCreated(newTicket);
      
      toast({
        title: "Success!",
        description: `Created ${quantity} tickets for ${formData.eventTitle}`,
      });

      // Reset form
      setFormData({
        eventTitle: '',
        description: '',
        price: '',
        quantity: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Event Tickets</h1>
        <p className="text-gray-600 mt-1">Set up tickets for your soccer event</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TicketIcon className="w-5 h-5 text-green-600" />
            <span>Event Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Event Title *</Label>
              <Input
                id="eventTitle"
                type="text"
                placeholder="e.g., Chelsea vs Arsenal - Premier League"
                value={formData.eventTitle}
                onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter event description, venue, date, and other details..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
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
                  onChange={(e) => handleInputChange('price', e.target.value)}
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
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
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
    </div>
  );
};
