
export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  date: string; // YYYY-MM-DD format
  category: string;
  notes?: string;
  createdAt?: string;
  completed: boolean; // Added the missing completed property
  startTime?: string; // Added startTime property for routine history
}

export type ViewMode = 'daily' | 'weekly' | 'monthly';

export const CATEGORIES = [
  { id: 'study', label: 'Study', color: 'blue', icon: '🧠' },
  { id: 'exercise', label: 'Exercise', color: 'emerald', icon: '🏋️' },
  { id: 'work', label: 'Work', color: 'purple', icon: '💼' },
  { id: 'personal', label: 'Personal', color: 'pink', icon: '👤' },
  { id: 'health', label: 'Health', color: 'teal', icon: '🏥' },
  { id: 'hobby', label: 'Hobby', color: 'orange', icon: '🎨' },
  { id: 'other', label: 'Other', color: 'gray', icon: '📋' },
] as const;
