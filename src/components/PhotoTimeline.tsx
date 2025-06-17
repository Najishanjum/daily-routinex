
import { Task, CATEGORIES } from '@/types/task';
import { Calendar, Clock } from 'lucide-react';

interface PhotoTimelineProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoTimeline({ tasks, isOpen, onClose }: PhotoTimelineProps) {
  if (!isOpen) return null;

  const tasksWithPhotos = tasks.filter(task => task.photos && task.photos.length > 0);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📸 Photo Memory Timeline
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {tasksWithPhotos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📷</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Photos Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start adding photos to your tasks to build your visual memory timeline!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tasksWithPhotos
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((task) => {
                  const category = CATEGORIES.find(c => c.id === task.category);
                  return (
                    <div key={task.id} className="border-l-4 border-blue-200 dark:border-blue-800 pl-6 relative">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
                      
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {task.title}
                            </h3>
                            {category && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {category.icon} {category.label}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(task.duration)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(task.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {task.notes && (
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {task.notes}
                          </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {task.photos?.map((photo, index) => (
                            <div key={index} className="group cursor-pointer">
                              <img
                                src={photo}
                                alt={`${task.title} photo ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg hover:scale-105 transition-transform"
                                onClick={() => {
                                  // Open photo in larger view
                                  const img = new Image();
                                  img.src = photo;
                                  const newWindow = window.open('', '_blank');
                                  if (newWindow) {
                                    newWindow.document.write(`<img src="${photo}" style="max-width:100%;max-height:100%;object-fit:contain;" />`);
                                  }
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
