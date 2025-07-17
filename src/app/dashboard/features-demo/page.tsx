'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoteEditor } from '@/components/dashboard/note-editor';
import { ArchiveManager } from '@/components/dashboard/archive-manager';
import { TextToSpeechPlayer } from '@/components/dashboard/text-to-speech-player';
import { IconThumbnailView } from '@/components/dashboard/icon-thumbnail-view';
import { 
  FileText, 
  Archive, 
  Volume2, 
  Grid, 
  Plus, 
  Star, 
  Settings 
} from 'lucide-react';

// Mock data for demonstration
const mockSavedItems = [
  {
    id: '1',
    title: 'Project Planning Notes',
    content: 'This is a comprehensive note about project planning including timelines, resources, and key milestones.',
    type: 'note' as const,
    category: 'work',
    tags: ['project', 'planning', 'timeline'],
    images: ['/api/placeholder/200/150'],
    thumbnail: '/api/placeholder/200/150',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    isFavorite: true,
    size: 2048,
    author: 'John Doe',
    status: 'active' as const
  },
  {
    id: '2',
    title: 'Meeting Minutes - Q1 Review',
    content: 'Important decisions made during the quarterly review meeting with action items and follow-ups.',
    type: 'document' as const,
    category: 'meetings',
    tags: ['meeting', 'quarterly', 'review'],
    images: [],
    createdAt: '2025-01-12T09:00:00Z',
    updatedAt: '2025-01-12T11:00:00Z',
    isFavorite: false,
    size: 1024,
    author: 'Jane Smith',
    status: 'active' as const
  },
  {
    id: '3',
    title: 'Code Architecture Diagram',
    content: 'System architecture diagram showing microservices and data flow.',
    type: 'image' as const,
    category: 'technical',
    tags: ['architecture', 'diagram', 'microservices'],
    images: ['/api/placeholder/300/200'],
    thumbnail: '/api/placeholder/300/200',
    createdAt: '2025-01-08T16:00:00Z',
    updatedAt: '2025-01-08T16:00:00Z',
    isFavorite: true,
    size: 4096,
    author: 'Mike Johnson',
    status: 'active' as const
  }
];

const mockArchivedItems = [
  {
    id: 'arch1',
    title: 'Old Project Notes',
    content: 'Notes from a completed project that was finished last month.',
    type: 'note' as const,
    category: 'work',
    tags: ['project', 'completed'],
    images: [],
    createdAt: '2024-12-01T10:00:00Z',
    archivedAt: '2025-01-01T10:00:00Z',
    autoArchived: true,
    size: 1536
  },
  {
    id: 'arch2',
    title: 'Draft Research Paper',
    content: 'Research paper draft that was replaced with a newer version.',
    type: 'document' as const,
    category: 'research',
    tags: ['research', 'draft', 'paper'],
    images: [],
    createdAt: '2024-11-15T14:00:00Z',
    archivedAt: '2024-12-20T14:00:00Z',
    autoArchived: false,
    size: 2048
  }
];

const sampleText = `
Welcome to the Text-to-Speech demonstration! This feature allows you to convert any written content into natural-sounding speech using advanced browser-based speech synthesis.

You can control the playback speed, pitch, and volume to customize your listening experience. The player supports multiple voices and languages, giving you flexibility in how your content is presented.

This is particularly useful for:
- Reviewing long documents while multitasking
- Accessibility for users with reading difficulties
- Learning pronunciation of complex terms
- Creating audio versions of your notes for mobile listening

The player includes standard media controls like play, pause, skip forward and backward, along with a progress bar for easy navigation through your content.
`;

export default function FeaturesDemo() {
  const [activeTab, setActiveTab] = useState('notes');
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [savedItems, setSavedItems] = useState(mockSavedItems);
  const [archivedItems, setArchivedItems] = useState(mockArchivedItems);

  const handleSaveNote = (note: any) => {
    const newItem = {
      id: Date.now().toString(),
      title: note.title,
      content: note.content,
      type: 'note' as const,
      category: note.category,
      tags: note.tags,
      images: note.images.map((img: any) => img.url),
      thumbnail: note.images[0]?.url,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      isFavorite: false,
      size: note.content.length * 2,
      author: 'Current User',
      status: 'active' as const
    };
    
    setSavedItems(prev => [newItem, ...prev]);
    setShowNoteEditor(false);
  };

  const handleItemClick = (item: any) => {
    console.log('Clicked item:', item);
  };

  const handleItemEdit = (item: any) => {
    console.log('Edit item:', item);
  };

  const handleItemDelete = (itemId: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleItemFavorite = (itemId: string, isFavorite: boolean) => {
    setSavedItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isFavorite } : item
    ));
  };

  const handleItemArchive = (itemId: string) => {
    const item = savedItems.find(i => i.id === itemId);
    if (item) {
      const archivedItem = {
        ...item,
        archivedAt: new Date().toISOString(),
        autoArchived: false,
        size: item.size
      };
      setArchivedItems(prev => [archivedItem, ...prev]);
      setSavedItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const handleRestoreItem = (item: any) => {
    const restoredItem = {
      ...item,
      status: 'active' as const,
      updatedAt: new Date().toISOString()
    };
    setSavedItems(prev => [restoredItem, ...prev]);
    setArchivedItems(prev => prev.filter(i => i.id !== item.id));
  };

  const handleDeleteArchivedItem = (itemId: string) => {
    setArchivedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateArchiveSettings = (settings: any) => {
    console.log('Archive settings updated:', settings);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Advanced Features Demo</h1>
          <p className="text-lg text-muted-foreground">
            Explore the new note editor, archive system, text-to-speech, and icon/thumbnail views
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Note Editor
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Item Library
            </TabsTrigger>
            <TabsTrigger value="tts" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Text-to-Speech
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archive Manager
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Note Editor with Vision AI</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Create rich notes with image upload, AI analysis, and voice recording
                    </p>
                  </div>
                  <Button onClick={() => setShowNoteEditor(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">✨ Key Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Rich text editor with tabs</li>
                      <li>• Drag & drop image upload</li>
                      <li>• AI-powered image analysis</li>
                      <li>• Voice recording integration</li>
                      <li>• Tag and category organization</li>
                      <li>• Real-time preview</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">🎯 Use Cases</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Meeting notes with photos</li>
                      <li>• Research documentation</li>
                      <li>• Project planning</li>
                      <li>• Personal journaling</li>
                      <li>• Technical documentation</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">⚡ Shortcuts</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Ctrl+Enter: Save note</li>
                      <li>• Drag & drop: Upload images</li>
                      <li>• Enter: Add tags</li>
                      <li>• Voice commands supported</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {showNoteEditor && (
              <NoteEditor
                onSave={handleSaveNote}
                onCancel={() => setShowNoteEditor(false)}
              />
            )}
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Icon & Thumbnail View</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Browse your saved items with rich previews and advanced filtering
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      {savedItems.length} Active Items
                    </Badge>
                    <Badge variant="outline">
                      {savedItems.filter(i => i.isFavorite).length} Favorites
                    </Badge>
                    <Badge variant="outline">
                      {archivedItems.length} Archived
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <IconThumbnailView
              items={savedItems}
              onItemClick={handleItemClick}
              onItemEdit={handleItemEdit}
              onItemDelete={handleItemDelete}
              onItemFavorite={handleItemFavorite}
              onItemArchive={handleItemArchive}
            />
          </TabsContent>

          <TabsContent value="tts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Text-to-Speech Player</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Convert any text to natural-sounding speech with advanced controls
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">🎵 Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Multiple voice options</li>
                      <li>• Speed and pitch control</li>
                      <li>• Volume adjustment</li>
                      <li>• Skip forward/backward</li>
                      <li>• Progress tracking</li>
                      <li>• Audio file export</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">🎧 Benefits</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Accessibility support</li>
                      <li>• Multitasking friendly</li>
                      <li>• Learning enhancement</li>
                      <li>• Mobile-friendly playback</li>
                      <li>• Pronunciation help</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TextToSpeechPlayer
              text={sampleText}
              title="Sample Text Playback"
              onPlaybackComplete={() => console.log('Playback completed')}
            />
          </TabsContent>

          <TabsContent value="archive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Archive Manager</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Automatic archiving system with 24-hour auto-archive and bulk operations
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">⚡ Auto-Archive</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 24-hour auto-archiving</li>
                      <li>• Configurable time periods</li>
                      <li>• Category-based rules</li>
                      <li>• Manual override options</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">🔍 Search & Filter</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Full-text search</li>
                      <li>• Category filtering</li>
                      <li>• Type-based sorting</li>
                      <li>• Date range filters</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">📦 Bulk Operations</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Multi-select items</li>
                      <li>• Bulk restore/delete</li>
                      <li>• Export archived data</li>
                      <li>• Storage optimization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ArchiveManager
              items={archivedItems}
              onRestore={handleRestoreItem}
              onDelete={handleDeleteArchivedItem}
              onUpdateSettings={handleUpdateArchiveSettings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
