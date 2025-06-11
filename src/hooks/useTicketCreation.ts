
import { useState } from 'react';
import { Ticket, IndividualTicket } from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';
import { generateQRCodeImage } from '@/utils/qrCodeGenerator';

interface TicketFormData {
  eventTitle: string;
  description: string;
  price: string;
  quantity: string;
}

export const useTicketCreation = (onTicketCreated: (ticket: Ticket) => void) => {
  const [formData, setFormData] = useState<TicketFormData>({
    eventTitle: '',
    description: '',
    price: '',
    quantity: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      eventTitle: '',
      description: '',
      price: '',
      quantity: '',
    });
  };

  const validateForm = (): boolean => {
    if (!formData.eventTitle || !formData.price || !formData.quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const createTickets = async (): Promise<void> => {
    if (!validateForm()) return;

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

      resetForm();
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

  return {
    formData,
    isCreating,
    handleInputChange,
    createTickets,
  };
};
