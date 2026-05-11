
import { Task, ViewMode, CATEGORIES } from '@/types/task';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface ActivitySummaryProps {
  tasks: Task[];
  viewMode: ViewMode;
}

export function ActivitySummary({ tasks, viewMode }: ActivitySummaryProps) {
  // Calculate category statistics
  const categoryStats = CATEGORIES.map(category => {
    const categoryTasks = tasks.filter(task => task.category === category.id);
    const totalMinutes = categoryTasks.reduce((sum, task) => sum + task.duration, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    
    return {
      ...category,
      tasks: categoryTasks.length,
      minutes: totalMinutes,
      hours: totalHours,
      fill: `var(--routine-${category.color})`
    };
  }).filter(stat => stat.tasks > 0);

  // Calculate weekly productivity (most productive day)
  const weeklyStats = () => {
    const dayStats = {};
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    tasks.forEach(task => {
      const dayOfWeek = new Date(task.date).getDay();
      const dayName = daysOfWeek[dayOfWeek];
      if (!dayStats[dayName]) {
        dayStats[dayName] = 0;
      }
      dayStats[dayName] += task.duration;
    });

    return daysOfWeek.map(day => ({
      day,
      minutes: dayStats[day] || 0,
      hours: Math.round(((dayStats[day] || 0) / 60) * 10) / 10
    }));
  };

  const weeklyData = weeklyStats();
  const mostProductiveDay = weeklyData.reduce((max, day) => 
    day.minutes > max.minutes ? day : max, weeklyData[0] || { day: 'None', minutes: 0 }
  );

  const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);

  const chartConfig = {
    hours: {
      label: "Hours",
    },
    ...CATEGORIES.reduce((acc, category) => ({
      ...acc,
      [category.id]: {
        label: category.label,
        color: `var(--routine-${category.color})`
      }
    }), {})
  };

  if (tasks.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
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

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Activity Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round((totalMinutes / 60) * 10) / 10}h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {tasks.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {mostProductiveDay.day}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Most Productive Day</div>
          </div>
        </div>
      </div>

      {/* Time Distribution Pie Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Time Distribution by Category
        </h3>
        <div className="h-64">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="hours"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`${value}h`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {categoryStats.map((stat) => (
            <div key={stat.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: stat.fill }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {stat.icon} {stat.label}: {stat.hours}h
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Productivity Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weekly Productivity
        </h3>
        <div className="h-64">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value}h`, 'Hours']}
                />
                <Bar dataKey="hours" fill="var(--routine-blue)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      {/* Category Progress Bars */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Time Spent per Category
        </h3>
        <div className="space-y-4">
          {categoryStats.map((stat) => {
            const percentage = (stat.minutes / totalMinutes) * 100;
            return (
              <div key={stat.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stat.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stat.label}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.hours}h ({Math.round(percentage)}%)
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                  style={{
                    '--progress-foreground': stat.fill
                  } as React.CSSProperties}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
