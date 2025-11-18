// src/contexts/sound-context.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSound } from '../hooks/use-sound';

type SoundType = 
  | 'click'
  | 'correct'
  | 'correct1'
  | 'win'
  | 'lose'
  | 'lose1'
  | 'lose2'
  | 'lessonComplete'
  | 'notification'
  | 'wrong';

interface SoundContextType {
  play: (sound: SoundType, options?: { volume?: number; playbackRate?: number }) => void;
  stop: (sound: SoundType) => void;
  stopAll: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { play: playSound, stop, stopAll } = useSound();
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const play = (sound: string, options?: { volume?: number; playbackRate?: number }) => {
    if (!isMuted) {
      playSound(sound as any, { 
        volume: options?.volume ?? volume,
        playbackRate: options?.playbackRate 
      });
    }
  };

  return (
    <SoundContext.Provider 
      value={{ 
        play, 
        stop, 
        stopAll, 
        isMuted, 
        setIsMuted, 
        volume, 
        setVolume 
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSoundContext = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within SoundProvider');
  }
  return context;
};