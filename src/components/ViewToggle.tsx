
import { Calendar, ChevronDown } from 'lucide-react';
import { ViewMode } from '@/types/task';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function ViewToggle({ 
  viewMode, 
  onViewModeChange, 
  selectedDate, 
  onDateChange 
}: ViewToggleProps) {
  const formatDateForDisplay = (dateStr: string, mode: ViewMode) => {
    const date = new Date(dateStr);
    if (mode === 'daily') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (mode === 'weekly') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              viewMode === mode
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-gray-500" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-transparent text-gray-900 dark:text-white font-medium focus:outline-none"
        />
        <div className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
          {formatDateForDisplay(selectedDate, viewMode)}
        </div>
      </div>
    </div>
  );
}
