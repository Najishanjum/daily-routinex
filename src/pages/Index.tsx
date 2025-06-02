
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { ViewToggle } from '@/components/ViewToggle';
import { SearchFilter } from '@/components/SearchFilter';
import { DailyStats } from '@/components/DailyStats';
import { ActivitySummary } from '@/components/ActivitySummary';
import { FloatingAddButton } from '@/components/FloatingAddButton';
import { VoiceTaskEntry } from '@/components/VoiceTaskEntry';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { UserProfile } from '@/components/UserProfile';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Task, ViewMode } from '@/types/task';
import { toast } from 'sonner';

const Index = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('routine-tasks', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showActivitySummary, setShowActivitySummary] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || task.category === selectedCategory;
    
    let matchesDate = true;
    if (viewMode === 'daily') {
      matchesDate = task.date === selectedDate;
    } else if (viewMode === 'weekly') {
      const taskDate = new Date(task.date);
      const selectedDateObj = new Date(selectedDate);
      const startOfWeek = new Date(selectedDateObj);
      startOfWeek.setDate(selectedDateObj.getDate() - selectedDateObj.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      matchesDate = taskDate >= startOfWeek && taskDate <= endOfWeek;
    } else if (viewMode === 'monthly') {
      const taskDate = new Date(task.date);
      const selectedDateObj = new Date(selectedDate);
      matchesDate = taskDate.getMonth() === selectedDateObj.getMonth() &&
                   taskDate.getFullYear() === selectedDateObj.getFullYear();
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...taskData, id: editingTask.id }
          : task
      ));
      toast.success('Task updated successfully!');
    } else {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString()
      };
      setTasks([...tasks, newTask]);
      toast.success('Task added successfully!');
    }
    
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
      setTaskToDelete(null);
      toast.success('Task deleted successfully!');
    }
  };

  const handleAddClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleVoiceTask = (transcript: string) => {
    setEditingTask(null);
    setIsFormOpen(true);
    // Pre-fill the form with the voice transcript
    setTimeout(() => {
      const titleInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (titleInput) {
        titleInput.value = transcript;
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Toggle */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowUserProfile(!showUserProfile)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showUserProfile
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                {showUserProfile ? 'Hide Profile' : 'Show Profile'}
              </button>
            </div>

            {/* User Profile Section */}
            {showUserProfile && (
              <UserProfile tasks={tasks} />
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <ViewToggle 
                viewMode={viewMode} 
                onViewModeChange={setViewMode}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowActivitySummary(!showActivitySummary)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showActivitySummary
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }`}
                >
                  {showActivitySummary ? 'Show Tasks' : 'Show Charts'}
                </button>
              </div>
            </div>

            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {showActivitySummary ? (
              <ActivitySummary tasks={filteredTasks} viewMode={viewMode} />
            ) : (
              <TaskList
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                viewMode={viewMode}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DailyStats 
              tasks={filteredTasks}
              viewMode={viewMode}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 md:bottom-8 md:right-8">
        <VoiceTaskEntry onVoiceTask={handleVoiceTask} />
        <FloatingAddButton onClick={handleAddClick} />
      </div>

      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        taskTitle={taskToDelete?.title || ''}
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};

export default Index;
