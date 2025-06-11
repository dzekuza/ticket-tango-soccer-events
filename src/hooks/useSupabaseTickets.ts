
import { useTicketData } from './useTicketData';
import { useTicketCreation } from './useTicketCreation';
import { useTicketValidation } from './useTicketValidation';
import { useTicketPDF } from './useTicketPDF';

export * from './useTicketData';

export const useSupabaseTickets = () => {
  const { tickets, loading, fetchTickets, setTickets } = useTicketData();
  const { createTicketBatch, createEnhancedTicketBatch } = useTicketCreation(fetchTickets);
  const { validateTicket } = useTicketValidation(fetchTickets);
  const { regeneratePDF } = useTicketPDF(tickets, fetchTickets);

  return {
    tickets,
    loading,
    createTicketBatch,
    createEnhancedTicketBatch,
    validateTicket,
    regeneratePDF,
    refetch: fetchTickets,
  };
};
