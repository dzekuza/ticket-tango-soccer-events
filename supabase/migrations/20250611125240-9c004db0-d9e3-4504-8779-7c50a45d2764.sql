
-- Extend the tickets table with soccer-specific fields
ALTER TABLE public.tickets 
ADD COLUMN event_date DATE,
ADD COLUMN event_start_time TIME,
ADD COLUMN event_end_time TIME,
ADD COLUMN home_team TEXT,
ADD COLUMN away_team TEXT,
ADD COLUMN stadium_name TEXT,
ADD COLUMN competition TEXT;

-- Create ticket_tiers table for pricing tiers
CREATE TABLE public.ticket_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_batch_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  tier_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  tier_quantity INTEGER NOT NULL DEFAULT 1,
  tier_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update individual_tickets table to include tier information
ALTER TABLE public.individual_tickets 
ADD COLUMN tier_id UUID REFERENCES public.ticket_tiers(id) ON DELETE CASCADE,
ADD COLUMN seat_section TEXT,
ADD COLUMN seat_row TEXT,
ADD COLUMN seat_number TEXT;

-- Enable RLS for ticket_tiers table
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket_tiers (users can only manage tiers for their own tickets)
CREATE POLICY "Users can view tiers for their own tickets" 
  ON public.ticket_tiers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = ticket_tiers.ticket_batch_id 
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tiers for their own tickets" 
  ON public.ticket_tiers 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = ticket_tiers.ticket_batch_id 
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tiers for their own tickets" 
  ON public.ticket_tiers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = ticket_tiers.ticket_batch_id 
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tiers for their own tickets" 
  ON public.ticket_tiers 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = ticket_tiers.ticket_batch_id 
      AND tickets.user_id = auth.uid()
    )
  );
