
import { supabase } from '@/integrations/supabase/client';

export const useIndividualTicketInsertion = () => {
  const insertIndividualTickets = async (
    ticketBatchId: string,
    individualTickets: any[],
    tierIdMapping: Record<string, string>
  ) => {
    console.log('Preparing individual tickets for database insertion...');
    const ticketsToInsert = [];
    
    for (const ticket of individualTickets) {
      const actualTierId = tierIdMapping[ticket.tierId];
      if (!actualTierId) {
        console.error('Missing tier ID for ticket:', ticket.tierId, 'Available mappings:', tierIdMapping);
        throw new Error(`Invalid tier ID: ${ticket.tierId}`);
      }

      // Validate ticket data
      if (!ticket.qrCode || !ticket.id) {
        console.error('Invalid ticket data:', ticket);
        throw new Error('Ticket missing required data (qrCode or id)');
      }
      
      ticketsToInsert.push({
        ticket_batch_id: ticketBatchId,
        qr_code: ticket.qrCode,
        qr_code_image: ticket.qrCodeImage || null,
        tier_id: actualTierId,
        seat_section: ticket.seatSection || null,
        seat_row: ticket.seatRow || null,
        seat_number: ticket.seatNumber || null,
      });
    }

    console.log(`Inserting ${ticketsToInsert.length} individual tickets...`);

    // Insert individual tickets in smaller batches to avoid timeout
    const batchSize = 100;
    const insertedIndividualTickets = [];
    
    for (let i = 0; i < ticketsToInsert.length; i += batchSize) {
      const batch = ticketsToInsert.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(ticketsToInsert.length/batchSize)} (${batch.length} tickets)`);
      
      const { data: batchResult, error: batchError } = await supabase
        .from('individual_tickets')
        .insert(batch)
        .select();

      if (batchError) {
        console.error('Individual tickets batch insertion error:', batchError);
        throw new Error(`Failed to insert ticket batch ${Math.floor(i/batchSize) + 1}: ${batchError.message}`);
      }

      insertedIndividualTickets.push(...batchResult);
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} inserted successfully`);
    }

    console.log('✅ All individual tickets created successfully:', insertedIndividualTickets.length);

    // Verify all tickets were created
    if (insertedIndividualTickets.length !== individualTickets.length) {
      throw new Error(`Expected ${individualTickets.length} tickets, but only ${insertedIndividualTickets.length} were created`);
    }

    return insertedIndividualTickets;
  };

  const insertBasicIndividualTickets = async (
    ticketBatchId: string,
    individualTickets: any[]
  ) => {
    const ticketsToInsert = individualTickets.map(ticket => ({
      ticket_batch_id: ticketBatchId,
      qr_code: ticket.qrCode,
      qr_code_image: ticket.qrCodeImage,
    }));

    const { data: insertedIndividualTickets, error: ticketsError } = await supabase
      .from('individual_tickets')
      .insert(ticketsToInsert)
      .select();

    if (ticketsError) throw ticketsError;

    console.log('Individual tickets created:', insertedIndividualTickets);
    return insertedIndividualTickets;
  };

  return {
    insertIndividualTickets,
    insertBasicIndividualTickets,
  };
};
