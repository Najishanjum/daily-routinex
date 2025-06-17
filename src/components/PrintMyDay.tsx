
import { useState } from 'react';
import { Task, CATEGORIES } from '@/types/task';
import { Printer, Download, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface PrintMyDayProps {
  tasks: Task[];
  selectedDate: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PrintMyDay({ tasks, selectedDate, isOpen, onClose }: PrintMyDayProps) {
  const [includePhotos, setIncludePhotos] = useState(true);
  const [selectedMood, setSelectedMood] = useState('😊');
  const [dailyQuote, setDailyQuote] = useState("Today is a new opportunity to grow and achieve your goals!");

  if (!isOpen) return null;

  const dailyTasks = tasks.filter(task => task.date === selectedDate);
  const totalDuration = dailyTasks.reduce((sum, task) => sum + task.duration, 0);

  const moods = ['😊', '💪', '🎯', '✨', '🌟', '🔥', '💡', '🎨'];
  
  const inspirationalQuotes = [
    "Today is a new opportunity to grow and achieve your goals!",
    "Small steps every day lead to big changes over time.",
    "Progress, not perfection, is the goal.",
    "Your future self will thank you for what you do today.",
    "Consistency is the mother of mastery.",
    "Every expert was once a beginner.",
    "Success is the sum of small efforts repeated daily."
  ];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getPriorityColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.color || 'gray';
  };

  const generatePrintContent = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print your day');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>My Daily Routine - ${new Date(selectedDate).toLocaleDateString()}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }
            .routine-card {
              background: white;
              max-width: 800px;
              margin: 0 auto;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 { font-size: 2.5em; margin-bottom: 10px; font-weight: bold; }
            .header .date { font-size: 1.2em; opacity: 0.9; }
            .content { padding: 30px; }
            .mood-section {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 15px;
              margin-bottom: 25px;
              padding: 20px;
              background: #f8f9ff;
              border-radius: 15px;
            }
            .mood { font-size: 2em; }
            .quote {
              text-align: center;
              font-style: italic;
              font-size: 1.1em;
              color: #666;
              margin-bottom: 30px;
              padding: 20px;
              background: #fff8e1;
              border-radius: 10px;
              border-left: 4px solid #ffc107;
            }
            .stats {
              display: flex;
              justify-content: space-around;
              margin-bottom: 30px;
              padding: 20px;
              background: #f0f4ff;
              border-radius: 15px;
            }
            .stat { text-align: center; }
            .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
            .stat-label { color: #666; font-size: 0.9em; }
            .tasks-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
            .task-item {
              border: 2px solid #e0e0e0;
              border-radius: 15px;
              padding: 20px;
              background: white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.05);
            }
            .task-header {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 15px;
            }
            .priority-dot {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              flex-shrink: 0;
            }
            .task-title { font-weight: bold; font-size: 1.1em; }
            .task-meta {
              display: flex;
              gap: 15px;
              color: #666;
              font-size: 0.9em;
              margin-bottom: 10px;
            }
            .task-notes { color: #555; font-size: 0.9em; line-height: 1.4; }
            .category-blue { background-color: #3b82f6; }
            .category-emerald { background-color: #10b981; }
            .category-purple { background-color: #8b5cf6; }
            .category-pink { background-color: #ec4899; }
            .category-teal { background-color: #14b8a6; }
            .category-orange { background-color: #f97316; }
            .category-gray { background-color: #6b7280; }
            .photos-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
              gap: 8px;
              margin-top: 10px;
            }
            .photo { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 0.9em;
              border-top: 1px solid #e0e0e0;
              margin-top: 30px;
            }
            @media print {
              body { background: white !important; padding: 0 !important; }
              .routine-card { box-shadow: none !important; border: 1px solid #ddd; }
            }
          </style>
        </head>
        <body>
          <div class="routine-card">
            <div class="header">
              <h1>My Daily Routine</h1>
              <div class="date">${new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>
            
            <div class="content">
              <div class="mood-section">
                <span class="mood">${selectedMood}</span>
                <span>Today's Mood</span>
              </div>
              
              <div class="quote">"${dailyQuote}"</div>
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-number">${dailyTasks.length}</div>
                  <div class="stat-label">Tasks</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${formatDuration(totalDuration)}</div>
                  <div class="stat-label">Total Time</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${Math.round(totalDuration / (dailyTasks.length || 1))}m</div>
                  <div class="stat-label">Avg Duration</div>
                </div>
              </div>
              
              <div class="tasks-grid">
                ${dailyTasks.map(task => {
                  const category = CATEGORIES.find(c => c.id === task.category);
                  return `
                    <div class="task-item">
                      <div class="task-header">
                        <div class="priority-dot category-${getPriorityColor(task.category)}"></div>
                        <div class="task-title">${task.title}</div>
                      </div>
                      <div class="task-meta">
                        <span>⏱ ${formatDuration(task.duration)}</span>
                        <span>${category?.icon || '📋'} ${category?.label || 'Other'}</span>
                      </div>
                      ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
                      ${includePhotos && task.photos && task.photos.length > 0 ? `
                        <div class="photos-grid">
                          ${task.photos.slice(0, 4).map(photo => `
                            <img src="${photo}" alt="Task photo" class="photo" />
                          `).join('')}
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            
            <div class="footer">
              Generated by RoutineX - Your Personal Routine Manager<br>
              Print Date: ${new Date().toLocaleDateString()}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Auto print after content loads
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };

    toast.success('Print preview opened!');
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Printer className="w-6 h-6" />
            Print My Day
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

        <div className="space-y-6">
          {/* Date and Stats */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{dailyTasks.length} tasks</span>
              <span>{formatDuration(totalDuration)} total time</span>
            </div>
          </div>

          {/* Mood Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Today's Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map(mood => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`text-2xl p-3 rounded-lg border-2 transition-colors ${
                    selectedMood === mood
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Quote Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily Quote
            </label>
            <select
              value={dailyQuote}
              onChange={(e) => setDailyQuote(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {inspirationalQuotes.map((quote, index) => (
                <option key={index} value={quote}>
                  {quote}
                </option>
              ))}
            </select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includePhotos}
                onChange={(e) => setIncludePhotos(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Include task photos in printout
              </span>
            </label>
          </div>

          {/* Task Preview */}
          {dailyTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Tasks to Print</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {dailyTasks.map(task => {
                  const category = CATEGORIES.find(c => c.id === task.category);
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className={`w-3 h-3 rounded-full bg-${category?.color || 'gray'}-500`}></div>
                      <span className="text-sm text-gray-900 dark:text-white">{task.title}</span>
                      <span className="text-xs text-gray-500 ml-auto">{formatDuration(task.duration)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={generatePrintContent}
              disabled={dailyTasks.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-5 h-5" />
              Print My Day
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>

          {dailyTasks.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Tasks for This Day
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add some tasks to your routine to print your daily schedule.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
