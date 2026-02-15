
import { Moon, Sun } from 'lucide-react';
import routinexLogo from '@/assets/routinex-logo.jpg';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
              <img src={routinexLogo} alt="RoutineX Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                RoutineX
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your personal productivity tracker
              </p>
            </div>
          </div>
          
          <button
            onClick={onToggleDarkMode}
            className="p-3 rounded-xl glass-card hover:scale-110 transition-all duration-300 hover:shadow-lg"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
