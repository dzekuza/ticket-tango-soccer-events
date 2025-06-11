
export interface TicketTier {
  id: string;
  tier_name: string;
  tier_price: number;
  tier_quantity: number;
  tier_description?: string;
}

export interface SoccerEventData {
  eventTitle: string;
  description: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  homeTeam: string;
  awayTeam: string;
  stadiumName: string;
  competition: string;
  tiers: TicketTier[];
}

export interface EnhancedTicketFormData {
  // Step 1: Basic Event Info
  homeTeam: string;
  awayTeam: string;
  competition: string;
  stadiumName: string;
  
  // Step 2: Event Schedule
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  description: string;
  
  // Step 3: Pricing Tiers
  tiers: Array<{
    tierName: string;
    tierPrice: string;
    tierQuantity: string;
    tierDescription: string;
  }>;
}
