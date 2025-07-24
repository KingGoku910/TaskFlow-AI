/**
 * Enhanced meeting recorder with system audio capture and real-time processing
 */

import { enhanceTranscript, correctGrammarLive } from '@/ai/flows/transcript-enhancement-client';

export interface MeetingRecordingConfig {
  captureSystemAudio: boolean;
  enhanceGrammar: boolean;
  language: string;
  autoSpeakerDetection: boolean;
}

export interface MeetingRecording {
  id: string;
  audio: Blob | string;
  timestamp: Date;
  duration: number;
  config: MeetingRecordingConfig;
}

export interface EnhancedMeetingSummary {
  summary: string;
  tasks: string[];
  enhancedTranscript: string;
  speakerSegments: Array<{
    speaker: string;
    text: string;
    timestamp?: string;
  }>;
  confidence: number;
  corrections: string[];
}

export class EnhancedMeetingRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recognition: any = null;
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private systemStream: MediaStream | null = null;
  private combinedStream: MediaStream | null = null;
  private isRecording = false;
  private transcript = '';
  private config: MeetingRecordingConfig;
  
  // Callbacks
  public onTranscriptUpdate?: (transcript: string, enhanced: string) => void;
  public onError?: (error: Error) => void;
  public onStatusChange?: (status: string) => void;

  constructor(config: MeetingRecordingConfig) {
    this.config = config;
  }

  /**
   * Start recording with enhanced audio capture
   */
  async startRecording(): Promise<void> {
    try {
      this.onStatusChange?.(this.config.captureSystemAudio ? 'Initializing system audio capture...' : 'Initializing microphone...');
      
      // Get microphone stream
      this.micStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 2
        } 
      });

      let finalStream = this.micStream;

      // Attempt to capture system audio (for calls/meetings)
      if (this.config.captureSystemAudio) {
        try {
          // Try to capture system audio using getDisplayMedia with audio
          this.systemStream = await navigator.mediaDevices.getDisplayMedia({
            video: false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } as any
          });

          // Combine microphone and system audio
          if (this.systemStream) {
            finalStream = await this.combineAudioStreams(this.micStream, this.systemStream);
            this.onStatusChange?.('✅ System audio + microphone captured');
          }
        } catch (sysError) {
          console.warn('System audio capture failed, using microphone only:', sysError);
          this.onStatusChange?.('⚠️ Using microphone only (system audio unavailable)');
        }
      }

      this.combinedStream = finalStream;

      // Set up MediaRecorder for audio recording
      const chunks: BlobPart[] = [];
      this.mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // Handle the audio blob if needed
      };

      // Start audio recording
      this.mediaRecorder.start();

      // Set up speech recognition for live transcription
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        await this.setupSpeechRecognition();
      } else {
        this.onError?.(new Error('Speech recognition not supported in this browser'));
      }

      this.isRecording = true;
      this.onStatusChange?.('🎙️ Recording active');
    } catch (error) {
      this.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Combine microphone and system audio streams
   */
  private async combineAudioStreams(micStream: MediaStream, systemStream: MediaStream): Promise<MediaStream> {
    try {
      this.audioContext = new AudioContext();
      
      // Create audio sources
      const micSource = this.audioContext.createMediaStreamSource(micStream);
      const systemSource = this.audioContext.createMediaStreamSource(systemStream);
      
      // Create a gain node to control volume levels
      const micGain = this.audioContext.createGain();
      const systemGain = this.audioContext.createGain();
      
      // Adjust levels (you might want to make these configurable)
      micGain.gain.value = 1.0; // Full microphone volume
      systemGain.gain.value = 0.8; // Slightly lower system volume
      
      // Create destination for the combined audio
      const destination = this.audioContext.createMediaStreamDestination();
      
      // Connect sources through gain controls to destination
      micSource.connect(micGain);
      systemSource.connect(systemGain);
      micGain.connect(destination);
      systemGain.connect(destination);
      
      return destination.stream;
    } catch (error) {
      console.error('Failed to combine audio streams:', error);
      // Fallback to microphone only
      return micStream;
    }
  }

  /**
   * Setup speech recognition with enhanced processing
   */
  private async setupSpeechRecognition(): Promise<void> {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = 1;
    
    let lastFinalTranscript = '';
    let grammarCorrectionQueue: string[] = [];
    
    this.recognition.onresult = async (event: any) => {
      let currentFinalText = '';
      let currentInterimText = '';
      
      // Process speech recognition results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          currentFinalText += transcript;
        } else {
          currentInterimText += transcript;
        }
      }
      
      // Update transcript
      if (currentFinalText) {
        lastFinalTranscript += currentFinalText;
        this.transcript = lastFinalTranscript;
        
        // Apply grammar correction if enabled
        if (this.config.enhanceGrammar) {
          try {
            const corrected = await correctGrammarLive(currentFinalText, this.config.language);
            const enhancedTranscript = lastFinalTranscript.slice(0, -currentFinalText.length) + corrected.corrected_text;
            this.onTranscriptUpdate?.(lastFinalTranscript, enhancedTranscript);
          } catch (error) {
            console.warn('Grammar correction failed, using original text:', error);
            this.onTranscriptUpdate?.(lastFinalTranscript, lastFinalTranscript);
          }
        } else {
          this.onTranscriptUpdate?.(lastFinalTranscript, lastFinalTranscript);
        }
      } else if (currentInterimText) {
        // Show interim results
        const fullTranscript = lastFinalTranscript + currentInterimText;
        this.onTranscriptUpdate?.(fullTranscript, fullTranscript);
      }
    };
    
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        this.onError?.(new Error('Microphone access denied. Please allow microphone access and try again.'));
      } else {
        this.onError?.(new Error(`Speech recognition error: ${event.error}`));
      }
    };
    
    this.recognition.onend = () => {
      // Auto-restart if still recording
      if (this.isRecording) {
        setTimeout(() => {
          if (this.isRecording) {
            try {
              this.recognition?.start();
            } catch (error) {
              console.error('Failed to restart speech recognition:', error);
            }
          }
        }, 100);
      }
    };
    
    this.recognition.start();
  }

  /**
   * Stop recording and process final transcript
   */
  async stopRecording(): Promise<MeetingRecording> {
    try {
      this.isRecording = false;
      
      // Stop media recorder
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      
      // Stop speech recognition
      if (this.recognition) {
        this.recognition.stop();
      }
      
      // Stop all audio streams
      this.micStream?.getTracks().forEach(track => track.stop());
      this.systemStream?.getTracks().forEach(track => track.stop());
      this.combinedStream?.getTracks().forEach(track => track.stop());
      
      // Close audio context
      if (this.audioContext) {
        await this.audioContext.close();
      }
      
      this.onStatusChange?.('✅ Recording stopped');
      
      return {
        id: `rec-${Date.now()}`,
        audio: new Blob(['audio data'], { type: 'audio/webm' }),
        timestamp: new Date(),
        duration: 0, // You'd calculate this from start time
        config: this.config
      };
    } catch (error) {
      this.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Get enhanced transcript with speaker detection and grammar correction
   */
  async getEnhancedTranscript(): Promise<EnhancedMeetingSummary> {
    if (!this.transcript) {
      throw new Error('No transcript available');
    }

    try {
      const enhancement = await enhanceTranscript(this.transcript, this.config.language);
      
      return {
        summary: enhancement.enhanced_transcript,
        tasks: [], // You'd extract these from action items
        enhancedTranscript: enhancement.enhanced_transcript,
        speakerSegments: enhancement.speaker_segments,
        confidence: enhancement.confidence_score,
        corrections: enhancement.corrections_made
      };
    } catch (error) {
      console.warn('Failed to enhance transcript, using original:', error);
      
      // Fallback to basic processing
      return {
        summary: this.transcript,
        tasks: [],
        enhancedTranscript: this.transcript,
        speakerSegments: [
          {
            speaker: 'Speaker 1',
            text: this.transcript
          }
        ],
        confidence: 0.5,
        corrections: ['Failed to enhance - using original transcript']
      };
    }
  }

  /**
   * Get current transcript
   */
  getCurrentTranscript(): string {
    return this.transcript;
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}

// Legacy functions for backward compatibility
export async function recordMeeting(): Promise<MeetingRecording> {
  console.warn("Using legacy recordMeeting. Consider using EnhancedMeetingRecorder for better functionality.");
  return {
    id: `rec-${Date.now()}`,
    audio: new Blob(['simulated audio data'], { type: 'audio/webm' }),
    timestamp: new Date(),
    duration: 0,
    config: {
      captureSystemAudio: false,
      enhanceGrammar: false,
      language: 'en-US',
      autoSpeakerDetection: false
    }
  };
}

export async function transcribeMeeting(recording: MeetingRecording): Promise<EnhancedMeetingSummary> {
  console.warn("Using legacy transcribeMeeting. Consider using EnhancedMeetingRecorder for better functionality.");
  return {
    summary: 'This is a simulated meeting summary. Key points discussed were placeholders.',
    tasks: ['Simulated Task 1: Follow up', 'Simulated Task 2: Review document'],
    enhancedTranscript: 'Enhanced transcript would appear here.',
    speakerSegments: [
      { speaker: 'Speaker 1', text: 'This is simulated speaker 1 content.' },
      { speaker: 'Speaker 2', text: 'This is simulated speaker 2 content.' }
    ],
    confidence: 0.85,
    corrections: ['Grammar correction 1', 'Grammar correction 2']
  };
}
