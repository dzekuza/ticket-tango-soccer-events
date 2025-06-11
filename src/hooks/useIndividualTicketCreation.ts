
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { generateTicketQRCode, createQRCodeData } from '@/utils/ticketQRGenerator';
import { EnhancedTicketFormData } from '@/types/ticket';

export interface TicketProgress {
  current: number;
  total: number;
  percentage: number;
  currentTier?: string;
  status: 'idle' | 'creating' | 'completed' | 'cancelled' | 'error';
  error?: string;
}

export interface CreatedTicket {
  id: string;
  ticketNumber: number;
  tierName: string;
  qrCodeImage: string;
}

export const useIndividualTicketCreation = () => {
  const [progress, setProgress] = useState<TicketProgress>({
    current: 0,
    total: 0,
    percentage: 0,
    status: 'idle'
  });
  const [createdTickets, setCreatedTickets] = useState<CreatedTicket[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const cancelledRef = useRef(false);

  const cancelCreation = () => {
    cancelledRef.current = true;
    setProgress(prev => ({ ...prev, status: 'cancelled' }));
  };

  const createTicketsIndividually = async (
    formData: EnhancedTicketFormData,
    onTicketCreated?: (ticket: any) => void
  ) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    cancelledRef.current = false;
    const batchId = `batch_${Date.now()}`;
    const eventTitle = `${formData.homeTeam} vs ${formData.awayTeam}`;
    
    // Calculate total tickets
    const totalTickets = formData.tiers.reduce((sum, tier) => sum + parseInt(tier.tierQuantity), 0);
    const avgPrice = formData.tiers.reduce((sum, tier) => sum + (parseFloat(tier.tierPrice) * parseInt(tier.tierQuantity)), 0) / totalTickets;

    console.log('Starting individual ticket creation:', {
      eventTitle,
      totalTickets,
      tiers: formData.tiers.length
    });

    setProgress({
      current: 0,
      total: totalTickets,
      percentage: 0,
      status: 'creating'
    });

    try {
      // Create ticket batch first
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

      // Create ticket tiers
      const tiersToInsert = formData.tiers.map(tier => ({
        ticket_batch_id: ticketBatch.id,
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

      // Create mapping of tier index to actual tier ID
      const tierIdMapping: Record<number, string> = {};
      insertedTiers.forEach((tier, index) => {
        tierIdMapping[index] = tier.id;
      });

      // Now create tickets individually
      const createdIndividualTickets: CreatedTicket[] = [];
      let globalTicketCounter = 1;

      for (const [tierIndex, tierFormData] of formData.tiers.entries()) {
        const tier = insertedTiers[tierIndex];
        const tierQuantity = parseInt(tierFormData.tierQuantity);
        
        console.log(`Creating ${tierQuantity} tickets for tier: ${tier.tier_name}`);
        
        setProgress(prev => ({
          ...prev,
          currentTier: tier.tier_name
        }));

        for (let i = 0; i < tierQuantity; i++) {
          if (cancelledRef.current) {
            console.log('Ticket creation cancelled by user');
            return { success: false, cancelled: true };
          }

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

          console.log(`Creating ticket ${globalTicketCounter}/${totalTickets}: ${ticketId}`);

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
            continue;
          }

          const createdTicket: CreatedTicket = {
            id: individualTicket.id,
            ticketNumber: globalTicketCounter,
            tierName: tier.tier_name,
            qrCodeImage: qrCodeImage,
          };

          createdIndividualTickets.push(createdTicket);
          setCreatedTickets(prev => [...prev, createdTicket]);

          // Update progress
          const newProgress = {
            current: globalTicketCounter,
            total: totalTickets,
            percentage: Math.round((globalTicketCounter / totalTickets) * 100),
            currentTier: tier.tier_name,
            status: 'creating' as const
          };
          setProgress(newProgress);

          console.log(`✅ Ticket ${globalTicketCounter} created successfully`);
          globalTicketCounter++;

          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      console.log(`✅ All ${createdIndividualTickets.length} tickets created successfully`);
      
      setProgress(prev => ({
        ...prev,
        status: 'completed'
      }));

      // Call the callback to update the main ticket list
      if (onTicketCreated) {
        const completeTicket = {
          id: ticketBatch.id,
          eventTitle,
          description: formData.description,
          price: avgPrice,
          quantity: totalTickets,
          createdAt: new Date(ticketBatch.created_at),
          tickets: createdIndividualTickets.map(ticket => ({
            id: ticket.id,
            qrCode: '',
            qrCodeImage: ticket.qrCodeImage,
            eventTitle,
            price: formData.tiers.find(t => t.tierName === ticket.tierName) ? 
              parseFloat(formData.tiers.find(t => t.tierName === ticket.tierName)!.tierPrice) : 0,
            isUsed: false,
            tierName: ticket.tierName,
            ticketNumber: ticket.ticketNumber,
          })),
          eventDate: formData.eventDate,
          eventStartTime: formData.eventStartTime,
          eventEndTime: formData.eventEndTime,
          homeTeam: formData.homeTeam,
          awayTeam: formData.awayTeam,
          stadiumName: formData.stadiumName,
          competition: formData.competition,
        };
        
        onTicketCreated(completeTicket);
      }

      toast({
        title: "Success!",
        description: `Created ${createdIndividualTickets.length} tickets for ${eventTitle}`,
      });

      return { 
        success: true, 
        ticketBatch, 
        createdTickets: createdIndividualTickets,
        totalCreated: createdIndividualTickets.length 
      };

    } catch (error) {
      console.error('Individual ticket creation error:', error);
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tickets",
        variant: "destructive",
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const resetProgress = () => {
    setProgress({
      current: 0,
      total: 0,
      percentage: 0,
      status: 'idle'
    });
    setCreatedTickets([]);
    cancelledRef.current = false;
  };

  return {
    progress,
    createdTickets,
    createTicketsIndividually,
    cancelCreation,
    resetProgress,
  };
};
