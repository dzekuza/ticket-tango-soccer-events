
-- Add missing fields to individual_tickets table for individual ticket generation
ALTER TABLE public.individual_tickets 
ADD COLUMN ticket_number INTEGER,
ADD COLUMN event_date DATE,
ADD COLUMN event_start_time TIME,
ADD COLUMN event_end_time TIME,
ADD COLUMN tier_name TEXT,
ADD COLUMN tier_price DECIMAL(10,2),
ADD COLUMN home_team TEXT,
ADD COLUMN away_team TEXT,
ADD COLUMN stadium_name TEXT,
ADD COLUMN competition TEXT,
ADD COLUMN event_title TEXT;

-- Add index on ticket_number for better performance
CREATE INDEX idx_individual_tickets_ticket_number ON public.individual_tickets(ticket_number);

-- Add index on ticket_batch_id and ticket_number for efficient querying
CREATE INDEX idx_individual_tickets_batch_number ON public.individual_tickets(ticket_batch_id, ticket_number);
