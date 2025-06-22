
import { useState, useEffect } from 'react';
import { Brain, Lightbulb, Target, Check, X, Star } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Task } from '@/types/task';
import { toast } from 'sonner';

interface MicroHabit {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  reason: string;
  completed: boolean;
  dateAdded: string;
  completedDates: string[];
}

interface MicroHabitsProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onTasksGenerated: (tasks: Omit<Task, 'id'>[]) => void;
}

export function MicroHabits({ tasks, isOpen, onClose, onTasksGenerated }: MicroHabitsProps) {
  const [microHabits, setMicroHabits] = useLocalStorage<MicroHabit[]>('routine-micro-habits', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<MicroHabit | null>(null);

  const generateMicroHabits = () => {
    setIsGenerating(true);
    
    // Analyze user's existing tasks to generate personalized micro-habits
    const categories = tasks.map(task => task.category);
    const mostUsedCategory = categories.reduce((a, b, i, arr) => 
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    );

    const completedTasks = tasks.filter(task => task.completed);
    const averageCompletionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    // Generate micro-habits based on user patterns
    const habitTemplates = [
      {
        title: "2 minutes of silence after lunch",
        description: "Take a moment to breathe and center yourself",
        category: "mindfulness",
        difficulty: "easy" as const,
        estimatedTime: "2 minutes",
        reason: "Perfect for reducing afternoon stress and improving focus"
      },
      {
        title: "Write down 3 things you're grateful for",
        description: "Quick gratitude practice before bed",
        category: "personal",
        difficulty: "easy" as const,
        estimatedTime: "3 minutes",
        reason: "Builds positive mindset and improves sleep quality"
      },
      {
        title: "Do 10 jumping jacks between tasks",
        description: "Quick energy boost during work breaks",
        category: "exercise",
        difficulty: "easy" as const,
        estimatedTime: "1 minute",
        reason: "Increases blood flow and mental clarity"
      },
      {
        title: "Drink a glass of water when you wake up",
        description: "Hydrate immediately after waking",
        category: "health",
        difficulty: "easy" as const,
        estimatedTime: "30 seconds",
        reason: "Kickstarts metabolism and improves alertness"
      },
      {
        title: "Read one page of a book daily",
        description: "Consistent learning habit",
        category: "study",
        difficulty: "easy" as const,
        estimatedTime: "5 minutes",
        reason: "Builds knowledge and reading habit gradually"
      },
      {
        title: "Take 5 deep breaths before checking phone",
        description: "Mindful phone usage practice",
        category: "mindfulness",
        difficulty: "medium" as const,
        estimatedTime: "1 minute",
        reason: "Reduces phone addiction and increases mindfulness"
      }
    ];

    // Select 3 random habits
    const selectedHabits = habitTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(habit => ({
        ...habit,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        completed: false,
        dateAdded: new Date().toISOString().split('T')[0],
        completedDates: []
      }));

    setTimeout(() => {
      setMicroHabits([...microHabits, ...selectedHabits]);
      setIsGenerating(false);
      toast.success('New micro-habits generated based on your patterns!');
    }, 2000);
  };

  const addHabitToRoutine = (habit: MicroHabit) => {
    const newTask = {
      title: habit.title,
      duration: parseInt(habit.estimatedTime) || 5,
      date: new Date().toISOString().split('T')[0],
      category: habit.category,
      notes: `${habit.description}\n\nWhy: ${habit.reason}`,
      completed: false,
      photos: []
    };

    onTasksGenerated([newTask]);
    toast.success(`Added "${habit.title}" to your routine!`);
  };

  const markHabitCompleted = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setMicroHabits(microHabits.map(habit => {
      if (habit.id === habitId) {
        const isAlreadyCompleted = habit.completedDates.includes(today);
        return {
          ...habit,
          completed: !isAlreadyCompleted,
          completedDates: isAlreadyCompleted 
            ? habit.completedDates.filter(date => date !== today)
            : [...habit.completedDates, today]
        };
      }
      return habit;
    }));
    
    toast.success('Micro-habit progress updated!');
  };

  const deleteHabit = (habitId: string) => {
    setMicroHabits(microHabits.filter(habit => habit.id !== habitId));
    toast.success('Micro-habit removed');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🧠 AI Micro-Habits
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Small experiments, major results
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Generate New Habits */}
          <div className="mb-6">
            <button
              onClick={generateMicroHabits}
              disabled={isGenerating}
              className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing your patterns...
                </>
              ) : (
                <>
                  <Lightbulb className="w-5 h-5" />
                  Generate New Micro-Habits
                </>
              )}
            </button>
          </div>

          {/* Current Micro-Habits */}
          {microHabits.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Micro-Habits ({microHabits.length})
              </h3>
              
              {microHabits.map((habit) => {
                const today = new Date().toISOString().split('T')[0];
                const completedToday = habit.completedDates.includes(today);
                const streak = habit.completedDates.length;
                
                return (
                  <div key={habit.id} className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {habit.title}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(habit.difficulty)}`}>
                            {habit.difficulty}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {habit.estimatedTime}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                          {habit.description}
                        </p>
                        
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          💡 {habit.reason}
                        </p>
                        
                        {streak > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                              {streak} day{streak > 1 ? 's' : ''} completed
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => markHabitCompleted(habit.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            completedToday
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-500 hover:text-white'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => addHabitToRoutine(habit)}
                          className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          title="Add to routine"
                        >
                          <Target className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Micro-Habits Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Generate AI-powered micro-habits based on your routine patterns
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
