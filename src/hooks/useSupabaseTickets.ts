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
    validateTicket,
    regeneratePDF,
    refetch: fetchTickets,
  };
};
