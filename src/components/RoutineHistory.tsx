
import React, { useState } from 'react';
import { Calendar, Search, Trophy, TrendingUp, X } from 'lucide-react';
import { Task } from '@/types/task';

interface RoutineHistoryProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

export function RoutineHistory({ tasks, isOpen, onClose }: RoutineHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  if (!isOpen) return null;

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const date = task.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Filter tasks based on search and month
  const filteredDates = Object.keys(tasksByDate)
    .filter(date => {
      const matchesMonth = date.startsWith(selectedMonth);
      const matchesSearch = !searchQuery || tasksByDate[date].some(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchesMonth && matchesSearch;
    })
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Routine History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search routines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredDates.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No entries found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or date filter.
              </p>
            </div>
          ) : (
            filteredDates.map(date => {
              const dayTasks = tasksByDate[date];
              const completedTasks = dayTasks.filter(task => task.completed);
              const completionRate = Math.round((completedTasks.length / dayTasks.length) * 100);
              
              return (
                <div key={date} className="glass-card p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {completionRate}% complete
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {dayTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`p-2 rounded-lg text-sm ${
                          task.completed 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="font-medium">{task.title}</span>
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {task.category} • {task.startTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
