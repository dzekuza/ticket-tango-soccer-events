
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface SupabaseTicket {
  id: string;
  event_title: string;
  description: string;
  price: number;
  quantity: number;
  pdf_url?: string;
  created_at: string;
  individual_tickets: SupabaseIndividualTicket[];
}

export interface SupabaseIndividualTicket {
  id: string;
  qr_code: string;
  qr_code_image?: string;
  is_used: boolean;
  validated_at?: string;
}

export const useSupabaseTickets = () => {
  const [tickets, setTickets] = useState<SupabaseTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          individual_tickets (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

    try {
      // Create ticket batch
      const { data: ticketBatch, error: batchError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          event_title: eventTitle,
          description,
          price,
          quantity,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Create individual tickets
      const ticketsToInsert = individualTickets.map(ticket => ({
        ticket_batch_id: ticketBatch.id,
        qr_code: ticket.qrCode,
        qr_code_image: ticket.qrCodeImage,
      }));

      const { error: ticketsError } = await supabase
        .from('individual_tickets')
        .insert(ticketsToInsert);

      if (ticketsError) throw ticketsError;

      await fetchTickets();
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
      await fetchTickets();
    } catch (error) {
      console.error('Error validating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to validate ticket",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  return {
    tickets,
    loading,
    createTicketBatch,
    validateTicket,
    refetch: fetchTickets,
  };
};
