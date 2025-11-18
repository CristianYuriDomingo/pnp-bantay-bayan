'use client';
// src/contexts/sound-context.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSound } from '../hooks/use-sound';

type SoundType =
  | 'click'
  | 'correct'
  | 'correct1'
  | 'lose'
  | 'lose1'
  | 'lose2'
  | 'win'
  | 'win1'
  | 'lessonComplete'
  | 'notification'
  | 'wrong'
  | 'wrong1';

interface SoundContextType {
  play: (sound: SoundType, options?: { volume?: number; playbackRate?: number }) => void;
  stop: (sound: SoundType) => void;
  stopAll: () => void;
  preload: (sounds: SoundType[]) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { play: playSound, stop, stopAll, preload: preloadSounds } = useSound();
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const play = (sound: SoundType, options?: { volume?: number; playbackRate?: number }) => {
    if (!isMuted) {
      playSound(sound as any, {
        volume: options?.volume ?? volume,
        playbackRate: options?.playbackRate,
      });
    }
  };

  const preload = (sounds: SoundType[]) => {
    // if muted, still call preload to create and cache audio elements but at 0 volume
    preloadSounds(sounds as any);
  };

  return (
    <SoundContext.Provider
      value={{
        play,
        stop,
        stopAll,
        preload,
        isMuted,
        setIsMuted,
        volume,
        setVolume,
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