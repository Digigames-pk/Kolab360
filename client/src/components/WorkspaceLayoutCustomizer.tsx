import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Layout, 
  Palette, 
  Eye, 
  EyeOff, 
  Move, 
  RotateCcw, 
  Settings2,
  Grid3X3,
  Sidebar,
  Monitor,
  Smartphone,
  Save,
  GripVertical,
  Plus,
  X,
  Edit3,
  Home,
  MessageSquare,
  CheckSquare,
  Calendar,
  FolderOpen,
  Users,
  Bell,
  Star,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkspaceSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: boolean;
  order: number;
  color?: string;
  width?: number;
  height?: number;
  customizable: boolean;
}

interface WorkspaceTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  sidebar: string;
  text: string;
}

const DEFAULT_SECTIONS: WorkspaceSection[] = [
  { id: 'home', name: 'Home', icon: Home, visible: true, order: 0, customizable: false },
  { id: 'threads', name: 'Threads', icon: MessageSquare, visible: true, order: 1, customizable: true },
  { id: 'mentions', name: 'Mentions', icon: Bell, visible: true, order: 2, customizable: true },
  { id: 'saved', name: 'Saved Items', icon: Star, visible: true, order: 3, customizable: true },
  { id: 'files', name: 'Files', icon: FolderOpen, visible: true, order: 4, customizable: true },
  { id: 'ai', name: 'AI Assistant', icon: Zap, visible: true, order: 5, customizable: true },
  { id: 'tasks', name: 'Tasks', icon: CheckSquare, visible: true, order: 6, customizable: true },
  { id: 'calendar', name: 'Calendar', icon: Calendar, visible: true, order: 7, customizable: true },
  { id: 'people', name: 'People', icon: Users, visible: true, order: 8, customizable: true },
];

const WORKSPACE_THEMES: WorkspaceTheme[] = [
  {
    id: 'default',
    name: 'Default',
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    background: '#ffffff',
    sidebar: '#1e293b',
    text: '#1f2937'
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    primary: '#6366f1',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#0f172a',
    sidebar: '#020617',
    text: '#f8fafc'
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: '#0ea5e9',
    secondary: '#0891b2',
    accent: '#06b6d4',
    background: '#f0f9ff',
    sidebar: '#0c4a6e',
    text: '#164e63'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10b981',
    background: '#f0fdf4',
    sidebar: '#064e3b',
    text: '#065f46'
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    primary: '#ea580c',
    secondary: '#dc2626',
    accent: '#f59e0b',
    background: '#fffbeb',
    sidebar: '#7c2d12',
    text: '#9a3412'
  }
];

export function WorkspaceLayoutCustomizer({ onClose }: { onClose: () => void }) {
  const [sections, setSections] = useState<WorkspaceSection[]>(DEFAULT_SECTIONS);
  const [selectedTheme, setSelectedTheme] = useState<string>('default');
  const [sidebarWidth, setSidebarWidth] = useState([280]);
  const [compactMode, setCompactMode] = useState(false);
  const [autoHide, setAutoHide] = useState(false);
  const [showIcons, setShowIcons] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedSections = localStorage.getItem('workspace-sections');
    const savedTheme = localStorage.getItem('workspace-theme');
    const savedSettings = localStorage.getItem('workspace-settings');

    if (savedSections) {
      setSections(JSON.parse(savedSections));
    }
    if (savedTheme) {
      setSelectedTheme(savedTheme);
    }
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSidebarWidth([settings.sidebarWidth || 280]);
      setCompactMode(settings.compactMode || false);
      setAutoHide(settings.autoHide || false);
      setShowIcons(settings.showIcons !== undefined ? settings.showIcons : true);
    }
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newSections = Array.from(sections);
    const [reorderedSection] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, reorderedSection);

    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    setSections(updatedSections);
    setHasUnsavedChanges(true);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, visible: !section.visible }
        : section
    ));
    setHasUnsavedChanges(true);
  };

  const updateSectionColor = (sectionId: string, color: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, color }
        : section
    ));
    setHasUnsavedChanges(true);
  };

  const applyTheme = (themeId: string) => {
    const theme = WORKSPACE_THEMES.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--sidebar', theme.sidebar);
    root.style.setProperty('--text', theme.text);

    setSelectedTheme(themeId);
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('workspace-sections', JSON.stringify(sections));
    localStorage.setItem('workspace-theme', selectedTheme);
    localStorage.setItem('workspace-settings', JSON.stringify({
      sidebarWidth: sidebarWidth[0],
      compactMode,
      autoHide,
      showIcons
    }));

    setHasUnsavedChanges(false);
    
    // Apply theme
    applyTheme(selectedTheme);
    
    // Trigger workspace refresh
    window.dispatchEvent(new CustomEvent('workspace-settings-changed', {
      detail: { sections, theme: selectedTheme, settings: { sidebarWidth: sidebarWidth[0], compactMode, autoHide, showIcons } }
    }));
  };

  const resetToDefaults = () => {
    setSections(DEFAULT_SECTIONS);
    setSelectedTheme('default');
    setSidebarWidth([280]);
    setCompactMode(false);
    setAutoHide(false);
    setShowIcons(true);
    setHasUnsavedChanges(true);
  };

  const ColorPicker = ({ value, onChange }: { value?: string; onChange: (color: string) => void }) => {
    const colors = ['blue', 'green', 'red', 'purple', 'orange', 'pink', 'indigo', 'teal'];
    
    return (
      <div className="flex space-x-1">
        {colors.map(color => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full bg-${color}-500 border-2 ${
              value === color ? 'border-gray-800' : 'border-transparent'
            } hover:scale-110 transition-transform`}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Layout className="h-5 w-5" />
            <span>Workspace Layout Customizer</span>
          </DialogTitle>
          <DialogDescription>
            Customize your workspace layout, colors, and behavior to match your workflow.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="layout" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <div className="mt-4 h-96">
            <TabsContent value="layout" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Sidebar Sections</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Drag to reorder, toggle visibility, and customize colors for each section.
                    </p>

                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="sections">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                          >
                            {sections
                              .sort((a, b) => a.order - b.order)
                              .map((section, index) => {
                                const IconComponent = section.icon;
                                return (
                                  <Draggable
                                    key={section.id}
                                    draggableId={section.id}
                                    index={index}
                                    isDragDisabled={!section.customizable}
                                  >
                                    {(provided, snapshot) => (
                                      <Card
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`transition-all duration-200 ${
                                          snapshot.isDragging ? 'shadow-lg rotate-1' : ''
                                        } ${!section.customizable ? 'opacity-60' : ''}`}
                                      >
                                        <CardContent className="p-3">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                              {section.customizable && (
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className="cursor-grab hover:cursor-grabbing text-gray-400"
                                                >
                                                  <GripVertical className="h-4 w-4" />
                                                </div>
                                              )}
                                              
                                              <IconComponent className="h-4 w-4" />
                                              <span className="font-medium">{section.name}</span>
                                              
                                              {!section.customizable && (
                                                <Badge variant="outline" className="text-xs">Core</Badge>
                                              )}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                              {section.customizable && (
                                                <>
                                                  <ColorPicker
                                                    value={section.color}
                                                    onChange={(color) => updateSectionColor(section.id, color)}
                                                  />
                                                  
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => toggleSectionVisibility(section.id)}
                                                  >
                                                    {section.visible ? (
                                                      <Eye className="h-4 w-4" />
                                                    ) : (
                                                      <EyeOff className="h-4 w-4" />
                                                    )}
                                                  </Button>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </Draggable>
                                );
                              })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-3">Sidebar Width</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Width: {sidebarWidth[0]}px</Label>
                        <Badge variant="outline">{sidebarWidth[0] < 250 ? 'Compact' : sidebarWidth[0] > 350 ? 'Wide' : 'Normal'}</Badge>
                      </div>
                      <Slider
                        value={sidebarWidth}
                        onValueChange={(value) => {
                          setSidebarWidth(value);
                          setHasUnsavedChanges(true);
                        }}
                        max={400}
                        min={200}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="themes" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Color Themes</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Choose a color theme that matches your style and improves your productivity.
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                      {WORKSPACE_THEMES.map((theme) => (
                        <Card
                          key={theme.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedTheme === theme.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => applyTheme(theme.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{theme.name}</h4>
                                <div className="flex space-x-2 mt-2">
                                  <div 
                                    className="w-4 h-4 rounded-full border" 
                                    style={{ backgroundColor: theme.primary }}
                                  />
                                  <div 
                                    className="w-4 h-4 rounded-full border" 
                                    style={{ backgroundColor: theme.secondary }}
                                  />
                                  <div 
                                    className="w-4 h-4 rounded-full border" 
                                    style={{ backgroundColor: theme.accent }}
                                  />
                                  <div 
                                    className="w-4 h-4 rounded-full border" 
                                    style={{ backgroundColor: theme.sidebar }}
                                  />
                                </div>
                              </div>
                              
                              {selectedTheme === theme.id && (
                                <Badge>Current</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="behavior" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Sidebar Behavior</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Compact Mode</Label>
                          <p className="text-sm text-gray-500">Reduce spacing and padding for more content</p>
                        </div>
                        <Switch
                          checked={compactMode}
                          onCheckedChange={(checked) => {
                            setCompactMode(checked);
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Auto-hide Sidebar</Label>
                          <p className="text-sm text-gray-500">Automatically hide sidebar when not in use</p>
                        </div>
                        <Switch
                          checked={autoHide}
                          onCheckedChange={(checked) => {
                            setAutoHide(checked);
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Icons</Label>
                          <p className="text-sm text-gray-500">Display icons next to section names</p>
                        </div>
                        <Switch
                          checked={showIcons}
                          onCheckedChange={(checked) => {
                            setShowIcons(checked);
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-3">Reset Options</h3>
                    <Button
                      variant="outline"
                      onClick={resetToDefaults}
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview" className="h-full">
              <div className="h-full border rounded-lg bg-gray-50 p-4">
                <div className="flex h-full">
                  {/* Mock Sidebar Preview */}
                  <div 
                    className="bg-slate-800 text-white rounded-lg p-3"
                    style={{ width: `${Math.max(sidebarWidth[0] / 4, 60)}px` }}
                  >
                    <div className="space-y-2">
                      {sections
                        .filter(s => s.visible)
                        .sort((a, b) => a.order - b.order)
                        .map((section) => {
                          const IconComponent = section.icon;
                          return (
                            <div 
                              key={section.id}
                              className={`flex items-center space-x-2 p-1 rounded text-xs ${
                                compactMode ? 'py-0.5' : 'py-1'
                              }`}
                            >
                              {showIcons && <IconComponent className="h-3 w-3" />}
                              <span className="truncate">{section.name}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  
                  {/* Mock Content Area */}
                  <div className="flex-1 bg-white rounded-lg ml-2 p-4">
                    <div className="text-center text-gray-500">
                      <Monitor className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Preview of your customized workspace</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600">
                Unsaved changes
              </Badge>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={saveSettings} disabled={!hasUnsavedChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}