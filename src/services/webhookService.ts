
const SUPABASE_PROJECT_URL = 'https://gnvvccuehmmbghossyqn.supabase.co';

export const triggerWebhook = async (ticketData: any) => {
  try {
    console.log('Triggering webhook for new ticket creation...');
    
    // Use the webhook-proxy edge function instead of direct n8n call for security
    const response = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/webhook-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudnZjY3VlaG1tYmdob3NzeXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NDQ3MjQsImV4cCI6MjA2NTIyMDcyNH0.4htoxYScVIpaGDWJlxcUTP0-KfeuKvJ3yLM2Hjmv72A'}`
      },
      body: JSON.stringify({
        type: 'new_ticket',
        data: ticketData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook proxy error:', errorText);
      return;
    }

    const result = await response.json();
    console.log('Webhook triggered successfully:', result);
  } catch (error) {
    console.error('Error triggering webhook:', error);
    // Don't throw the error to prevent breaking ticket creation
  }
};
