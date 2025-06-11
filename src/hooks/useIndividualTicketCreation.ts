
import { useState } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { EnhancedTicketFormData } from '@/types/ticket';
import { sendTicketCreatedWebhook } from '@/services/webhookService';
import { useTicketProgress } from './useTicketProgress';
import { useTicketBatchOperations } from './useTicketBatchOperations';
import { useIndividualTicketOperations } from './useIndividualTicketOperations';
import { CreatedTicket, TicketCreationResult } from '@/types/ticketCreation';

export const useIndividualTicketCreation = () => {
  const [createdTickets, setCreatedTickets] = useState<CreatedTicket[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    progress,
    setProgressTotal,
    incrementProgress,
    setError,
    setCompleted,
    setCancelled,
    resetProgress,
    isCancelled,
    updateProgress
  } = useTicketProgress();
  
  const { createTicketBatch, createTicketTiers } = useTicketBatchOperations();
  const { createIndividualTicket } = useIndividualTicketOperations();

  const cancelCreation = () => {
    setCancelled();
  };

  const createTicketsIndividually = async (
    formData: EnhancedTicketFormData,
    onTicketCreated?: (ticket: any) => void
  ): Promise<TicketCreationResult> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const batchId = `batch_${Date.now()}`;
    
    // Calculate total tickets
    const totalTickets = formData.tiers.reduce((sum, tier) => sum + parseInt(tier.tierQuantity), 0);

    console.log('Starting individual ticket creation:', {
      eventTitle: `${formData.homeTeam} vs ${formData.awayTeam}`,
      totalTickets,
      tiers: formData.tiers.length
    });

    setProgressTotal(totalTickets);

    try {
      // Create ticket batch first
      const { ticketBatch, eventTitle, avgPrice } = await createTicketBatch(formData);

      // Create ticket tiers
      const insertedTiers = await createTicketTiers(ticketBatch.id, formData);

      // Now create tickets individually
      const createdIndividualTickets: CreatedTicket[] = [];
      const webhookTickets: any[] = [];
      let globalTicketCounter = 1;

      for (const [tierIndex, tierFormData] of formData.tiers.entries()) {
        const tier = insertedTiers[tierIndex];
        const tierQuantity = parseInt(tierFormData.tierQuantity);
        
        console.log(`Creating ${tierQuantity} tickets for tier: ${tier.tier_name}`);
        
        updateProgress({ currentTier: tier.tier_name });

        for (let i = 0; i < tierQuantity; i++) {
          if (isCancelled()) {
            console.log('Ticket creation cancelled by user');
            return { success: false, cancelled: true };
          }

          const result = await createIndividualTicket(
            ticketBatch,
            tier,
            formData,
            eventTitle,
            globalTicketCounter,
            batchId,
            tierIndex
          );

          if (result) {
            const { ticket, webhookData } = result;
            createdIndividualTickets.push(ticket);
            webhookTickets.push(webhookData);
            setCreatedTickets(prev => [...prev, ticket]);
          }

          incrementProgress(tier.tier_name);
          globalTicketCounter++;

          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      console.log(`✅ All ${createdIndividualTickets.length} tickets created successfully`);
      
      setCompleted();

      // Send webhook to n8n with all ticket data
      const totalRevenue = formData.tiers.reduce((sum, tier) => sum + (parseFloat(tier.tierPrice) * parseInt(tier.tierQuantity)), 0);
      
      await sendTicketCreatedWebhook({
        ticketBatch: {
          id: ticketBatch.id,
          eventTitle,
          description: formData.description,
          price: avgPrice,
          quantity: totalTickets,
          eventDate: formData.eventDate,
          eventStartTime: formData.eventStartTime,
          eventEndTime: formData.eventEndTime,
          homeTeam: formData.homeTeam,
          awayTeam: formData.awayTeam,
          stadiumName: formData.stadiumName,
          competition: formData.competition,
          createdAt: ticketBatch.created_at,
        },
        tickets: webhookTickets,
        tiers: insertedTiers.map(tier => ({
          id: tier.id,
          tierName: tier.tier_name,
          tierPrice: tier.tier_price,
          tierQuantity: tier.tier_quantity,
          tierDescription: tier.tier_description,
        })),
        totalRevenue,
        timestamp: new Date().toISOString(),
      });

      // Call the callback to update the main ticket list
      if (onTicketCreated) {
        const completeTicket = {
          id: ticketBatch.id,
          eventTitle,
          description: formData.description,
          price: avgPrice,
          quantity: totalTickets,
          createdAt: new Date(ticketBatch.created_at),
          tickets: createdIndividualTickets.map(ticket => ({
            id: ticket.id,
            qrCode: '',
            qrCodeImage: ticket.qrCodeImage,
            eventTitle,
            price: formData.tiers.find(t => t.tierName === ticket.tierName) ? 
              parseFloat(formData.tiers.find(t => t.tierName === ticket.tierName)!.tierPrice) : 0,
            isUsed: false,
            tierName: ticket.tierName,
            ticketNumber: ticket.ticketNumber,
          })),
          eventDate: formData.eventDate,
          eventStartTime: formData.eventStartTime,
          eventEndTime: formData.eventEndTime,
          homeTeam: formData.homeTeam,
          awayTeam: formData.awayTeam,
          stadiumName: formData.stadiumName,
          competition: formData.competition,
        };
        
        onTicketCreated(completeTicket);
      }

      toast({
        title: "Success!",
        description: `Created ${createdIndividualTickets.length} tickets for ${eventTitle}`,
      });

      return { 
        success: true, 
        ticketBatch, 
        createdTickets: createdIndividualTickets,
        totalCreated: createdIndividualTickets.length 
      };

    } catch (error) {
      console.error('Individual ticket creation error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tickets",
        variant: "destructive",
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const resetCreation = () => {
    resetProgress();
    setCreatedTickets([]);
  };

  return {
    progress,
    createdTickets,
    createTicketsIndividually,
    cancelCreation,
    resetProgress: resetCreation,
  };
};
