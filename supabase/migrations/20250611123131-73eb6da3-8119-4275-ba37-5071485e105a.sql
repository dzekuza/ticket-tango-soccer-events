
-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table to store ticket batches
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create individual_tickets table for each ticket
CREATE TABLE public.individual_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_batch_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  qr_code TEXT NOT NULL,
  qr_code_image TEXT,
  is_used BOOLEAN NOT NULL DEFAULT false,
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_tickets ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create tickets policies
CREATE POLICY "Users can view their own tickets" 
  ON public.tickets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets" 
  ON public.tickets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" 
  ON public.tickets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tickets" 
  ON public.tickets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create individual_tickets policies
CREATE POLICY "Users can view tickets from their batches" 
  ON public.individual_tickets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = individual_tickets.ticket_batch_id 
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tickets for their batches" 
  ON public.individual_tickets 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = individual_tickets.ticket_batch_id 
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tickets from their batches" 
  ON public.individual_tickets 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = individual_tickets.ticket_batch_id 
      AND tickets.user_id = auth.uid()
    )
  );

-- Create storage policies for the tickets bucket
CREATE POLICY "Users can upload their own ticket PDFs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'tickets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own ticket PDFs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'tickets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own ticket PDFs"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'tickets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own ticket PDFs"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'tickets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
