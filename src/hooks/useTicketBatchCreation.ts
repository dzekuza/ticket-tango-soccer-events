
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useTicketBatchCreation = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createTicketBatchRecord = async (
    eventData: any,
    tiers: any[]
  ) => {
    if (!user) return null;

    console.log('Creating ticket batch record...');
    
    const totalQuantity = tiers.reduce((sum, tier) => sum + tier.tier_quantity, 0);
    const avgPrice = tiers.reduce((sum, tier) => sum + (tier.tier_price * tier.tier_quantity), 0) / totalQuantity;

    const { data: ticketBatch, error: batchError } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        event_title: eventData.eventTitle,
        description: eventData.description,
        price: avgPrice,
        quantity: totalQuantity,
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

    if (batchError) {
      console.error('Ticket batch creation error:', batchError);
      throw new Error(`Failed to create ticket batch: ${batchError.message}`);
    }

    console.log('✅ Ticket batch created successfully:', ticketBatch.id);
    return ticketBatch;
  };

  const createBasicTicketBatchRecord = async (
    eventTitle: string,
    description: string,
    price: number,
    quantity: number
  ) => {
    if (!user) return null;

    console.log('Creating basic ticket batch with data:', { eventTitle, description, price, quantity });

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

    console.log('Ticket batch created:', ticketBatch);
    return ticketBatch;
  };

  return {
    createTicketBatchRecord,
    createBasicTicketBatchRecord,
  };
};
