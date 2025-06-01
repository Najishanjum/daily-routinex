
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { ViewToggle } from '@/components/ViewToggle';
import { SearchFilter } from '@/components/SearchFilter';
import { DailyStats } from '@/components/DailyStats';
import { FloatingAddButton } from '@/components/FloatingAddButton';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Task, ViewMode } from '@/types/task';

const Index = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('routine-tasks', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
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
    } else {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString()
      };
      setTasks([...tasks, newTask]);
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
    }
  };

  const handleAddClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <ViewToggle 
                viewMode={viewMode} 
                onViewModeChange={setViewMode}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </div>

            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            <TaskList
              tasks={filteredTasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              viewMode={viewMode}
            />
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

      <FloatingAddButton onClick={handleAddClick} />

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
