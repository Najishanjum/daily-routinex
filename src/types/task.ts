
export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  date: string; // YYYY-MM-DD format
  category: string;
  notes?: string;
  createdAt?: string;
}

export type ViewMode = 'daily' | 'weekly' | 'monthly';

export const CATEGORIES = [
  { id: 'study', label: 'Study', color: 'blue' },
  { id: 'exercise', label: 'Exercise', color: 'emerald' },
  { id: 'work', label: 'Work', color: 'purple' },
  { id: 'personal', label: 'Personal', color: 'pink' },
  { id: 'health', label: 'Health', color: 'teal' },
  { id: 'hobby', label: 'Hobby', color: 'orange' },
  { id: 'other', label: 'Other', color: 'gray' },
] as const;
