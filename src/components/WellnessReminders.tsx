
import React, { useState, useEffect } from 'react';
import { Droplets, Zap, Coffee, X, Plus, Trash2, Bell } from 'lucide-react';

interface WellnessReminder {
  id: string;
  type: 'water' | 'stretch' | 'break';
  interval: number; // in minutes
  message: string;
  enabled: boolean;
  lastTriggered?: string;
}

interface WellnessRemindersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WellnessReminders({ isOpen, onClose }: WellnessRemindersProps) {
  const [reminders, setReminders] = useState<WellnessReminder[]>([
    {
      id: '1',
      type: 'water',
      interval: 60,
      message: '💧 Time to hydrate! Drink some water',
      enabled: true
    },
    {
      id: '2',
      type: 'stretch',
      interval: 90,
      message: '🧘 Take a moment to stretch your body',
      enabled: true
    },
    {
      id: '3',
      type: 'break',
      interval: 120,
      message: '☕ Time for a wellness break! Rest your eyes',
      enabled: true
    }
  ]);

  const [activeReminders, setActiveReminders] = useState<string[]>([]);

  useEffect(() => {
    // Load saved reminders
    const saved = localStorage.getItem('wellness-reminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save reminders
    localStorage.setItem('wellness-reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    // Set up intervals for enabled reminders
    const intervals: { [key: string]: ReturnType<typeof setInterval> } = {};

    reminders.forEach(reminder => {
      if (reminder.enabled) {
        intervals[reminder.id] = setInterval(() => {
          triggerReminder(reminder);
        }, reminder.interval * 60 * 1000);
      }
    });

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [reminders]);

  const triggerReminder = (reminder: WellnessReminder) => {
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('RoutineX Wellness Reminder', {
        body: reminder.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }

    // Show in-app notification
    setActiveReminders(prev => [...prev, reminder.id]);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setActiveReminders(prev => prev.filter(id => id !== reminder.id));
    }, 5000);

    // Update last triggered time
    setReminders(prev => prev.map(r => 
      r.id === reminder.id 
        ? { ...r, lastTriggered: new Date().toISOString() }
        : r
    ));
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id 
        ? { ...reminder, enabled: !reminder.enabled }
        : reminder
    ));
  };

  const updateInterval = (id: string, interval: number) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id 
        ? { ...reminder, interval }
        : reminder
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const addCustomReminder = () => {
    const newReminder: WellnessReminder = {
      id: Date.now().toString(),
      type: 'break',
      interval: 60,
      message: '🌟 Custom wellness reminder',
      enabled: true
    };
    setReminders(prev => [...prev, newReminder]);
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'water': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'stretch': return <Zap className="w-5 h-5 text-green-500" />;
      case 'break': return <Coffee className="w-5 h-5 text-orange-500" />;
      default: return <Bell className="w-5 h-5 text-purple-500" />;
    }
  };

  const dismissNotification = (id: string) => {
    setActiveReminders(prev => prev.filter(reminderId => reminderId !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* In-app notifications */}
      <div className="fixed top-20 right-4 z-[60] space-y-2">
        {activeReminders.map(reminderId => {
          const reminder = reminders.find(r => r.id === reminderId);
          if (!reminder) return null;
          
          return (
            <div
              key={reminderId}
              className="glass-card p-4 rounded-lg shadow-lg animate-slide-in-right max-w-sm"
            >
              <div className="flex items-start gap-3">
                <div className="animate-bounce">
                  {getReminderIcon(reminder.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {reminder.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissNotification(reminderId)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Settings Modal */}
      <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Wellness Reminders
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {reminders.map(reminder => (
              <div key={reminder.id} className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getReminderIcon(reminder.type)}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)} Reminder
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Every {reminder.interval} minutes
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        reminder.enabled
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
                      }`}
                    >
                      {reminder.enabled ? 'On' : 'Off'}
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-1 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message
                    </label>
                    <input
                      type="text"
                      value={reminder.message}
                      onChange={(e) => setReminders(prev => prev.map(r => 
                        r.id === reminder.id ? { ...r, message: e.target.value } : r
                      ))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interval (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={reminder.interval}
                      onChange={(e) => updateInterval(reminder.id, parseInt(e.target.value) || 60)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addCustomReminder}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Custom Reminder
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
