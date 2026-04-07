import React, { useState } from 'react';
import { X, Users, Trophy, Target, Zap, Send, Crown, Flame, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Task } from '@/types/task';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SocialAccountabilityProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  todayCompleted: number;
  todayTotal: number;
  punishment?: string;
}

interface PunishmentRule {
  id: string;
  trigger: string;
  action: string;
  active: boolean;
}

const MOCK_FRIENDS: Friend[] = [
  { id: '1', name: 'Alex M.', avatar: '🧑‍💻', streak: 12, todayCompleted: 5, todayTotal: 7 },
  { id: '2', name: 'Sara K.', avatar: '👩‍🎨', streak: 8, todayCompleted: 3, todayTotal: 5 },
  { id: '3', name: 'Mike R.', avatar: '🧑‍🔬', streak: 15, todayCompleted: 6, todayTotal: 6 },
];

const DEFAULT_PUNISHMENTS: PunishmentRule[] = [
  { id: '1', trigger: 'Lose 3-day streak', action: 'Send embarrassing GIF to group chat 😂', active: true },
  { id: '2', trigger: 'Miss all daily tasks', action: 'Pay ₹50 fine to friend\'s fund 💸', active: false },
  { id: '3', trigger: 'Skip 2 days in a row', action: 'Do 20 pushups and post proof 💪', active: true },
];

export function SocialAccountability({ tasks, isOpen, onClose }: SocialAccountabilityProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'goals' | 'punishment'>('leaderboard');
  const [friends] = useState<Friend[]>(MOCK_FRIENDS);
  const [punishments, setPunishments] = useLocalStorage<PunishmentRule[]>('punishment-rules', DEFAULT_PUNISHMENTS);
  const [newGoal, setNewGoal] = useState('');
  const [sharedGoals, setSharedGoals] = useLocalStorage<string[]>('shared-goals', []);
  const [inviteEmail, setInviteEmail] = useState('');
  const [newPunishTrigger, setNewPunishTrigger] = useState('');
  const [newPunishAction, setNewPunishAction] = useState('');

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === today);
  const completedToday = todayTasks.filter(t => t.completed).length;

  function calculateStreak(): number {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 30; i++) {
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.date === dateStr);
      if (dayTasks.length > 0 && dayTasks.every(t => t.completed)) {
        streak++;
      } else if (dayTasks.length > 0) {
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  const myEntry: Friend = {
    id: 'me',
    name: 'You',
    avatar: '⭐',
    streak: calculateStreak(),
    todayCompleted: completedToday,
    todayTotal: todayTasks.length,
  };

  const leaderboard = [...friends, myEntry].sort((a, b) => {
    if (b.streak !== a.streak) return b.streak - a.streak;
    return (b.todayCompleted / (b.todayTotal || 1)) - (a.todayCompleted / (a.todayTotal || 1));
  });

  const shareGoal = () => {
    if (newGoal.trim()) {
      setSharedGoals(prev => [...prev, newGoal.trim()]);
      toast.success('Goal shared with friends! 🎯');
      setNewGoal('');
    }
  };

  const inviteFriend = () => {
    if (inviteEmail.trim()) {
      toast.success(`Invitation sent to ${inviteEmail}! 📧`);
      setInviteEmail('');
    }
  };

  const togglePunishment = (id: string) => {
    setPunishments(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const addPunishment = () => {
    if (newPunishTrigger.trim() && newPunishAction.trim()) {
      setPunishments(prev => [...prev, {
        id: Date.now().toString(),
        trigger: newPunishTrigger.trim(),
        action: newPunishAction.trim(),
        active: true,
      }]);
      setNewPunishTrigger('');
      setNewPunishAction('');
      toast.success('Punishment rule added! 😈');
    }
  };

  const removePunishment = (id: string) => {
    setPunishments(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Social Accountability
              </h2>
              <p className="text-sm text-muted-foreground">Friend Mode++ 🤝</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="email"
            placeholder="Invite friend by email..."
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm"
          />
          <button onClick={inviteFriend} disabled={!inviteEmail.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium">
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 mb-6 bg-secondary rounded-lg p-1">
          {[
            { key: 'leaderboard' as const, icon: Trophy, label: 'Leaderboard' },
            { key: 'goals' as const, icon: Target, label: 'Shared Goals' },
            { key: 'punishment' as const, icon: Zap, label: 'Punishment Mode' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm flex-1 justify-center ${
                activeTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'leaderboard' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" /> Daily Leaderboard
            </h3>
            {leaderboard.map((friend, idx) => {
              const completionRate = friend.todayTotal > 0 ? Math.round((friend.todayCompleted / friend.todayTotal) * 100) : 0;
              const isMe = friend.id === 'me';
              return (
                <div
                  key={friend.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isMe ? 'bg-primary/10 border-2 border-primary/30' : 'bg-secondary/50'
                  } ${idx === 0 ? 'ring-2 ring-yellow-400/50' : ''}`}
                >
                  <div className="text-lg font-bold w-8 text-center text-muted-foreground">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>
                  <div className="text-2xl">{friend.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {friend.name} {isMe && '(You)'}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {friend.streak} day streak
                      </span>
                      <span>{friend.todayCompleted}/{friend.todayTotal} today</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${completionRate === 100 ? 'text-green-500' : completionRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {completionRate}%
                    </div>
                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${completionRate === 100 ? 'bg-green-500' : completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" /> Share Your Goals
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Share a daily goal with friends..."
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && shareGoal()}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm"
              />
              <button onClick={shareGoal} disabled={!newGoal.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {sharedGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No shared goals yet. Start sharing!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sharedGoals.map((goal, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="text-lg">🎯</div>
                    <p className="flex-1 text-sm text-foreground">{goal}</p>
                    <button
                      onClick={() => setSharedGoals(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <h4 className="font-semibold text-foreground mb-3">Friends' Today Progress</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {friends.map(friend => (
                  <div key={friend.id} className="p-3 bg-secondary/50 rounded-lg text-center">
                    <div className="text-2xl mb-1">{friend.avatar}</div>
                    <div className="font-medium text-sm text-foreground">{friend.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {friend.todayCompleted}/{friend.todayTotal} tasks
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${friend.todayTotal > 0 ? (friend.todayCompleted / friend.todayTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'punishment' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-foreground">Punishment Mode 😈</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Set consequences for breaking streaks. Stay accountable or face the music!
            </p>

            <div className="space-y-2">
              {punishments.map(rule => (
                <div key={rule.id} className={`p-3 rounded-lg border transition-all ${
                  rule.active ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : 'border-input bg-secondary/30 opacity-60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground">
                        ⚡ {rule.trigger}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        → {rule.action}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePunishment(rule.id)}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                          rule.active
                            ? 'bg-red-600 text-white'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {rule.active ? 'Active' : 'Off'}
                      </button>
                      <button onClick={() => removePunishment(rule.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-secondary/50 rounded-xl space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Add New Rule</h4>
              <input
                type="text"
                placeholder="Trigger (e.g., Miss 3 days in a row)"
                value={newPunishTrigger}
                onChange={e => setNewPunishTrigger(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm"
              />
              <input
                type="text"
                placeholder="Consequence (e.g., Buy friends coffee ☕)"
                value={newPunishAction}
                onChange={e => setNewPunishAction(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm"
              />
              <button
                onClick={addPunishment}
                disabled={!newPunishTrigger.trim() || !newPunishAction.trim()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                Add Punishment Rule 😈
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
