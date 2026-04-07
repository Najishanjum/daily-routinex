import React, { useState, useEffect } from 'react';
import { X, Users, Trophy, Target, Zap, Send, Crown, Flame, AlertTriangle, Plus, Trash2, UserPlus, Check, Clock, RefreshCw } from 'lucide-react';
import { Task } from '@/types/task';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SocialAccountabilityProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

interface FriendData {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  friend_email?: string;
  friend_name?: string;
}

interface ProgressData {
  user_id: string;
  date: string;
  tasks_completed: number;
  tasks_total: number;
  streak_count: number;
  email?: string;
  name?: string;
}

interface PunishmentRule {
  id: string;
  trigger_text: string;
  action_text: string;
  is_active: boolean;
}

interface SharedGoal {
  id: string;
  user_id: string;
  goal_text: string;
  is_completed: boolean;
  created_at: string;
}

export function SocialAccountability({ tasks, isOpen, onClose }: SocialAccountabilityProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'goals' | 'punishment'>('leaderboard');
  const [inviteEmail, setInviteEmail] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newPunishTrigger, setNewPunishTrigger] = useState('');
  const [newPunishAction, setNewPunishAction] = useState('');
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [friendProgress, setFriendProgress] = useState<ProgressData[]>([]);
  const [punishments, setPunishments] = useState<PunishmentRule[]>([]);
  const [sharedGoals, setSharedGoals] = useState<SharedGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    // Sync today's progress
    await syncDailyProgress(user.id);

    // Load all data in parallel
    const [friendsRes, punishRes, goalsRes] = await Promise.all([
      supabase.from('friend_connections').select('*').or(`user_id.eq.${user.id},friend_id.eq.${user.id}`),
      supabase.from('punishment_rules').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('shared_goals').select('*').order('created_at', { ascending: false }),
    ]);

    if (friendsRes.data) setFriends(friendsRes.data as FriendData[]);
    if (punishRes.data) setPunishments(punishRes.data as PunishmentRule[]);
    if (goalsRes.data) setSharedGoals(goalsRes.data as SharedGoal[]);

    // Load friend progress
    if (friendsRes.data) {
      const acceptedFriendIds = friendsRes.data
        .filter((f: any) => f.status === 'accepted')
        .map((f: any) => f.user_id === user.id ? f.friend_id : f.user_id);

      if (acceptedFriendIds.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const { data: progressData } = await supabase
          .from('daily_progress')
          .select('*')
          .in('user_id', [...acceptedFriendIds, user.id])
          .eq('date', today);
        if (progressData) setFriendProgress(progressData as ProgressData[]);
      }
    }

    setLoading(false);
  };

  const syncDailyProgress = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    const completed = todayTasks.filter(t => t.completed).length;

    // Calculate streak
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

    await supabase.from('daily_progress').upsert({
      user_id: userId,
      date: today,
      tasks_completed: completed,
      tasks_total: todayTasks.length,
      streak_count: streak,
    }, { onConflict: 'user_id,date' });
  };

  const inviteFriend = async () => {
    if (!inviteEmail.trim()) return;
    // Look up user by email in auth - we'll just create the connection
    // For now, we create a pending request. The friend can accept it.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // We need to find the friend's user_id. Check profiles table.
    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', inviteEmail.trim())
      .maybeSingle();

    if (!profileData?.user_id) {
      toast.error('User not found. They need to sign up first!');
      return;
    }

    if (profileData.user_id === user.id) {
      toast.error("You can't add yourself as a friend!");
      return;
    }

    const { error } = await supabase.from('friend_connections').insert({
      user_id: user.id,
      friend_id: profileData.user_id,
      status: 'pending',
    });

    if (error) {
      if (error.code === '23505') toast.error('Friend request already sent!');
      else toast.error(error.message);
      return;
    }

    toast.success(`Friend request sent to ${inviteEmail}! 📧`);
    setInviteEmail('');
    loadData();
  };

  const acceptFriend = async (connectionId: string) => {
    await supabase.from('friend_connections').update({ status: 'accepted' }).eq('id', connectionId);
    toast.success('Friend request accepted! 🤝');
    loadData();
  };

  const removeFriend = async (connectionId: string) => {
    await supabase.from('friend_connections').delete().eq('id', connectionId);
    toast.success('Connection removed');
    loadData();
  };

  const shareGoal = async () => {
    if (!newGoal.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('shared_goals').insert({
      user_id: user.id,
      goal_text: newGoal.trim(),
    });

    if (error) { toast.error(error.message); return; }
    toast.success('Goal shared with friends! 🎯');
    setNewGoal('');
    loadData();
  };

  const deleteGoal = async (id: string) => {
    await supabase.from('shared_goals').delete().eq('id', id);
    loadData();
  };

  const addPunishment = async () => {
    if (!newPunishTrigger.trim() || !newPunishAction.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('punishment_rules').insert({
      user_id: user.id,
      trigger_text: newPunishTrigger.trim(),
      action_text: newPunishAction.trim(),
    });

    if (error) { toast.error(error.message); return; }
    toast.success('Punishment rule added! 😈');
    setNewPunishTrigger('');
    setNewPunishAction('');
    loadData();
  };

  const togglePunishment = async (id: string, currentActive: boolean) => {
    await supabase.from('punishment_rules').update({ is_active: !currentActive }).eq('id', id);
    loadData();
  };

  const removePunishment = async (id: string) => {
    await supabase.from('punishment_rules').delete().eq('id', id);
    loadData();
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === today);
  const completedToday = todayTasks.filter(t => t.completed).length;

  // Calculate streak
  let myStreak = 0;
  const d = new Date();
  for (let i = 0; i < 30; i++) {
    const dateStr = d.toISOString().split('T')[0];
    const dayTasks = tasks.filter(t => t.date === dateStr);
    if (dayTasks.length > 0 && dayTasks.every(t => t.completed)) myStreak++;
    else if (dayTasks.length > 0) break;
    d.setDate(d.getDate() - 1);
  }

  const pendingRequests = friends.filter(f => f.status === 'pending' && f.friend_id === currentUserId);
  const acceptedFriends = friends.filter(f => f.status === 'accepted');

  // Build leaderboard from real progress data + current user
  const leaderboardEntries = [
    { id: 'me', name: 'You', avatar: '⭐', streak: myStreak, todayCompleted: completedToday, todayTotal: todayTasks.length },
    ...friendProgress
      .filter(p => p.user_id !== currentUserId)
      .map(p => ({
        id: p.user_id,
        name: p.email || 'Friend',
        avatar: '🧑',
        streak: p.streak_count,
        todayCompleted: p.tasks_completed,
        todayTotal: p.tasks_total,
      })),
  ].sort((a, b) => b.streak !== a.streak ? b.streak - a.streak : (b.todayCompleted / (b.todayTotal || 1)) - (a.todayCompleted / (a.todayTotal || 1)));

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Social Accountability</h2>
              <p className="text-sm text-muted-foreground">Friend Mode++ 🤝</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invite + Pending Requests */}
        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <input type="email" placeholder="Invite friend by email..." value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm" />
            <button onClick={inviteFriend} disabled={!inviteEmail.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium">
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Pending Requests:</p>
              {pendingRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-foreground">Friend request from a user</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => acceptFriend(req.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeFriend(req.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {acceptedFriends.length > 0 && (
            <p className="text-xs text-muted-foreground">{acceptedFriends.length} friend(s) connected</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-secondary rounded-lg p-1">
          {([
            { key: 'leaderboard' as const, icon: Trophy, label: 'Leaderboard' },
            { key: 'goals' as const, icon: Target, label: 'Shared Goals' },
            { key: 'punishment' as const, icon: Zap, label: 'Punishment Mode' },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm flex-1 justify-center ${
                activeTab === tab.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" /> Daily Leaderboard
            </h3>
            {leaderboardEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Add friends to see the leaderboard!</p>
            ) : (
              leaderboardEntries.map((entry, idx) => {
                const rate = entry.todayTotal > 0 ? Math.round((entry.todayCompleted / entry.todayTotal) * 100) : 0;
                const isMe = entry.id === 'me';
                return (
                  <div key={entry.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isMe ? 'bg-primary/10 border-2 border-primary/30' : 'bg-secondary/50'} ${idx === 0 ? 'ring-2 ring-yellow-400/50' : ''}`}>
                    <div className="text-lg font-bold w-8 text-center text-muted-foreground">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <div className="text-2xl">{entry.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{entry.name} {isMe && '(You)'}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{entry.streak} day streak</span>
                        <span>{entry.todayCompleted}/{entry.todayTotal} today</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${rate === 100 ? 'text-green-500' : rate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{rate}%</div>
                      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${rate === 100 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" /> Share Your Goals
            </h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Share a daily goal with friends..." value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === 'Enter' && shareGoal()}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm" />
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
                {sharedGoals.map(goal => (
                  <div key={goal.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="text-lg">🎯</div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{goal.goal_text}</p>
                      <p className="text-xs text-muted-foreground">{goal.user_id === currentUserId ? 'You' : 'Friend'} • {new Date(goal.created_at).toLocaleDateString()}</p>
                    </div>
                    {goal.user_id === currentUserId && (
                      <button onClick={() => deleteGoal(goal.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Punishment Tab */}
        {activeTab === 'punishment' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-foreground">Punishment Mode 😈</h3>
            </div>
            <p className="text-sm text-muted-foreground">Set consequences for breaking streaks. Stay accountable or face the music!</p>

            <div className="space-y-2">
              {punishments.map(rule => (
                <div key={rule.id} className={`p-3 rounded-lg border transition-all ${rule.is_active ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : 'border-input bg-secondary/30 opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground">⚡ {rule.trigger_text}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">→ {rule.action_text}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => togglePunishment(rule.id, rule.is_active)}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${rule.is_active ? 'bg-red-600 text-white' : 'bg-secondary text-muted-foreground'}`}>
                        {rule.is_active ? 'Active' : 'Off'}
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
              <input type="text" placeholder="Trigger (e.g., Miss 3 days in a row)" value={newPunishTrigger} onChange={e => setNewPunishTrigger(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm" />
              <input type="text" placeholder="Consequence (e.g., Buy friends coffee ☕)" value={newPunishAction} onChange={e => setNewPunishAction(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm" />
              <button onClick={addPunishment} disabled={!newPunishTrigger.trim() || !newPunishAction.trim()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium">
                Add Punishment Rule 😈
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
