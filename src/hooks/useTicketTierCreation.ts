
import { supabase } from '@/integrations/supabase/client';

export const useTicketTierCreation = () => {
  const createTicketTiers = async (ticketBatchId: string, tiers: any[]) => {
    console.log('Creating ticket tiers...');
    
    const tiersToInsert = tiers.map(tier => ({
      ticket_batch_id: ticketBatchId,
      tier_name: tier.tier_name,
      tier_price: tier.tier_price,
      tier_quantity: tier.tier_quantity,
      tier_description: tier.tier_description,
    }));

    const { data: insertedTiers, error: tiersError } = await supabase
      .from('ticket_tiers')
      .insert(tiersToInsert)
      .select();

    if (tiersError) {
      console.error('Ticket tiers creation error:', tiersError);
      throw new Error(`Failed to create ticket tiers: ${tiersError.message}`);
    }

    console.log('✅ Ticket tiers created successfully:', insertedTiers.length);

    // Create mapping of tier index to actual tier ID
    const tierIdMapping: Record<string, string> = {};
    insertedTiers.forEach((tier, index) => {
      tierIdMapping[`tier_${index}`] = tier.id;
    });

    console.log('Tier ID mapping created:', tierIdMapping);
    return { insertedTiers, tierIdMapping };
  };

  return {
    createTicketTiers,
  };
};
