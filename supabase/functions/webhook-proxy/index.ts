
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Webhook proxy called');
    
    const requestData = await req.json();
    console.log('Forwarding webhook data to n8n:', {
      eventTitle: requestData.ticketBatch?.eventTitle,
      ticketCount: requestData.tickets?.length,
      totalRevenue: requestData.totalRevenue
    });

    // Forward the request to n8n webhook
    const n8nWebhookUrl = 'https://n8n.srv824584.hstgr.cloud/webhook/new-ticket-event';
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const result = await response.text();
    console.log('✅ Webhook forwarded successfully to n8n:', result);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook forwarded successfully',
      n8nResponse: result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status
    });

  } catch (error) {
    console.error('❌ Failed to forward webhook to n8n:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
