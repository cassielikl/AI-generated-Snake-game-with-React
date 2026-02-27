import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'Neon Dreams (AI Gen)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Cybernetic Pulse (AI Gen)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Synthwave Cascade (AI Gen)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-pink-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(236,72,153,0.15)] w-full max-w-md mx-auto flex flex-col items-center gap-6">
      <audio 
        ref={audioRef} 
        src={TRACKS[currentTrackIndex].url} 
        onEnded={nextTrack}
        loop={false}
      />
      
      <div className="text-center w-full">
        <h3 className="text-pink-400 font-mono text-xs uppercase tracking-[0.2em] mb-2 opacity-80">Now Playing</h3>
        <div className="bg-pink-950/30 border border-pink-500/20 rounded-lg py-3 px-4 w-full overflow-hidden">
          <p className="text-white font-medium text-lg truncate drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            {TRACKS[currentTrackIndex].title}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 w-full">
        <button onClick={prevTrack} className="text-pink-500 hover:text-pink-300 hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] transition-all active:scale-95">
          <SkipBack size={28} />
        </button>
        <button 
          onClick={togglePlay} 
          className="bg-gradient-to-br from-pink-400 to-pink-600 text-black p-4 rounded-full hover:from-pink-300 hover:to-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:shadow-[0_0_25px_rgba(236,72,153,0.8)] transition-all active:scale-95"
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>
        <button onClick={nextTrack} className="text-pink-500 hover:text-pink-300 hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] transition-all active:scale-95">
          <SkipForward size={28} />
        </button>
      </div>
      
      <div className="w-full flex justify-end">
        <button onClick={toggleMute} className="text-pink-500/60 hover:text-pink-400 transition-all">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
}
