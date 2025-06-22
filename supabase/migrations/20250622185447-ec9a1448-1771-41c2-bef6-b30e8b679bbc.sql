
-- Create a table to store user AI memory/preferences
CREATE TABLE public.user_ai_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  memory_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on user_id to ensure one memory record per user
CREATE UNIQUE INDEX user_ai_memory_user_id_idx ON public.user_ai_memory(user_id);

-- Create a table to store AI conversations for learning patterns
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for efficient queries
CREATE INDEX ai_conversations_user_id_idx ON public.ai_conversations(user_id);
CREATE INDEX ai_conversations_created_at_idx ON public.ai_conversations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_ai_memory (users can only access their own data)
CREATE POLICY "Users can view their own AI memory" 
  ON public.user_ai_memory 
  FOR SELECT 
  USING (true); -- Allow anonymous access for demo

CREATE POLICY "Users can insert their own AI memory" 
  ON public.user_ai_memory 
  FOR INSERT 
  WITH CHECK (true); -- Allow anonymous access for demo

CREATE POLICY "Users can update their own AI memory" 
  ON public.user_ai_memory 
  FOR UPDATE 
  USING (true); -- Allow anonymous access for demo

-- Create policies for ai_conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.ai_conversations 
  FOR SELECT 
  USING (true); -- Allow anonymous access for demo

CREATE POLICY "Users can insert their own conversations" 
  ON public.ai_conversations 
  FOR INSERT 
  WITH CHECK (true); -- Allow anonymous access for demo
