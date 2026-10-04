/** Export only RoutineX-owned browser data, never unrelated sites' or auth session keys. */
export function downloadRoutineBackup() {
  const keys = ['accountability-buddies', 'accountability-challenges', 'accountability-feed', 'shared-routines', 'wellness-reminders', 'notification-settings', 'focus-music-track', 'focus-music-volume', 'tts-settings', 'cookie-consent'];
  const data: Record<string, string> = {};

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && (key.startsWith('routine-') || keys.includes(key))) {
      const value = window.localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
  }

  const exportedAt = new Date().toISOString();
  const blob = new Blob([JSON.stringify({ app: 'RoutineX', version: 1, exportedAt, data }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `routinex-backup-${exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}