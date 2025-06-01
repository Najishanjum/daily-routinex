
import { Task, ViewMode, CATEGORIES } from '@/types/task';

interface DailyStatsProps {
  tasks: Task[];
  viewMode: ViewMode;
  selectedDate: string;
}

export function DailyStats({ tasks, viewMode, selectedDate }: DailyStatsProps) {
  const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const categoryStats = CATEGORIES.map(category => {
    const categoryTasks = tasks.filter(task => task.category === category.id);
    const categoryMinutes = categoryTasks.reduce((sum, task) => sum + task.duration, 0);
    const percentage = totalMinutes > 0 ? (categoryMinutes / totalMinutes) * 100 : 0;
    
    return {
      ...category,
      tasks: categoryTasks.length,
      minutes: categoryMinutes,
      percentage: Math.round(percentage)
    };
  }).filter(stat => stat.tasks > 0);

  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      default: return 'Total';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {getViewModeLabel()} Summary
        </h3>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {totalHours > 0 ? `${totalHours}h ` : ''}
          {remainingMinutes}m
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {categoryStats.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Categories</h4>
          {categoryStats.map((stat) => (
            <div key={stat.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium category-${stat.id} px-2 py-1 rounded-lg border`}>
                  {stat.label}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.floor(stat.minutes / 60) > 0 ? `${Math.floor(stat.minutes / 60)}h ` : ''}
                  {stat.minutes % 60}m
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-routine-${stat.color}`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">📊</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No data to show yet.
            <br />
            Add some tasks to see your stats!
          </p>
        </div>
      )}
    </div>
  );
}
