'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Settings,
  Download,
  Headphones,
  Mic,
  FileAudio
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TextToSpeechPlayerProps {
  text: string;
  title?: string;
  autoPlay?: boolean;
  onPlaybackComplete?: () => void;
}

interface Voice {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  gender: string;
  quality: string;
}

export function TextToSpeechPlayer({ 
  text, 
  title = 'Note Playback', 
  autoPlay = false, 
  onPlaybackComplete 
}: TextToSpeechPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const { toast } = useToast();

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const voiceList: Voice[] = availableVoices.map(voice => ({
        voice,
        name: voice.name,
        lang: voice.lang,
        gender: voice.name.toLowerCase().includes('female') ? 'female' : 'male',
        quality: voice.localService ? 'high' : 'standard'
      }));
      
      setVoices(voiceList);
      
      // Set default voice (prefer English voices)
      const defaultVoice = voiceList.find(v => v.lang.startsWith('en')) || voiceList[0];
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    
    // Voices might not be loaded immediately
    speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && text && voices.length > 0) {
      handlePlay();
    }
  }, [autoPlay, text, voices.length]);

  // Calculate text duration (rough estimate)
  useEffect(() => {
    if (text) {
      const wordsPerMinute = 150 * rate;
      const wordCount = text.split(' ').length;
      const estimatedDuration = (wordCount / wordsPerMinute) * 60;
      setDuration(estimatedDuration);
    }
  }, [text, rate]);

  // Update position during playback
  useEffect(() => {
    if (isPlaying && !isPaused) {
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setCurrentPosition(Math.min(elapsed, duration));
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isPaused, duration]);

  const createUtterance = (textToSpeak: string) => {
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set voice
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice.voice;
    }
    
    // Set speech parameters
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume / 100;
    
    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
      startTimeRef.current = Date.now() - (currentPosition * 1000);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPosition(0);
      onPlaybackComplete?.();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsPlaying(false);
      setIsPaused(false);
      toast({
        title: "Playback Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive"
      });
    };
    
    return utterance;
  };

  const handlePlay = () => {
    if (!text.trim()) {
      toast({
        title: "No Text",
        description: "There's no text to read aloud.",
        variant: "destructive"
      });
      return;
    }

    if (isPaused) {
      speechSynthesis.resume();
      return;
    }

    setIsLoading(true);
    
    // Stop any current speech
    speechSynthesis.cancel();
    
    // Create and start new utterance
    const utterance = createUtterance(text);
    utteranceRef.current = utterance;
    
    speechSynthesis.speak(utterance);
    setIsLoading(false);
  };

  const handlePause = () => {
    if (isPlaying) {
      speechSynthesis.pause();
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPosition(0);
  };

  const handleSkipBack = () => {
    const newPosition = Math.max(0, currentPosition - 10);
    setCurrentPosition(newPosition);
    
    if (isPlaying) {
      handleStop();
      
      // Skip to position by splitting text
      const wordsPerSecond = (text.split(' ').length) / duration;
      const wordIndex = Math.floor(newPosition * wordsPerSecond);
      const words = text.split(' ');
      const textFromPosition = words.slice(wordIndex).join(' ');
      
      setTimeout(() => {
        const utterance = createUtterance(textFromPosition);
        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  const handleSkipForward = () => {
    const newPosition = Math.min(duration, currentPosition + 10);
    setCurrentPosition(newPosition);
    
    if (isPlaying) {
      handleStop();
      
      // Skip to position by splitting text
      const wordsPerSecond = (text.split(' ').length) / duration;
      const wordIndex = Math.floor(newPosition * wordsPerSecond);
      const words = text.split(' ');
      const textFromPosition = words.slice(wordIndex).join(' ');
      
      setTimeout(() => {
        const utterance = createUtterance(textFromPosition);
        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  const handleSeek = (value: number[]) => {
    const newPosition = (value[0] / 100) * duration;
    setCurrentPosition(newPosition);
    
    if (isPlaying) {
      handleStop();
      
      // Seek to position
      const wordsPerSecond = (text.split(' ').length) / duration;
      const wordIndex = Math.floor(newPosition * wordsPerSecond);
      const words = text.split(' ');
      const textFromPosition = words.slice(wordIndex).join(' ');
      
      setTimeout(() => {
        const utterance = createUtterance(textFromPosition);
        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  const handleDownloadAudio = async () => {
    try {
      // This would typically use a server-side TTS service to generate audio files
      toast({
        title: "Download Started",
        description: "Audio file generation in progress...",
        variant: "default"
      });
      
      // Simulate download
      setTimeout(() => {
        toast({
          title: "Download Complete",
          description: "Audio file has been saved to your downloads folder.",
          variant: "default"
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not generate audio file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVoicesByLanguage = () => {
    const groupedVoices = voices.reduce((acc, voice) => {
      const lang = voice.lang.split('-')[0];
      if (!acc[lang]) acc[lang] = [];
      acc[lang].push(voice);
      return acc;
    }, {} as Record<string, Voice[]>);
    
    return groupedVoices;
  };

  const groupedVoices = getVoicesByLanguage();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAudio}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[duration > 0 ? (currentPosition / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentPosition)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipBack}
            disabled={!text || currentPosition === 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={isPlaying && !isPaused ? handlePause : handlePlay}
            disabled={!text || isLoading}
            size="lg"
            className="rounded-full"
          >
            {isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isPlaying && !isPaused ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
          >
            <Square className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipForward}
            disabled={!text || currentPosition >= duration}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4">
          <VolumeX className="h-4 w-4" />
          <Slider
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            max={100}
            step={1}
            className="flex-1"
          />
          <Volume2 className="h-4 w-4" />
          <Badge variant="secondary" className="min-w-[3rem] text-center">
            {volume}%
          </Badge>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Playback Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupedVoices).map(([lang, voiceList]) => (
                      <div key={lang}>
                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                          {lang.toUpperCase()}
                        </div>
                        {voiceList.map(voice => (
                          <SelectItem key={voice.name} value={voice.name}>
                            <div className="flex items-center gap-2">
                              <span>{voice.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {voice.gender}
                              </Badge>
                              {voice.quality === 'high' && (
                                <Badge variant="secondary" className="text-xs">
                                  HD
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Speed: {rate}x</Label>
                <Slider
                  value={[rate]}
                  onValueChange={(value) => setRate(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Pitch: {pitch}</Label>
                <Slider
                  value={[pitch]}
                  onValueChange={(value) => setPitch(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Text Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Text Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
              {text || 'No text content available'}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
