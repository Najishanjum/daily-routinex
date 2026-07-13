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
    // --- Authentication: verify JWT and derive user id server-side ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized', success: false }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', success: false }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = authData.user.id;

    const { message, userContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable.', success: false }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Service-role client used for writing memory/conversations under the verified user id.
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get user's memory/context from database
    let userMemory: any = {};
    const { data: memoryData } = await supabase
      .from('user_ai_memory')
      .select('memory_data')
      .eq('user_id', userId)
      .single();
    if (memoryData) userMemory = memoryData.memory_data || {};

    // Get recent conversation history for context
    let conversationHistory: any[] = [];
    const { data: historyData } = await supabase
      .from('ai_conversations')
      .select('message, response')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    if (historyData) conversationHistory = historyData;

    const systemPrompt = `You are RoutineX — a smart, supportive AI Life Coach and Mood Assistant with private memory.
Your purpose is to help users improve their daily routines, motivation, and emotional well-being.

User Context: ${JSON.stringify(userContext)}
User Memory Profile: ${JSON.stringify(userMemory)}
Recent Conversation History: ${JSON.stringify(conversationHistory)}

🧩 Your core principles:
- Be empathetic, positive, and encouraging — never robotic.
- Understand the user's mood and respond with genuine emotional intelligence.
- Give practical and simple actions they can take right now to feel better or stay consistent.
- Track user progress, routines, and goals through Supabase memory logs.
- Encourage reflection, discipline, and balance without judgment.
- Adapt your advice based on the user's tone, preferences, and past responses.

💬 Interaction Style:
- Conversational, natural, and short when needed.
- Use friendly emojis and motivational tones (not overused).

⚙️ Behavior Rules:
- Always keep responses under 100 words unless the user asks for details.
- If user mood is "low" or "demotivated," focus on kindness and quick relief actions.
- If user mood is "positive," focus on growth, gratitude, and optimization.
- Avoid generic quotes — personalize based on context.
- Maintain a warm, coach-like tone, not a chatbot vibe.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again shortly.', success: false }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to your Lovable workspace.', success: false }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'AI service error. Please try again later.', success: false }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    const enhancedMemory = {
      ...userMemory,
      lastInteraction: new Date().toISOString(),
      recentTopics: [
        ...(userMemory.recentTopics || []).slice(-4),
        message.substring(0, 100)
      ],
      conversationCount: (userMemory.conversationCount || 0) + 1,
      responsePatterns: {
        avgResponseLength: aiResponse.length,
        topics: extractTopicsFromMessage(message),
        sentiment: analyzeSentiment(message)
      },
      learningInsights: generateLearningInsights(userContext, userMemory)
    };

    await supabase
      .from('user_ai_memory')
      .upsert({
        user_id: userId,
        memory_data: enhancedMemory,
        updated_at: new Date().toISOString()
      });

    await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        message,
        response: aiResponse,
        context_data: {
          userContext,
          memorySnapshot: userMemory,
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      });

    const personalityInsight = generatePersonalityInsight(userMemory, userContext);

    return new Response(JSON.stringify({
      response: aiResponse,
      personalityInsight,
      memoryUpdated: true,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred. Please try again later.',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractTopicsFromMessage(message: string): string[] {
  const topics: string[] = [];
  const keywords = ['morning', 'routine', 'habit', 'goal', 'work', 'exercise', 'sleep', 'productivity', 'motivation', 'stress', 'focus'];
  const lowerMessage = message.toLowerCase();
  keywords.forEach(k => { if (lowerMessage.includes(k)) topics.push(k); });
  return topics;
}

function analyzeSentiment(message: string): string {
  const positive = ['happy', 'excited', 'motivated', 'great', 'awesome', 'good', 'amazing', 'fantastic'];
  const negative = ['sad', 'frustrated', 'tired', 'overwhelmed', 'stressed', 'bad', 'difficult', 'struggling'];
  const lower = message.toLowerCase();
  const p = positive.filter(w => lower.includes(w)).length;
  const n = negative.filter(w => lower.includes(w)).length;
  if (p > n) return 'positive';
  if (n > p) return 'negative';
  return 'neutral';
}

function generateLearningInsights(userContext: any, userMemory: any): any {
  return {
    taskPatterns: {
      completionTrend: userContext?.completionRate,
      preferredCategory: userContext?.mostUsedCategory,
      consistencyScore: calculateConsistencyScore(userContext)
    },
    communicationStyle: {
      preferredLength: (userMemory?.conversationCount || 0) > 5 ? 'detailed' : 'concise',
      responsiveness: userMemory?.lastInteraction ? 'active' : 'new'
    },
    motivationProfile: {
      triggers: userMemory?.motivationTriggers || [],
      effectiveness: (userContext?.completionRate || 0) > 70 ? 'high' : 'moderate'
    }
  };
}

function calculateConsistencyScore(userContext: any): number {
  const baseScore = userContext?.completionRate || 0;
  const taskFrequency = (userContext?.totalTasks || 0) > 10 ? 20 : (userContext?.totalTasks || 0) * 2;
  return Math.min(100, baseScore + taskFrequency);
}

function generatePersonalityInsight(userMemory: any, _userContext: any): string {
  if (!userMemory || !userMemory.conversationCount) return "Building your personality profile";
  const insights = [
    "Adapting to your communication style",
    "Learning from your patterns",
    "Remembering your preferences",
    "Tracking your progress",
    "Personalizing advice based on history"
  ];
  return insights[(userMemory.conversationCount || 0) % insights.length];
}
