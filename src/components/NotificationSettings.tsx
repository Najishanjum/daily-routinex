import React, { useState, useEffect } from 'react';
import { Bell, Clock, X, Plus, Trash2 } from 'lucide-react';

interface NotificationTime {
  id: string;
  time: string;
  message: string;
  enabled: boolean;
}

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTimes, setNotificationTimes] = useState<NotificationTime[]>([]);
  const [newTime, setNewTime] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Load saved notification settings
    const saved = localStorage.getItem('notification-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setNotificationsEnabled(settings.enabled || false);
      setNotificationTimes(settings.times || []);
    }
  }, []);

  useEffect(() => {
    // Save notification settings
    const settings = {
      enabled: notificationsEnabled,
      times: notificationTimes
    };
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }, [notificationsEnabled, notificationTimes]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        scheduleNotifications();
      }
    }
  };

  const scheduleNotifications = () => {
    // Clear existing notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications().then(notifications => {
          notifications.forEach(notification => notification.close());
        });
      });
    }

    // Schedule new notifications
    notificationTimes.forEach(notif => {
      if (notif.enabled) {
        scheduleNotification(notif);
      }
    });
  };

  const scheduleNotification = (notif: NotificationTime) => {
    const [hours, minutes] = notif.time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('RoutineX Reminder', {
          body: notif.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }
      
      // Schedule for next day
      setTimeout(() => scheduleNotification(notif), 24 * 60 * 60 * 1000);
    }, timeUntilNotification);
  };

  const addNotification = () => {
    if (newTime && newMessage) {
      const newNotif: NotificationTime = {
        id: Date.now().toString(),
        time: newTime,
        message: newMessage,
        enabled: true
      };
      setNotificationTimes([...notificationTimes, newNotif]);
      setNewTime('');
      setNewMessage('');
      
      if (notificationsEnabled) {
        scheduleNotification(newNotif);
      }
    }
  };

  const removeNotification = (id: string) => {
    setNotificationTimes(notificationTimes.filter(notif => notif.id !== id));
  };

  const toggleNotification = (id: string) => {
    setNotificationTimes(notificationTimes.map(notif => 
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Notification Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enable Notifications */}
        <div className="glass-card p-4 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Enable Notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get reminders for your routine activities
              </p>
            </div>
            <button
              onClick={notificationsEnabled ? () => setNotificationsEnabled(false) : requestNotificationPermission}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                notificationsEnabled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {notificationsEnabled ? 'Enabled' : 'Enable'}
            </button>
          </div>
        </div>

        {/* Add New Notification */}
        <div className="glass-card p-4 rounded-xl mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add Reminder
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <input
                type="text"
                placeholder="e.g., Time for your 4 PM reading break!"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={addNotification}
              disabled={!newTime || !newMessage}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </button>
          </div>
        </div>

        {/* Existing Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Reminders ({notificationTimes.filter(n => n.enabled).length})
          </h3>
          {notificationTimes.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                No reminders set up yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificationTimes.map(notif => (
                <div key={notif.id} className="glass-card p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleNotification(notif.id)}
                        className={`w-4 h-4 rounded border-2 transition-colors ${
                          notif.enabled
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {notif.enabled && <div className="w-2 h-2 bg-white rounded-full mx-auto" />}
                      </button>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {notif.time}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {notif.message}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeNotification(notif.id)}
                      className="p-1 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
