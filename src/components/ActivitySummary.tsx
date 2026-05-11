import { Task, ViewMode, CATEGORIES } from '@/types/task';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';

interface ActivitySummaryProps {
  tasks: Task[];
  viewMode: ViewMode;
}

// Premium color palette (vivid, distinct, professional)
const PREMIUM_COLORS = [
  '#6366F1', // indigo
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F59E0B', // amber
  '#64748B', // slate
  '#EF4444', // red
];

export function ActivitySummary({ tasks, viewMode }: ActivitySummaryProps) {
  const categoryStats = CATEGORIES.map((category, idx) => {
    const categoryTasks = tasks.filter(task => task.category === category.id);
    const totalMinutes = categoryTasks.reduce((sum, task) => sum + task.duration, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    return {
      ...category,
      tasks: categoryTasks.length,
      minutes: totalMinutes,
      hours: totalHours,
      fill: PREMIUM_COLORS[idx % PREMIUM_COLORS.length],
    };
  }).filter(stat => stat.tasks > 0);

  const weeklyStats = () => {
    const dayStats: Record<string, number> = {};
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    tasks.forEach(task => {
      const dayName = daysOfWeek[new Date(task.date).getDay()];
      dayStats[dayName] = (dayStats[dayName] || 0) + task.duration;
    });
    return daysOfWeek.map(day => ({
      day,
      hours: Math.round(((dayStats[day] || 0) / 60) * 10) / 10,
    }));
  };

  const weeklyData = weeklyStats();
  const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);
  const mostProductiveDay = weeklyData.reduce(
    (max, day) => (day.hours > max.hours ? day : max),
    weeklyData[0] || { day: 'None', hours: 0 }
  );

  const chartConfig = {
    hours: { label: 'Hours' },
    ...CATEGORIES.reduce(
      (acc, category, idx) => ({
        ...acc,
        [category.id]: {
          label: category.label,
          color: PREMIUM_COLORS[idx % PREMIUM_COLORS.length],
        },
      }),
      {}
    ),
  };

  if (tasks.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Activity Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add some tasks to see your activity summary and charts!
        </p>
      </div>
    );
  }

  // Radial data (percent of total per category)
  const radialData = categoryStats.map(s => ({
    name: s.label,
    value: Math.round((s.minutes / totalMinutes) * 100),
    fill: s.fill,
  }));

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Activity Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="rounded-xl p-4 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-200/40 dark:border-indigo-800/40">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {Math.round((totalMinutes / 60) * 10) / 10}h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
          </div>
          <div className="rounded-xl p-4 bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-200/40 dark:border-violet-800/40">
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {tasks.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
          </div>
          <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-200/40 dark:border-emerald-800/40">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {mostProductiveDay.day}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Most Productive Day</div>
          </div>
        </div>
      </div>

      {/* Time Distribution - Donut */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Time Distribution by Category
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Share of hours across categories
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="w-full h-[320px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <defs>
                    {categoryStats.map((entry, i) => (
                      <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.fill} stopOpacity={0.65} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={115}
                    paddingAngle={3}
                    dataKey="hours"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {categoryStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 12,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                    formatter={(value: number, name: string) => [`${value}h`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categoryStats.map(stat => (
              <div
                key={stat.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: stat.fill }}
                  />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {stat.icon} {stat.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {stat.hours}h
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Productivity - Gradient Bars */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Weekly Productivity
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Hours focused per day
        </p>
        <div className="w-full h-[320px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 10, right: 16, bottom: 10, left: 0 }}
                barSize={36}
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                  }}
                  formatter={(value: number) => [`${value}h`, 'Hours']}
                />
                <Bar dataKey="hours" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      {/* Time Spent per Category - Radial */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Time Spent per Category
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Percentage of your total time
        </p>
        <div className="w-full h-[340px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="25%"
                outerRadius="100%"
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  background={{ fill: 'hsl(var(--muted) / 0.3)' }}
                  dataKey="value"
                  cornerRadius={10}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                  }}
                  formatter={(value: number, _n, p: any) => [`${value}%`, p.payload.name]}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
          {radialData.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full" style={{ background: d.fill }} />
              <span className="text-gray-700 dark:text-gray-300">{d.name}</span>
              <span className="ml-auto font-semibold text-gray-900 dark:text-white">
                {d.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
