
import React, { useState, useRef } from 'react';
import { Award, Download, Share2, Calendar, Trophy, Target, Clock, Star, X } from 'lucide-react';
import { Task } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ProgressCertificateProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

interface CertificateData {
  userName: string;
  tasksCompleted: number;
  streakDays: number;
  avgDailyTime: string;
  topCategories: string[];
  quote: string;
  completionDate: string;
  aiCoachName: string;
}

export function ProgressCertificate({ tasks, isOpen, onClose }: ProgressCertificateProps) {
  const [userProfile] = useLocalStorage('routine-user-profile', { name: 'Achiever' });
  const [showCertificate, setShowCertificate] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Calculate certificate data
  const calculateCertificateData = (): CertificateData => {
    const completedTasks = tasks.filter(task => task.completed);
    const tasksCompleted = completedTasks.length;

    // Calculate streak days (simplified)
    let streakDays = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(task => task.date === dateStr);
      const dayCompletedTasks = dayTasks.filter(task => task.completed);
      
      if (dayTasks.length > 0 && dayCompletedTasks.length > 0) {
        streakDays++;
      } else if (i > 0) {
        break;
      }
    }

    // Calculate average daily time
    const totalMinutes = completedTasks.reduce((sum, task) => sum + task.duration, 0);
    const avgMinutesPerDay = totalMinutes / 30;
    const hours = Math.floor(avgMinutesPerDay / 60);
    const minutes = Math.round(avgMinutesPerDay % 60);
    const avgDailyTime = `${hours}h ${minutes}m`;

    // Get top categories
    const categoryCount: Record<string, number> = {};
    completedTasks.forEach(task => {
      categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
    });
    
    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Select motivational quote based on performance
    const quotes = [
      "Discipline is choosing between what you want now and what you want most.",
      "Success is the sum of small efforts repeated daily.",
      "The way to get started is to quit talking and begin doing.",
      "Your only limit is your mind.",
      "Great things never come from comfort zones.",
      "Dream it. Believe it. Build it. Achieve it.",
      "Progress, not perfection, is the goal."
    ];
    
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    return {
      userName: userProfile.name || 'Achiever',
      tasksCompleted,
      streakDays,
      avgDailyTime,
      topCategories,
      quote,
      completionDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      aiCoachName: userProfile.name ? `${userProfile.name}'s AI Coach` : 'RoutineX AI Coach'
    };
  };

  const certificateData = calculateCertificateData();

  const handleGenerateCertificate = () => {
    setShowCertificate(true);
  };

  const handleDownloadPDF = () => {
    if (certificateRef.current) {
      // Simple print functionality - browser will handle PDF generation
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Progress Certificate</title>
              <style>
                body { 
                  margin: 0; 
                  font-family: 'Arial', sans-serif; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .certificate { 
                  background: white; 
                  padding: 40px; 
                  border-radius: 20px; 
                  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                  max-width: 800px;
                  text-align: center;
                }
                .header { font-size: 48px; color: #667eea; margin-bottom: 20px; }
                .title { font-size: 32px; color: #333; margin-bottom: 30px; }
                .name { font-size: 36px; color: #667eea; font-weight: bold; margin: 20px 0; }
                .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
                .stat { padding: 15px; background: #f8f9ff; border-radius: 10px; }
                .quote { font-style: italic; font-size: 18px; color: #666; margin: 30px 0; }
                .signature { margin-top: 40px; font-size: 16px; color: #888; }
              </style>
            </head>
            <body>
              ${certificateRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const eligibleForCertificate = certificateData.tasksCompleted >= 30 || certificateData.streakDays >= 7;

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Progress Certificate
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showCertificate ? (
          <div className="text-center space-y-6">
            {eligibleForCertificate ? (
              <>
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Congratulations! 🎉
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  You've achieved an incredible milestone! Ready to generate your personalized achievement certificate?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="glass-card p-4 rounded-xl text-center">
                    <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {certificateData.tasksCompleted}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
                  </div>
                  <div className="glass-card p-4 rounded-xl text-center">
                    <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {certificateData.streakDays}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Streak Days</div>
                  </div>
                  <div className="glass-card p-4 rounded-xl text-center">
                    <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {certificateData.avgDailyTime}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Time</div>
                  </div>
                  <div className="glass-card p-4 rounded-xl text-center">
                    <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {certificateData.topCategories.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Top Categories</div>
                  </div>
                </div>
                <button
                  onClick={handleGenerateCertificate}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                >
                  Generate My Certificate
                </button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Keep Going! 💪
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Complete more tasks or build a longer streak to unlock your achievement certificate!
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Requirement: Complete 30+ tasks OR maintain a 7+ day streak
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => navigator.share && navigator.share({ title: 'My Achievement Certificate' })}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            <div 
              ref={certificateRef}
              className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 p-12 rounded-2xl border-4 border-yellow-400 relative overflow-hidden"
              style={{ minHeight: '800px' }}
            >
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-16 h-16 bg-yellow-400/20 rounded-full"></div>
              <div className="absolute top-8 right-8 w-12 h-12 bg-purple-400/20 rounded-full"></div>
              <div className="absolute bottom-4 left-8 w-20 h-20 bg-blue-400/20 rounded-full"></div>
              <div className="absolute bottom-8 right-4 w-14 h-14 bg-pink-400/20 rounded-full"></div>

              {/* Certificate content */}
              <div className="relative z-10 text-center">
                <div className="text-6xl mb-6">🏆</div>
                
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  PRODUCTIVITY CERTIFICATE
                </h1>
                
                <div className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  In Recognition of Outstanding Achievement
                </div>

                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Awarded to
                </div>
                
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-8 border-b-2 border-yellow-400 pb-4 inline-block">
                  {certificateData.userName}
                </div>

                <div className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                  For Completing 30 Days of Mindful Routines
                </div>

                {/* Stats section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">✅</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {certificateData.tasksCompleted}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">📅</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {certificateData.streakDays}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Streak Days</div>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">⏳</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {certificateData.avgDailyTime}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Daily Focus Time</div>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">🌟</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {certificateData.topCategories.slice(0, 2).join(', ')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Top Categories</div>
                  </div>
                </div>

                {/* Quote section */}
                <div className="bg-white/40 dark:bg-gray-800/40 p-6 rounded-xl mb-8">
                  <div className="text-lg italic text-gray-700 dark:text-gray-300 mb-2">
                    Quote of the Journey
                  </div>
                  <div className="text-xl font-medium text-gray-900 dark:text-white">
                    "{certificateData.quote}"
                  </div>
                </div>

                {/* Signature section */}
                <div className="flex justify-between items-end">
                  <div className="text-left">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Date of Achievement</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {certificateData.completionDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {certificateData.aiCoachName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">AI Productivity Coach</div>
                    <div className="w-24 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg mt-2 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">CERTIFIED</span>
                    </div>
                  </div>
                </div>

                {/* QR Code placeholder */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      QR<br/>Code
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
