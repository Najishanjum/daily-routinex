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
import { TermsConditions } from '@/components/TermsConditions';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import { TextToSpeechAssistant } from '@/components/TextToSpeechAssistant';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Task, ViewMode } from '@/types/task';
import { toast } from 'sonner';
import { RoutineHistory } from '@/components/RoutineHistory';
import { StreakRewards } from '@/components/StreakRewards';
import { NotificationSettings } from '@/components/NotificationSettings';
import { CookieConsent } from '@/components/CookieConsent';
import { FriendMode } from '@/components/FriendMode';
import { WellnessReminders } from '@/components/WellnessReminders';
import { FocusMusic } from '@/components/FocusMusic';
import { FloatingMusicControl } from '@/components/FloatingMusicControl';
import { AIGoalPlanner } from '@/components/AIGoalPlanner';
import { PhotoTimeline } from '@/components/PhotoTimeline';
import { PrintMyDay } from '@/components/PrintMyDay';
import { ProgressCertificate } from '@/components/ProgressCertificate';
import { MiniCourses } from '@/components/MiniCourses';
import { MicroHabits } from '@/components/MicroHabits';
import { DailySnapTracker } from '@/components/DailySnapTracker';
import { AIChatCoach } from '@/components/AIChatCoach';

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
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showRoutineHistory, setShowRoutineHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriendMode, setShowFriendMode] = useState(false);
  const [showWellnessReminders, setShowWellnessReminders] = useState(false);
  const [showFocusMusic, setShowFocusMusic] = useState(false);
  const [showGoalPlanner, setShowGoalPlanner] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentMusicTrack, setCurrentMusicTrack] = useState<string | null>(null);
  const [showPhotoTimeline, setShowPhotoTimeline] = useState(false);
  const [showMicroHabits, setShowMicroHabits] = useState(false);
  const [showDailySnapTracker, setShowDailySnapTracker] = useState(false);
  const [showAIChatCoach, setShowAIChatCoach] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showPrintMyDay, setShowPrintMyDay] = useState(false);
  const [showProgressCertificate, setShowProgressCertificate] = useState(false);
  const [showMiniCourses, setShowMiniCourses] = useState(false);

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
      
      if ((window as any).routineXSpeak) {
        (window as any).routineXSpeak(`Task "${taskData.title}" has been updated successfully`);
      }
    } else {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString()
      };
      setTasks([...tasks, newTask]);
      toast.success('Task added successfully!');
      
      if ((window as any).routineXSpeak) {
        (window as any).routineXSpeak(`New task "${taskData.title}" has been added to your routine`);
      }
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
      
      if ((window as any).routineXSpeak) {
        (window as any).routineXSpeak(`Task "${taskToDelete.title}" has been deleted`);
      }
    }
  };

  const handleAddClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleVoiceTask = (transcript: string) => {
    setEditingTask(null);
    setIsFormOpen(true);
    setTimeout(() => {
      const titleInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (titleInput) {
        titleInput.value = transcript;
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 100);
    
    if ((window as any).routineXSpeak) {
      (window as any).routineXSpeak(`Voice input received: ${transcript}. Please complete the task details.`);
    }
  };

  const handleMusicToggle = () => {
    setMusicPlaying(!musicPlaying);
  };

  const handleGoalTasksGenerated = (generatedTasks: Omit<Task, 'id'>[]) => {
    const newTasks = generatedTasks.map(task => ({
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));
    setTasks([...tasks, ...newTasks]);
    toast.success(`${generatedTasks.length} tasks added to your routine!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Toggle */}
            <div className="flex justify-end gap-2 flex-wrap">
              <button
                onClick={() => setShowAIChatCoach(!showAIChatCoach)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showAIChatCoach
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                🤖 AI Coach
              </button>
              <button
                onClick={() => setShowDailySnapTracker(!showDailySnapTracker)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showDailySnapTracker
                    ? 'bg-pink-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                📸 Daily Snap
              </button>
              <button
                onClick={() => setShowMicroHabits(!showMicroHabits)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showMicroHabits
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                🧠 Micro-Habits
              </button>
              <button
                onClick={() => setShowMiniCourses(!showMiniCourses)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showMiniCourses
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                🎓 Mini Courses
              </button>
              <button
                onClick={() => setShowProgressCertificate(!showProgressCertificate)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showProgressCertificate
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                🏆 Certificate
              </button>
              <button
                onClick={() => setShowPrintMyDay(!showPrintMyDay)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showPrintMyDay
                    ? 'bg-green-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                🖨️ Print My Day
              </button>
              <button
                onClick={() => setShowGoalPlanner(!showGoalPlanner)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showGoalPlanner
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                🎯 AI Goals
              </button>
              <button
                onClick={() => setShowFocusMusic(!showFocusMusic)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFocusMusic
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                🎵 Focus Music
              </button>
              <button
                onClick={() => setShowFriendMode(!showFriendMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFriendMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                Friend Mode
              </button>
              <button
                onClick={() => setShowWellnessReminders(!showWellnessReminders)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showWellnessReminders
                    ? 'bg-green-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                Wellness
              </button>
              <button
                onClick={() => setShowRoutineHistory(!showRoutineHistory)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showRoutineHistory
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                {showRoutineHistory ? 'Hide History' : 'View History'}
              </button>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showNotifications
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                Notifications
              </button>
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
          <div className="lg:col-span-1 space-y-6">
            <DailyStats 
              tasks={filteredTasks}
              viewMode={viewMode}
              selectedDate={selectedDate}
            />
            <StreakRewards tasks={tasks} />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer 
        onTermsClick={() => setShowTerms(true)}
        onPrivacyClick={() => setShowPrivacy(true)}
      />

      {/* Text-to-Speech Assistant */}
      <TextToSpeechAssistant />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40 md:bottom-8 md:right-8">
        <VoiceTaskEntry onVoiceTask={handleVoiceTask} />
        <FloatingAddButton onClick={handleAddClick} />
      </div>

      {/* Floating Music Control */}
      <FloatingMusicControl
        isPlaying={musicPlaying}
        currentTrack={currentMusicTrack}
        onTogglePlay={handleMusicToggle}
        onOpenMusic={() => setShowFocusMusic(true)}
      />

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

      <TermsConditions
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />

      <PrivacyPolicy
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      <RoutineHistory
        tasks={tasks}
        isOpen={showRoutineHistory}
        onClose={() => setShowRoutineHistory(false)}
      />

      <NotificationSettings
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <FriendMode
        tasks={tasks}
        isOpen={showFriendMode}
        onClose={() => setShowFriendMode(false)}
      />

      <WellnessReminders
        isOpen={showWellnessReminders}
        onClose={() => setShowWellnessReminders(false)}
      />

      <FocusMusic
        isOpen={showFocusMusic}
        onClose={() => setShowFocusMusic(false)}
      />

      <AIGoalPlanner
        isOpen={showGoalPlanner}
        onClose={() => setShowGoalPlanner(false)}
        onTasksGenerated={handleGoalTasksGenerated}
      />

      <PhotoTimeline
        tasks={tasks}
        isOpen={showPhotoTimeline}
        onClose={() => setShowPhotoTimeline(false)}
      />

      <PrintMyDay
        tasks={tasks}
        selectedDate={selectedDate}
        isOpen={showPrintMyDay}
        onClose={() => setShowPrintMyDay(false)}
      />

      <ProgressCertificate
        tasks={tasks}
        isOpen={showProgressCertificate}
        onClose={() => setShowProgressCertificate(false)}
      />

      <MiniCourses
        isOpen={showMiniCourses}
        onClose={() => setShowMiniCourses(false)}
        onTasksGenerated={handleGoalTasksGenerated}
      />

      <MicroHabits
        tasks={tasks}
        isOpen={showMicroHabits}
        onClose={() => setShowMicroHabits(false)}
        onTasksGenerated={handleGoalTasksGenerated}
      />

      <DailySnapTracker
        isOpen={showDailySnapTracker}
        onClose={() => setShowDailySnapTracker(false)}
      />

      <AIChatCoach
        isOpen={showAIChatCoach}
        onClose={() => setShowAIChatCoach(false)}
        tasks={tasks}
      />

      <CookieConsent />
    </div>
  );
};

export default Index;
