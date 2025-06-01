
import { TaskCard } from './TaskCard';
import { Task, ViewMode } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  viewMode: ViewMode;
}

export function TaskList({ tasks, onEditTask, onDeleteTask, viewMode }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No tasks found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {viewMode === 'daily' ? "You haven't added any tasks for today yet." :
           viewMode === 'weekly' ? "No tasks found for this week." :
           "No tasks found for this month."}
        </p>
      </div>
    );
  }

  // Group tasks by date for weekly/monthly views
  const groupedTasks = tasks.reduce((groups, task) => {
    const date = task.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  if (viewMode === 'daily') {
    return (
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([date, dateTasks]) => (
          <div key={date} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            {dateTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        ))}
    </div>
  );
}
