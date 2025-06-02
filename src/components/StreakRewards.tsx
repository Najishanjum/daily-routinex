
import React from 'react';
import { Trophy, Flame, Star, Award, Zap, Crown } from 'lucide-react';
import { Task } from '@/types/task';

interface StreakRewardsProps {
  tasks: Task[];
}

export function StreakRewards({ tasks }: StreakRewardsProps) {
  // Calculate current streak
  const calculateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const dates = Array.from(new Set(tasks.map(task => task.date))).sort();
    
    let streak = 0;
    let currentDate = new Date(today);
    
    while (streak < dates.length) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (dates.includes(dateStr)) {
        const dayTasks = tasks.filter(task => task.date === dateStr);
        const hasCompletedTasks = dayTasks.some(task => task.completed);
        if (hasCompletedTasks) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();
  
  const badges = [
    { id: 1, name: 'Getting Started', icon: Star, threshold: 1, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' },
    { id: 2, name: 'Building Momentum', icon: Flame, threshold: 3, color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' },
    { id: 3, name: 'One Week Wonder', icon: Trophy, threshold: 7, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
    { id: 4, name: 'Two Week Titan', icon: Award, threshold: 14, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
    { id: 5, name: 'Monthly Master', icon: Zap, threshold: 30, color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
    { id: 6, name: 'Consistency King', icon: Crown, threshold: 60, color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30' }
  ];

  const earnedBadges = badges.filter(badge => currentStreak >= badge.threshold);
  const nextBadge = badges.find(badge => currentStreak < badge.threshold);

  const getMotivationalMessage = () => {
    if (currentStreak === 0) return "Start your journey today! 🌟";
    if (currentStreak === 1) return "Great start! Keep it up! 💪";
    if (currentStreak < 7) return `${currentStreak} days strong! You're building momentum! 🔥`;
    if (currentStreak < 14) return `${currentStreak} days in a row! You're on fire! 🚀`;
    if (currentStreak < 30) return `${currentStreak} days of consistency! Amazing! ⭐`;
    return `${currentStreak} days streak! You're a routine master! 👑`;
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30">
          <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Streak Rewards
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Track your consistency and earn badges!
          </p>
        </div>
      </div>

      {/* Current Streak */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
          {currentStreak}
        </div>
        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Day Streak
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {getMotivationalMessage()}
        </div>
      </div>

      {/* Progress to Next Badge */}
      {nextBadge && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress to {nextBadge.name}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentStreak}/{nextBadge.threshold}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentStreak / nextBadge.threshold) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Earned Badges */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Earned Badges ({earnedBadges.length})
        </h4>
        {earnedBadges.length === 0 ? (
          <div className="text-center py-6">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Complete your first routine to earn a badge!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earnedBadges.map(badge => {
              const IconComponent = badge.icon;
              return (
                <div key={badge.id} className={`${badge.color} rounded-xl p-3 text-center`}>
                  <IconComponent className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-xs font-medium">{badge.name}</div>
                  <div className="text-xs opacity-75">{badge.threshold} days</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
