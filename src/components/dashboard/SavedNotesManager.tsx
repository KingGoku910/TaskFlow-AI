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
  Tag, 
  Trash2, 
  Edit, 
  Eye, 
  CheckSquare,
  Bot,
  User,
  Plus,
  ArrowRight,
  RefreshCw,
  Archive,
  ArchiveRestore,
  List,
  Grid3X3,
  LayoutGrid,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Markdown } from '@/components/ui/markdown';

interface SavedNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  topic: string;
  generated_by_ai: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
  is_archived?: boolean;
}

interface SavedNotesManagerProps {
  onCreateTask?: (noteContent: string, title: string) => void;
  onNoteCreated?: () => void;
  onEditNote?: (note: SavedNote) => void;
}

export function SavedNotesManager({ onCreateTask, onNoteCreated, onEditNote }: SavedNotesManagerProps) {
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showArchivedNotes, setShowArchivedNotes] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const { toast } = useToast();

  const supabase = createClient();

  const fetchNotes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: 'Authentication Error',
          description: 'Please sign in to view your notes.',
          variant: 'destructive'
        });
        return;
      }

      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('Notes fetch error:', notesError);
        toast({
          title: 'Error Loading Notes',
          description: 'Failed to load your notes. Please try again.',
          variant: 'destructive'
        });
        setNotes([]);
      } else {
        // Set the actual notes data (could be empty array)
        setNotes(notesData || []);
        
        if (isRefresh) {
          toast({
            title: 'Notes Refreshed',
            description: `Loaded ${notesData?.length || 0} notes successfully.`,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      toast({
        title: 'Error',
        description: 'Failed to load saved notes.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchNotes(true);
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        throw error;
      }

      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast({
        title: 'Note Deleted',
        description: 'The note has been removed from your library.',
      });
    } catch (err) {
      console.error('Error deleting note:', err);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the note. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleCreateTaskFromNote = (note: SavedNote) => {
    if (onCreateTask) {
      onCreateTask(note.content, note.title);
    }
    toast({
      title: 'Task Created',
      description: `Task created from note: ${note.title}`,
    });
  };

  const handleEditNote = (note: SavedNote) => {
    if (onEditNote) {
      onEditNote(note);
    }
  };

  const exportNote = (note: SavedNote, format: 'md' | 'rtf' | 'txt' = 'txt') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'md':
        content = `# ${note.title}\n\n**Topic:** ${note.topic}\n**Tags:** ${note.tags.join(', ')}\n**Created:** ${new Date(note.created_at).toLocaleDateString()}\n**Type:** ${note.generated_by_ai ? 'AI Generated' : 'Manual'}\n\n---\n\n${note.content}`;
        filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        mimeType = 'text/markdown';
        break;
      case 'rtf':
        content = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 {\\b ${note.title}}\\par\\par Topic: ${note.topic}\\par Tags: ${note.tags.join(', ')}\\par Created: ${new Date(note.created_at).toLocaleDateString()}\\par Type: ${note.generated_by_ai ? 'AI Generated' : 'Manual'}\\par\\par ${note.content.replace(/\n/g, '\\par ')}}`;
        filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.rtf`;
        mimeType = 'application/rtf';
        break;
      default:
        content = `${note.title}\n\nTopic: ${note.topic}\nTags: ${note.tags.join(', ')}\nCreated: ${new Date(note.created_at).toLocaleDateString()}\nType: ${note.generated_by_ai ? 'AI Generated' : 'Manual'}\n\n${note.content}`;
        filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
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
      title: 'Note Exported',
      description: `${note.title} exported as ${format.toUpperCase()}`,
    });
  };

  const archiveNote = async (noteId: string, isArchived: boolean) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_archived: isArchived })
        .eq('id', noteId);

      if (error) {
        throw error;
      }

      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, is_archived: isArchived }
          : note
      ));
      
      toast({
        title: isArchived ? 'Note Archived' : 'Note Restored',
        description: isArchived 
          ? 'The note has been moved to archives.' 
          : 'The note has been restored from archives.',
      });
    } catch (err) {
      console.error('Error archiving note:', err);
      toast({
        title: 'Archive Failed',
        description: 'Could not archive the note. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const generateThumbnail = (content: string) => {
    // Extract first few lines and create a preview
    const lines = content.split('\n').slice(0, 3);
    return lines.join('\n').substring(0, 150) + (content.length > 150 ? '...' : '');
  };

  const getIconColor = (note: SavedNote) => {
    // Generate consistent color based on topic
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
      'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    const index = note.topic.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderNoteActions = (note: SavedNote) => (
    <div className="flex items-center gap-0">
      <Dialog open={showNoteDialog && selectedNote?.id === note.id} onOpenChange={setShowNoteDialog}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedNote(note)}
            title="View note"
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
            <DialogDescription>
              {selectedNote?.generated_by_ai ? 'AI Generated' : 'Manual'} • {selectedNote?.topic}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Markdown>
              {selectedNote?.content || ''}
            </Markdown>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleEditNote(note)}
        title="Edit note"
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleCreateTaskFromNote(note)}
        title="Create task from note"
        className="h-8 w-8 p-0"
      >
        <CheckSquare className="h-4 w-4" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            title="Export note"
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => exportNote(note, 'txt')}>
            Plain Text (.txt)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportNote(note, 'md')}>
            Markdown (.md)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportNote(note, 'rtf')}>
            Rich Text (.rtf)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => archiveNote(note.id, !note.is_archived)}
        title={note.is_archived ? 'Restore from archive' : 'Archive note'}
        className="h-8 w-8 p-0"
      >
        {note.is_archived ? (
          <ArchiveRestore className="h-4 w-4" />
        ) : (
          <Archive className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => deleteNote(note.id)}
        title="Delete note"
        className="h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredNotes.map((note) => (
        <div key={note.id} className="border rounded-lg p-2 space-y-1 w-full max-w-[90%] items-start">
          <div className="flex items-start justify-between w-[100%]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h4 className="font-medium text-lg truncate">{note.title}</h4>
                {note.is_archived && (
                  <Badge variant="secondary" className="text-xs">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  {note.generated_by_ai ? (
                    <Bot className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  {note.generated_by_ai ? 'AI Generated' : 'Manual'}
                </div>
                <Separator orientation="vertical" className="h-3" />
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
                <Separator orientation="vertical" className="h-3" />
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {note.topic}
                </div>
              </div>
            </div>
            
            {renderNoteActions(note)}
          </div>
          
          <div className="text-sm text-muted-foreground line-clamp-2">
            {note.content.substring(0, 200)}...
          </div>
          
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredNotes.map((note) => (
        <div key={note.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
          {/* Icon Thumbnail */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white`}>
              {note.generated_by_ai ? (
                <Bot className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-base truncate">{note.title}</h4>
              {note.is_archived && (
                <Badge variant="secondary" className="text-xs mt-1">
                  <Archive className="h-3 w-3" />
                  Archived
                </Badge>
              )}
            </div>
          </div>
          
          {/* Preview Content */}
          <div className="bg-muted/30 rounded-md p-3 min-h-[100px] text-sm">
            <div className="line-clamp-4 text-muted-foreground">
              {generateThumbnail(note.content)}
            </div>
          </div>
          
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(note.created_at).toLocaleDateString()}
            </div>
            <Separator orientation="vertical" className="h-3" />
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {note.topic}
            </div>
          </div>
          
          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* AI/Manual indicator */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {note.generated_by_ai ? (
              <>
                <Bot className="h-3 w-3" />
                AI Generated
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                Manual
              </>
            )}
          </div>
          
          {/* Actions - Now on their own line */}
          <div className="flex items-center justify-center gap-1 pt-2 border-t mt-auto">
            {renderNoteActions(note)}
          </div>
        </div>
      ))}
    </div>
  );

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesArchiveFilter = showArchivedNotes 
      ? note.is_archived === true
      : !note.is_archived;
    
    return matchesSearch && matchesArchiveFilter;
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  // Auto-refresh when notes are created externally
  useEffect(() => {
    if (onNoteCreated) {
      // This will be called from the parent component when a note is created
      const refreshNotes = () => {
        fetchNotes(true);
      };
      
      // Store the refresh function so parent can call it
      (onNoteCreated as any).refresh = refreshNotes;
    }
  }, [onNoteCreated]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Saved Notes
          </CardTitle>
          <CardDescription>Loading your saved notes...</CardDescription>
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
    <Card role="region" aria-labelledby="saved-notes-heading">
      <CardHeader id="saved-notes-heading">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {showArchivedNotes ? 'Archived Notes' : 'Saved Notes'} ({filteredNotes.length})
        </CardTitle>
        <CardDescription>
          {showArchivedNotes 
            ? 'Your archived notes library'
            : 'Your library of generated and manual notes'
          }
        </CardDescription>
        
        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes by title, content, or tags..."
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
            variant="outline"
            size="sm"
            onClick={() => setShowArchivedNotes(!showArchivedNotes)}
            className="flex items-center gap-2"
          >
            {showArchivedNotes ? (
              <>
                <FileText className="h-4 w-4" />
                Active
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                Archive
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'No matching notes found' : 'No saved notes yet'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Generate some notes using the AI Note Generator to see them here.'
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
