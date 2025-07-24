'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Download,
  Clock,
  Rewind,
  FastForward
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EnhancedAudioPlayerProps {
  audioSrc: string | Blob;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  showDownload?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

export function EnhancedAudioPlayer({ 
  audioSrc, 
  title = 'Audio Recording',
  className,
  autoPlay = false,
  showDownload = true,
  onTimeUpdate,
  onEnded
}: EnhancedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Convert Blob to URL if needed
  useEffect(() => {
    if (audioSrc instanceof Blob) {
      const url = URL.createObjectURL(audioSrc);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (audioSrc && audioSrc.trim()) {
      setAudioUrl(audioSrc);
    } else {
      setAudioUrl('');
    }
  }, [audioSrc]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime, audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl, onTimeUpdate, onEnded]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleProgressChange = (value: number[]) => {
    seekTo(value[0]);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = Math.max(0, audio.currentTime - 10);
    seekTo(newTime);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = Math.min(duration, audio.currentTime + 10);
    seekTo(newTime);
  };

  const rewind = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = Math.max(0, audio.currentTime - 30);
    seekTo(newTime);
  };

  const fastForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = Math.min(duration, audio.currentTime + 30);
    seekTo(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    setVolume(newVolume);
    audio.volume = newVolume;
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handlePlaybackRateChange = (rate: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newRate = parseFloat(rate);
    setPlaybackRate(newRate);
    audio.playbackRate = newRate;
  };

  const downloadAudio = () => {
    if (audioSrc instanceof Blob) {
      const url = URL.createObjectURL(audioSrc);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // For URL-based audio, open in new tab
      window.open(audioSrc, '_blank');
    }
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  };

  return (
    <div
      className={cn('enhanced-audio-player rounded-lg border p-4 bg-background', className)}
      style={{
        boxShadow: '0 0 8px 2px var(--tw-shadow-accent, #0ff)',
        overflow: 'visible',
      }}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        autoPlay={autoPlay}
        style={{ display: 'none' }}
      />
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {showDownload && (
          <Button variant="ghost" size="icon" onClick={downloadAudio} aria-label="Download audio">
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progress Bar & Time */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
        <Slider
          min={0}
          max={duration || 1}
          step={0.1}
          value={[currentTime]}
          onValueChange={handleProgressChange}
          className="flex-1"
          aria-label="Seek audio"
        />
        <span className="text-xs tabular-nums w-10">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 justify-between">
        {/* Main controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={rewind} aria-label="Rewind 30s">
            <Rewind className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={skipBackward} aria-label="Back 10s">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={togglePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} disabled={isLoading || !audioUrl}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={stop} aria-label="Stop">
            <Square className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={skipForward} aria-label="Forward 10s">
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={fastForward} aria-label="Fast Forward 30s">
            <FastForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1 w-32">
          <Button variant="ghost" size="icon" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            className="flex-1"
            aria-label="Volume"
          />
        </div>

        {/* Playback Rate */}
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
            <SelectTrigger className="w-16 h-8 px-2 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="0.75">0.75x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="1.25">1.25x</SelectItem>
              <SelectItem value="1.5">1.5x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-2 text-xs text-muted-foreground">Loading audio...</div>
      )}
    </div>
  );
}

export default EnhancedAudioPlayer;
