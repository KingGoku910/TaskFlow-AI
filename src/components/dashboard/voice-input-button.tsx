
'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// import { voiceToText } from '@/services/voice'; // Placeholder for actual voice service

interface VoiceInputButtonProps {
  onVoiceCommand: (command: string) => void;
}

export function VoiceInputButton({ onVoiceCommand }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleVoiceInput = () => {
    // This is a placeholder. Real implementation would use browser's SpeechRecognition API
    // or integrate with a voice service.
    startTransition(async () => {
      setIsListening(true);
      toast({
        title: 'Voice Input (Stub)',
        description: 'Listening for voice command... (This is a placeholder)',
      });

      // Simulate voice recognition
      await new Promise(resolve => setTimeout(resolve, 2000));
      const recognizedCommand = "Create new task: design landing page mockups"; // Simulated command
      console.log("Simulated recognized command:", recognizedCommand);

      // Call the onVoiceCommand prop if actual command was recognized
      // onVoiceCommand(recognizedCommand);

      toast({
        title: 'Voice Command (Stub)',
        description: `Simulated command: "${recognizedCommand}". Feature not fully implemented.`,
      });
      setIsListening(false);
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleVoiceInput}
      disabled={isListening || isPending}
      aria-label="Activate Voice Input"
      className="relative"
    >
      {isPending || isListening ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
       {isListening && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      )}
    </Button>
  );
}
