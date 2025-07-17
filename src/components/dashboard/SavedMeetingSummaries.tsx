'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Search, 
  Calendar, 
  Users, 
  Clock,
  Trash2, 
  Eye, 
  CheckSquare,
  Timer,
  Play,
  CheckCircle,
  Volume2,
  Pause,
  VolumeX,
  RefreshCw,
  Download,
  List,
  LayoutGrid
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { MeetingSummary } from '@/types/meeting';

interface SavedMeetingSummariesProps {
  onCreateTask?: (actionItems: string[], meetingTitle: string) => void;
  onMeetingCreated?: () => void; // Add callback for when meetings are created
}

export function SavedMeetingSummaries({ onCreateTask, onMeetingCreated }: SavedMeetingSummariesProps) {
  const supabase = createClient();
  const [summaries, setSummaries] = useState<MeetingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSummary, setSelectedSummary] = useState<MeetingSummary | null>(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const { toast } = useToast();

  // Cleanup audio elements on unmount
  useEffect(() => {
    return () => {
      Object.values(audioElements).forEach(audio => {
        audio.pause();
        audio.removeEventListener('error', handleAudioError);
        audio.src = '';
      });
    };
  }, [audioElements]);

  const handleAudioError = (summaryId: string) => {
    // Only show error if component is still mounted and audio was actually playing
    if (playingAudio === summaryId) {
      toast({
        title: 'Audio Error',
        description: 'Could not play the audio recording.',
        variant: 'destructive'
      });
      setPlayingAudio(null);
    }
  };

  const fetchSummaries = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
        toast({
          title: "Refreshing meetings...",
          description: "Fetching latest meeting summaries.",
        });
      } else {
        setLoading(true);
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: 'Authentication Error',
          description: 'Please sign in to view your meeting summaries.',
          variant: 'destructive'
        });
        return;
      }

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
            title: 'Q1 Planning Session',
            summary: 'Comprehensive planning session for Q1 objectives, resource allocation, and milestone definitions. Team aligned on strategic priorities and deliverables.',
            key_points: [
              'Q1 revenue target set at $2.5M',
              'New product launch scheduled for March',
              'Team expansion approved for engineering and sales',
              'Key partnerships identified for market expansion'
            ],
            action_items: [
              'Finalize Q1 budget allocation by end of week',
              'Schedule kick-off meetings with all department heads',
              'Prepare detailed project timelines for new product launch',
              'Initiate hiring process for 3 new engineering positions'
            ],
            participants: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Wang'],
            meeting_date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            duration: 3600, // 1 hour
            created_at: new Date(Date.now() - 259200000).toISOString(),
            updated_at: new Date(Date.now() - 259200000).toISOString()
          },
          {
            id: '2',
            user_id: user.id,
            title: 'Sprint Review & Retrospective',
            summary: 'End-of-sprint review covering completed features, performance metrics, and team feedback. Identified improvements for next sprint.',
            key_points: [
              'Completed 85% of planned story points',
              'User authentication system fully deployed',
              'API performance improved by 30%',
              'Team velocity trending upward'
            ],
            action_items: [
              'Address remaining UI/UX feedback from user testing',
              'Optimize database queries for better performance',
              'Update documentation for new API endpoints',
              'Plan capacity for upcoming feature requests'
            ],
            participants: ['Alex Brown', 'David Kim', 'Emma Wilson', 'Tom Garcia'],
            meeting_date: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
            duration: 2700, // 45 minutes
            created_at: new Date(Date.now() - 604800000).toISOString(),
            updated_at: new Date(Date.now() - 604800000).toISOString()
          },
          {
            id: '3',
            user_id: user.id,
            title: 'Client Strategy Meeting',
            summary: 'Strategic discussion on client relationship management, upcoming renewals, and expansion opportunities.',
            key_points: [
              'Client satisfaction scores at 4.2/5',
              '3 major renewals due in next quarter',
              'Expansion opportunities identified with 2 key clients',
              'Support ticket resolution time improved by 40%'
            ],
            action_items: [
              'Prepare renewal proposals for key clients',
              'Schedule expansion discussions with target accounts',
              'Implement new customer success tracking system',
              'Develop client testimonial collection process'
            ],
            participants: ['Rachel Green', 'Kevin Park', 'Maria Rodriguez'],
            meeting_date: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
            duration: 5400, // 1.5 hours
            created_at: new Date(Date.now() - 1209600000).toISOString(),
            updated_at: new Date(Date.now() - 1209600000).toISOString()
          }
        ];
        setSummaries(sampleSummaries);
      } else {
        setSummaries(summariesData || []);
      }
    } catch (err) {
      console.error('Error fetching meeting summaries:', err);
      toast({
        title: 'Error',
        description: 'Failed to load meeting summaries.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      if (showRefreshToast) {
        toast({
          title: "Meetings refreshed",
          description: "Your meeting summaries are now up to date.",
        });
      }
    }
  };

  const deleteSummary = async (summaryId: string) => {
    try {
      const { error } = await supabase
        .from('meeting_summaries')
        .delete()
        .eq('id', summaryId);

      if (error) {
        throw error;
      }

      setSummaries(prev => prev.filter(summary => summary.id !== summaryId));
      toast({
        title: 'Summary Deleted',
        description: 'The meeting summary has been removed.',
      });
    } catch (err) {
      console.error('Error deleting summary:', err);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the summary. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const exportSummary = (summary: MeetingSummary, format: 'md' | 'rtf' | 'txt' = 'txt') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    const participantsList = summary.participants ? summary.participants.join(', ') : 'No participants listed';
    const keyPointsList = summary.key_points ? summary.key_points.join('\n- ') : 'No key points listed';
    const actionItemsList = summary.action_items ? summary.action_items.join('\n- ') : 'No action items listed';
    const meetingDate = summary.meeting_date ? new Date(summary.meeting_date).toLocaleDateString() : new Date(summary.created_at).toLocaleDateString();
    const duration = summary.duration ? formatDuration(summary.duration) : 'Duration not specified';

    switch (format) {
      case 'md':
        content = `# ${summary.title}

**Date:** ${meetingDate}
**Duration:** ${duration}
**Participants:** ${participantsList}
${summary.language ? `**Language:** ${summary.language}` : ''}

## Summary
${summary.summary}

## Key Points
- ${keyPointsList}

## Action Items
- ${actionItemsList}

---
*Generated on ${new Date().toLocaleDateString()}*`;
        filename = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.md`;
        mimeType = 'text/markdown';
        break;
      case 'rtf':
        content = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 {\\b ${summary.title}}\\par\\par Date: ${meetingDate}\\par Duration: ${duration}\\par Participants: ${participantsList}\\par${summary.language ? `\\par Language: ${summary.language}` : ''}\\par\\par {\\b Summary}\\par ${summary.summary.replace(/\n/g, '\\par ')}\\par\\par {\\b Key Points}\\par - ${keyPointsList.replace(/\n/g, '\\par ')}\\par\\par {\\b Action Items}\\par - ${actionItemsList.replace(/\n/g, '\\par ')}\\par\\par Generated on ${new Date().toLocaleDateString()}}`;
        filename = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.rtf`;
        mimeType = 'application/rtf';
        break;
      default:
        content = `${summary.title}

Date: ${meetingDate}
Duration: ${duration}
Participants: ${participantsList}
${summary.language ? `Language: ${summary.language}` : ''}

SUMMARY
${summary.summary}

KEY POINTS
- ${keyPointsList}

ACTION ITEMS
- ${actionItemsList}

---
Generated on ${new Date().toLocaleDateString()}`;
        filename = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.txt`;
        mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Summary Exported',
      description: `${summary.title} exported as ${format.toUpperCase()}`,
    });
  };

  const handleCreateTasksFromSummary = (summary: MeetingSummary) => {
    if (onCreateTask && summary.action_items) {
      onCreateTask(summary.action_items, summary.title);
    }
    toast({
      title: 'Tasks Created',
      description: `Tasks created from meeting: ${summary.title}`,
    });
  };

  const toggleAudioPlayback = (summaryId: string, audioUrl: string) => {
    if (playingAudio === summaryId) {
      // Stop current audio
      const audio = audioElements[summaryId];
      if (audio) {
        audio.pause();
      }
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      if (playingAudio && audioElements[playingAudio]) {
        audioElements[playingAudio].pause();
      }

      // Start new audio
      let audio = audioElements[summaryId];
      if (!audio) {
        audio = new Audio(audioUrl);
        audio.onended = () => setPlayingAudio(null);
        audio.onerror = () => handleAudioError(summaryId);
        setAudioElements(prev => ({ ...prev, [summaryId]: audio }));
      }

      audio.play().catch(err => {
        console.error('Audio playback error:', err);
        // Only show error if we're still trying to play this specific audio
        if (playingAudio === summaryId) {
          toast({
            title: 'Audio Error',
            description: 'Could not play the audio recording.',
            variant: 'destructive'
          });
        }
      });
      setPlayingAudio(summaryId);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const generateThumbnail = (content: string) => {
    // Extract first few lines and create a preview
    const lines = content.split('\n').slice(0, 3);
    return lines.join('\n').substring(0, 150) + (content.length > 150 ? '...' : '');
  };

  const renderSummaryActions = (summary: MeetingSummary) => (
    <div className="flex items-center gap-2">
      {/* Audio Player Button */}
      {summary.audio_url && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleAudioPlayback(summary.id, summary.audio_url!)}
          className="text-blue-600 hover:text-blue-800 h-8 w-8 p-0"
        >
          {playingAudio === summary.id ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      )}
      
      <Dialog open={showSummaryDialog && selectedSummary?.id === summary.id} onOpenChange={setShowSummaryDialog}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSummary(summary)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSummary?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-4">
              <span>{selectedSummary?.meeting_date 
                ? new Date(selectedSummary.meeting_date).toLocaleDateString()
                : new Date(selectedSummary?.created_at || '').toLocaleDateString()
              }</span>
              {selectedSummary?.participants && selectedSummary.participants.length > 0 && (
                <span>{selectedSummary.participants.length} participants</span>
              )}
              {selectedSummary?.duration && (
                <span>{formatDuration(selectedSummary.duration)}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Audio Player Section */}
            {selectedSummary?.audio_url && (
              <div className="bg-accent text-accent-foreground rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAudioPlayback(selectedSummary.id, selectedSummary.audio_url!)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {playingAudio === selectedSummary.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Meeting Audio Recording</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedSummary.duration ? formatDuration(selectedSummary.duration) : 'Duration unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {playingAudio === selectedSummary.id ? 'Playing...' : 'Ready to play'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">{selectedSummary?.summary}</p>
            </div>
            
            {selectedSummary?.participants && selectedSummary.participants.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Participants</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedSummary.participants.map((participant, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {participant}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {selectedSummary?.key_points && selectedSummary.key_points.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Key Points</h4>
                <ul className="text-sm space-y-1">
                  {selectedSummary.key_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedSummary?.action_items && selectedSummary.action_items.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Action Items</h4>
                <ul className="text-sm space-y-1">
                  {selectedSummary.action_items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckSquare className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {summary.action_items && summary.action_items.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCreateTasksFromSummary(summary)}
          className="h-8 w-8 p-0"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            title="Export summary"
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => exportSummary(summary, 'txt')}>
            Plain Text (.txt)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportSummary(summary, 'md')}>
            Markdown (.md)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportSummary(summary, 'rtf')}>
            Rich Text (.rtf)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => deleteSummary(summary.id)}
        className="h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredSummaries.map((summary) => (
        <div key={summary.id} className="border rounded-lg p-4 space-y-3 w-full max-w-[90%]">
          <div className="flex items-start justify-between w-full">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-lg truncate">{summary.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {summary.meeting_date 
                    ? new Date(summary.meeting_date).toLocaleDateString()
                    : new Date(summary.created_at).toLocaleDateString()
                  }
                </div>
                {summary.participants && summary.participants.length > 0 && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {summary.participants.length} participants
                    </div>
                  </>
                )}
                {summary.duration && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {formatDuration(summary.duration)}
                    </div>
                  </>
                )}
                {summary.language && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <div className="flex items-center gap-1 text-xs">
                      <span>🗣️</span>
                      <span>{summary.language}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {renderSummaryActions(summary)}
          </div>
          
          <div className="text-sm text-muted-foreground line-clamp-2">
            {summary.summary}
          </div>
          
          <div className="flex items-center justify-between">
            {summary.participants && summary.participants.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {summary.participants.slice(0, 3).map((participant, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {participant}
                  </Badge>
                ))}
                {summary.participants.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{summary.participants.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            {summary.action_items && summary.action_items.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckSquare className="h-3 w-3" />
                {summary.action_items.length} action items
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredSummaries.map((summary) => (
        <div key={summary.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
          {/* Icon Thumbnail */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-base truncate">{summary.title}</h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                {summary.meeting_date 
                  ? new Date(summary.meeting_date).toLocaleDateString()
                  : new Date(summary.created_at).toLocaleDateString()
                }
              </div>
            </div>
          </div>
          
          {/* Preview Content */}
          <div className="bg-muted/30 rounded-md p-3 min-h-[100px] text-sm">
            <div className="line-clamp-4 text-muted-foreground">
              {generateThumbnail(summary.summary)}
            </div>
          </div>
          
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {summary.participants && summary.participants.length > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {summary.participants.length}
                </div>
                <Separator orientation="vertical" className="h-3" />
              </>
            )}
            {summary.duration && (
              <>
                <div className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {formatDuration(summary.duration)}
                </div>
                <Separator orientation="vertical" className="h-3" />
              </>
            )}
            {summary.language && (
              <div className="flex items-center gap-1">
                <span>🗣️</span>
                <span>{summary.language}</span>
              </div>
            )}
          </div>
          
          {/* Participants */}
          {summary.participants && summary.participants.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {summary.participants.slice(0, 3).map((participant, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {participant}
                </Badge>
              ))}
              {summary.participants.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{summary.participants.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Action items indicator */}
          {summary.action_items && summary.action_items.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckSquare className="h-3 w-3" />
              {summary.action_items.length} action items
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-center gap-1 pt-2 border-t mt-auto">
            {renderSummaryActions(summary)}
          </div>
        </div>
      ))}
    </div>
  );

  const filteredSummaries = summaries.filter(summary => 
    summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.participants?.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
    summary.action_items?.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleRefresh = async () => {
    await fetchSummaries(true);
  };

  // Auto-refresh when meetings are created
  useEffect(() => {
    if (onMeetingCreated) {
      fetchSummaries();
    }
  }, [onMeetingCreated]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Meeting Summaries
          </CardTitle>
          <CardDescription>Loading your meeting summaries...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Meeting Summaries ({summaries.length})
        </CardTitle>
        <CardDescription>
          Your saved meeting summaries and action items
        </CardDescription>
        
        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search summaries by title, content, or participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredSummaries.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'No matching summaries found' : 'No meeting summaries yet'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Record meetings using the Meeting Manager to see summaries here.'
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            {viewMode === 'list' ? renderListView() : renderGridView()}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
