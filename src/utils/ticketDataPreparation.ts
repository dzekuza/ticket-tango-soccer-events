
import { IndividualTicket } from '@/components/Dashboard';
import { EnhancedTicketFormData } from '@/types/ticket';
import { generateTicketQRCode, createQRCodeData } from './ticketQRGenerator';

export interface PreparedTierData {
  tier_name: string;
  tier_price: number;
  tier_quantity: number;
  tier_description: string | null;
}

export interface PreparedEventData {
  eventTitle: string;
  description: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  homeTeam: string;
  awayTeam: string;
  stadiumName: string;
  competition: string;
}

export const prepareTiersData = (formData: EnhancedTicketFormData): PreparedTierData[] => {
  return formData.tiers.map(tier => ({
    tier_name: tier.tierName,
    tier_price: parseFloat(tier.tierPrice),
    tier_quantity: parseInt(tier.tierQuantity),
    tier_description: tier.tierDescription || null,
  }));
};

export const prepareEventData = (formData: EnhancedTicketFormData): PreparedEventData => {
  const eventTitle = `${formData.homeTeam} vs ${formData.awayTeam}`;
  
  return {
    eventTitle,
    description: formData.description,
    eventDate: formData.eventDate,
    eventStartTime: formData.eventStartTime,
    eventEndTime: formData.eventEndTime,
    homeTeam: formData.homeTeam,
    awayTeam: formData.awayTeam,
    stadiumName: formData.stadiumName,
    competition: formData.competition,
  };
};

export const generateIndividualTickets = async (
  formData: EnhancedTicketFormData,
  tiers: PreparedTierData[],
  batchId: string
): Promise<{ individualTickets: IndividualTicket[]; individualTicketsForSupabase: any[] }> => {
  const eventTitle = `${formData.homeTeam} vs ${formData.awayTeam}`;
  const individualTickets: IndividualTicket[] = [];
  const individualTicketsForSupabase = [];

  let globalTicketCounter = 1;
  
  for (const [tierIndex, tier] of tiers.entries()) {
    console.log(`Creating ${tier.tier_quantity} tickets for tier ${tierIndex + 1}: ${tier.tier_name}`);
    
    for (let i = 0; i < tier.tier_quantity; i++) {
      const ticketId = `${batchId}_ticket_${globalTicketCounter.toString().padStart(4, '0')}`;
      
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
      
      // Generate unique QR code image for each ticket
      const qrCodeImage = await generateTicketQRCode(ticketData);
      
      const qrCodeData = createQRCodeData(ticketData);

      const individualTicket = {
        id: ticketId,
        qrCode: JSON.stringify(qrCodeData),
        qrCodeImage: qrCodeImage,
        eventTitle,
        price: tier.tier_price,
        isUsed: false,
        tierName: tier.tier_name,
        ticketNumber: globalTicketCounter,
      };

      individualTickets.push(individualTicket);
      
      individualTicketsForSupabase.push({
        ...individualTicket,
        tierId: `tier_${tierIndex}`, // Will be replaced with actual tier ID
        seatSection: null,
        seatRow: null,
        seatNumber: globalTicketCounter.toString(),
      });

      globalTicketCounter++;
    }
  }

  console.log(`Generated ${individualTickets.length} individual tickets`);
  
  return { individualTickets, individualTicketsForSupabase };
};
