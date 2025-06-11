
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
  const [isCompleted, setIsCompleted] = useState(false);
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
    setIsCompleted(false);
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
      
      console.log('Starting enhanced ticket creation with data:', {
        eventTitle,
        totalTiers: formData.tiers.length,
        tiers: formData.tiers.map(t => ({ name: t.tierName, quantity: t.tierQuantity, price: t.tierPrice }))
      });
      
      // Prepare tiers data
      const tiers = formData.tiers.map(tier => ({
        tier_name: tier.tierName,
        tier_price: parseFloat(tier.tierPrice),
        tier_quantity: parseInt(tier.tierQuantity),
        tier_description: tier.tierDescription || null,
      }));

      // Generate individual tickets for each tier with proper unique IDs
      const individualTickets: IndividualTicket[] = [];
      const individualTicketsForSupabase = [];

      let globalTicketCounter = 1;
      
      for (const [tierIndex, tier] of tiers.entries()) {
        console.log(`Creating ${tier.tier_quantity} tickets for tier ${tierIndex + 1}: ${tier.tier_name}`);
        
        for (let i = 0; i < tier.tier_quantity; i++) {
          const ticketId = `${batchId}_ticket_${globalTicketCounter.toString().padStart(4, '0')}`;
          
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
            ticketNumber: globalTicketCounter,
            tierIndex: tierIndex,
          };
          
          console.log(`Generating QR code for ticket ${globalTicketCounter}`);
          
          // Generate unique QR code image for each ticket
          const qrCodeImage = await generateQRCodeImage(ticketData);
          
          const qrCodeData = {
            ...ticketData,
            timestamp: Date.now(),
            checksum: btoa(`${ticketId}_${eventTitle}_${Date.now()}`).slice(0, 8)
          };

          const individualTicket = {
            id: ticketId,
            qrCode: JSON.stringify(qrCodeData),
            qrCodeImage: qrCodeImage,
            eventTitle,
            price: tier.tier_price,
            isUsed: false,
            tierName: tier.tier_name,
            ticketNumber: globalTicketCounter,
          };

          individualTickets.push(individualTicket);
          
          individualTicketsForSupabase.push({
            ...individualTicket,
            tierId: `tier_${tierIndex}`, // Will be replaced with actual tier ID
            seatSection: null,
            seatRow: null,
            seatNumber: globalTicketCounter.toString(),
          });

          globalTicketCounter++;
        }
      }

      console.log(`Generated ${individualTickets.length} individual tickets`);

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
      console.log('Creating ticket batch in database...');
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
          // Enhanced fields
          eventDate: formData.eventDate,
          eventStartTime: formData.eventStartTime,
          eventEndTime: formData.eventEndTime,
          homeTeam: formData.homeTeam,
          awayTeam: formData.awayTeam,
          stadiumName: formData.stadiumName,
          competition: formData.competition,
        };

        onTicketCreated(newTicket);
        setIsCompleted(true);
        
        toast({
          title: "Success!",
          description: `Created ${totalQuantity} tickets for ${eventTitle}. PDF generation in progress...`,
        });

      } else {
        throw new Error('Failed to create ticket batch');
      }
    } catch (error) {
      console.error('Enhanced ticket creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return {
    formData,
    isCreating,
    isCompleted,
    handleInputChange,
    createTickets,
    resetForm,
  };
};
