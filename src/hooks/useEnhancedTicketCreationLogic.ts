
import { useState } from 'react';
import { Ticket, IndividualTicket } from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';
import { EnhancedTicketFormData } from '@/types/ticket';
import { useTicketDatabaseOperations } from './useTicketDatabaseOperations';
import { 
  prepareTiersData, 
  prepareEventData, 
  generateIndividualTickets 
} from '@/utils/ticketDataPreparation';

export const useEnhancedTicketCreationLogic = (onTicketCreated: (ticket: Ticket) => void) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { createTicketBatchInDatabase } = useTicketDatabaseOperations();

  const createTickets = async (formData: EnhancedTicketFormData): Promise<void> => {
    setIsCreating(true);

    try {
      const batchId = `batch_${Date.now()}`;
      const eventTitle = `${formData.homeTeam} vs ${formData.awayTeam}`;
      
      console.log('Starting enhanced ticket creation with data:', {
        eventTitle,
        totalTiers: formData.tiers.length,
        tiers: formData.tiers.map(t => ({ name: t.tierName, quantity: t.tierQuantity, price: t.tierPrice }))
      });
      
      // Prepare data for database operations
      const tiers = prepareTiersData(formData);
      const eventData = prepareEventData(formData);

      // Generate individual tickets with QR codes
      const { individualTickets, individualTicketsForSupabase } = await generateIndividualTickets(
        formData,
        tiers,
        batchId
      );

      // Create ticket batch in database
      const result = await createTicketBatchInDatabase(
        eventData,
        tiers,
        individualTicketsForSupabase
      );

      // Calculate totals and create ticket object
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
      
      toast({
        title: "Success!",
        description: `Created ${totalQuantity} tickets for ${eventTitle}. PDF generation in progress...`,
      });

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
    isCreating,
    createTickets,
  };
};
