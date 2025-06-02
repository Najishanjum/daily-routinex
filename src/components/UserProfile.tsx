
import { useState, useEffect } from 'react';
import { Edit3, Calendar, Target, Flame, Quote } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Task } from '@/types/task';
import { Progress } from '@/components/ui/progress';

interface UserProfileData {
  name: string;
  bio: string;
  avatar: string;
}

interface UserProfileProps {
  tasks: Task[];
}

export function UserProfile({ tasks }: UserProfileProps) {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfileData>('routine-user-profile', {
    name: 'Welcome to RoutineX',
    bio: 'Your journey to better productivity starts here!',
    avatar: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(userProfile);
  const [quoteOfDay, setQuoteOfDay] = useState('');

  // Motivational quotes
  const quotes = [
    "Success is the sum of small efforts repeated daily.",
    "The way to get started is to quit talking and begin doing.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it."
  ];

  useEffect(() => {
    // Set a random quote each day
    const today = new Date().toDateString();
    const savedQuote = localStorage.getItem('routine-quote-date');
    
    if (savedQuote !== today) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuoteOfDay(randomQuote);
      localStorage.setItem('routine-quote-date', today);
      localStorage.setItem('routine-quote', randomQuote);
    } else {
      const savedQuoteText = localStorage.getItem('routine-quote');
      setQuoteOfDay(savedQuoteText || quotes[0]);
    }
  }, []);

  // Calculate task statistics
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.date === today);
  const completedTasks = todayTasks.filter(task => task.completed);
  const completionRate = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0;

  // Calculate streak (simplified - count consecutive days with completed tasks)
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(task => task.date === dateStr);
      const dayCompletedTasks = dayTasks.filter(task => task.completed);
      
      if (dayTasks.length > 0 && dayCompletedTasks.length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  const handleSaveProfile = () => {
    setUserProfile(editForm);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Profile Card */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-2xl transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-2xl lg:text-3xl font-bold text-gray-700 dark:text-gray-200">
                {userProfile.avatar ? (
                  <img 
                    src={userProfile.avatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(userProfile.name)
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center lg:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-white w-full"
                  placeholder="Your Name"
                />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="text-gray-600 dark:text-gray-300 bg-transparent border-b-2 border-blue-500 focus:outline-none resize-none w-full"
                  placeholder="Your bio..."
                  rows={2}
                />
                <div className="flex gap-2 justify-center lg:justify-start">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditForm(userProfile);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {userProfile.name}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {userProfile.bio}
                </p>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-full">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {todayTasks.length} tasks today
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-full">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {completedTasks.length} completed
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-full">
                <Flame className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {streak} day streak
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Today's Progress
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {Math.round(completionRate)}%
            </span>
          </div>
          <Progress 
            value={completionRate} 
            className="h-3 bg-gray-200 dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Quote of the Day */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -translate-y-4 translate-x-4"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <Quote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quote of the Day
            </h3>
          </div>
          <blockquote className="text-gray-600 dark:text-gray-300 italic text-lg leading-relaxed">
            "{quoteOfDay}"
          </blockquote>
        </div>
      </div>
    </div>
  );
}
