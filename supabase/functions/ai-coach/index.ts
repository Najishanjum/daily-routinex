
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

    // Get user's memory/context from database
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

    // Get recent conversation history for context
    let conversationHistory = [];
    if (userId) {
      const { data: historyData } = await supabase
        .from('ai_conversations')
        .select('message, response')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (historyData) {
        conversationHistory = historyData;
      }
    }

    // Enhanced system prompt with memory capabilities
    const systemPrompt = `You are RoutineX AI Coach with Private Memory - an advanced AI companion that remembers user preferences, patterns, and provides increasingly personalized advice.

User Context: ${JSON.stringify(userContext)}
User Memory Profile: ${JSON.stringify(userMemory)}
Recent Conversation History: ${JSON.stringify(conversationHistory)}

MEMORY CAPABILITIES:
- Remember user's communication style, mood patterns, and preferences
- Track user's goals, challenges, and motivation triggers
- Provide continuity across conversations
- Adapt your personality and advice based on learned patterns

GUIDELINES:
- Be empathetic, supportive, and increasingly personalized
- Reference previous conversations when relevant
- Adapt your tone to match user's preferred communication style
- Remember user's goals and track their progress over time
- Suggest specific, actionable steps based on their patterns
- Celebrate their achievements and acknowledge struggles
- Use insights from their task completion patterns and preferences

PERSONALIZATION FEATURES:
1. Mood-aware responses (adapt to their current emotional state)
2. Pattern recognition (identify what works for them)
3. Preference learning (remember their likes/dislikes)
4. Goal continuity (track long-term objectives)
5. Motivation triggers (use what energizes them)

Always provide:
1. Empathetic acknowledgment with personal touch
2. Practical actionable advice based on their patterns
3. Specific next steps tailored to their preferences
4. Encouragement that references their progress
5. Memory-based insights when relevant

If this is a returning user, acknowledge their history and build on previous conversations. If new, focus on learning about them.`;

    console.log('Sending enhanced request to OpenAI with memory context...');
    
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
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Enhanced memory update
    if (userId) {
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
    }

    // Store detailed conversation with context
    if (userId) {
      await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          message: message,
          response: aiResponse,
          context_data: {
            userContext,
            memorySnapshot: userMemory,
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });
    }

    // Generate personality insight for the response
    const personalityInsight = generatePersonalityInsight(userMemory, userContext);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      personalityInsight: personalityInsight,
      memoryUpdated: true,
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

// Helper functions for enhanced memory processing
function extractTopicsFromMessage(message: string): string[] {
  const topics = [];
  const keywords = ['morning', 'routine', 'habit', 'goal', 'work', 'exercise', 'sleep', 'productivity', 'motivation', 'stress', 'focus'];
  const lowerMessage = message.toLowerCase();
  
  keywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) topics.push(keyword);
  });
  
  return topics;
}

function analyzeSentiment(message: string): string {
  const positive = ['happy', 'excited', 'motivated', 'great', 'awesome', 'good', 'amazing', 'fantastic'];
  const negative = ['sad', 'frustrated', 'tired', 'overwhelmed', 'stressed', 'bad', 'difficult', 'struggling'];
  
  const lowerMessage = message.toLowerCase();
  
  const positiveCount = positive.filter(word => lowerMessage.includes(word)).length;
  const negativeCount = negative.filter(word => lowerMessage.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function generateLearningInsights(userContext: any, userMemory: any): any {
  return {
    taskPatterns: {
      completionTrend: userContext.completionRate,
      preferredCategory: userContext.mostUsedCategory,
      consistencyScore: calculateConsistencyScore(userContext)
    },
    communicationStyle: {
      preferredLength: userMemory.conversationCount > 5 ? 'detailed' : 'concise',
      responsiveness: userMemory.lastInteraction ? 'active' : 'new'
    },
    motivationProfile: {
      triggers: userMemory.motivationTriggers || [],
      effectiveness: userContext.completionRate > 70 ? 'high' : 'moderate'
    }
  };
}

function calculateConsistencyScore(userContext: any): number {
  // Simple consistency calculation based on completion rate and task frequency
  const baseScore = userContext.completionRate || 0;
  const taskFrequency = userContext.totalTasks > 10 ? 20 : userContext.totalTasks * 2;
  return Math.min(100, baseScore + taskFrequency);
}

function generatePersonalityInsight(userMemory: any, userContext: any): string {
  if (!userMemory || !userMemory.conversationCount) {
    return "Building your personality profile";
  }
  
  const insights = [
    "Adapting to your communication style",
    "Learning from your patterns",
    "Remembering your preferences",
    "Tracking your progress",
    "Personalizing advice based on history"
  ];
  
  const insightIndex = (userMemory.conversationCount || 0) % insights.length;
  return insights[insightIndex];
}
