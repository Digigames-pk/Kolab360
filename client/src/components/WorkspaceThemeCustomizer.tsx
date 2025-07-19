import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Palette, Save, RotateCcw, Eye, Monitor } from 'lucide-react';

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

interface WorkspaceThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (theme: WorkspaceTheme) => void;
  workspaceId?: number;
}

const predefinedThemes: WorkspaceTheme[] = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    background: '#f8fafc',
    sidebar: '#e2e8f0',
    text: '#1e293b'
  },
  {
    id: 'elegant-dark',
    name: 'Elegant Dark',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#a78bfa',
    background: '#0f172a',
    sidebar: '#1e293b',
    text: '#f1f5f9'
  },
  {
    id: 'warm-neutral',
    name: 'Warm Neutral',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#34d399',
    background: '#fefefe',
    sidebar: '#f3f4f6',
    text: '#374151'
  },
  {
    id: 'modern-purple',
    name: 'Modern Purple',
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    accent: '#a78bfa',
    background: '#faf5ff',
    sidebar: '#f3e8ff',
    text: '#581c87'
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    primary: '#475569',
    secondary: '#64748b',
    accent: '#94a3b8',
    background: '#ffffff',
    sidebar: '#f1f5f9',
    text: '#334155'
  }
];

export function WorkspaceThemeCustomizer({
  isOpen,
  onClose,
  onThemeChange,
  workspaceId = 1
}: WorkspaceThemeCustomizerProps) {
  const [selectedTheme, setSelectedTheme] = useState<WorkspaceTheme>(predefinedThemes[0]);
  const [customTheme, setCustomTheme] = useState<WorkspaceTheme>({
    id: 'custom',
    name: 'Custom Theme',
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    accent: '#c084fc',
    background: '#1f2937',
    sidebar: '#111827',
    text: '#f9fafb'
  });
  const [activeTab, setActiveTab] = useState('predefined');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();

  const handlePreview = () => {
    setIsPreviewMode(true);
    const themeToApply = activeTab === 'predefined' ? selectedTheme : customTheme;
    
    // Apply theme changes for preview
    document.documentElement.style.setProperty('--primary', themeToApply.primary);
    document.documentElement.style.setProperty('--secondary', themeToApply.secondary);
    document.documentElement.style.setProperty('--accent', themeToApply.accent);
    document.documentElement.style.setProperty('--background', themeToApply.background);
    document.documentElement.style.setProperty('--sidebar', themeToApply.sidebar);
    document.documentElement.style.setProperty('--text', themeToApply.text);
    
    toast({
      title: "Preview Applied",
      description: "Theme preview is now active. Click 'Save Changes' to make it permanent.",
    });
  };

  const handleSave = () => {
    const themeToSave = activeTab === 'predefined' ? selectedTheme : customTheme;
    
    // Save theme to workspace settings
    const workspaceThemes = JSON.parse(localStorage.getItem('workspaceThemes') || '{}');
    workspaceThemes[workspaceId] = themeToSave;
    localStorage.setItem('workspaceThemes', JSON.stringify(workspaceThemes));
    
    // Apply the theme permanently
    onThemeChange(themeToSave);
    
    toast({
      title: "Theme Saved",
      description: `${themeToSave.name} has been applied to this workspace.`,
    });
    
    setIsPreviewMode(false);
    onClose();
  };

  const handleCancel = () => {
    if (isPreviewMode) {
      // Reset to original theme
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--secondary');
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--background');
      document.documentElement.style.removeProperty('--sidebar');
      document.documentElement.style.removeProperty('--text');
      setIsPreviewMode(false);
    }
    onClose();
  };

  const updateCustomColor = (colorKey: keyof WorkspaceTheme, value: string) => {
    if (colorKey === 'id' || colorKey === 'name') return;
    setCustomTheme(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Workspace Theme Customizer</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Customize your workspace layout, colors, and behavior to match your workflow.
          </p>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Preview Panel */}
          <div className="w-1/3 border-r p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
            </div>
            
            {/* Mock workspace preview */}
            <div className="border rounded-lg overflow-hidden bg-card">
              <div 
                className="h-12 flex items-center px-3 text-white text-sm"
                style={{ 
                  backgroundColor: activeTab === 'predefined' ? selectedTheme.sidebar : customTheme.sidebar 
                }}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Preview of your customized workspace
              </div>
              <div 
                className="h-32 p-3"
                style={{ 
                  backgroundColor: activeTab === 'predefined' ? selectedTheme.background : customTheme.background,
                  color: activeTab === 'predefined' ? selectedTheme.text : customTheme.text
                }}
              >
                <div className="text-xs mb-2">Preview content will appear here</div>
                <div 
                  className="text-xs px-2 py-1 rounded inline-block"
                  style={{ 
                    backgroundColor: activeTab === 'predefined' ? selectedTheme.primary : customTheme.primary,
                    color: '#ffffff'
                  }}
                >
                  Sample element
                </div>
              </div>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="flex-1 p-4 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="predefined">Predefined Themes</TabsTrigger>
                <TabsTrigger value="custom">Custom Theme</TabsTrigger>
              </TabsList>

              <TabsContent value="predefined" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {predefinedThemes.map((theme) => (
                    <Card 
                      key={theme.id}
                      className={`cursor-pointer transition-all ${
                        selectedTheme.id === theme.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTheme(theme)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between">
                          <span>{theme.name}</span>
                          {selectedTheme.id === theme.id && (
                            <Badge variant="default">Selected</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex space-x-2">
                          {Object.entries(theme)
                            .filter(([key]) => !['id', 'name'].includes(key))
                            .map(([key, color]) => (
                              <div
                                key={key}
                                className="w-6 h-6 rounded border border-gray-300"
                                style={{ backgroundColor: color }}
                                title={key}
                              />
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Colors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(customTheme)
                      .filter(([key]) => !['id', 'name'].includes(key))
                      .map(([key, color]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: color }}
                            />
                            <Input
                              type="color"
                              value={color}
                              onChange={(e) => updateCustomColor(key as keyof WorkspaceTheme, e.target.value)}
                              className="w-16 h-8 p-0 border-0"
                            />
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              {isPreviewMode && (
                <Badge variant="secondary">Unsaved changes</Badge>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}