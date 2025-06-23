
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
  photos?: string[]; // Added photos array for photo diary
  priority?: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'low-priority'; // Added priority field
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

export const PRIORITIES = [
  { 
    id: 'urgent-important', 
    label: 'Urgent & Important', 
    color: 'red', 
    icon: '🟥',
    description: 'Do First - Crisis, emergencies'
  },
  { 
    id: 'not-urgent-important', 
    label: 'Not Urgent but Important', 
    color: 'yellow', 
    icon: '🟨',
    description: 'Schedule - Prevention, planning'
  },
  { 
    id: 'urgent-not-important', 
    label: 'Urgent but Not Important', 
    color: 'blue', 
    icon: '🟦',
    description: 'Delegate - Interruptions, some calls'
  },
  { 
    id: 'low-priority', 
    label: 'Low Priority', 
    color: 'green', 
    icon: '🟩',
    description: 'Eliminate - Time wasters, busy work'
  },
] as const;
