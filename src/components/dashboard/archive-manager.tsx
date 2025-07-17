'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Archive, 
  ArchiveRestore, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Image, 
  FileText, 
  Calendar, 
  Tag, 
  Trash2, 
  Download,
  Eye,
  Clock,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ArchivedItem {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'task' | 'document';
  category: string;
  tags: string[];
  images: string[];
  createdAt: string;
  archivedAt: string;
  autoArchived: boolean;
  size: number;
  thumbnail?: string;
}

interface ArchiveManagerProps {
  items: ArchivedItem[];
  onRestore: (item: ArchivedItem) => void;
  onDelete: (itemId: string) => void;
  onUpdateSettings: (settings: ArchiveSettings) => void;
}

interface ArchiveSettings {
  autoArchiveAfterDays: number;
  enableAutoArchive: boolean;
  archiveCategories: string[];
}

export function ArchiveManager({ items, onRestore, onDelete, onUpdateSettings }: ArchiveManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [archiveSettings, setArchiveSettings] = useState<ArchiveSettings>({
    autoArchiveAfterDays: 24,
    enableAutoArchive: true,
    archiveCategories: ['completed', 'old']
  });
  
  // Handle auto-archive check
  useEffect(() => {
    const checkAutoArchive = async () => {
      if (!archiveSettings.enableAutoArchive) return;

      const now = new Date();
      const cutoffTime = new Date(now.getTime() - (archiveSettings.autoArchiveAfterDays * 24 * 60 * 60 * 1000));
      
      const itemsToArchive = items.filter(item =>
        !item.autoArchived &&
        new Date(item.createdAt) < cutoffTime
      );
      
      if (itemsToArchive.length > 0) {
        try {
          // Call auto-archive API endpoint
          const response = await fetch('/api/tasks/auto-archive', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              daysThreshold: archiveSettings.autoArchiveAfterDays
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to auto-archive tasks');
          }
          
          toast({
            title: "Auto-Archive Completed",
            description: `${itemsToArchive.length} items were auto-archived.`,
            variant: "default"
          });
          
          // Refresh data
          window.location.reload();
        } catch (error) {
          console.error('Auto-archive failed:', error);
          toast({
            title: "Auto-Archive Failed",
            description: "Could not auto-archive tasks. Please try again.",
            variant: "destructive"
          });
        }
      }
    };

    // Check every hour
    const interval = setInterval(checkAutoArchive, 60 * 60 * 1000);
    checkAutoArchive(); // Check immediately

    return () => clearInterval(interval);
  }, [archiveSettings, items, toast]);
  
  const { toast } = useToast();

  // Auto-archive functionality
  useEffect(() => {
    const checkAutoArchive = () => {
      if (!archiveSettings.enableAutoArchive) return;

      const now = new Date();
      const cutoffTime = new Date(now.getTime() - (archiveSettings.autoArchiveAfterDays * 24 * 60 * 60 * 1000));
      
      // This would typically be handled by the parent component
      // For now, we'll just show a notification
      const itemsToArchive = items.filter(item => 
        !item.autoArchived && 
        new Date(item.createdAt) < cutoffTime
      );
      
      if (itemsToArchive.length > 0) {
        toast({
          title: "Auto-Archive Available",
          description: `${itemsToArchive.length} items are eligible for auto-archiving.`,
          variant: "default"
        });
      }
    };

    // Check every hour
    const interval = setInterval(checkAutoArchive, 60 * 60 * 1000);
    checkAutoArchive(); // Check immediately

    return () => clearInterval(interval);
  }, [archiveSettings, items, toast]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesType = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = Array.from(new Set(items.map(item => item.category)));
  const types = Array.from(new Set(items.map(item => item.type)));

  const handleRestore = (item: ArchivedItem) => {
    onRestore(item);
    toast({
      title: "Item Restored",
      description: `"${item.title}" has been restored from archive.`,
      variant: "default"
    });
  };

  const handleDelete = (itemId: string) => {
    onDelete(itemId);
    toast({
      title: "Item Deleted",
      description: "Item has been permanently deleted.",
      variant: "destructive"
    });
  };

  const handleBulkAction = (action: 'restore' | 'delete') => {
    const itemsToProcess = items.filter(item => selectedItems.includes(item.id));
    
    if (action === 'restore') {
      itemsToProcess.forEach(item => onRestore(item));
      toast({
        title: "Items Restored",
        description: `${itemsToProcess.length} items have been restored.`,
        variant: "default"
      });
    } else {
      itemsToProcess.forEach(item => onDelete(item.id));
      toast({
        title: "Items Deleted",
        description: `${itemsToProcess.length} items have been permanently deleted.`,
        variant: "destructive"
      });
    }
    
    setSelectedItems([]);
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'task':
        return <Archive className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const ItemCard = ({ item }: { item: ArchivedItem }) => (
    <Card className={cn(
      "cursor-pointer transition-all hover:shadow-md",
      selectedItems.includes(item.id) ? "ring-2 ring-primary" : ""
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => toggleItemSelection(item.id)}
              className="rounded"
            />
            {getItemIcon(item.type)}
            <CardTitle className="text-sm line-clamp-1">{item.title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {item.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {item.thumbnail && (
          <div className="relative h-20 w-full rounded overflow-hidden">
            <img 
              src={item.thumbnail} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {item.images.length > 1 && (
              <Badge className="absolute top-1 right-1 text-xs">
                +{item.images.length - 1}
              </Badge>
            )}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {item.content}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{item.tags.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{format(new Date(item.archivedAt), 'MMM d, yyyy')}</span>
          <span>{formatFileSize(item.size)}</span>
        </div>
        
        {item.autoArchived && (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Auto-archived
          </Badge>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRestore(item)}
            className="flex-1"
          >
            <ArchiveRestore className="h-3 w-3 mr-1" />
            Restore
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(item.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ItemRow = ({ item }: { item: ArchivedItem }) => (
    <div className={cn(
      "flex items-center p-4 border-b hover:bg-muted/50 cursor-pointer",
      selectedItems.includes(item.id) ? "bg-muted" : ""
    )}>
      <input
        type="checkbox"
        checked={selectedItems.includes(item.id)}
        onChange={() => toggleItemSelection(item.id)}
        className="mr-3 rounded"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          {getItemIcon(item.type)}
          <h4 className="font-medium truncate">{item.title}</h4>
          <Badge variant="outline" className="text-xs">
            {item.type}
          </Badge>
          {item.autoArchived && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Auto
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate mt-1">
          {item.content}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {item.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{format(new Date(item.archivedAt), 'MMM d, yyyy')}</span>
        <span>{formatFileSize(item.size)}</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRestore(item)}
          >
            <ArchiveRestore className="h-3 w-3 mr-1" />
            Restore
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(item.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Archive</h2>
          <p className="text-muted-foreground">
            {filteredItems.length} of {items.length} items
            {archiveSettings.enableAutoArchive && (
              <span className="ml-2">
                • Auto-archive after {archiveSettings.autoArchiveAfterDays} hours
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Archive Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={archiveSettings.enableAutoArchive}
                onChange={(e) => setArchiveSettings(prev => ({ ...prev, enableAutoArchive: e.target.checked }))}
                className="rounded"
              />
              <Label>Enable auto-archive</Label>
            </div>
            
            <div className="space-y-2">
              <Label>Auto-archive after (hours)</Label>
              <Input
                type="number"
                value={archiveSettings.autoArchiveAfterDays}
                onChange={(e) => setArchiveSettings(prev => ({ ...prev, autoArchiveAfterDays: parseInt(e.target.value) || 24 }))}
                min={1}
                max={168}
              />
            </div>
            
            <Button onClick={() => onUpdateSettings(archiveSettings)}>
              Save Settings
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search archived items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedItems.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedItems.length} item(s) selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('restore')}
          >
            <ArchiveRestore className="h-3 w-3 mr-1" />
            Restore Selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('delete')}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete Selected
          </Button>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Archive className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No archived items found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms.' : 'Items will appear here when archived.'}
          </p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-0"
        )}>
          {viewMode === 'grid' ? (
            filteredItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))
          ) : (
            <Card>
              <CardContent className="p-0">
                {filteredItems.map(item => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
