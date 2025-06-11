
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
  // New soccer-specific fields
  event_date?: string;
  event_start_time?: string;
  event_end_time?: string;
  home_team?: string;
  away_team?: string;
  stadium_name?: string;
  competition?: string;
  individual_tickets: SupabaseIndividualTicket[];
  ticket_tiers?: SupabaseTicketTier[];
}

export interface SupabaseTicketTier {
  id: string;
  tier_name: string;
  tier_price: number;
  tier_quantity: number;
  tier_description?: string;
}

export interface SupabaseIndividualTicket {
  id: string;
  qr_code: string;
  qr_code_image?: string;
  is_used: boolean;
  validated_at?: string;
  tier_id?: string;
  seat_section?: string;
  seat_row?: string;
  seat_number?: string;
}

export const useTicketData = () => {
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
          individual_tickets (*),
          ticket_tiers (*)
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

  useEffect(() => {
    fetchTickets();
  }, [user]);

  return {
    tickets,
    loading,
    fetchTickets,
    setTickets,
  };
};
