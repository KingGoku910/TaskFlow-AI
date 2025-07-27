'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useTransition, useEffect } from 'react';
import { generateNotesAction } from './actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, FileText, Wand2, MessageSquare, Save, CheckSquare, RefreshCw, FileDown, Hash, Type, AlignLeft, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SavedNotesManager } from '@/components/dashboard/SavedNotesManager';
import { NoteEditor } from '@/components/dashboard/note-editor';
import { createClient } from '@/utils/supabase/client';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeneratedNote {
  notes: string;
  summary: string;
  keyPoints: string[];
  topic: string;
  version: number;
}

interface SavedNote {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  user_id: string;
  topic: string;
  generated_by_ai: boolean;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
}

type NoteFormat = 'markdown' | 'richtext' | 'plaintext';

export default function NoteGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [currentNote, setCurrentNote] = useState<GeneratedNote | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [refinementFeedback, setRefinementFeedback] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mode, setMode] = useState<'generate' | 'refine' | 'edit'>('generate');
  const [noteFormat, setNoteFormat] = useState<NoteFormat>('markdown');
  const [userId, setUserId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<SavedNote | null>(null);
  const { toast } = useToast();

  // Load user on component mount
  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const handleGenerateNotes = () => {
    if (!topic.trim()) {
      toast({
        title: 'Topic Required',
        description: 'Please enter a topic to generate notes.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        setCurrentNote(null);
        setChatMessages([]);
        
        // Add user message to chat
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: `Generate notes on: ${topic}${context ? `\nContext: ${context}` : ''}`,
          timestamp: new Date(),
        };
        setChatMessages([userMessage]);

        const result = await generateNotesAction(topic, context);
        if (result && result.content) {
          const newNote: GeneratedNote = {
            notes: result.content,
            summary: result.summary || 'Generated comprehensive notes',
            keyPoints: result.keyPoints || [],
            topic,
            version: 1,
          };
          setCurrentNote(newNote);
          setMode('refine');

          // Add assistant message to chat
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `Generated comprehensive notes on "${topic}". ${result.summary || ''}`,
            timestamp: new Date(),
          };
          setChatMessages(prev => [...prev, assistantMessage]);

          toast({
            title: 'Notes Generated!',
            description: 'AI has successfully generated notes. You can now refine them with feedback.',
          });
        } else {
          toast({
            title: 'Generation Failed',
            description: 'The AI could not generate notes for this topic. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Note generation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
          title: 'Error',
          description: `Failed to generate notes: ${errorMessage}`,
          variant: 'destructive',
        });
      }
    });
  };

  const handleRefineNotes = async () => {
    if (!currentNote || !refinementFeedback.trim()) {
      toast({
        title: 'Feedback Required',
        description: 'Please provide feedback on how to improve the notes.',
        variant: 'destructive',
      });
      return;
    }

    setIsRefining(true);
    try {
      // Add user feedback to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: refinementFeedback,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, userMessage]);

      // Import refine action dynamically
      const { refineNotesAction } = await import('./actions');
      const result = await refineNotesAction(currentNote.notes, refinementFeedback, currentNote.topic);
      
      if (result && result.content) {
        const refinedNote: GeneratedNote = {
          notes: result.content,
          summary: result.summary || 'Notes refined',
          keyPoints: result.keyPoints || [],
          topic: currentNote.topic,
          version: currentNote.version + 1,
        };
        setCurrentNote(refinedNote);

        // Add assistant response to chat
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Notes refined based on your feedback. Updated to version ${refinedNote.version}. ${result.summary || ''}`,
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, assistantMessage]);

        setRefinementFeedback('');
        toast({
          title: 'Notes Refined',
          description: 'Your notes have been updated based on your feedback.',
        });
      } else {
        throw new Error('Failed to refine notes');
      }
    } catch (error) {
      console.error('Refinement error:', error);
      toast({
        title: 'Refinement Failed',
        description: 'Failed to refine notes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!currentNote) return;

    setIsSaving(true);
    try {
      // Import save action dynamically
      const { saveNotesAction } = await import('./actions');
      const result = await saveNotesAction(currentNote.notes, currentNote.topic);
      
      if (result.success) {
        toast({
          title: 'Notes Saved',
          description: `Your notes have been saved to: ${result.filePath || 'generated-notes directory'}`,
        });
      } else {
        throw new Error(result.error || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save notes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertToTasks = async () => {
    if (!currentNote) return;

    try {
      const { createTaskFromNotesAction } = await import('./actions');
      const result = await createTaskFromNotesAction(currentNote.notes, currentNote.topic, false);
      
      if (result.success) {
        toast({
          title: 'Task Created',
          description: `Single task created from your notes: ${currentNote.topic}. You can decompose it into smaller tasks on the Tasks page.`,
        });
      } else {
        throw new Error(result.error || 'Failed to create task from notes');
      }
    } catch (error) {
      console.error('Task creation error:', error);
      toast({
        title: 'Task Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create task from notes.',
        variant: 'destructive',
      });
    }
  };

  const handleExportToPDF = async () => {
    if (!currentNote) return;

    setIsExporting(true);
    try {
      // Create a temporary div to render the notes for PDF export
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.color = 'black';
      tempDiv.style.padding = '40px';
      tempDiv.style.paddingBottom = '60px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      
      // Add title and metadata
      tempDiv.innerHTML = `
        <div style="margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; color: #333;">${currentNote.topic}</h1>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
            Generated on: ${new Date().toLocaleDateString()} | Version: ${currentNote.version}
          </p>
        </div>
        
        ${currentNote.keyPoints.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #333; margin-bottom: 15px;">Key Points:</h2>
            <ul style="margin: 0; padding-left: 20px;">
              ${currentNote.keyPoints.map(point => `<li style="margin-bottom: 5px;">${point}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div style="white-space: pre-wrap; font-family: inherit; margin-bottom: 40px;">
          ${currentNote.notes.replace(/\n/g, '<br>')}
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      document.body.removeChild(tempDiv);
      
      // Create PDF with proper margins
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename
      const fileName = `${currentNote.topic.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}-notes.pdf`;
      
      pdf.save(fileName);
      
      toast({
        title: 'PDF Exported',
        description: `Notes exported as ${fileName}`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export notes as PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateTaskFromNote = async (noteContent: string, noteTitle: string) => {
    try {
      const { createTaskFromNotesAction } = await import('./actions');
      const result = await createTaskFromNotesAction(noteContent, noteTitle, false);
      
      if (result.success) {
        toast({
          title: 'Task Created',
          description: `Single task created from note: ${noteTitle}. You can decompose it into smaller tasks on the Tasks page.`,
        });
      } else {
        throw new Error(result.error || 'Failed to create task from note');
      }
    } catch (error) {
      console.error('Task creation error:', error);
      toast({
        title: 'Task Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create task from note.',
        variant: 'destructive',
      });
    }
  };

  const handleEditNote = (note: SavedNote) => {
    setEditingNote(note);
    setMode('edit');
  };

  const handleSaveEditedNote = async (editedNote: any) => {
    try {
      const supabase = createClient();
      
      // Update the note in the database
      const { error } = await supabase
        .from('notes')
        .update({
          title: editedNote.title,
          content: editedNote.content,
          topic: editedNote.category || editedNote.topic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editedNote.id);

      if (error) {
        throw error;
      }

      setEditingNote(null);
      setMode('generate');
      
      toast({
        title: 'Note Updated',
        description: 'Your note has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update the note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setMode('generate');
  };

  const startOver = () => {
    setCurrentNote(null);
    setChatMessages([]);
    setTopic('');
    setContext('');
    setRefinementFeedback('');
    setMode('generate');
    setEditingNote(null);
  };

  const renderNotesContent = () => {
    if (!currentNote) return null;

    switch (noteFormat) {
      case 'markdown':
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
                p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>,
                pre: ({ children }) => <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm">{children}</pre>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {currentNote.notes}
            </ReactMarkdown>
          </div>
        );
        
      case 'richtext':
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-primary">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-primary">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-primary">{children}</h3>,
                p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-foreground">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                code: ({ children }) => <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">{children}</code>,
                pre: ({ children }) => <pre className="bg-muted border-l-4 border-primary p-4 rounded-md overflow-x-auto text-sm font-mono">{children}</pre>,
                strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">{children}</blockquote>,
              }}
            >
              {currentNote.notes}
            </ReactMarkdown>
          </div>
        );
        
      case 'plaintext':
        return (
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {currentNote.notes}
          </div>
        );
        
      default:
        return (
          <div className="whitespace-pre-wrap">
            {currentNote.notes}
          </div>
        );
    }
  };

  const getFormatIcon = (format: NoteFormat) => {
    switch (format) {
      case 'markdown':
        return <Hash className="h-4 w-4" />;
      case 'richtext':
        return <Type className="h-4 w-4" />;
      case 'plaintext':
        return <AlignLeft className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatLabel = (format: NoteFormat) => {
    switch (format) {
      case 'markdown':
        return 'Markdown';
      case 'richtext':
        return 'Rich Text';
      case 'plaintext':
        return 'Plain Text';
      default:
        return 'Default';
    }
  };

  return (
    <div className="space-y-6 w-full h-full overflow-y-auto flex-1 flex flex-col">
      {mode === 'edit' && editingNote ? (
        <div className="w-full">
          <NoteEditor
            initialNote={{
              id: editingNote.id,
              title: editingNote.title,
              content: editingNote.content,
              tags: editingNote.tags || [],
              category: editingNote.topic || 'general',
              createdAt: editingNote.created_at,
              updatedAt: editingNote.updated_at,
              images: [],
              isArchived: editingNote.is_archived || false,
            }}
            onSave={handleSaveEditedNote}
            onCancel={handleCancelEdit}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Note Generator */}
            <div className="space-y-6">
              <Card className="shadow-lg w-80%">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    AI Note Generator
                  </CardTitle>
                  <CardDescription>
                    Generate structured notes with AI and refine them through conversation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mode === 'generate' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="topic-input">Topic</Label>
                        <Input
                          id="topic-input"
                          placeholder="e.g., The Future of Renewable Energy, Key Concepts in Quantum Physics (Ctrl+Enter to generate)"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.ctrlKey && e.key === 'Enter') {
                              e.preventDefault();
                              if (!isPending && topic.trim()) {
                                handleGenerateNotes();
                              }
                            }
                          }}
                          disabled={isPending}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="context-input">Additional Context (Optional)</Label>
                        <Textarea
                          id="context-input"
                          placeholder="Provide any specific requirements, focus areas, or context... (Ctrl+Enter to generate)"
                          value={context}
                          onChange={(e) => setContext(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.ctrlKey && e.key === 'Enter') {
                              e.preventDefault();
                              if (!isPending && topic.trim()) {
                                handleGenerateNotes();
                              }
                            }
                          }}
                          disabled={isPending}
                          rows={3}
                        />
                      </div>
                      
                      {/* Format Selection */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>Output Format</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Settings className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">Note Format Options</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Hash className="h-3 w-3" />
                                    <strong>Markdown:</strong> Standard markdown with headers, lists, and code blocks
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Type className="h-3 w-3" />
                                    <strong>Rich Text:</strong> Enhanced styling with colors and improved formatting
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <AlignLeft className="h-3 w-3" />
                                    <strong>Plain Text:</strong> Simple text without formatting
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <RadioGroup 
                          value={noteFormat} 
                          onValueChange={(value) => setNoteFormat(value as NoteFormat)}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="markdown" id="gen-markdown" />
                            <Label htmlFor="gen-markdown" className="flex items-center gap-2 cursor-pointer">
                              <Hash className="h-4 w-4" />
                              Markdown
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="richtext" id="gen-richtext" />
                            <Label htmlFor="gen-richtext" className="flex items-center gap-2 cursor-pointer">
                              <Type className="h-4 w-4" />
                              Rich Text
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="plaintext" id="gen-plaintext" />
                            <Label htmlFor="gen-plaintext" className="flex items-center gap-2 cursor-pointer">
                              <AlignLeft className="h-4 w-4" />
                              Plain Text
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <Button onClick={handleGenerateNotes} disabled={isPending || !topic.trim()}>
                        {isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Notes
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Notes Generated</h3>
                          <p className="text-sm text-muted-foreground">Topic: {currentNote?.topic}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">v{currentNote?.version}</Badge>
                          <Button variant="outline" size="sm" onClick={startOver}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Start Over
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="feedback-input">Refine Notes</Label>
                        <Textarea
                          id="feedback-input"
                          placeholder="Provide feedback on how to improve the notes (e.g., 'Add more examples', 'Make it more technical', 'Include implementation details')... (Ctrl+Enter to submit)"
                          value={refinementFeedback}
                          onChange={(e) => setRefinementFeedback(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.ctrlKey && e.key === 'Enter') {
                              e.preventDefault();
                              if (!isRefining && refinementFeedback.trim()) {
                                handleRefineNotes();
                              }
                            }
                          }}
                          disabled={isRefining}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          onClick={handleRefineNotes} 
                          disabled={isRefining || !refinementFeedback.trim()}
                          variant="outline"
                        >
                          {isRefining ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Refining...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Refine Notes
                            </>
                          )}
                        </Button>
                        
                        <Button onClick={handleSaveNotes} disabled={isSaving} variant="outline">
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Notes
                            </>
                          )}
                        </Button>
                        
                        <Button onClick={handleConvertToTasks} variant="outline">
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Create Task
                        </Button>

                        <Button onClick={handleExportToPDF} disabled={isExporting} variant="outline">
                          {isExporting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Exporting...
                            </>
                          ) : (
                            <>
                              <FileDown className="mr-2 h-4 w-4" />
                              Export PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {chatMessages.length > 0 && (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Conversation History</CardTitle>
                    <CardDescription>Your conversation with the AI assistant</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] w-full">
                      <div className="space-y-4">
                        {chatMessages.map((message) => (
                          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg ${
                              message.type === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Saved Notes */}
            <div className="space-y-6">
              <SavedNotesManager 
                onCreateTask={handleCreateTaskFromNote}
                onEditNote={handleEditNote}
              />
            </div>
          </div>

          {currentNote && (
            <Card className="w-full flex-1 flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">Generated Notes</CardTitle>
                    <CardDescription>Notes on: {currentNote.topic} (Version {currentNote.version})</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Format Selection - Compact */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Display:</Label>
                      <div className="flex rounded-lg border bg-muted/50 p-1">
                        <button
                          onClick={() => setNoteFormat('markdown')}
                          className={`px-3 py-1.5 text-sm flex items-center gap-1 rounded-md transition-all ${
                            noteFormat === 'markdown' 
                              ? 'bg-background text-foreground shadow-sm' 
                              : 'hover:bg-background/50 text-muted-foreground'
                          }`}
                          title="Markdown"
                        >
                          <Hash className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setNoteFormat('richtext')}
                          className={`px-3 py-1.5 text-sm flex items-center gap-1 rounded-md transition-all ${
                            noteFormat === 'richtext' 
                              ? 'bg-background text-foreground shadow-sm' 
                              : 'hover:bg-background/50 text-muted-foreground'
                          }`}
                          title="Rich Text"
                        >
                          <Type className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setNoteFormat('plaintext')}
                          className={`px-3 py-1.5 text-sm flex items-center gap-1 rounded-md transition-all ${
                            noteFormat === 'plaintext' 
                              ? 'bg-background text-foreground shadow-sm' 
                              : 'hover:bg-background/50 text-muted-foreground'
                          }`}
                          title="Plain Text"
                        >
                          <AlignLeft className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Key Points */}
                    {currentNote.keyPoints.length > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-medium">Key Points:</p>
                        <div className="flex flex-wrap gap-1 mt-1 justify-end">
                          {currentNote.keyPoints.slice(0, 3).map((point, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {point.length > 20 ? point.substring(0, 20) + '...' : point}
                            </Badge>
                          ))}
                          {currentNote.keyPoints.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{currentNote.keyPoints.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-muted/30">
                  {renderNotesContent()}
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2">
                <p className="text-xs text-muted-foreground">
                  {currentNote.summary}
                </p>
                <Separator />
                <div className="flex items-center justify-between w-full">
                  <p className="text-xs text-muted-foreground">
                    Use the refinement section above to improve the notes, save them to a file, or convert them to actionable tasks.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Format: {getFormatLabel(noteFormat)}
                    </span>
                    {getFormatIcon(noteFormat)}
                  </div>
                </div>
              </CardFooter>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
