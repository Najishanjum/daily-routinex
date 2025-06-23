
import { Task, PRIORITIES } from '@/types/task';
import { TaskCard } from './TaskCard';

interface PriorityMatrixProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function PriorityMatrix({ tasks, onEditTask, onDeleteTask }: PriorityMatrixProps) {
  const tasksByPriority = tasks.reduce((acc, task) => {
    const priority = task.priority || 'low-priority';
    if (!acc[priority]) {
      acc[priority] = [];
    }
    acc[priority].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const getQuadrantClass = (priorityId: string) => {
    switch (priorityId) {
      case 'urgent-important':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'not-urgent-important':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'urgent-not-important':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'low-priority':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Priority Matrix (Eisenhower Matrix)
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Organize your tasks by urgency and importance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PRIORITIES.map((priority) => {
          const priorityTasks = tasksByPriority[priority.id] || [];
          
          return (
            <div
              key={priority.id}
              className={`p-6 rounded-2xl border-2 ${getQuadrantClass(priority.id)}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{priority.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {priority.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {priority.description}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">
                    {priorityTasks.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {priorityTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2 opacity-50">{priority.icon}</div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No {priority.label.toLowerCase()} tasks
                    </p>
                  </div>
                ) : (
                  priorityTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
