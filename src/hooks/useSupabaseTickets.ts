import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { generateAndUploadTicketPDF } from '@/utils/supabasePdfGenerator';

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

  const createEnhancedTicketBatch = async (
    eventData: any,
    tiers: any[],
    individualTickets: any[]
  ) => {
    if (!user) return null;

    try {
      // Create ticket batch with enhanced fields
      const { data: ticketBatch, error: batchError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          event_title: eventData.eventTitle,
          description: eventData.description,
          price: tiers.reduce((sum, tier) => sum + (tier.tier_price * tier.tier_quantity), 0) / tiers.reduce((sum, tier) => sum + tier.tier_quantity, 0), // Average price
          quantity: tiers.reduce((sum, tier) => sum + tier.tier_quantity, 0),
          event_date: eventData.eventDate,
          event_start_time: eventData.eventStartTime,
          event_end_time: eventData.eventEndTime,
          home_team: eventData.homeTeam,
          away_team: eventData.awayTeam,
          stadium_name: eventData.stadiumName,
          competition: eventData.competition,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Create ticket tiers
      const tiersToInsert = tiers.map(tier => ({
        ticket_batch_id: ticketBatch.id,
        tier_name: tier.tier_name,
        tier_price: tier.tier_price,
        tier_quantity: tier.tier_quantity,
        tier_description: tier.tier_description,
      }));

      const { data: insertedTiers, error: tiersError } = await supabase
        .from('ticket_tiers')
        .insert(tiersToInsert)
        .select();

      if (tiersError) throw tiersError;

      // Create individual tickets with tier assignments
      const ticketsToInsert = individualTickets.map(ticket => ({
        ticket_batch_id: ticketBatch.id,
        qr_code: ticket.qrCode,
        qr_code_image: ticket.qrCodeImage,
        tier_id: ticket.tierId,
        seat_section: ticket.seatSection,
        seat_row: ticket.seatRow,
        seat_number: ticket.seatNumber,
      }));

      const { error: ticketsError } = await supabase
        .from('individual_tickets')
        .insert(ticketsToInsert);

      if (ticketsError) throw ticketsError;

      // Generate and upload PDF
      const pdfResult = await generateAndUploadTicketPDF(
        individualTickets,
        {
          id: ticketBatch.id,
          eventTitle: eventData.eventTitle,
          description: eventData.description || '',
          price: ticketBatch.price,
          quantity: ticketBatch.quantity,
          createdAt: new Date(ticketBatch.created_at),
          tickets: individualTickets,
          // Pass enhanced event data
          eventDate: eventData.eventDate,
          eventStartTime: eventData.eventStartTime,
          eventEndTime: eventData.eventEndTime,
          homeTeam: eventData.homeTeam,
          awayTeam: eventData.awayTeam,
          stadiumName: eventData.stadiumName,
          competition: eventData.competition,
        },
        user.id
      );

      // Update ticket batch with PDF URL if successful
      if (pdfResult.success && pdfResult.pdfUrl) {
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ pdf_url: pdfResult.pdfUrl })
          .eq('id', ticketBatch.id);

        if (updateError) {
          console.error('Failed to update PDF URL:', updateError);
        }
      } else if (pdfResult.error) {
        console.error('PDF generation failed:', pdfResult.error);
        toast({
          title: "Warning",
          description: "Tickets created successfully, but PDF generation failed. You can regenerate it later.",
          variant: "destructive",
        });
      }

      await fetchTickets();
      return ticketBatch;
    } catch (error) {
      console.error('Error creating enhanced ticket batch:', error);
      toast({
        title: "Error",
        description: "Failed to create tickets",
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

      // Generate and upload PDF
      const pdfResult = await generateAndUploadTicketPDF(
        individualTickets,
        {
          id: ticketBatch.id,
          eventTitle,
          description: description || '',
          price,
          quantity,
          createdAt: new Date(ticketBatch.created_at),
          tickets: individualTickets
        },
        user.id
      );

      // Update ticket batch with PDF URL if successful
      if (pdfResult.success && pdfResult.pdfUrl) {
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ pdf_url: pdfResult.pdfUrl })
          .eq('id', ticketBatch.id);

        if (updateError) {
          console.error('Failed to update PDF URL:', updateError);
        }
      } else if (pdfResult.error) {
        console.error('PDF generation failed:', pdfResult.error);
        toast({
          title: "Warning",
          description: "Tickets created successfully, but PDF generation failed. You can regenerate it later.",
          variant: "destructive",
        });
      }

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

  const regeneratePDF = async (ticketId: string) => {
    if (!user) return false;

    try {
      // Find the ticket batch and its individual tickets
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Generate and upload PDF
      const pdfResult = await generateAndUploadTicketPDF(
        ticket.individual_tickets.map(it => ({
          id: it.id,
          qrCode: it.qr_code,
          qrCodeImage: it.qr_code_image,
          eventTitle: ticket.event_title,
          price: ticket.price,
          isUsed: it.is_used,
          validatedAt: it.validated_at ? new Date(it.validated_at) : undefined,
        })),
        {
          id: ticket.id,
          eventTitle: ticket.event_title,
          description: ticket.description || '',
          price: ticket.price,
          quantity: ticket.quantity,
          createdAt: new Date(ticket.created_at),
          tickets: []
        },
        user.id
      );

      if (pdfResult.success && pdfResult.pdfUrl) {
        // Update ticket batch with new PDF URL
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ pdf_url: pdfResult.pdfUrl })
          .eq('id', ticketId);

        if (updateError) throw updateError;

        await fetchTickets();
        
        toast({
          title: "Success",
          description: "PDF regenerated successfully",
        });
        
        return true;
      } else {
        throw new Error(pdfResult.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('Error regenerating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate PDF",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

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
