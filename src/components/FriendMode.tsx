
import React, { useState, useEffect } from 'react';
import { Share2, Users, Copy, Check, X, User, Clock } from 'lucide-react';
import { Task } from '@/types/task';
import { toast } from 'sonner';

interface FriendModeProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

interface SharedRoutine {
  id: string;
  date: string;
  tasks: Task[];
  sharedBy: string;
  sharedAt: string;
}

export function FriendMode({ tasks, isOpen, onClose }: FriendModeProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [collaborativeTask, setCollaborativeTask] = useState('');
  const [sharedRoutines, setSharedRoutines] = useState<SharedRoutine[]>([]);

  useEffect(() => {
    // Load shared routines from localStorage
    const saved = localStorage.getItem('shared-routines');
    if (saved) {
      setSharedRoutines(JSON.parse(saved));
    }
  }, []);

  if (!isOpen) return null;

  const dayTasks = tasks.filter(task => task.date === selectedDate);

  const generateShareLink = () => {
    const routineData = {
      date: selectedDate,
      tasks: dayTasks,
      sharedBy: 'You',
      timestamp: new Date().toISOString()
    };
    
    const encodedData = btoa(JSON.stringify(routineData));
    const baseUrl = window.location.origin;
    const link = `${baseUrl}?shared=${encodedData}`;
    setShareLink(link);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const inviteFriend = () => {
    if (friendEmail && collaborativeTask) {
      const invitation = {
        email: friendEmail,
        task: collaborativeTask,
        date: selectedDate,
        invitedAt: new Date().toISOString()
      };
      
      // In a real app, this would send an email invitation
      toast.success(`Invitation sent to ${friendEmail} for "${collaborativeTask}"!`);
      setFriendEmail('');
      setCollaborativeTask('');
    }
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Friend Mode
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Share Routine */}
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share Your Routine
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {dayTasks.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {dayTasks.length} task(s) to share:
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {dayTasks.map(task => (
                      <div key={task.id} className="text-sm bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">• {task.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  No tasks found for this date.
                </p>
              )}

              <button
                onClick={generateShareLink}
                disabled={dayTasks.length === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Generate Share Link
              </button>

              {shareLink && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Share this link with friends to show them your routine!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Collaborate on Tasks */}
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Invite Friend to Collaborate
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Friend's Email
                </label>
                <input
                  type="email"
                  placeholder="friend@example.com"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Collaborative Task
                </label>
                <input
                  type="text"
                  placeholder="e.g., Group study session, Morning jog together"
                  value={collaborativeTask}
                  onChange={(e) => setCollaborativeTask(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Collaboration Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={inviteFriend}
                disabled={!friendEmail || !collaborativeTask}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>

        {/* Shared Routines History */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Recent Collaborations
          </h3>
          {sharedRoutines.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                No collaborations yet. Start sharing your routines!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedRoutines.slice(0, 3).map(routine => (
                <div key={routine.id} className="glass-card p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {routine.date}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {routine.tasks.length} tasks • Shared by {routine.sharedBy}
                      </div>
                    </div>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
