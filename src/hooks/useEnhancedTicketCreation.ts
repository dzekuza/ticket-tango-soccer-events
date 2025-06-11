
import { useState } from 'react';
import { Ticket, IndividualTicket } from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';
import { generateQRCodeImage } from '@/utils/qrCodeGenerator';
import { useSupabaseTickets } from './useSupabaseTickets';
import { EnhancedTicketFormData } from '@/types/ticket';

export const useEnhancedTicketCreation = (onTicketCreated: (ticket: Ticket) => void) => {
  const [formData, setFormData] = useState<EnhancedTicketFormData>({
    homeTeam: '',
    awayTeam: '',
    competition: '',
    stadiumName: '',
    eventDate: '',
    eventStartTime: '',
    eventEndTime: '',
    description: '',
    tiers: [
      {
        tierName: 'Standard',
        tierPrice: '',
        tierQuantity: '',
        tierDescription: '',
      },
    ],
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { createEnhancedTicketBatch } = useSupabaseTickets();

  const handleInputChange = (field: keyof EnhancedTicketFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      homeTeam: '',
      awayTeam: '',
      competition: '',
      stadiumName: '',
      eventDate: '',
      eventStartTime: '',
      eventEndTime: '',
      description: '',
      tiers: [
        {
          tierName: 'Standard',
          tierPrice: '',
          tierQuantity: '',
          tierDescription: '',
        },
      ],
    });
  };

  const validateForm = (): boolean => {
    if (!formData.homeTeam || !formData.awayTeam || !formData.stadiumName) {
      toast({
        title: "Error",
        description: "Please fill in all required team and venue fields",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.eventDate || !formData.eventStartTime || !formData.eventEndTime) {
      toast({
        title: "Error",
        description: "Please fill in all required date and time fields",
        variant: "destructive",
      });
      return false;
    }

    if (formData.tiers.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one pricing tier",
        variant: "destructive",
      });
      return false;
    }

    for (const tier of formData.tiers) {
      if (!tier.tierName || !tier.tierPrice || !tier.tierQuantity) {
        toast({
          title: "Error",
          description: "Please fill in all required tier fields",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const createTickets = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsCreating(true);

    try {
      const batchId = `batch_${Date.now()}`;
      const eventTitle = `${formData.homeTeam} vs ${formData.awayTeam}`;
      
      // Prepare tiers data
      const tiers = formData.tiers.map(tier => ({
        tier_name: tier.tierName,
        tier_price: parseFloat(tier.tierPrice),
        tier_quantity: parseInt(tier.tierQuantity),
        tier_description: tier.tierDescription || null,
      }));

      // Generate individual tickets for each tier
      const individualTickets: IndividualTicket[] = [];
      const individualTicketsForSupabase = [];

      let ticketCounter = 1;
      
      for (const [tierIndex, tier] of tiers.entries()) {
        for (let i = 0; i < tier.tier_quantity; i++) {
          const ticketId = `${batchId}_ticket_${ticketCounter}`;
          const ticketData = {
            id: ticketId,
            eventTitle,
            homeTeam: formData.homeTeam,
            awayTeam: formData.awayTeam,
            stadiumName: formData.stadiumName,
            eventDate: formData.eventDate,
            eventStartTime: formData.eventStartTime,
            tierName: tier.tier_name,
            price: tier.tier_price,
          };
          
          // Generate QR code image
          const qrCodeImage = await generateQRCodeImage(ticketData);
          
          const individualTicket = {
            id: ticketId,
            qrCode: JSON.stringify({
              ...ticketData,
              timestamp: Date.now(),
              checksum: btoa(`${ticketId}_${eventTitle}_${Date.now()}`).slice(0, 8)
            }),
            qrCodeImage: qrCodeImage,
            eventTitle,
            price: tier.tier_price,
            isUsed: false,
          };

          individualTickets.push(individualTicket);
          
          individualTicketsForSupabase.push({
            ...individualTicket,
            tierId: `tier_${tierIndex}`, // This will be replaced with actual tier ID after creation
            seatSection: null,
            seatRow: null,
            seatNumber: null,
          });

          ticketCounter++;
        }
      }

      const eventData = {
        eventTitle,
        description: formData.description,
        eventDate: formData.eventDate,
        eventStartTime: formData.eventStartTime,
        eventEndTime: formData.eventEndTime,
        homeTeam: formData.homeTeam,
        awayTeam: formData.awayTeam,
        stadiumName: formData.stadiumName,
        competition: formData.competition,
      };

      // Create enhanced ticket batch
      const result = await createEnhancedTicketBatch(
        eventData,
        tiers,
        individualTicketsForSupabase
      );

      if (result) {
        const totalQuantity = tiers.reduce((sum, tier) => sum + tier.tier_quantity, 0);
        const avgPrice = tiers.reduce((sum, tier) => sum + (tier.tier_price * tier.tier_quantity), 0) / totalQuantity;

        const newTicket: Ticket = {
          id: result.id,
          eventTitle,
          description: formData.description,
          price: avgPrice,
          quantity: totalQuantity,
          createdAt: new Date(),
          tickets: individualTickets,
        };

        onTicketCreated(newTicket);
        
        toast({
          title: "Success!",
          description: `Created ${totalQuantity} tickets for ${eventTitle}`,
        });

        resetForm();
      }
    } catch (error) {
      console.error('Enhanced ticket creation error:', error);
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
