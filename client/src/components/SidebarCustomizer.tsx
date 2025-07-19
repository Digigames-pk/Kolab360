import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings2, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Save,
  Layout,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface SidebarSection {
  id: string;
  name: string;
  visible: boolean;
  height: number;
  isResizable: boolean;
}

interface SidebarCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: SidebarSettings) => void;
  currentSettings: SidebarSettings;
}

export interface SidebarSettings {
  sections: {
    quickActions: SidebarSection;
    channels: SidebarSection;
    directMessages: SidebarSection;
  };
  compactMode: boolean;
  showUnreadCounts: boolean;
  showStatusIndicators: boolean;
  sidebarWidth: number;
}

const defaultSettings: SidebarSettings = {
  sections: {
    quickActions: {
      id: 'quickActions',
      name: 'Quick Actions',
      visible: true,
      height: 200,
      isResizable: true
    },
    channels: {
      id: 'channels',
      name: 'Channels',
      visible: true,
      height: 250,
      isResizable: true
    },
    directMessages: {
      id: 'directMessages',
      name: 'Direct Messages',
      visible: true,
      height: 180,
      isResizable: true
    }
  },
  compactMode: false,
  showUnreadCounts: true,
  showStatusIndicators: true,
  sidebarWidth: 280
};

export function SidebarCustomizer({ 
  isOpen, 
  onClose, 
  onSettingsChange, 
  currentSettings 
}: SidebarCustomizerProps) {
  const [settings, setSettings] = useState<SidebarSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const updateSectionVisibility = (sectionId: keyof typeof settings.sections, visible: boolean) => {
    setSettings(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          visible
        }
      }
    }));
  };

  const updateSectionHeight = (sectionId: keyof typeof settings.sections, height: number) => {
    setSettings(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          height
        }
      }
    }));
  };

  const updateGeneralSetting = (key: keyof Omit<SidebarSettings, 'sections'>, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const saveSettings = () => {
    onSettingsChange(settings);
    onClose();
  };

  const visibleSections = Object.values(settings.sections).filter(s => s.visible).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings2 className="h-5 w-5" />
            <span>Customize Sidebar</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Layout className="h-4 w-4" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing and use smaller elements
                  </p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateGeneralSetting('compactMode', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Unread Counts</Label>
                  <p className="text-sm text-muted-foreground">
                    Display notification badges on channels and DMs
                  </p>
                </div>
                <Switch
                  checked={settings.showUnreadCounts}
                  onCheckedChange={(checked) => updateGeneralSetting('showUnreadCounts', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Status Indicators</Label>
                  <p className="text-sm text-muted-foreground">
                    Show online/offline status for users
                  </p>
                </div>
                <Switch
                  checked={settings.showStatusIndicators}
                  onCheckedChange={(checked) => updateGeneralSetting('showStatusIndicators', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Sidebar Width: {settings.sidebarWidth}px</Label>
                <Slider
                  value={[settings.sidebarWidth]}
                  onValueChange={([value]) => updateGeneralSetting('sidebarWidth', value)}
                  min={240}
                  max={400}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Narrow (240px)</span>
                  <span>Wide (400px)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Section Visibility & Heights</span>
                </div>
                <Badge variant="secondary">
                  {visibleSections} of {Object.keys(settings.sections).length} visible
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(settings.sections).map(([key, section]) => (
                <div key={key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {section.visible ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        <Label className="font-medium">{section.name}</Label>
                      </div>
                    </div>
                    <Switch
                      checked={section.visible}
                      onCheckedChange={(checked) => 
                        updateSectionVisibility(key as keyof typeof settings.sections, checked)
                      }
                    />
                  </div>

                  {section.visible && section.isResizable && (
                    <div className="ml-6 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Maximize2 className="h-3 w-3 text-muted-foreground" />
                        <Label className="text-sm">Height: {section.height}px</Label>
                      </div>
                      <Slider
                        value={[section.height]}
                        onValueChange={([value]) => 
                          updateSectionHeight(key as keyof typeof settings.sections, value)
                        }
                        min={120}
                        max={400}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Compact (120px)</span>
                        <span>Spacious (400px)</span>
                      </div>
                    </div>
                  )}

                  {key !== 'directMessages' && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Preview Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Layout className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    Preview Changes
                  </p>
                  <p className="text-xs text-blue-700">
                    Your sidebar customizations will be applied immediately after saving. 
                    You can always reset to defaults or adjust settings later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={saveSettings} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing sidebar settings
export function useSidebarSettings() {
  const [settings, setSettings] = useState<SidebarSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarSettings');
      return saved ? JSON.parse(saved) : defaultSettings;
    }
    return defaultSettings;
  });

  const updateSettings = (newSettings: SidebarSettings) => {
    setSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarSettings', JSON.stringify(newSettings));
    }
  };

  return { settings, updateSettings };
}