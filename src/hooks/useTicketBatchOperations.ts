
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { EnhancedTicketFormData } from '@/types/ticket';

export const useTicketBatchOperations = () => {
  const { user } = useAuth();

  const createTicketBatch = async (formData: EnhancedTicketFormData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const eventTitle = `${formData.homeTeam} vs ${formData.awayTeam}`;
    const totalTickets = formData.tiers.reduce((sum, tier) => sum + parseInt(tier.tierQuantity), 0);
    const avgPrice = formData.tiers.reduce((sum, tier) => sum + (parseFloat(tier.tierPrice) * parseInt(tier.tierQuantity)), 0) / totalTickets;

    const { data: ticketBatch, error: batchError } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        event_title: eventTitle,
        description: formData.description,
        price: avgPrice,
        quantity: totalTickets,
        event_date: formData.eventDate,
        event_start_time: formData.eventStartTime,
        event_end_time: formData.eventEndTime,
        home_team: formData.homeTeam,
        away_team: formData.awayTeam,
        stadium_name: formData.stadiumName,
        competition: formData.competition,
      })
      .select()
      .single();

    if (batchError) {
      throw new Error(`Failed to create ticket batch: ${batchError.message}`);
    }

    console.log('✅ Ticket batch created:', ticketBatch.id);
    return { ticketBatch, eventTitle, totalTickets, avgPrice };
  };

  const createTicketTiers = async (ticketBatchId: string, formData: EnhancedTicketFormData) => {
    const tiersToInsert = formData.tiers.map(tier => ({
      ticket_batch_id: ticketBatchId,
      tier_name: tier.tierName,
      tier_price: parseFloat(tier.tierPrice),
      tier_quantity: parseInt(tier.tierQuantity),
      tier_description: tier.tierDescription || null,
    }));

    const { data: insertedTiers, error: tiersError } = await supabase
      .from('ticket_tiers')
      .insert(tiersToInsert)
      .select();

    if (tiersError) {
      throw new Error(`Failed to create ticket tiers: ${tiersError.message}`);
    }

    console.log('✅ Ticket tiers created:', insertedTiers.length);
    return insertedTiers;
  };

  return {
    createTicketBatch,
    createTicketTiers
  };
};
