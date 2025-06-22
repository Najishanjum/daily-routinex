
import { useState, useRef, useEffect } from 'react';
import { Camera, Calendar, Smile, X, Download, Share2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

interface DailySnap {
  id: string;
  date: string;
  photo: string;
  mood: 'happy' | 'neutral' | 'sad' | '';
  notes?: string;
  timestamp: string;
}

interface DailySnapTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailySnapTracker({ isOpen, onClose }: DailySnapTrackerProps) {
  const [dailySnaps, setDailySnaps] = useLocalStorage<DailySnap[]>('routine-daily-snaps', []);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedSnap, setSelectedSnap] = useState<DailySnap | null>(null);
  const [currentMood, setCurrentMood] = useState<'happy' | 'neutral' | 'sad' | ''>('');
  const [notes, setNotes] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const todaySnap = dailySnaps.find(snap => snap.date === today);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupCamera = async () => {
      if (showCamera && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' },
            audio: false 
          });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.error('Error accessing camera:', error);
          toast.error('Unable to access camera. Please use file upload instead.');
          setShowCamera(false);
        }
      }
    };

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        saveSnap(photoData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = e.target?.result as string;
        saveSnap(photoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSnap = (photoData: string) => {
    const newSnap: DailySnap = {
      id: Date.now().toString(),
      date: today,
      photo: photoData,
      mood: currentMood,
      notes,
      timestamp: new Date().toISOString()
    };

    // Replace today's snap if it exists, otherwise add new
    const updatedSnaps = todaySnap 
      ? dailySnaps.map(snap => snap.date === today ? newSnap : snap)
      : [...dailySnaps, newSnap];

    setDailySnaps(updatedSnaps);
    setShowCamera(false);
    setCurrentMood('');
    setNotes('');
    toast.success('Daily snap saved! 📸');

    // Stop camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const deleteSnap = (snapId: string) => {
    setDailySnaps(dailySnaps.filter(snap => snap.id !== snapId));
    setSelectedSnap(null);
    toast.success('Snap deleted');
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'sad': return '😔';
      default: return '📷';
    }
  };

  const generateTimeline = () => {
    const sortedSnaps = [...dailySnaps].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return sortedSnaps.map((snap, index) => {
      const date = new Date(snap.date);
      const isToday = snap.date === today;
      
      return (
        <div key={snap.id} className="flex gap-4 items-start">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${isToday ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            {index < sortedSnaps.length - 1 && (
              <div className="w-px h-20 bg-gray-200 dark:bg-gray-700 mt-2"></div>
            )}
          </div>
          
          <div 
            className="flex-1 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setSelectedSnap(snap)}
          >
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isToday ? 'Today' : date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="text-lg">{getMoodEmoji(snap.mood)}</span>
              </div>
              
              <img 
                src={snap.photo} 
                alt={`Snap from ${snap.date}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              
              {snap.notes && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 truncate">
                  {snap.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📸 Daily Snap Tracker
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Visual journey of your progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(90vh-120px)]">
          {/* Left Side - Camera/Today's Snap */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Snap
            </h3>

            {todaySnap ? (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                <img 
                  src={todaySnap.photo} 
                  alt="Today's snap"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMoodEmoji(todaySnap.mood)}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(todaySnap.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCamera(true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Retake
                  </button>
                </div>
                {todaySnap.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {todaySnap.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 text-center space-y-4">
                {showCamera ? (
                  <div className="space-y-4">
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline
                      className="w-full rounded-lg"
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    
                    <div className="space-y-3">
                      <div className="flex justify-center gap-2">
                        {(['happy', 'neutral', 'sad'] as const).map(mood => (
                          <button
                            key={mood}
                            onClick={() => setCurrentMood(mood)}
                            className={`p-2 rounded-lg transition-colors ${
                              currentMood === mood 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {getMoodEmoji(mood)}
                          </button>
                        ))}
                      </div>
                      
                      <input
                        type="text"
                        placeholder="How are you feeling? (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                      
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={capturePhoto}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Capture
                        </button>
                        <button
                          onClick={() => setShowCamera(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No snap for today yet
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setShowCamera(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Take Photo
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Upload
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Progress Timeline ({dailySnaps.length} days)
            </h3>
            
            <div className="overflow-y-auto max-h-[calc(100%-60px)] space-y-2">
              {dailySnaps.length > 0 ? (
                generateTimeline()
              ) : (
                <div className="text-center py-12">
                  <Smile className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Start your visual journey today!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Snap Modal */}
        {selectedSnap && (
          <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(selectedSnap.date).toLocaleDateString()}
                </h4>
                <button
                  onClick={() => setSelectedSnap(null)}
                  className="p-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <img 
                src={selectedSnap.photo} 
                alt="Selected snap"
                className="w-full rounded-lg mb-3"
              />
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{getMoodEmoji(selectedSnap.mood)}</span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedSnap.timestamp).toLocaleString()}
                </span>
              </div>
              
              {selectedSnap.notes && (
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {selectedSnap.notes}
                </p>
              )}
              
              <button
                onClick={() => deleteSnap(selectedSnap.id)}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Snap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
