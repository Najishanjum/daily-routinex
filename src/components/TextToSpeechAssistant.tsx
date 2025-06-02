
import React, { useState, useCallback } from 'react';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface TextToSpeechSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

interface TextToSpeechAssistantProps {
  onSettingsClick?: () => void;
}

export function TextToSpeechAssistant({ onSettingsClick }: TextToSpeechAssistantProps) {
  const [settings, setSettings] = useLocalStorage<TextToSpeechSettings>('tts-settings', {
    enabled: true,
    voice: '',
    rate: 1,
    pitch: 1,
    volume: 0.8
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  React.useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (!settings.voice && voices.length > 0) {
        const defaultVoice = voices.find(voice => voice.default) || voices[0];
        setSettings(prev => ({ ...prev, voice: defaultVoice.name }));
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!settings.enabled || !text.trim()) return;

    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Stop any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = availableVoices.find(voice => voice.name === settings.voice);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error('Speech synthesis failed');
      };

      speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech is not supported in this browser');
    }
  }, [settings, availableVoices]);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleEnabled = () => {
    const newEnabled = !settings.enabled;
    setSettings(prev => ({ ...prev, enabled: newEnabled }));
    
    if (newEnabled) {
      speak("Text to speech assistant enabled");
      toast.success('Text-to-speech enabled');
    } else {
      stopSpeaking();
      toast.info('Text-to-speech disabled');
    }
  };

  // Expose speak function globally for other components
  React.useEffect(() => {
    (window as any).routineXSpeak = speak;
    return () => {
      delete (window as any).routineXSpeak;
    };
  }, [speak]);

  return (
    <>
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-50 md:bottom-8 md:left-8">
        <button
          onClick={isSpeaking ? stopSpeaking : toggleEnabled}
          className={`p-3 rounded-full transition-all duration-300 shadow-lg ${
            isSpeaking 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : settings.enabled
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
              : 'bg-gray-400 hover:bg-gray-500'
          } text-white`}
          title={
            isSpeaking 
              ? 'Stop speaking' 
              : settings.enabled 
              ? 'Text-to-speech enabled' 
              : 'Enable text-to-speech'
          }
        >
          {isSpeaking ? (
            <VolumeX className="w-5 h-5" />
          ) : settings.enabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all"
          title="TTS Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {showSettings && (
        <div className="fixed bottom-24 left-6 glass-card p-4 rounded-xl w-80 z-50 animate-slide-up md:bottom-28 md:left-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Text-to-Speech Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voice
              </label>
              <select
                value={settings.voice}
                onChange={(e) => setSettings(prev => ({ ...prev, voice: e.target.value }))}
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speed: {settings.rate}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={(e) => setSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Volume: {Math.round(settings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>

            <button
              onClick={() => speak("This is a test of the text to speech assistant")}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Test Voice
            </button>
          </div>
        </div>
      )}
    </>
  );
}
