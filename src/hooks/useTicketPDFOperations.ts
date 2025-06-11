
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { generateAndUploadTicketPDF } from '@/utils/supabasePdfGenerator';

export const useTicketPDFOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const generateAndUpdatePDF = async (
    ticketBatch: any,
    eventData: any,
    individualTickets: any[],
    insertedIndividualTickets: any[]
  ) => {
    if (!user) return;

    // Prepare individual tickets data for PDF generation
    console.log('Preparing ticket data for PDF generation...');
    const ticketsForPDF = insertedIndividualTickets.map((dbTicket, index) => {
      const originalTicket = individualTickets[index];
      return {
        id: dbTicket.id,
        qrCode: dbTicket.qr_code,
        qrCodeImage: dbTicket.qr_code_image,
        eventTitle: eventData.eventTitle,
        price: originalTicket.price,
        isUsed: dbTicket.is_used,
        validatedAt: dbTicket.validated_at,
        tierName: originalTicket.tierName,
        ticketNumber: originalTicket.ticketNumber,
      };
    });

    console.log('Starting PDF generation with tickets:', ticketsForPDF.length);

    // Generate and upload PDF
    const pdfResult = await generateAndUploadTicketPDF(
      ticketsForPDF,
      {
        id: ticketBatch.id,
        eventTitle: eventData.eventTitle,
        description: eventData.description || '',
        price: ticketBatch.price,
        quantity: ticketBatch.quantity,
        createdAt: new Date(ticketBatch.created_at),
        tickets: ticketsForPDF,
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

    console.log('PDF generation result:', pdfResult);

    // Update ticket batch with PDF URL if successful
    if (pdfResult.success && pdfResult.pdfUrl) {
      console.log('Updating ticket batch with PDF URL:', pdfResult.pdfUrl);
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ pdf_url: pdfResult.pdfUrl })
        .eq('id', ticketBatch.id);

      if (updateError) {
        console.error('Failed to update PDF URL:', updateError);
        toast({
          title: "Warning",
          description: "Tickets created, but failed to save PDF link. You can regenerate it later.",
          variant: "destructive",
        });
      } else {
        console.log('✅ PDF URL updated successfully');
        toast({
          title: "Success!",
          description: `Created ${ticketBatch.quantity} tickets and generated PDF successfully!`,
        });
      }
    } else if (pdfResult.error) {
      console.error('PDF generation failed:', pdfResult.error);
      toast({
        title: "Partial Success",
        description: `Tickets created successfully, but PDF generation failed. You can regenerate it from the tickets page.`,
        variant: "destructive",
      });
    }
  };

  const generateBasicTicketPDF = async (
    ticketBatch: any,
    eventTitle: string,
    description: string,
    price: number,
    quantity: number,
    individualTickets: any[]
  ) => {
    if (!user) return;

    console.log('Starting PDF generation...');
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

    console.log('PDF generation result:', pdfResult);

    // Update ticket batch with PDF URL if successful
    if (pdfResult.success && pdfResult.pdfUrl) {
      console.log('Updating ticket batch with PDF URL:', pdfResult.pdfUrl);
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ pdf_url: pdfResult.pdfUrl })
        .eq('id', ticketBatch.id);

      if (updateError) {
        console.error('Failed to update PDF URL:', updateError);
        toast({
          title: "Warning",
          description: "Tickets created, but failed to save PDF link. You can regenerate it later.",
          variant: "destructive",
        });
      } else {
        console.log('PDF URL updated successfully');
        toast({
          title: "Success!",
          description: "Tickets created and PDF generated successfully",
        });
      }
    } else if (pdfResult.error) {
      console.error('PDF generation failed:', pdfResult.error);
      toast({
        title: "Warning",
        description: `Tickets created successfully, but PDF generation failed: ${pdfResult.error}`,
        variant: "destructive",
      });
    }
  };

  return {
    generateAndUpdatePDF,
    generateBasicTicketPDF,
  };
};
