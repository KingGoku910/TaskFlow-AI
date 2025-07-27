'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mic, 
  MicOff, 
  Square,
  Play, 
  Pause, 
  Trash2, 
  Plus,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Wand2,
  UserPlus,
  Timer,
  Save,
  Zap
} from 'lucide-react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import type { MeetingSummary } from '@/types/meeting';
import { processMeetingTranscript, convertActionItemsToTasks } from './actions';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SavedMeetingSummaries } from '@/components/dashboard/SavedMeetingSummaries';
import { EnhancedMeetingRecorder } from '@/services/enhanced-meeting-recorder';
import { Switch } from '@/components/ui/switch';
import { EnhancedAudioPlayer } from '@/components/ui/enhanced-audio-player';

export default function MeetingSummariesPage() {
  const supabase = createClient();
  const [summaries, setSummaries] = useState<MeetingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentMeeting, setCurrentMeeting] = useState<any>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [recognitionRef, setRecognitionRef] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({ title: '', transcript: '', summary: '', participants: '' });
  const [lastProcessedIndex, setLastProcessedIndex] = useState(0);
  const [processedTranscripts, setProcessedTranscripts] = useState<Set<string>>(new Set());
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);
  const [enhancedTranscript, setEnhancedTranscript] = useState<string>('');
  const [grammarCorrections, setGrammarCorrections] = useState<string[]>([]);
  const [speakerSegments, setSpeakerSegments] = useState<Array<{speaker: string, text: string}>>([]);
  const [enhancedRecorder, setEnhancedRecorder] = useState<any>(null);
  const [audioQuality, setAudioQuality] = useState<'microphone-only' | 'system-audio' | 'mixed'>('microphone-only');
  const [grammarEnabled, setGrammarEnabled] = useState<boolean>(true);
  const transcriptRef = useRef<HTMLDivElement>(null);
  
  // Available languages for speech recognition
  const availableLanguages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'pt-PT', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
  ];
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Team members - this would come from your team management system
  const [teamMembers] = useState([
    { id: '1', name: 'John Smith', email: 'john@company.com', role: 'Developer' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Designer' },
    { id: '3', name: 'Mike Chen', email: 'mike@company.com', role: 'Product Manager' },
    { id: '4', name: 'Alice Brown', email: 'alice@company.com', role: 'QA Engineer' },
  ]);
  
  // Generated tasks from meeting
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  
  const { toast } = useToast();

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User authentication error:', userError);
        setError('Please sign in to view meeting summaries.');
        return;
      }

      if (!user) {
        console.error('No user found');
        setError('Please sign in to access meeting summaries.');
        return;
      }

      // Check if user exists in the users table and create if not
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, username')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile lookup error:', profileError);
        setError('Failed to load user profile. Please try again.');
        return;
      }

      if (!userProfile) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ 
            id: user.id, 
            email: user.email || '', 
            username: user.email?.split('@')[0] || 'user' 
          }]);
        
        if (insertError) {
          console.error('User creation error:', insertError);
          setError('Failed to create user profile. Please try again.');
          return;
        }
      }

      // Now fetch meeting summaries
      const { data: summariesData, error: summariesError } = await supabase
        .from('meeting_summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (summariesError) {
        console.error('Meeting summaries fetch error:', summariesError);
        // Use sample data if there's an error
        const sampleSummaries: MeetingSummary[] = [
          {
            id: '1',
            user_id: user.id,
            title: 'Product Planning Meeting',
            summary: 'Discussed Q1 feature roadmap and resource allocation. Key decisions made on priority features and timeline adjustments.',
            key_points: [
              'Q1 roadmap finalized with 3 major features',
              'Resource allocation approved for additional developer',
              'Timeline adjusted to accommodate holiday schedule'
            ],
            action_items: [
              'Update project timeline documentation by Friday',
              'Schedule follow-up with design team next week',
              'Prepare budget proposal for new hire'
            ],
            participants: ['John Smith', 'Sarah Johnson', 'Mike Chen'],
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '2',
            user_id: user.id,
            title: 'Sprint Retrospective',
            summary: 'Team retrospective for completed sprint. Identified areas for improvement and celebrated successes.',
            key_points: [
              'Velocity improved by 15% this sprint',
              'Communication issues with QA team identified',
              'New deployment process working well'
            ],
            action_items: [
              'Implement daily standup with QA team',
              'Create documentation for deployment process',
              'Schedule team building activity'
            ],
            participants: ['Alice Brown', 'Bob Wilson', 'Carol Davis'],
            created_at: new Date(Date.now() - 172800000).toISOString(),
          }
        ];
        setSummaries(sampleSummaries);
      } else {
        setSummaries(summariesData || []);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('General error:', err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      // Initialize enhanced recorder
      const recorder = new EnhancedMeetingRecorder({
        captureSystemAudio: audioQuality === 'system-audio' || audioQuality === 'mixed',
        enhanceGrammar: grammarEnabled,
        language: selectedLanguage,
        autoSpeakerDetection: true
      });

      // Set up callbacks
      recorder.onTranscriptUpdate = (rawTranscript: string, enhanced: string) => {
        setLiveTranscript(rawTranscript);
        setEnhancedTranscript(enhanced);
        
        // Auto-scroll to bottom
        if (transcriptRef.current) {
          transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
      };

      recorder.onError = (error: Error) => {
        console.error('Recording error:', error);
        toast({
          title: 'Recording Error',
          description: error.message,
          variant: 'destructive'
        });
        setIsRecording(false);
      };

      recorder.onStatusChange = (status: string) => {
        console.log('Status:', status);
      };

      setEnhancedRecorder(recorder);

      // Start recording
      await recorder.startRecording();
      
      setIsRecording(true);
      setLiveTranscript('');
      setEnhancedTranscript('');
      setGrammarCorrections([]);
      setSpeakerSegments([]);
      
      // Create new meeting session
      const newMeeting = {
        id: Date.now().toString(),
        title: `Meeting ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        startTime: new Date().toISOString(),
        participants: [],
        transcript: '',
        summary: '',
        actionItems: [],
        generatedTasks: []
      };
      
      setCurrentMeeting(newMeeting);
      
      // Start duration timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      toast({
        title: 'Enhanced Meeting Started',
        description: `Recording with ${audioQuality === 'system-audio' ? 'system audio capture' : audioQuality === 'mixed' ? 'mixed audio' : 'microphone only'}${grammarEnabled ? ' and live grammar correction' : ''}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not start recording';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording && !isPaused) {
      mediaRecorder.pause();
      if (recognitionRef) {
        recognitionRef.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setIsPaused(true);
      
      // Clear processed transcripts to prevent duplication issues on resume
      setProcessedTranscripts(new Set());
      setInterimText('');
      
      toast({
        title: 'Recording Paused',
        description: 'Meeting recording has been paused'
      });
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && isRecording && isPaused) {
      mediaRecorder.resume();
      if (recognitionRef) {
        recognitionRef.start();
      }
      
      // Resume timer
      const pausedDuration = recordingDuration;
      const resumeTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingDuration(pausedDuration + Math.floor((Date.now() - resumeTime) / 1000));
      }, 1000);
      
      setIsPaused(false);
      
      toast({
        title: 'Recording Resumed',
        description: 'Meeting recording has been resumed'
      });
    }
  };

  const stopRecording = async () => {
    if (enhancedRecorder && isRecording) {
      try {
        const recording = await enhancedRecorder.stopRecording();
        const enhancedSummary = await enhancedRecorder.getEnhancedTranscript();
        
        // Update states
        setIsRecording(false);
        setIsPaused(false);
        setEnhancedTranscript(enhancedSummary.enhancedTranscript);
        setSpeakerSegments(enhancedSummary.speakerSegments);
        setGrammarCorrections(enhancedSummary.corrections);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Update current meeting with enhanced transcript
        if (currentMeeting) {
          setCurrentMeeting((prev: any) => ({
            ...prev,
            transcript: enhancedSummary.enhancedTranscript,
            endTime: new Date().toISOString(),
            duration: recordingDuration,
            speakerSegments: enhancedSummary.speakerSegments,
            corrections: enhancedSummary.corrections,
            confidence: enhancedSummary.confidence
          }));
        }
        
        toast({
          title: 'Meeting Ended',
          description: `Recording stopped. Enhanced transcript generated with ${enhancedSummary.confidence * 100}% confidence.`,
        });
      } catch (error) {
        console.error('Error stopping recording:', error);
        toast({
          title: 'Error',
          description: 'Failed to stop recording properly',
          variant: 'destructive'
        });
      }
    }
  };

  const playAudio = () => {
    // This function is now handled by EnhancedAudioPlayer component
    // Keep for backward compatibility but functionality moved to component
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const processWithAI = async () => {
    if (!formData.transcript.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a transcript to process',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      const participants = formData.participants
        ? formData.participants.split(',').map((p: string) => p.trim()).filter(Boolean)
        : [];

      const aiSummary = await processMeetingTranscript(
        formData.transcript,
        formData.title || undefined,
        participants.length > 0 ? participants : undefined
      );

      setFormData((prev: { title: string; transcript: string; summary: string; participants: string; }) => ({
        ...prev,
        title: aiSummary.title,
        summary: aiSummary.summary,
        participants: aiSummary.participants?.join(', ') || '',
      }));

      toast({
        title: 'AI Processing Complete',
        description: 'Meeting summary generated successfully'
      });
    } catch (err) {
      toast({
        title: 'AI Processing Failed',
        description: 'Could not generate summary. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const createTasksFromActionItems = async (actionItems: string[]) => {
    try {
      const tasks = await convertActionItemsToTasks(actionItems, formData.summary);
      
      // Here you would integrate with your task creation system
      toast({
        title: 'Tasks Created',
        description: `Generated ${tasks.length} tasks from action items`
      });
      
      // TODO: Actually create tasks in the system
      console.log('Generated tasks:', tasks);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create tasks from action items',
        variant: 'destructive'
      });
    }
  };

  const saveSummary = async () => {
    try {
      // TODO: Implement actual save to database
      const newSummary: MeetingSummary = {
        id: Date.now().toString(),
        user_id: 'current-user',
        title: formData.title,
        summary: formData.summary,
        key_points: [], // Extract from summary
        action_items: [], // Extract from summary
        participants: formData.participants.split(',').map((p: string) => p.trim()).filter(Boolean),
        created_at: new Date().toISOString(),
      };

      setSummaries((prev: MeetingSummary[]) => [newSummary, ...prev]);
      setShowCreateForm(false);
      setFormData({ title: '', transcript: '', summary: '', participants: '' });
      setAudioBlob(null);
      setRecordingDuration(0);

      toast({
        title: 'Success',
        description: 'Meeting summary saved successfully'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save meeting summary',
        variant: 'destructive'
      });
    }
  };

  const autoSummarize = async () => {
    if (!currentMeeting || !liveTranscript.trim()) {
      toast({
        title: 'Error',
        description: 'No meeting transcript available for summarization',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      const aiSummary = await processMeetingTranscript(
        liveTranscript,
        currentMeeting.title,
        currentMeeting.participants
      );

      setCurrentMeeting((prev: any) => ({
        ...prev,
        summary: aiSummary.summary,
        actionItems: aiSummary.action_items || [],
        keyPoints: aiSummary.key_points || []
      }));

      toast({
        title: 'Auto-Summarization Complete',
        description: 'AI has generated meeting summary and action items',
      });
    } catch (err) {
      toast({
        title: 'Summarization Failed',
        description: 'Could not generate summary. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTasksFromMeeting = async () => {
    if (!currentMeeting || !currentMeeting.actionItems?.length) {
      toast({
        title: 'Error',
        description: 'No action items found to convert to tasks',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsGeneratingTasks(true);
      
      const tasks = await convertActionItemsToTasks(
        currentMeeting.actionItems,
        currentMeeting.summary
      );
      
      // Add team assignment capability to each task
      const tasksWithAssignment = tasks.map(task => ({
        ...task,
        id: Date.now().toString() + Math.random(),
        assignee: null,
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: 'todo',
        meetingId: currentMeeting.id
      }));
      
      setGeneratedTasks(tasksWithAssignment);
      
      toast({
        title: 'Tasks Generated',
        description: `Generated ${tasks.length} tasks from meeting action items`,
      });
    } catch (err) {
      toast({
        title: 'Task Generation Failed',
        description: 'Could not generate tasks from action items',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  const assignTaskToMember = (taskId: string, memberId: string) => {
    setGeneratedTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, assignee: teamMembers.find(m => m.id === memberId) }
        : task
    ));
    
    const member = teamMembers.find(m => m.id === memberId);
    toast({
      title: 'Task Assigned',
      description: `Task assigned to ${member?.name}`,
    });
  };

  const saveTasksToBoard = async () => {
    try {
      // Here you would integrate with your task creation system
      // For now, we'll just simulate saving
      
      const tasksToSave = generatedTasks.filter(task => task.assignee);
      
      if (tasksToSave.length === 0) {
        toast({
          title: 'No Tasks to Save',
          description: 'Please assign tasks to team members before saving',
          variant: 'destructive'
        });
        return;
      }
      
      // TODO: Integrate with your task creation API
      console.log('Saving tasks to board:', tasksToSave);
      
      toast({
        title: 'Tasks Saved',
        description: `${tasksToSave.length} tasks added to the task board`,
      });
      
      // Clear generated tasks after saving
      setGeneratedTasks([]);
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: 'Could not save tasks to board',
        variant: 'destructive'
      });
    }
  };

  const saveMeetingSummary = async () => {
    if (!currentMeeting) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'Please log in to save meeting summaries',
          variant: 'destructive'
        });
        return;
      }

      let audioUrl = null;
      let duration = recordingDuration;

      // Upload audio blob to Supabase Storage if available
      if (audioBlob) {
        const fileName = `meeting-audio-${Date.now()}.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('meeting-audio')
          .upload(`${user.id}/${fileName}`, audioBlob, {
            contentType: 'audio/webm',
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Audio upload error:', uploadError);
          toast({
            title: 'Warning',
            description: 'Meeting saved but audio upload failed',
            variant: 'default'
          });
        } else {
          // Get public URL for the uploaded audio
          const { data: urlData } = supabase.storage
            .from('meeting-audio')
            .getPublicUrl(uploadData.path);
          audioUrl = urlData.publicUrl;
        }
      }

      const meetingSummaryData = {
        user_id: user.id,
        title: currentMeeting.title,
        summary: currentMeeting.summary || '',
        key_points: currentMeeting.keyPoints || [],
        action_items: currentMeeting.actionItems || [],
        participants: currentMeeting.participants || [],
        transcript: liveTranscript,
        audio_url: audioUrl,
        duration: duration,
        language: selectedLanguage,
        meeting_date: currentMeeting.startTime,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to database
      const { data, error } = await supabase
        .from('meeting_summaries')
        .insert([meetingSummaryData])
        .select('*')
        .single();

      if (error) {
        console.error('Database save error:', error);
        toast({
          title: 'Save Failed',
          description: 'Could not save meeting summary to database',
          variant: 'destructive'
        });
        return;
      }

      // Update local state
      setSummaries(prev => [data, ...prev]);
      
      // Reset meeting state
      setCurrentMeeting(null);
      setLiveTranscript('');
      setAudioBlob(null);
      setRecordingDuration(0);
      setGeneratedTasks([]);

      toast({
        title: 'Meeting Saved',
        description: 'Meeting summary and audio have been saved successfully',
      });
    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: 'Save Failed',
        description: 'Could not save meeting summary',
        variant: 'destructive'
      });
    }
  };

  const handleCreateTasksFromMeetingSummary = async (actionItems: string[], meetingTitle: string) => {
    try {
      const { createTaskFromNotesAction } = await import('../note-generator/actions');
      const taskContent = actionItems.join('\n- ');
      const result = await createTaskFromNotesAction(taskContent, `Action Items from: ${meetingTitle}`, false);
      
      if (result.success) {
        toast({
          title: 'Task Created',
          description: `Single task created from meeting: ${meetingTitle}. You can decompose it into smaller tasks on the Tasks page.`,
        });
      } else {
        throw new Error(result.error || 'Failed to create task from meeting');
      }
    } catch (error) {
      console.error('Task creation error:', error);
      toast({
        title: 'Task Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create task from meeting.',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 h-full overflow-y-auto w-full">
        <Card className="shadow-lg w-full">
          <CardHeader>
            <DashboardPageHeader
              title="Meeting Summaries"
              description="Loading meeting summaries..."
              icon={<FileText />}
            />
          </CardHeader>
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 h-full overflow-y-auto w-full pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Meeting Manager */}
          <div className="space-y-8">
            <Card className="shadow-lg w-full">
              <CardHeader>
                <DashboardPageHeader
                  title="Meeting Manager"
                  description="Record meetings with live transcription, AI summarization, and automatic task generation."
                  icon={<FileText />}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="flex items-center text-lg font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-md border border-red-300 dark:border-red-700">
                    <AlertTriangle className="mr-3 h-8 w-8" />
                    <p>Error: {error}</p>
                  </div>
                )}

                {/* Live Meeting Section */}
                {!currentMeeting ? (
                  <div className="space-y-6">
                    {/* Enhanced Recording Configuration */}
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Enhanced Recording Settings
                        </h4>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Audio Capture Mode */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Audio Capture Mode</Label>
                          <Select value={audioQuality} onValueChange={(value: 'microphone-only' | 'system-audio' | 'mixed') => setAudioQuality(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="microphone-only">
                                <div className="flex items-center gap-2">
                                  <Mic className="h-3 w-3" />
                                  <span>Microphone Only</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="system-audio">
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3" />
                                  <span>System Audio (Calls/Meetings)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="mixed">
                                <div className="flex items-center gap-2">
                                  <Zap className="h-3 w-3" />
                                  <span>Mixed Audio (Microphone + System)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            {audioQuality === 'microphone-only' && 'Records only your voice through microphone'}
                            {audioQuality === 'system-audio' && 'Captures system audio from calls/video meetings (requires screen sharing permission)'}
                            {audioQuality === 'mixed' && 'Records both your microphone and system audio for complete meeting capture'}
                          </p>
                        </div>

                        {/* Grammar Enhancement */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Live Grammar Correction</Label>
                            <p className="text-xs text-muted-foreground">Auto-correct grammar and punctuation in real-time</p>
                          </div>
                          <Switch 
                            checked={grammarEnabled} 
                            onCheckedChange={setGrammarEnabled}
                          />
                        </div>

                        {/* Language Selection */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Speech Recognition Language</Label>
                          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableLanguages.map((language) => (
                                <SelectItem key={language.code} value={language.code}>
                                  <div className="flex items-center gap-2">
                                    <span>{language.flag}</span>
                                    <span>{language.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Start Recording Button */}
                    <div className="flex gap-4">
                      <Button 
                        onClick={startRecording}
                        size="lg"
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                      >
                        <Mic className="h-5 w-5" />
                        Start Enhanced Recording
                      </Button>
                    </div>

                    {/* Feature Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">System Audio Capture</p>
                          <p className="text-green-600 dark:text-green-300">Records both sides of video calls</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-200">Live Grammar Correction</p>
                          <p className="text-blue-600 dark:text-blue-300">Real-time punctuation and grammar fixes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Card className="border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="font-semibold">LIVE MEETING</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Timer className="h-4 w-4" />
                            {formatDuration(recordingDuration)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {availableLanguages.find(lang => lang.code === selectedLanguage)?.flag}
                            <span>{availableLanguages.find(lang => lang.code === selectedLanguage)?.name}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isRecording && !isPaused && (
                            <Button size="sm" variant="outline" onClick={pauseRecording}>
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {isRecording && isPaused && (
                            <Button size="sm" variant="outline" onClick={resumeRecording}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={stopRecording}>
                            <Square className="h-4 w-4" />
                            End Meeting
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Input
                          placeholder="Meeting Title"
                          value={currentMeeting?.title || ''}
                          onChange={(e) => setCurrentMeeting((prev: any) => ({ ...prev, title: e.target.value }))}
                          className="text-lg font-semibold"
                        />
                      </div>
                      
                      {/* Live Transcript */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Live Transcript</Label>
                          <div className="flex items-center gap-2">
                            {isRecording && !isPaused && (
                              <div className="flex items-center gap-2 text-xs text-blue-600">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>Listening...</span>
                              </div>
                            )}
                            {grammarEnabled && grammarCorrections.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {grammarCorrections.length} corrections
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                              className="text-xs"
                            >
                              {isEditingTranscript ? 'View' : 'Edit'}
                            </Button>
                            {isEditingTranscript && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setLiveTranscript(enhancedTranscript || liveTranscript);
                                  setIsEditingTranscript(false);
                                  toast({
                                    title: 'Transcript Saved',
                                    description: 'Your edits have been saved to the transcript.',
                                  });
                                }}
                                className="text-xs"
                              >
                                Save
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="relative">
                          {isEditingTranscript ? (
                            <Textarea
                              value={enhancedTranscript || liveTranscript}
                              onChange={(e) => setEnhancedTranscript(e.target.value)}
                              placeholder="Edit transcript here..."
                              rows={6}
                              className="text-sm"
                            />
                          ) : (
                            <div className="space-y-4">
                              {/* Enhanced Transcript View */}
                              <div 
                                ref={transcriptRef}
                                className="min-h-[150px] max-h-[200px] overflow-y-auto border border-gray-300 rounded-md p-3 bg-white dark:bg-gray-800"
                              >
                                {/* Show enhanced transcript if available */}
                                {enhancedTranscript ? (
                                  <div className="space-y-2">
                                    <div className="text-xs text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      Enhanced with grammar correction
                                    </div>
                                    <span className="text-gray-900 dark:text-gray-100">
                                      {enhancedTranscript}
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    {/* Regular transcript */}
                                    <span className="text-gray-900 dark:text-gray-100">
                                      {liveTranscript}
                                    </span>
                                    {/* Interim transcript (being processed) */}
                                    {interimText && !isEditingTranscript && (
                                      <span className="text-gray-500 dark:text-gray-400 italic">
                                        {interimText}
                                      </span>
                                    )}
                                    {/* Cursor indicator */}
                                    {isRecording && !isPaused && !isEditingTranscript && (
                                      <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-1"></span>
                                    )}
                                  </>
                                )}
                                {/* Placeholder when empty */}
                                {!liveTranscript && !enhancedTranscript && !interimText && (
                                  <span className="text-gray-400 dark:text-gray-500">
                                    Live transcript will appear here as you speak...
                                  </span>
                                )}
                              </div>

                              {/* Speaker Segments Preview */}
                              {speakerSegments.length > 0 && (
                                <div className="border border-dashed border-gray-300 rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Speaker Detection ({speakerSegments.length} segments)
                                  </div>
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {speakerSegments.slice(-3).map((segment, index) => (
                                      <div key={index} className="text-xs">
                                        <span className="font-medium text-purple-600 dark:text-purple-400">
                                          {segment.speaker}:
                                        </span>
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                                          {segment.text.substring(0, 100)}
                                          {segment.text.length > 100 ? '...' : ''}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Audio Quality Indicator */}
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            {audioQuality === 'system-audio' && (
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                                <Users className="h-3 w-3 mr-1" />
                                System Audio
                              </Badge>
                            )}
                            {audioQuality === 'mixed' && (
                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                                <Zap className="h-3 w-3 mr-1" />
                                Mixed Audio
                              </Badge>
                            )}
                            {grammarEnabled && (
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Grammar+
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* AI Tools */}
                      {!isRecording && currentMeeting && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={autoSummarize}
                                disabled={isProcessing || !liveTranscript.trim()}
                                size="sm"
                                className="w-10 h-10 rounded-full p-0"
                              >
                                {isProcessing ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                ) : (
                                  <Sparkles className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Auto-Summarize Meeting</p>
                              <p className="text-xs text-muted-foreground">Generate AI summary and action items</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={generateTasksFromMeeting}
                                disabled={isGeneratingTasks || !currentMeeting?.actionItems?.length}
                                size="sm"
                                className="w-10 h-10 rounded-full p-0"
                                variant="outline"
                              >
                                {isGeneratingTasks ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                ) : (
                                  <Zap className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Generate Tasks</p>
                              <p className="text-xs text-muted-foreground">Create tasks from action items</p>
                            </TooltipContent>
                          </Tooltip>

                          <Button
                            onClick={saveMeetingSummary}
                            disabled={!currentMeeting?.summary}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save Meeting
                          </Button>
                        </div>
                      )}

                      {/* Meeting Summary Preview */}
                      {currentMeeting?.summary && (
                        <div className="space-y-3 pt-4 border-t">
                          <h4 className="font-semibold">AI Generated Summary</h4>
                          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            {currentMeeting.summary}
                          </div>
                          
                          {currentMeeting.actionItems?.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Action Items</h5>
                              <ul className="text-sm space-y-1">
                                {currentMeeting.actionItems.map((item: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Audio Playback Section */}
                      {audioBlob && !isRecording && (
                        <div className="space-y-3 pt-4 border-t">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Meeting Recording
                          </h4>
                          <EnhancedAudioPlayer
                            audioSrc={audioBlob}
                            title={currentMeeting?.title || 'Meeting Recording'}
                            showDownload={true}
                            onTimeUpdate={(currentTime, duration) => {
                              // You can sync with transcript timestamps here
                              // For example, highlight transcript sections based on time
                              console.log(`Playback: ${Math.floor(currentTime)}s / ${Math.floor(duration)}s`);
                            }}
                            onEnded={() => {
                              setIsPlaying(false);
                              console.log('Meeting recording playback ended');
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Use the controls above to play, pause, skip, and adjust playback speed. 
                            Click anywhere on the timeline to jump to that point in the recording.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Generated Tasks Section */}
                {generatedTasks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Generated Tasks</h3>
                        <Button onClick={saveTasksToBoard} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Task Board
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {generatedTasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={task.assignee?.id || ''}
                                onValueChange={(value) => assignTaskToMember(task.id, value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Assign to..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {teamMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      <div className="flex items-center gap-2">
                                        <UserPlus className="h-3 w-3" />
                                        {member.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {task.assignee && (
                                <Badge variant="secondary">{task.assignee.name}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Saved Meeting Summaries */}
          <div className="space-y-8">
            <SavedMeetingSummaries onCreateTask={handleCreateTasksFromMeetingSummary} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
