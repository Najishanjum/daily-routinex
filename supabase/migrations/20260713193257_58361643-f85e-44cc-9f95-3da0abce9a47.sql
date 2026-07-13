
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.ai_conversations;

CREATE POLICY "Users can view their own conversations"
  ON public.ai_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own conversations"
  ON public.ai_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own conversations"
  ON public.ai_conversations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);
