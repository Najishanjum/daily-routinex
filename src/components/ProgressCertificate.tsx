import React, { useMemo, useRef, useState } from 'react';
import { Award, Download, X, Trophy, Lock, Calendar, Target, Clock } from 'lucide-react';
import { Task } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/hooks/useAuth';

interface ProgressCertificateProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

type Tier = 7 | 30;

const QUOTES: Record<Tier, string> = {
  7: 'Small daily wins compound into extraordinary results.',
  30: 'Discipline is the bridge between goals and accomplishment.',
};

export function ProgressCertificate({ tasks, isOpen, onClose }: ProgressCertificateProps) {
  const { user } = useAuth();
  const [userProfile] = useLocalStorage<{ name?: string; photo?: string }>('routine-user-profile', {});
  const [activeTier, setActiveTier] = useState<Tier | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed);
    const tasksCompleted = completed.length;

    // streak calculation
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.date === ds);
      const dayDone = dayTasks.filter(t => t.completed);
      if (dayTasks.length > 0 && dayDone.length > 0) streak++;
      else if (i > 0) break;
    }

    const totalMin = completed.reduce((s, t) => s + (t.duration || 0), 0);
    const days = Math.max(streak, 1);
    const avg = totalMin / days;
    const avgDaily = `${Math.floor(avg / 60)}h ${Math.round(avg % 60)}m`;

    const catCount: Record<string, number> = {};
    completed.forEach(t => { catCount[t.category] = (catCount[t.category] || 0) + 1; });
    const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);

    return { tasksCompleted, streak, avgDaily, topCats };
  }, [tasks]);

  if (!isOpen) return null;

  const userName =
    userProfile.name ||
    (user?.user_metadata as any)?.full_name ||
    user?.email?.split('@')[0] ||
    'Achiever';

  const tiers: { tier: Tier; label: string; subtitle: string; gradient: string }[] = [
    { tier: 7, label: '7-Day Streak', subtitle: 'Consistency Starter', gradient: 'from-blue-400 to-cyan-500' },
    { tier: 30, label: '30-Day Streak', subtitle: 'Habit Master', gradient: 'from-yellow-400 to-orange-500' },
  ];

  const isUnlocked = (tier: Tier) => stats.streak >= tier;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownload = () => {
    if (!certRef.current) return;
    const html = certRef.current.outerHTML;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>${userName} - ${activeTier}-Day Certificate</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>@media print { @page { size: landscape; margin: 0; } body { margin: 0; } }</style>
      </head><body class="p-8 bg-white">${html}
      <script>window.onload = () => setTimeout(() => window.print(), 500);</script>
      </body></html>
    `);
    w.document.close();
  };

  const tier = activeTier;
  const tierInfo = tiers.find(t => t.tier === tier);

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Achievement Certificates
            </h2>
          </div>
          <button onClick={() => { setActiveTier(null); onClose(); }}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!tier ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard icon={<Calendar className="w-6 h-6 text-blue-600" />} label="Current Streak" value={`${stats.streak} days`} />
              <StatCard icon={<Target className="w-6 h-6 text-green-600" />} label="Tasks Completed" value={`${stats.tasksCompleted}`} />
              <StatCard icon={<Clock className="w-6 h-6 text-purple-600" />} label="Avg Daily Time" value={stats.avgDaily} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tiers.map(t => {
                const unlocked = isUnlocked(t.tier);
                return (
                  <div key={t.tier} className={`relative rounded-2xl p-6 border-2 ${unlocked ? 'border-yellow-400' : 'border-gray-300 dark:border-gray-600'} bg-white/60 dark:bg-gray-800/60`}>
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center`}>
                      {unlocked ? <Trophy className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-white" />}
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{t.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t.subtitle}</div>
                      <div className="text-xs text-gray-500 mb-4">
                        {unlocked ? '✅ Unlocked' : `🔒 ${t.tier - stats.streak} more day(s) to unlock`}
                      </div>
                      <button
                        disabled={!unlocked}
                        onClick={() => setActiveTier(t.tier)}
                        className={`w-full py-2 rounded-lg font-semibold transition-all ${unlocked ? `bg-gradient-to-r ${t.gradient} text-white hover:opacity-90` : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                      >
                        View Certificate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <button onClick={() => setActiveTier(null)} className="text-sm text-blue-600 hover:underline">← Back</button>
              <button onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" /> Download Certificate
              </button>
            </div>

            <div ref={certRef} className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-10 rounded-2xl border-4 border-yellow-400 relative overflow-hidden text-gray-900" style={{ minHeight: '600px' }}>
              <div className="absolute top-4 left-4 w-16 h-16 bg-yellow-400/20 rounded-full" />
              <div className="absolute bottom-4 right-4 w-20 h-20 bg-purple-400/20 rounded-full" />
              <div className="relative z-10 text-center">
                <div className="text-5xl mb-3">🏆</div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  CERTIFICATE OF ACHIEVEMENT
                </h1>
                <div className="text-base text-gray-600 mb-6">{tierInfo?.subtitle} · RoutineX</div>

                {userProfile.photo && (
                  <img src={userProfile.photo} alt={userName} className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-yellow-400 object-cover" />
                )}

                <div className="text-lg text-gray-700 mb-1">This certificate is proudly presented to</div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2 pb-2 inline-block border-b-2 border-yellow-400">
                  {userName}
                </div>
                {user?.email && <div className="text-sm text-gray-500 mb-6">{user.email}</div>}

                <div className="text-base text-gray-700 mb-6">
                  for successfully completing a <strong>{tier}-day routine streak</strong> on RoutineX.
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <CertStat label="Streak Days" value={`${stats.streak}`} />
                  <CertStat label="Tasks Done" value={`${stats.tasksCompleted}`} />
                  <CertStat label="Daily Focus" value={stats.avgDaily} />
                </div>

                <div className="bg-white/50 p-4 rounded-xl mb-6 italic text-gray-800">
                  "{QUOTES[tier]}"
                </div>

                <div className="flex justify-between items-end text-sm">
                  <div className="text-left">
                    <div className="text-gray-600">Issued on</div>
                    <div className="font-semibold">{today}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">RoutineX AI Coach</div>
                    <div className="text-gray-600">Productivity Coach</div>
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card p-4 rounded-xl text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

function CertStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/60 p-3 rounded-xl">
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}
