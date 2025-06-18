
import React, { useState, useEffect } from 'react';
import { Users, Mail, Link2, Trophy, Target, Calendar, ThumbsUp, Medal, Bell, X, Plus } from 'lucide-react';
import { Task } from '@/types/task';
import { toast } from 'sonner';

interface AccountabilityBuddyProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

interface Buddy {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastActivity: string;
  streak: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: number; // days
  startDate: string;
  participants: string[];
  type: 'no-skip' | 'streak' | 'custom';
  reward: string;
}

interface ActivityUpdate {
  id: string;
  buddyName: string;
  action: string;
  timestamp: string;
  taskTitle?: string;
  reactions: { [key: string]: string[] }; // emoji -> user IDs
}

export function AccountabilityBuddy({ tasks, isOpen, onClose }: AccountabilityBuddyProps) {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityUpdate[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [activeTab, setActiveTab] = useState<'buddies' | 'challenges' | 'feed'>('buddies');
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    duration: 7,
    type: 'no-skip' as Challenge['type'],
    reward: ''
  });

  useEffect(() => {
    // Load data from localStorage
    const savedBuddies = localStorage.getItem('accountability-buddies');
    const savedChallenges = localStorage.getItem('accountability-challenges');
    const savedFeed = localStorage.getItem('accountability-feed');
    
    if (savedBuddies) setBuddies(JSON.parse(savedBuddies));
    if (savedChallenges) setChallenges(JSON.parse(savedChallenges));
    if (savedFeed) setActivityFeed(JSON.parse(savedFeed));

    // Generate share link
    const baseUrl = window.location.origin;
    const buddyCode = btoa(`buddy-${Date.now()}`);
    setShareLink(`${baseUrl}?buddy=${buddyCode}`);
  }, []);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const inviteBuddy = () => {
    if (!inviteEmail) return;

    const newBuddy: Buddy = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      isOnline: false,
      lastActivity: new Date().toISOString(),
      streak: 0
    };

    const updatedBuddies = [...buddies, newBuddy];
    setBuddies(updatedBuddies);
    saveToStorage('accountability-buddies', updatedBuddies);

    // Simulate sending invitation
    toast.success(`Invitation sent to ${inviteEmail}!`);
    setInviteEmail('');

    // Add activity update
    const update: ActivityUpdate = {
      id: Date.now().toString(),
      buddyName: 'You',
      action: `invited ${newBuddy.name} to be an accountability buddy`,
      timestamp: new Date().toISOString(),
      reactions: {}
    };
    
    const updatedFeed = [update, ...activityFeed];
    setActivityFeed(updatedFeed);
    saveToStorage('accountability-feed', updatedFeed);
  };

  const createChallenge = () => {
    if (!newChallenge.title || !newChallenge.description) return;

    const challenge: Challenge = {
      id: Date.now().toString(),
      ...newChallenge,
      startDate: new Date().toISOString(),
      participants: ['you'] // In real app, would include selected buddies
    };

    const updatedChallenges = [...challenges, challenge];
    setChallenges(updatedChallenges);
    saveToStorage('accountability-challenges', updatedChallenges);

    toast.success(`Challenge "${challenge.title}" created!`);
    setNewChallenge({
      title: '',
      description: '',
      duration: 7,
      type: 'no-skip',
      reward: ''
    });

    // Add activity update
    const update: ActivityUpdate = {
      id: Date.now().toString(),
      buddyName: 'You',
      action: `created a new challenge: ${challenge.title}`,
      timestamp: new Date().toISOString(),
      reactions: {}
    };
    
    const updatedFeed = [update, ...activityFeed];
    setActivityFeed(updatedFeed);
    saveToStorage('accountability-feed', updatedFeed);
  };

  const addReaction = (updateId: string, emoji: string) => {
    const updatedFeed = activityFeed.map(update => {
      if (update.id === updateId) {
        const reactions = { ...update.reactions };
        if (!reactions[emoji]) reactions[emoji] = [];
        
        const userId = 'you';
        if (reactions[emoji].includes(userId)) {
          reactions[emoji] = reactions[emoji].filter(id => id !== userId);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji].push(userId);
        }
        
        return { ...update, reactions };
      }
      return update;
    });

    setActivityFeed(updatedFeed);
    saveToStorage('accountability-feed', updatedFeed);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Buddy link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Accountability Buddy
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'buddies', label: 'My Buddies', icon: Users },
            { id: 'challenges', label: 'Challenges', icon: Trophy },
            { id: 'feed', label: 'Activity Feed', icon: Bell }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Buddies Tab */}
        {activeTab === 'buddies' && (
          <div className="space-y-6">
            {/* Invite Section */}
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Invite a Buddy
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Invitation
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="friend@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={inviteBuddy}
                      disabled={!inviteEmail}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Invite
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                    <button
                      onClick={copyShareLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Link2 className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Buddies List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Accountability Buddies ({buddies.length})
              </h3>
              
              {buddies.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No buddies yet. Invite someone to start your accountability journey!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {buddies.map(buddy => (
                    <div key={buddy.id} className="glass-card p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {buddy.name.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                            buddy.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {buddy.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {buddy.streak} day streak 🔥
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {buddy.isOnline ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Create Challenge */}
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Challenge
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Challenge Title
                    </label>
                    <input
                      type="text"
                      placeholder="7-Day No Skip Challenge"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={newChallenge.duration}
                      onChange={(e) => setNewChallenge({...newChallenge, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Challenge Type
                  </label>
                  <select
                    value={newChallenge.type}
                    onChange={(e) => setNewChallenge({...newChallenge, type: e.target.value as Challenge['type']})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="no-skip">No Skip Days</option>
                    <option value="streak">Longest Streak</option>
                    <option value="custom">Custom Goal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Complete all daily tasks without skipping any day"
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reward
                  </label>
                  <input
                    type="text"
                    placeholder="Winner gets bragging rights + coffee treat!"
                    value={newChallenge.reward}
                    onChange={(e) => setNewChallenge({...newChallenge, reward: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={createChallenge}
                  disabled={!newChallenge.title || !newChallenge.description}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Challenge
                </button>
              </div>
            </div>

            {/* Active Challenges */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Active Challenges ({challenges.length})
              </h3>
              
              {challenges.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No active challenges. Create one to motivate yourself and your buddies!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {challenges.map(challenge => (
                    <div key={challenge.id} className="glass-card p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {challenge.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {challenge.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                          <Calendar className="w-4 h-4" />
                          {challenge.duration} days
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600 dark:text-gray-400">
                          Participants: {challenge.participants.length}
                        </div>
                        {challenge.reward && (
                          <div className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {challenge.reward}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            
            {activityFeed.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  No activity yet. Complete some tasks or invite buddies to see updates here!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityFeed.map(update => (
                  <div key={update.id} className="glass-card p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {update.buddyName}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          {update.action}
                        </span>
                        {update.taskTitle && (
                          <span className="text-blue-600 dark:text-blue-400 ml-1">
                            "{update.taskTitle}"
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addReaction(update.id, '👍')}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        👍 {update.reactions['👍']?.length || 0}
                      </button>
                      <button
                        onClick={() => addReaction(update.id, '🥇')}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        🥇 {update.reactions['🥇']?.length || 0}
                      </button>
                      <button
                        onClick={() => addReaction(update.id, '🔥')}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        🔥 {update.reactions['🔥']?.length || 0}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
