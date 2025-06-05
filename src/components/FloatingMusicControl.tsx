
import React, { useState } from 'react';
import { Music, Play, Pause, Volume2 } from 'lucide-react';

interface FloatingMusicControlProps {
  isPlaying: boolean;
  currentTrack: string | null;
  onTogglePlay: () => void;
  onOpenMusic: () => void;
}

export function FloatingMusicControl({ 
  isPlaying, 
  currentTrack, 
  onTogglePlay, 
  onOpenMusic 
}: FloatingMusicControlProps) {
  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 md:bottom-8 md:left-8">
      <div className="glass-card p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMusic}
            className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            title="Open Music Controls"
          >
            <Music className="w-4 h-4" />
          </button>
          
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            title={isPlaying ? 'Pause Music' : 'Play Music'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Volume2 className="w-4 h-4" />
            <span className="truncate max-w-24">{currentTrack}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
