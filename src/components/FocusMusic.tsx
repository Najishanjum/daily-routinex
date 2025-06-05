
import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface FocusMusicProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MusicTrack {
  id: string;
  name: string;
  icon: string;
  url: string;
  description: string;
}

export function FocusMusic({ isOpen, onClose }: FocusMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicTracks: MusicTrack[] = [
    {
      id: 'lofi',
      name: 'Lo-fi Hip Hop',
      icon: '🎵',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder - in real app would use actual lo-fi streams
      description: 'Chill beats for productivity'
    },
    {
      id: 'rain',
      name: 'Rain Sounds',
      icon: '🌧️',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
      description: 'Gentle rainfall ambience'
    },
    {
      id: 'forest',
      name: 'Forest Ambience',
      icon: '🌲',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
      description: 'Birds chirping and nature sounds'
    },
    {
      id: 'piano',
      name: 'Peaceful Piano',
      icon: '🎹',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
      description: 'Soft piano melodies'
    },
    {
      id: 'white-noise',
      name: 'White Noise',
      icon: '📻',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
      description: 'Pure focus sound'
    }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Load saved preferences
    const savedTrack = localStorage.getItem('focus-music-track');
    const savedVolume = localStorage.getItem('focus-music-volume');
    
    if (savedTrack) {
      const track = musicTracks.find(t => t.id === savedTrack);
      if (track) setCurrentTrack(track);
    }
    
    if (savedVolume) {
      setVolume([parseInt(savedVolume)]);
    }
  }, []);

  const playTrack = (track: MusicTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setCurrentTrack(track);
    setIsPlaying(true);
    
    // Save preference
    localStorage.setItem('focus-music-track', track.id);
    
    // In a real app, you would load the actual audio file here
    audioRef.current = new Audio(track.url);
    audioRef.current.loop = true;
    audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    audioRef.current.play().catch(console.error);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    localStorage.setItem('focus-music-volume', newVolume[0].toString());
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Music className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Focus Music
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Track Display */}
        {currentTrack && (
          <div className="glass-card p-4 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentTrack.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {currentTrack.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentTrack.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayPause}
                  className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={stopMusic}
                  className="p-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="p-1 rounded text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="flex-1">
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                {isMuted ? '0%' : `${volume[0]}%`}
              </span>
            </div>
          </div>
        )}

        {/* Track Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {musicTracks.map((track) => (
            <button
              key={track.id}
              onClick={() => playTrack(track)}
              className={`glass-card p-4 rounded-xl text-left hover:scale-105 transition-all duration-200 ${
                currentTrack?.id === track.id 
                  ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{track.icon}</span>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {track.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {track.description}
              </p>
            </button>
          ))}
        </div>

        {/* Custom Music Upload Section */}
        <div className="mt-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
          <div className="text-center">
            <Music className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              Custom Music
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Upload your own focus music files
            </p>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              id="custom-music"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // In a real app, you would handle file upload here
                  console.log('Custom music file selected:', file.name);
                }
              }}
            />
            <label
              htmlFor="custom-music"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Music className="w-4 h-4" />
              Choose File
            </label>
          </div>
        </div>

        {/* Focus Mode Tip */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-600 dark:text-purple-400">💡</span>
            <h4 className="font-medium text-purple-900 dark:text-purple-100">
              Focus Mode Tip
            </h4>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Music will continue playing in the background while you work on your tasks. 
            Use the floating music controls to adjust volume or change tracks without opening this panel.
          </p>
        </div>
      </div>
    </div>
  );
}
