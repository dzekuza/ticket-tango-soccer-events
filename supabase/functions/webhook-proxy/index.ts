
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Webhook proxy called:', req.method, req.url)
    
    // Get the n8n webhook URL from environment variables
    const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL')
    
    if (!N8N_WEBHOOK_URL) {
      console.error('N8N_WEBHOOK_URL environment variable not set')
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'POST') {
      const body = await req.json()
      console.log('Received webhook data:', body)

      // Validate the request structure
      if (!body.type || !body.data) {
        return new Response(
          JSON.stringify({ error: 'Invalid request structure' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Forward to n8n webhook with security headers
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
        body: JSON.stringify({
          type: body.type,
          data: body.data,
          timestamp: new Date().toISOString(),
          source: 'ticket-manager'
        })
      })

      if (!response.ok) {
        console.error('N8N webhook error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('N8N error details:', errorText)
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to forward webhook',
            status: response.status 
          }),
          { 
            status: 502, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const result = await response.json()
      console.log('N8N webhook response:', result)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook forwarded successfully',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook proxy error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
