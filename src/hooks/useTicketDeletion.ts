
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useTicketDeletion = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const deleteTicket = async (ticketId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete tickets",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('Starting ticket deletion process for ticket:', ticketId);

      // First, delete individual tickets
      const { error: individualTicketsError } = await supabase
        .from('individual_tickets')
        .delete()
        .eq('ticket_batch_id', ticketId);

      if (individualTicketsError) {
        console.error('Error deleting individual tickets:', individualTicketsError);
        throw new Error(`Failed to delete individual tickets: ${individualTicketsError.message}`);
      }

      // Then, delete ticket tiers
      const { error: tiersError } = await supabase
        .from('ticket_tiers')
        .delete()
        .eq('ticket_batch_id', ticketId);

      if (tiersError) {
        console.error('Error deleting ticket tiers:', tiersError);
        throw new Error(`Failed to delete ticket tiers: ${tiersError.message}`);
      }

      // Finally, delete the main ticket batch
      const { error: ticketError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId)
        .eq('user_id', user.id);

      if (ticketError) {
        console.error('Error deleting ticket batch:', ticketError);
        throw new Error(`Failed to delete ticket: ${ticketError.message}`);
      }

      console.log('✅ Ticket deleted successfully');
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error in deleteTicket:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete ticket",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    deleteTicket,
  };
};
