-- Create saved_journeys table to store user-specific journey data
CREATE TABLE public.saved_journeys (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL,
    journey_data JSONB NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_journeys ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own saved journeys" 
ON public.saved_journeys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved journeys" 
ON public.saved_journeys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved journeys" 
ON public.saved_journeys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved journeys" 
ON public.saved_journeys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saved_journeys_updated_at
BEFORE UPDATE ON public.saved_journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_saved_journeys_user_id ON public.saved_journeys(user_id);
CREATE INDEX idx_saved_journeys_created_at ON public.saved_journeys(created_at DESC);