import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Task } from '@/types/task';
import { Brain, CalendarDays, TrendingUp, Target, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TaskCalendarProps {
  tasks: Task[];
}

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [tasks]);

  // Dates that have tasks
  const datesWithTasks = useMemo(() => {
    return Object.keys(tasksByDate).map(d => new Date(d + 'T00:00:00'));
  }, [tasksByDate]);

  // Tasks for selected date
  const selectedDateStr = selectedDate?.toISOString().split('T')[0] || '';
  const selectedTasks = tasksByDate[selectedDateStr] || [];

  // Monthly stats
  const monthStats = useMemo(() => {
    if (!selectedDate) return { total: 0, completed: 0, rate: 0 };
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    const monthTasks = tasks.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const completed = monthTasks.filter(t => t.completed).length;
    return {
      total: monthTasks.length,
      completed,
      rate: monthTasks.length > 0 ? Math.round((completed / monthTasks.length) * 100) : 0
    };
  }, [tasks, selectedDate]);

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    setShowAnalysis(true);
    try {
      // Build context from calendar data
      const month = selectedDate?.getMonth() || new Date().getMonth();
      const year = selectedDate?.getFullYear() || new Date().getFullYear();
      const monthTasks = tasks.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      const categories = monthTasks.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const completedByDay = monthTasks.reduce((acc, t) => {
        if (t.completed) acc[t.date] = (acc[t.date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const context = {
        month: new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' }),
        totalTasks: monthTasks.length,
        completedTasks: monthTasks.filter(t => t.completed).length,
        categories,
        activeDays: Object.keys(completedByDay).length,
        topCategories: Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 3),
        recentTasks: monthTasks.slice(-5).map(t => ({ title: t.title, completed: t.completed, category: t.category }))
      };

      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: `Analyze my task calendar for ${context.month}. Here's my data: ${JSON.stringify(context)}. Give me insights about my productivity patterns, what I'm doing well, areas to improve, and actionable suggestions. Keep it under 150 words.`,
          userId: 'calendar_analysis',
          userContext: context
        }
      });

      if (error) throw error;
      if (data?.success) {
        setAiAnalysis(data.response);
      } else {
        throw new Error(data?.error || 'Failed to get analysis');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to get AI analysis');
      setAiAnalysis('Unable to analyze at this time. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent-important': return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
      case 'not-urgent-important': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
      case 'urgent-not-important': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700';
      default: return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Card */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Task Calendar</h3>
        </div>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md pointer-events-auto"
          modifiers={{ hasTasks: datesWithTasks }}
          modifiersStyles={{
            hasTasks: {
              fontWeight: 'bold',
              textDecoration: 'underline',
              textDecorationColor: 'hsl(var(--primary))',
              textUnderlineOffset: '4px'
            }
          }}
        />

        {/* Monthly Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="p-2 rounded-lg bg-muted">
            <p className="text-lg font-bold text-foreground">{monthStats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-2 rounded-lg bg-muted">
            <p className="text-lg font-bold text-green-600">{monthStats.completed}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div className="p-2 rounded-lg bg-muted">
            <p className="text-lg font-bold text-primary">{monthStats.rate}%</p>
            <p className="text-xs text-muted-foreground">Rate</p>
          </div>
        </div>
      </div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <div className="glass-card rounded-2xl p-4">
          <h4 className="font-semibold text-foreground text-sm mb-2">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </h4>
          {selectedTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">No tasks on this date</p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {selectedTasks.map(task => (
                <div key={task.id} className={`p-2 rounded-lg border text-xs ${getPriorityColor(task.priority)} ${task.completed ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                  </div>
                  <span className="text-muted-foreground ml-3">{task.category} • {task.startTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Analysis */}
      <div className="glass-card rounded-2xl p-4">
        <button
          onClick={showAnalysis ? () => setShowAnalysis(false) : analyzeWithAI}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <h4 className="font-semibold text-foreground text-sm">AI Calendar Analysis</h4>
          </div>
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
          ) : showAnalysis ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {showAnalysis && (
          <div className="mt-3">
            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing your calendar patterns...
              </div>
            ) : aiAnalysis ? (
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                {aiAnalysis}
              </div>
            ) : null}
            {!isAnalyzing && (
              <button
                onClick={analyzeWithAI}
                className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                🔄 Re-analyze
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
