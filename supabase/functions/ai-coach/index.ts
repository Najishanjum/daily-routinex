
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, userContext } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's memory/context
    let userMemory = {};
    if (userId) {
      const { data: memoryData } = await supabase
        .from('user_ai_memory')
        .select('memory_data')
        .eq('user_id', userId)
        .single();
      
      if (memoryData) {
        userMemory = memoryData.memory_data || {};
      }
    }

    // Create personalized system prompt
    const systemPrompt = `You are RoutineX AI Coach, a supportive productivity and wellness companion. 

User Context: ${JSON.stringify(userContext)}
User Memory: ${JSON.stringify(userMemory)}

Guidelines:
- Be encouraging, empathetic, and practical
- Give personalized advice based on user's patterns and preferences
- Suggest specific, actionable steps
- Remember user's goals, challenges, and progress
- Adapt your tone to match the user's communication style
- Focus on building sustainable habits and routines
- Offer motivation during difficult times

Always provide:
1. Empathetic acknowledgment
2. Practical actionable advice
3. Specific next steps
4. Encouragement for progress`;

    console.log('Sending request to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Update user memory if userId provided
    if (userId) {
      const updatedMemory = {
        ...userMemory,
        lastInteraction: new Date().toISOString(),
        recentTopics: [
          ...(userMemory.recentTopics || []).slice(-4),
          message.substring(0, 100)
        ],
        tone: userMemory.tone || 'supportive',
        preferences: userMemory.preferences || {}
      };

      await supabase
        .from('user_ai_memory')
        .upsert({
          user_id: userId,
          memory_data: updatedMemory,
          updated_at: new Date().toISOString()
        });
    }

    // Store conversation
    if (userId) {
      await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          message: message,
          response: aiResponse,
          created_at: new Date().toISOString()
        });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
