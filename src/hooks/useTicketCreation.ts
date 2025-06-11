
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useTicketBatchCreation } from './useTicketBatchCreation';
import { useTicketTierCreation } from './useTicketTierCreation';
import { useIndividualTicketInsertion } from './useIndividualTicketInsertion';
import { useTicketPDFOperations } from './useTicketPDFOperations';

export const useTicketCreation = (refetchTickets: () => Promise<void>) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createTicketBatchRecord, createBasicTicketBatchRecord } = useTicketBatchCreation();
  const { createTicketTiers } = useTicketTierCreation();
  const { insertIndividualTickets, insertBasicIndividualTickets } = useIndividualTicketInsertion();
  const { generateAndUpdatePDF, generateBasicTicketPDF } = useTicketPDFOperations();

  const createEnhancedTicketBatch = async (
    eventData: any,
    tiers: any[],
    individualTickets: any[]
  ) => {
    if (!user) return null;

    console.log('Creating enhanced ticket batch with data:', { 
      eventData, 
      tiers, 
      individualTicketsCount: individualTickets.length 
    });

    try {
      // Create ticket batch
      const ticketBatch = await createTicketBatchRecord(eventData, tiers);
      if (!ticketBatch) throw new Error('Failed to create ticket batch');

      // Create ticket tiers
      const { tierIdMapping } = await createTicketTiers(ticketBatch.id, tiers);

      // Create individual tickets
      const insertedIndividualTickets = await insertIndividualTickets(
        ticketBatch.id,
        individualTickets,
        tierIdMapping
      );

      // Generate and update PDF
      await generateAndUpdatePDF(ticketBatch, eventData, individualTickets, insertedIndividualTickets);

      await refetchTickets();
      return ticketBatch;
      
    } catch (error) {
      console.error('Error creating enhanced ticket batch:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tickets",
        variant: "destructive",
      });
      return null;
    }
  };

  const createTicketBatch = async (
    eventTitle: string,
    description: string,
    price: number,
    quantity: number,
    individualTickets: any[]
  ) => {
    if (!user) return null;

    console.log('Creating ticket batch with data:', { eventTitle, description, price, quantity, individualTicketsCount: individualTickets.length });

    try {
      // Create ticket batch
      const ticketBatch = await createBasicTicketBatchRecord(eventTitle, description, price, quantity);
      if (!ticketBatch) throw new Error('Failed to create ticket batch');

      // Create individual tickets
      await insertBasicIndividualTickets(ticketBatch.id, individualTickets);

      // Generate and upload PDF
      await generateBasicTicketPDF(ticketBatch, eventTitle, description, price, quantity, individualTickets);

      await refetchTickets();
      return ticketBatch;
    } catch (error) {
      console.error('Error creating ticket batch:', error);
      toast({
        title: "Error",
        description: "Failed to create tickets",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    createTicketBatch,
    createEnhancedTicketBatch,
  };
};
