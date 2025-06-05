
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, Sparkles } from 'lucide-react';
import { Task } from '@/types/task';
import { toast } from 'sonner';

interface AIChatCompanionProps {
  tasks: Task[];
}

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export function AIChatCompanion({ tasks }: AIChatCompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message when first opened
      setTimeout(() => {
        addBotMessage("Hi there! I'm your RoutineX Assistant 🤖 I'm here to help you stay on track with your routines. How can I assist you today?");
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    // Check for overdue tasks and send motivational messages
    const checkOverdueTasks = () => {
      const today = new Date().toISOString().split('T')[0];
      const overdueTasks = tasks.filter(task => 
        task.date < today && !task.completed
      );

      if (overdueTasks.length > 0 && !isOpen) {
        // Show notification for overdue tasks
        setTimeout(() => {
          if (!isOpen) {
            toast.info('RoutineX Assistant has some motivational tips for you!');
          }
        }, 3000);
      }
    };

    checkOverdueTasks();
  }, [tasks, isOpen]);

  const addBotMessage = (text: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const generateBotResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(task => task.date === today);
    const completedTasks = todayTasks.filter(task => task.completed);
    const overdueTasks = tasks.filter(task => task.date < today && !task.completed);

    // Routine suggestions
    if (input.includes('suggest') || input.includes('routine') || input.includes('recommend')) {
      const suggestions = [
        "🌅 Start your day with a 10-minute morning meditation",
        "💪 Add a 20-minute workout to boost your energy",
        "📚 Schedule 30 minutes of reading before bed",
        "💧 Set hourly water break reminders",
        "🎯 Try the Pomodoro technique for focused work sessions"
      ];
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      return `Here's a great routine suggestion for you: ${randomSuggestion}. Would you like me to help you add this to your tasks?`;
    }

    // Progress check-in
    if (input.includes('progress') || input.includes('how') || input.includes('doing')) {
      if (todayTasks.length === 0) {
        return "You haven't added any tasks for today yet. Would you like some suggestions to get started? 🚀";
      }
      const completionRate = Math.round((completedTasks.length / todayTasks.length) * 100);
      return `You're doing great! You've completed ${completedTasks.length} out of ${todayTasks.length} tasks today (${completionRate}%). ${completionRate >= 70 ? 'Fantastic work! 🎉' : 'Keep going, you\'ve got this! 💪'}`;
    }

    // Motivation for overdue tasks
    if (input.includes('overdue') || input.includes('behind') || input.includes('missed')) {
      if (overdueTasks.length === 0) {
        return "Great news! You don't have any overdue tasks. You're staying on top of things! 🌟";
      }
      return `I see you have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Don't worry, it happens to everyone! Let's focus on today and get back on track. Small progress is still progress! 🎯`;
    }

    // General motivation
    if (input.includes('motivate') || input.includes('encourage') || input.includes('help')) {
      const motivationalMessages = [
        "Remember, every small step counts! You're building better habits one task at a time. 🌱",
        "Consistency beats perfection every time. Keep showing up for yourself! 💪",
        "You've overcome challenges before, and you'll do it again. I believe in you! ✨",
        "Progress isn't always linear, but you're moving in the right direction! 🚀",
        "Your future self will thank you for the work you're putting in today! 🌟"
      ];
      const randomMotivation = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      return randomMotivation;
    }

    // Default responses
    const defaultResponses = [
      "I'm here to help you with your routines! Try asking me about your progress, or ask for routine suggestions. 😊",
      "That's interesting! I can help you with routine suggestions, progress check-ins, or motivation. What would you like to know? 🤖",
      "I'm your personal routine assistant! I can suggest new habits, check your progress, or give you a motivational boost. How can I help? ✨"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    const userInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateBotResponse(userInput);
      addBotMessage(response);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { text: "How am I doing today?", action: () => setInputValue("How am I doing today?") },
    { text: "Suggest a routine", action: () => setInputValue("Suggest a routine") },
    { text: "Motivate me", action: () => setInputValue("Motivate me") },
    { text: "Check overdue tasks", action: () => setInputValue("Check overdue tasks") }
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
        <button
          onClick={() => setIsOpen(true)}
          className="floating-button bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          title="Open RoutineX Assistant"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <span className="hidden sm:block text-sm font-medium">Assistant</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
      <div className="glass-card rounded-2xl w-80 md:w-96 h-96 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
              <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">RoutineX Assistant</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your personal routine helper</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.isBot
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-gray-800 dark:text-gray-200'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick actions:</p>
            <div className="grid grid-cols-2 gap-1">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="text-xs p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/20 dark:border-gray-700/20">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your routines..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
