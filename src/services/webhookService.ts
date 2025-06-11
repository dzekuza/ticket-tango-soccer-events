
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
  const webhookUrl = 'https://n8n.srv824584.hstgr.cloud/webhook/new-ticket-event';

  try {
    console.log('Sending ticket created webhook to n8n:', {
      eventTitle: data.ticketBatch.eventTitle,
      ticketCount: data.tickets.length,
      totalRevenue: data.totalRevenue
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'ticket_created',
        ...data
      }),
    });

    const result = await response.text(); // optional logging
    console.log('✅ Webhook sent successfully to n8n:', result);
  } catch (error) {
    console.error('❌ Failed to send webhook to n8n:', error);
  }
};
