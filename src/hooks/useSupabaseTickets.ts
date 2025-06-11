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

    console.log('Creating enhanced ticket batch with data:', { 
      eventData, 
      tiers, 
      individualTicketsCount: individualTickets.length 
    });

    try {
      // Start transaction-like approach - create ticket batch first
      const totalQuantity = tiers.reduce((sum, tier) => sum + tier.tier_quantity, 0);
      const avgPrice = tiers.reduce((sum, tier) => sum + (tier.tier_price * tier.tier_quantity), 0) / totalQuantity;

      console.log('Creating main ticket batch...');
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

      // Create ticket tiers
      console.log('Creating ticket tiers...');
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

      // Validate and prepare individual tickets
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
          ticket_batch_id: ticketBatch.id,
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
          validatedAt: dbTicket.validated_at ? new Date(dbTicket.validated_at) : undefined,
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
            description: `Created ${totalQuantity} tickets and generated PDF successfully!`,
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

      await fetchTickets();
      return ticketBatch;
      
    } catch (error) {
      console.error('Error creating enhanced ticket batch:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tickets",
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

    console.log('Creating ticket batch with data:', { eventTitle, description, price, quantity, individualTicketsCount: individualTickets.length });

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

      console.log('Ticket batch created:', ticketBatch);

      // Create individual tickets
      const ticketsToInsert = individualTickets.map(ticket => ({
        ticket_batch_id: ticketBatch.id,
        qr_code: ticket.qrCode,
        qr_code_image: ticket.qrCodeImage,
      }));

      const { data: insertedIndividualTickets, error: ticketsError } = await supabase
        .from('individual_tickets')
        .insert(ticketsToInsert)
        .select();

      if (ticketsError) throw ticketsError;

      console.log('Individual tickets created:', insertedIndividualTickets);

      // Generate and upload PDF
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

    console.log('Regenerating PDF for ticket:', ticketId);

    try {
      // Find the ticket batch and its individual tickets
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      console.log('Found ticket for regeneration:', ticket);

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

      console.log('PDF regeneration result:', pdfResult);

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
