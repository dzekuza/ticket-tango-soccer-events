
import { supabase } from '@/integrations/supabase/client';
import { generateTicketQRCode, createQRCodeData } from '@/utils/ticketQRGenerator';
import { EnhancedTicketFormData } from '@/types/ticket';
import { CreatedTicket } from '@/types/ticketCreation';
import { useToast } from './use-toast';

export const useIndividualTicketOperations = () => {
  const { toast } = useToast();

  const createIndividualTicket = async (
    ticketBatch: any,
    tier: any,
    formData: EnhancedTicketFormData,
    eventTitle: string,
    globalTicketCounter: number,
    batchId: string,
    tierIndex: number
  ): Promise<{ ticket: CreatedTicket; webhookData: any } | null> => {
    const ticketId = `${batchId}_ticket_${globalTicketCounter.toString().padStart(4, '0')}`;
    
    // Generate QR code data
    const ticketData = {
      id: ticketId,
      eventTitle,
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      stadiumName: formData.stadiumName,
      eventDate: formData.eventDate,
      eventStartTime: formData.eventStartTime,
      tierName: tier.tier_name,
      price: tier.tier_price,
      ticketNumber: globalTicketCounter,
      tierIndex: tierIndex,
    };

    console.log(`Creating ticket ${globalTicketCounter}: ${ticketId}`);

    // Generate QR code
    const qrCodeImage = await generateTicketQRCode(ticketData);
    const qrCodeData = createQRCodeData(ticketData);

    // Create individual ticket in database
    const { data: individualTicket, error: ticketError } = await supabase
      .from('individual_tickets')
      .insert({
        ticket_batch_id: ticketBatch.id,
        tier_id: tier.id,
        qr_code: JSON.stringify(qrCodeData),
        qr_code_image: qrCodeImage,
        ticket_number: globalTicketCounter,
        event_date: formData.eventDate,
        event_start_time: formData.eventStartTime,
        event_end_time: formData.eventEndTime,
        tier_name: tier.tier_name,
        tier_price: tier.tier_price,
        home_team: formData.homeTeam,
        away_team: formData.awayTeam,
        stadium_name: formData.stadiumName,
        competition: formData.competition,
        event_title: eventTitle,
        seat_number: globalTicketCounter.toString(),
      })
      .select()
      .single();

    if (ticketError) {
      console.error(`Failed to create ticket ${globalTicketCounter}:`, ticketError);
      toast({
        title: "Warning",
        description: `Failed to create ticket ${globalTicketCounter}. Continuing with others...`,
        variant: "destructive",
      });
      return null;
    }

    const createdTicket: CreatedTicket = {
      id: individualTicket.id,
      ticketNumber: globalTicketCounter,
      tierName: tier.tier_name,
      qrCodeImage: qrCodeImage,
    };

    // Prepare webhook data for this ticket
    const webhookData = {
      id: individualTicket.id,
      ticketNumber: globalTicketCounter,
      tierName: tier.tier_name,
      tierPrice: tier.tier_price,
      qrCode: JSON.stringify(qrCodeData),
      seatSection: null,
      seatRow: null,
      seatNumber: globalTicketCounter.toString(),
    };

    console.log(`✅ Ticket ${globalTicketCounter} created successfully`);
    return { ticket: createdTicket, webhookData };
  };

  return {
    createIndividualTicket
  };
};
