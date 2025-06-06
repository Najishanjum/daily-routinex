
import { useState, useEffect } from 'react';
import { Target, Calendar, CheckCircle, Clock, Lightbulb, X, Plus } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Task } from '@/types/task';
import { toast } from 'sonner';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  category: string;
  createdAt: string;
  completed: boolean;
  dailyTasks: string[];
  progress: number;
}

interface AIGoalPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksGenerated: (tasks: Omit<Task, 'id'>[]) => void;
}

export function AIGoalPlanner({ isOpen, onClose, onTasksGenerated }: AIGoalPlannerProps) {
  const [goals, setGoals] = useLocalStorage<Goal[]>('routine-goals', []);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'study'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // AI-like goal breakdown logic
  const generateDailyTasks = (goal: string, description: string, days: number, category: string): string[] => {
    const taskTemplates: Record<string, string[]> = {
      study: [
        'Review fundamentals and basic concepts',
        'Study core principles and theory',
        'Practice with hands-on exercises',
        'Work on practical projects',
        'Review and reinforce learning',
        'Take practice tests or quizzes',
        'Apply knowledge to real scenarios'
      ],
      exercise: [
        'Start with light warm-up exercises',
        'Focus on form and technique',
        'Increase intensity gradually',
        'Add variety to workout routine',
        'Work on endurance building',
        'Practice advanced techniques',
        'Maintain consistency and review progress'
      ],
      work: [
        'Research and gather requirements',
        'Plan and outline approach',
        'Begin initial implementation',
        'Develop core components',
        'Refine and optimize',
        'Test and validate results',
        'Finalize and document'
      ],
      personal: [
        'Set clear objectives and plan',
        'Start with small actionable steps',
        'Build momentum with daily practice',
        'Expand scope and challenge yourself',
        'Seek feedback and adjust approach',
        'Consolidate gains and habits',
        'Reflect on progress and celebrate'
      ],
      health: [
        'Establish baseline and goals',
        'Create healthy daily routines',
        'Focus on consistency over intensity',
        'Monitor progress and adjust',
        'Build sustainable habits',
        'Address challenges and obstacles',
        'Maintain long-term commitment'
      ]
    };

    const templates = taskTemplates[category] || taskTemplates.personal;
    const tasks: string[] = [];
    
    // Create a progression based on the goal
    const goalLower = goal.toLowerCase();
    const isLearning = goalLower.includes('learn') || goalLower.includes('study');
    const isSkill = goalLower.includes('skill') || goalLower.includes('practice');
    const isHabit = goalLower.includes('habit') || goalLower.includes('daily');

    for (let i = 0; i < days; i++) {
      const progress = i / (days - 1);
      let taskPrefix = '';
      
      if (isLearning) {
        if (progress < 0.3) taskPrefix = 'Learn basics of ';
        else if (progress < 0.6) taskPrefix = 'Practice ';
        else if (progress < 0.8) taskPrefix = 'Master ';
        else taskPrefix = 'Apply ';
      } else if (isSkill) {
        if (progress < 0.4) taskPrefix = 'Practice fundamentals of ';
        else if (progress < 0.7) taskPrefix = 'Develop skills in ';
        else taskPrefix = 'Perfect ';
      } else if (isHabit) {
        taskPrefix = 'Continue building habit: ';
      } else {
        taskPrefix = 'Work on ';
      }

      const templateIndex = Math.floor(progress * templates.length);
      const template = templates[Math.min(templateIndex, templates.length - 1)];
      
      tasks.push(`${taskPrefix}${goal.toLowerCase()} - ${template}`);
    }

    return tasks;
  };

  const calculateDaysUntilTarget = (targetDate: string): number => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const handleCreateGoal = async () => {
    if (!formData.title || !formData.targetDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    
    try {
      const days = calculateDaysUntilTarget(formData.targetDate);
      const dailyTasks = generateDailyTasks(formData.title, formData.description, days, formData.category);
      
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        targetDate: formData.targetDate,
        category: formData.category,
        createdAt: new Date().toISOString(),
        completed: false,
        dailyTasks,
        progress: 0
      };

      setGoals([...goals, newGoal]);

      // Generate actual tasks for the task system
      const tasksToAdd: Omit<Task, 'id'>[] = [];
      const startDate = new Date();
      
      dailyTasks.forEach((taskTitle, index) => {
        const taskDate = new Date(startDate);
        taskDate.setDate(startDate.getDate() + index);
        
        tasksToAdd.push({
          title: taskTitle,
          duration: 30,
          date: taskDate.toISOString().split('T')[0],
          category: formData.category,
          notes: `Part of goal: ${formData.title}`,
          completed: false
        });
      });

      onTasksGenerated(tasksToAdd);
      
      toast.success(`Goal created! Generated ${dailyTasks.length} daily tasks`);
      setShowCreateForm(false);
      setFormData({ title: '', description: '', targetDate: '', category: 'study' });
      
    } catch (error) {
      toast.error('Failed to create goal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
    toast.success('Goal deleted');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Goal Planner
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Break down big goals into achievable daily tasks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Create Goal Button */}
          {!showCreateForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create New Goal
              </button>
            </div>
          )}

          {/* Create Goal Form */}
          {showCreateForm && (
            <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Goal
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Learn Python Programming"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Additional details about your goal..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Date *
                    </label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="study">Study</option>
                      <option value="exercise">Exercise</option>
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="health">Health</option>
                      <option value="hobby">Hobby</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateGoal}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {isGenerating ? 'Generating...' : 'Generate Daily Tasks'}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Goals List */}
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Goals Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create your first goal and let AI break it down into daily tasks
                </p>
              </div>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="p-6 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {goal.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {goal.dailyTasks.length} daily tasks
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        goal.completed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {goal.completed ? 'Completed' : 'Active'}
                      </span>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Daily Tasks Preview:</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {goal.dailyTasks.slice(0, 5).map((task, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-gray-400" />
                          Day {index + 1}: {task}
                        </div>
                      ))}
                      {goal.dailyTasks.length > 5 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          ... and {goal.dailyTasks.length - 5} more tasks
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
