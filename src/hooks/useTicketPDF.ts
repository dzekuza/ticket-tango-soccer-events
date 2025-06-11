
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { generateAndUploadTicketPDF } from '@/utils/supabasePdfGenerator';
import { SupabaseTicket } from './useTicketData';

export const useTicketPDF = (tickets: SupabaseTicket[], refetchTickets: () => Promise<void>) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const regeneratePDF = async (ticketId: string) => {
    if (!user) {
      console.error('❌ No user authenticated for PDF regeneration');
      return false;
    }

    console.log('🔄 Regenerating PDF for ticket:', ticketId);

    try {
      // Find the ticket batch and its individual tickets
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      console.log('✅ Found ticket for regeneration:', {
        id: ticket.id,
        title: ticket.event_title,
        individualTicketsCount: ticket.individual_tickets.length
      });

      // Validate that we have individual tickets
      if (!ticket.individual_tickets || ticket.individual_tickets.length === 0) {
        throw new Error('No individual tickets found for this batch');
      }

      // Generate and upload PDF
      console.log('🚀 Starting PDF generation...');
      const pdfResult = await generateAndUploadTicketPDF(
        ticket.individual_tickets.map(it => ({
          id: it.id,
          qrCode: it.qr_code,
          qrCodeImage: it.qr_code_image,
          eventTitle: ticket.event_title,
          price: it.tier_price || ticket.price,
          isUsed: it.is_used,
          validatedAt: it.validated_at,
          tierName: it.tier_name,
          ticketNumber: it.ticket_number,
          seatSection: it.seat_section,
          seatRow: it.seat_row,
          seatNumber: it.seat_number,
        })),
        {
          id: ticket.id,
          eventTitle: ticket.event_title,
          description: ticket.description || '',
          price: ticket.price,
          quantity: ticket.quantity,
          createdAt: ticket.created_at,
          tickets: [],
          // Include enhanced event data
          eventDate: ticket.event_date,
          eventStartTime: ticket.event_start_time,
          eventEndTime: ticket.event_end_time,
          homeTeam: ticket.home_team,
          awayTeam: ticket.away_team,
          stadiumName: ticket.stadium_name,
          competition: ticket.competition,
        },
        user.id
      );

      console.log('📊 PDF regeneration result:', pdfResult);

      if (pdfResult.success && pdfResult.pdfUrl) {
        console.log('✅ PDF generated successfully, updating database...');
        // Update ticket batch with new PDF URL
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ pdf_url: pdfResult.pdfUrl })
          .eq('id', ticketId);

        if (updateError) {
          console.error('❌ Failed to update PDF URL:', updateError);
          throw updateError;
        }

        console.log('✅ Database updated successfully');
        await refetchTickets();
        
        toast({
          title: "Success",
          description: "PDF regenerated successfully",
        });
        
        return true;
      } else {
        console.error('❌ PDF generation failed:', pdfResult.error);
        throw new Error(pdfResult.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('❌ Error regenerating PDF:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to regenerate PDF",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    regeneratePDF,
  };
};
