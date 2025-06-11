
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useTicketValidation = (refetchTickets: () => Promise<void>) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const validateTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('individual_tickets')
        .update({
          is_used: true,
          validated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (error) throw error;
      await refetchTickets();
    } catch (error) {
      console.error('Error validating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to validate ticket",
        variant: "destructive",
      });
    }
  };

  return {
    validateTicket,
  };
};
