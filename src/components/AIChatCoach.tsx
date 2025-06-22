
import { useState, useRef, useEffect } from 'react';
import { Brain, Send, X, MessageCircle, Loader2, Star, Heart, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  mood?: string;
  personalityInsight?: string;
}

interface UserMemory {
  preferences: {
    communicationStyle: string;
    preferredTone: string;
    goals: string[];
    challenges: string[];
  };
  patterns: {
    mostActiveTime: string;
    completionRate: number;
    motivationTriggers: string[];
  };
  personalContext: {
    mood: string;
    recentTopics: string[];
    lastInteraction: string;
  };
}

interface AIChatCoachProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
}

export function AIChatCoach({ isOpen, onClose, tasks }: AIChatCoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(() => 'user_' + Date.now());
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null);
  const [showMemoryInsights, setShowMemoryInsights] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user memory when coach opens
  useEffect(() => {
    if (isOpen) {
      loadUserMemory();
      if (messages.length === 0) {
        initializeWelcomeMessage();
      }
    }
  }, [isOpen]);

  const loadUserMemory = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ai_memory')
        .select('memory_data')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setUserMemory(data.memory_data as UserMemory);
      }
    } catch (error) {
      console.log('No existing memory found, will create new one');
    }
  };

  const initializeWelcomeMessage = () => {
    const welcomeContent = userMemory 
      ? `Welcome back! I remember our last conversation was about ${userMemory.personalContext?.recentTopics?.[0] || 'your goals'}. How are you feeling today?`
      : "Hi! I'm your RoutineX AI Coach with Private Memory. I'll learn your patterns, preferences, and provide increasingly personalized advice. What's on your mind today?";

    setMessages([{
      id: '1',
      type: 'ai',
      content: welcomeContent,
      timestamp: new Date(),
      personalityInsight: userMemory ? "Personalized based on your history" : "Getting to know you"
    }]);
  };

  const generateUserContext = () => {
    const completedTasks = tasks.filter(task => task.completed);
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    const categories = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});

    const mostUsedCategory = Object.entries(categories).reduce((a, b) => 
      categories[a[0]] > categories[b[0]] ? a : b, ['none', 0])[0];

    // Enhanced context with memory
    return {
      totalTasks,
      completedTasks: completedTasks.length,
      completionRate: Math.round(completionRate),
      mostUsedCategory,
      recentTaskTitles: tasks.slice(-3).map(t => t.title),
      userMemory: userMemory,
      conversationHistory: messages.slice(-5) // Recent conversation context
    };
  };

  const updateUserMemory = async (message: string, aiResponse: string) => {
    try {
      // Analyze message for mood and patterns
      const mood = detectMood(message);
      const topics = extractTopics(message);
      
      const updatedMemory: UserMemory = {
        preferences: {
          communicationStyle: userMemory?.preferences?.communicationStyle || 'supportive',
          preferredTone: userMemory?.preferences?.preferredTone || 'encouraging',
          goals: [...(userMemory?.preferences?.goals || []), ...extractGoals(message)].slice(-5),
          challenges: [...(userMemory?.preferences?.challenges || []), ...extractChallenges(message)].slice(-5)
        },
        patterns: {
          mostActiveTime: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
          completionRate: generateUserContext().completionRate,
          motivationTriggers: [...(userMemory?.patterns?.motivationTriggers || []), ...detectMotivationTriggers(message)].slice(-5)
        },
        personalContext: {
          mood: mood,
          recentTopics: [...(userMemory?.personalContext?.recentTopics || []), ...topics].slice(-5),
          lastInteraction: new Date().toISOString()
        }
      };

      await supabase
        .from('user_ai_memory')
        .upsert({
          user_id: userId,
          memory_data: updatedMemory,
          updated_at: new Date().toISOString()
        });

      setUserMemory(updatedMemory);
    } catch (error) {
      console.error('Error updating user memory:', error);
    }
  };

  // Helper functions for memory analysis
  const detectMood = (message: string): string => {
    const positive = ['happy', 'excited', 'motivated', 'great', 'awesome', 'good'];
    const negative = ['sad', 'frustrated', 'tired', 'overwhelmed', 'stressed', 'bad'];
    const neutral = ['okay', 'fine', 'normal', 'alright'];

    const lowerMessage = message.toLowerCase();
    
    if (positive.some(word => lowerMessage.includes(word))) return 'positive';
    if (negative.some(word => lowerMessage.includes(word))) return 'negative';
    if (neutral.some(word => lowerMessage.includes(word))) return 'neutral';
    return 'neutral';
  };

  const extractTopics = (message: string): string[] => {
    const topics = [];
    const keywords = ['morning', 'routine', 'habit', 'goal', 'work', 'exercise', 'sleep', 'productivity', 'motivation'];
    const lowerMessage = message.toLowerCase();
    
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) topics.push(keyword);
    });
    
    return topics;
  };

  const extractGoals = (message: string): string[] => {
    const goalKeywords = ['want to', 'goal', 'achieve', 'improve', 'better at'];
    const goals = [];
    const lowerMessage = message.toLowerCase();
    
    goalKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        goals.push(keyword);
      }
    });
    
    return goals;
  };

  const extractChallenges = (message: string): string[] => {
    const challengeKeywords = ['struggling', 'difficult', 'hard', 'challenge', 'problem'];
    const challenges = [];
    const lowerMessage = message.toLowerCase();
    
    challengeKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        challenges.push(keyword);
      }
    });
    
    return challenges;
  };

  const detectMotivationTriggers = (message: string): string[] => {
    const triggers = [];
    const motivationWords = ['achievement', 'progress', 'success', 'reward', 'milestone'];
    const lowerMessage = message.toLowerCase();
    
    motivationWords.forEach(word => {
      if (lowerMessage.includes(word)) triggers.push(word);
    });
    
    return triggers;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      mood: detectMood(inputMessage)
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const userContext = generateUserContext();
      
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: currentMessage,
          userId: userId,
          userContext: userContext
        }
      });

      if (error) throw error;

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.response,
          timestamp: new Date(),
          personalityInsight: data.personalityInsight || "Learning from this interaction"
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Update user memory with this interaction
        await updateUserMemory(currentMessage, data.response);
        
        if ((window as any).routineXSpeak) {
          (window as any).routineXSpeak(data.response);
        }
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "I feel demotivated today. What should I do?",
    "Give me a smarter morning routine",
    "How can I be more productive?",
    "I'm struggling with consistency",
    "What habits should I focus on?",
    "Remember my preferences for next time"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                🤖 AI Coach
                {userMemory && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-600 dark:text-purple-400">Premium Memory</span>
                  </div>
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {userMemory 
                  ? `Personal AI companion • Remembers your patterns & preferences`
                  : `Your personal productivity companion • Building your memory profile...`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userMemory && (
              <button
                onClick={() => setShowMemoryInsights(!showMemoryInsights)}
                className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                title="View Memory Insights"
              >
                <Heart className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Memory Insights Panel */}
        {showMemoryInsights && userMemory && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
            <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">
              🧠 Memory Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <strong>Current Mood:</strong> {userMemory.personalContext.mood}
              </div>
              <div>
                <strong>Recent Topics:</strong> {userMemory.personalContext.recentTopics.slice(-2).join(', ') || 'None yet'}
              </div>
              <div>
                <strong>Completion Rate:</strong> {userMemory.patterns.completionRate}%
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border-l-4 border-purple-400'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                    {message.mood && (
                      <span className="ml-2">• Mood: {message.mood}</span>
                    )}
                  </p>
                  {message.personalityInsight && (
                    <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {message.personalityInsight}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl border-l-4 border-purple-400">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    AI Coach is thinking... {userMemory && "Using your memory profile"}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-6 py-4 border-t border-white/10">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={userMemory 
                ? "Share your thoughts... I'll remember for next time 🧠" 
                : "Ask your AI coach anything..."
              }
              className="flex-1 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
