
interface TicketWebhookData {
  ticketBatch: {
    id: string;
    eventTitle: string;
    description?: string;
    price: number;
    quantity: number;
    eventDate?: string;
    eventStartTime?: string;
    eventEndTime?: string;
    homeTeam?: string;
    awayTeam?: string;
    stadiumName?: string;
    competition?: string;
    createdAt: string;
  };
  tickets: Array<{
    id: string;
    ticketNumber: number;
    tierName: string;
    tierPrice: number;
    qrCode: string;
    seatSection?: string;
    seatRow?: string;
    seatNumber?: string;
  }>;
  tiers?: Array<{
    id: string;
    tierName: string;
    tierPrice: number;
    tierQuantity: number;
    tierDescription?: string;
  }>;
  totalRevenue: number;
  timestamp: string;
}

export const sendTicketCreatedWebhook = async (data: TicketWebhookData): Promise<void> => {
  // Use our Supabase Edge Function as a proxy to avoid CORS issues
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-proxy`;

  try {
    console.log('Sending ticket created webhook via edge function proxy:', {
      eventTitle: data.ticketBatch.eventTitle,
      ticketCount: data.tickets.length,
      totalRevenue: data.totalRevenue
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        event: 'ticket_created',
        ...data
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Webhook sent successfully via proxy:', result.message);
    } else {
      console.error('❌ Webhook proxy returned error:', result.error);
    }
  } catch (error) {
    console.error('❌ Failed to send webhook via proxy:', error);
  }
};
