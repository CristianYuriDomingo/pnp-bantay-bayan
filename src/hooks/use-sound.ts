// src/hooks/use-sound.ts
import { useCallback, useRef } from 'react';

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

interface UseSoundOptions {
  volume?: number; // 0 to 1
  playbackRate?: number; // 0.5 to 2
}

export const useSound = () => {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const play = useCallback((sound: SoundType, options?: UseSoundOptions) => {
    const soundMap: Record<SoundType, string> = {
      click: '/Sounds/click.wav',
      correct: '/Sounds/correct.wav',
      correct1: '/Sounds/correct1.wav',
      lose: '/Sounds/lose.wav',
      lose1: '/Sounds/lose1.wav',
      lose2: '/Sounds/lose2.wav',
      win: '/Sounds/win.mp3',
      win1: '/Sounds/win1.mp3',
      notification: '/Sounds/notification.wav',
      wrong: '/Sounds/wrong.mp3',
      wrong1: '/Sounds/wrong1.wav',
      lessonComplete: '/Sounds/lessonComplete.wav', 
    };

    const soundPath = soundMap[sound];
    if (!soundPath) {
      console.warn(`Sound "${sound}" not found in soundMap`);
      return;
    }

    try {
      // Get or create audio element
      let audio = audioRefs.current.get(sound);
      
      if (!audio) {
        audio = new Audio();
        
        // Add error handler before setting src
        audio.addEventListener('error', (e) => {
          const target = e.target as HTMLAudioElement;
          const error = target.error;
          
          console.error(`❌ Audio error for "${sound}":`, {
            code: error?.code,
            message: error?.message,
            path: soundPath,
            MEDIA_ERR_ABORTED: error?.code === 1,
            MEDIA_ERR_NETWORK: error?.code === 2,
            MEDIA_ERR_DECODE: error?.code === 3,
            MEDIA_ERR_SRC_NOT_SUPPORTED: error?.code === 4,
          });
        });

        // Add load success handler
        audio.addEventListener('canplaythrough', () => {
          console.log(`✅ Audio loaded successfully: "${sound}" from ${soundPath}`);
        });

        // Set the source
        audio.src = soundPath;
        audio.load();
        
        audioRefs.current.set(sound, audio);
      }

      // Reset audio to beginning if it's already playing
      audio.currentTime = 0;

      // Apply options
      if (options?.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, options.volume));
      } else {
        audio.volume = 0.5; // Default volume
      }
      
      if (options?.playbackRate !== undefined) {
        audio.playbackRate = Math.max(0.5, Math.min(2, options.playbackRate));
      }

      // Play the sound
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`🔊 Playing sound: "${sound}"`);
          })
          .catch(err => {
            console.error(`Error playing sound "${sound}":`, err);
            
            // If play fails, try reloading the audio
            if (err.name === 'NotAllowedError') {
              console.warn('Audio play was prevented. User interaction may be required.');
            } else if (err.name === 'NotSupportedError') {
              console.error(`Audio format not supported for "${sound}". Path: ${soundPath}`);
            }
          });
      }
    } catch (error) {
      console.error(`Error in play function for sound "${sound}":`, error);
    }
  }, []);

  const stop = useCallback((sound: SoundType) => {
    const audio = audioRefs.current.get(sound);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAll = useCallback(() => {
    audioRefs.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  // Preload sounds (optional but recommended)
  const preload = useCallback((sounds: SoundType[]) => {
    sounds.forEach(sound => {
      play(sound, { volume: 0 }); // Play at 0 volume to preload
      setTimeout(() => stop(sound), 100);
    });
  }, [play, stop]);

  return { play, stop, stopAll, preload };
};