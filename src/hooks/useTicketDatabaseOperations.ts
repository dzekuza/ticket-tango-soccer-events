
import { useSupabaseTickets } from './useSupabaseTickets';
import { PreparedEventData, PreparedTierData } from '@/utils/ticketDataPreparation';

export const useTicketDatabaseOperations = () => {
  const { createEnhancedTicketBatch } = useSupabaseTickets();

  const createTicketBatchInDatabase = async (
    eventData: PreparedEventData,
    tiers: PreparedTierData[],
    individualTicketsForSupabase: any[]
  ) => {
    console.log('Creating ticket batch in database...');
    
    const result = await createEnhancedTicketBatch(
      eventData,
      tiers,
      individualTicketsForSupabase
    );

    if (!result) {
      throw new Error('Failed to create ticket batch');
    }

    return result;
  };

  return {
    createTicketBatchInDatabase,
  };
};
