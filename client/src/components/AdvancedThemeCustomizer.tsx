import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Palette, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Eye,
  Brush,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Check
} from 'lucide-react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  popover: string;
  card: string;
  border: string;
  input: string;
  ring: string;
  destructive: string;
  warning: string;
  success: string;
}

interface WorkspaceTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  darkMode: boolean;
  gradients: {
    primary: string;
    secondary: string;
    background: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  spacing: {
    compact: boolean;
    borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  };
  effects: {
    glassmorphism: boolean;
    animations: boolean;
    shadows: 'none' | 'soft' | 'medium' | 'strong';
  };
}

const presetThemes: WorkspaceTheme[] = [
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#38bdf8',
      background: '#f0f9ff',
      foreground: '#0c4a6e',
      muted: '#e0f2fe',
      mutedForeground: '#0369a1',
      popover: '#ffffff',
      card: '#ffffff',
      border: '#bae6fd',
      input: '#e0f2fe',
      ring: '#0ea5e9',
      destructive: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    darkMode: false,
    gradients: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      secondary: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
    },
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Poppins',
      fontSize: 'medium'
    },
    spacing: {
      compact: false,
      borderRadius: 'medium'
    },
    effects: {
      glassmorphism: true,
      animations: true,
      shadows: 'soft'
    }
  },
  {
    id: 'forest-zen',
    name: 'Forest Zen',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#34d399',
      background: '#f0fdf4',
      foreground: '#064e3b',
      muted: '#dcfce7',
      mutedForeground: '#166534',
      popover: '#ffffff',
      card: '#ffffff',
      border: '#bbf7d0',
      input: '#dcfce7',
      ring: '#059669',
      destructive: '#dc2626',
      warning: '#d97706',
      success: '#16a34a'
    },
    darkMode: false,
    gradients: {
      primary: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      secondary: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
    },
    typography: {
      fontFamily: 'Source Sans Pro',
      headingFont: 'Merriweather',
      fontSize: 'medium'
    },
    spacing: {
      compact: false,
      borderRadius: 'large'
    },
    effects: {
      glassmorphism: false,
      animations: true,
      shadows: 'medium'
    }
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#fb923c',
      background: '#fff7ed',
      foreground: '#9a3412',
      muted: '#fed7aa',
      mutedForeground: '#c2410c',
      popover: '#ffffff',
      card: '#ffffff',
      border: '#fdba74',
      input: '#fed7aa',
      ring: '#ea580c',
      destructive: '#dc2626',
      warning: '#d97706',
      success: '#16a34a'
    },
    darkMode: false,
    gradients: {
      primary: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
      secondary: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)'
    },
    typography: {
      fontFamily: 'Roboto',
      headingFont: 'Playfair Display',
      fontSize: 'medium'
    },
    spacing: {
      compact: false,
      borderRadius: 'medium'
    },
    effects: {
      glassmorphism: true,
      animations: true,
      shadows: 'strong'
    }
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: '#0f0f23',
      foreground: '#e2e8f0',
      muted: '#1e1b3a',
      mutedForeground: '#94a3b8',
      popover: '#1a1a2e',
      card: '#16213e',
      border: '#2d3748',
      input: '#1e1b3a',
      ring: '#8b5cf6',
      destructive: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    darkMode: true,
    gradients: {
      primary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      secondary: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1e1b3a 100%)'
    },
    typography: {
      fontFamily: 'Space Grotesk',
      headingFont: 'Orbitron',
      fontSize: 'medium'
    },
    spacing: {
      compact: false,
      borderRadius: 'small'
    },
    effects: {
      glassmorphism: true,
      animations: true,
      shadows: 'strong'
    }
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    colors: {
      primary: '#1e40af',
      secondary: '#1d4ed8',
      accent: '#3b82f6',
      background: '#f8fafc',
      foreground: '#1e293b',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      popover: '#ffffff',
      card: '#ffffff',
      border: '#e2e8f0',
      input: '#f1f5f9',
      ring: '#1e40af',
      destructive: '#dc2626',
      warning: '#d97706',
      success: '#16a34a'
    },
    darkMode: false,
    gradients: {
      primary: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
      secondary: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    },
    typography: {
      fontFamily: 'Open Sans',
      headingFont: 'Montserrat',
      fontSize: 'medium'
    },
    spacing: {
      compact: true,
      borderRadius: 'small'
    },
    effects: {
      glassmorphism: false,
      animations: false,
      shadows: 'soft'
    }
  }
];

interface AdvancedThemeCustomizerProps {
  currentTheme: WorkspaceTheme;
  onThemeChange: (theme: WorkspaceTheme) => void;
  workspaceId: string;
}

export function AdvancedThemeCustomizer({ currentTheme, onThemeChange, workspaceId }: AdvancedThemeCustomizerProps) {
  const [selectedTheme, setSelectedTheme] = useState<WorkspaceTheme>(currentTheme);
  const [customTheme, setCustomTheme] = useState<WorkspaceTheme>({ ...currentTheme });
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('presets');

  // Apply theme to document
  const applyTheme = (theme: WorkspaceTheme) => {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });

    // Apply dark mode class
    if (theme.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply typography
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--heading-font', theme.typography.headingFont);
    
    // Apply spacing
    const radiusMap = {
      none: '0px',
      small: '4px',
      medium: '8px',
      large: '12px',
      full: '9999px'
    };
    root.style.setProperty('--radius', radiusMap[theme.spacing.borderRadius]);
  };

  const handleThemeSelect = (theme: WorkspaceTheme) => {
    setSelectedTheme(theme);
    setCustomTheme({ ...theme });
    if (previewMode) {
      applyTheme(theme);
    }
  };

  const handleCustomColorChange = (colorKey: keyof ThemeColors, value: string) => {
    const updatedTheme = {
      ...customTheme,
      colors: {
        ...customTheme.colors,
        [colorKey]: value
      }
    };
    setCustomTheme(updatedTheme);
    if (previewMode) {
      applyTheme(updatedTheme);
    }
  };

  const handleSaveTheme = () => {
    applyTheme(selectedTheme);
    onThemeChange(selectedTheme);
    localStorage.setItem(`workspace-theme-${workspaceId}`, JSON.stringify(selectedTheme));
  };

  const handleResetTheme = () => {
    const defaultTheme = presetThemes[0];
    setSelectedTheme(defaultTheme);
    setCustomTheme({ ...defaultTheme });
    applyTheme(defaultTheme);
  };

  const exportTheme = () => {
    const dataStr = JSON.stringify(selectedTheme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${selectedTheme.name.toLowerCase().replace(/ /g, '-')}-theme.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const theme = JSON.parse(e.target?.result as string);
          setSelectedTheme(theme);
          setCustomTheme({ ...theme });
        } catch (error) {
          console.error('Invalid theme file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Palette className="h-4 w-4" />
          Customize Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Advanced Theme Customizer
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {presetThemes.map((theme) => (
                  <Card 
                    key={theme.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTheme.id === theme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleThemeSelect(theme)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        {theme.name}
                        {selectedTheme.id === theme.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-1 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {theme.darkMode ? 'Dark' : 'Light'} • {theme.typography.fontFamily}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(customTheme.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={value}
                        onChange={(e) => handleCustomColorChange(key as keyof ThemeColors, e.target.value)}
                        className="w-12 h-8 p-1 border rounded"
                      />
                      <Input
                        value={value}
                        onChange={(e) => handleCustomColorChange(key as keyof ThemeColors, e.target.value)}
                        className="flex-1 text-xs"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select 
                    value={customTheme.typography.fontFamily}
                    onValueChange={(value) => setCustomTheme({
                      ...customTheme,
                      typography: { ...customTheme.typography, fontFamily: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Heading Font</Label>
                  <Select 
                    value={customTheme.typography.headingFont}
                    onValueChange={(value) => setCustomTheme({
                      ...customTheme,
                      typography: { ...customTheme.typography, headingFont: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                      <SelectItem value="Merriweather">Merriweather</SelectItem>
                      <SelectItem value="Orbitron">Orbitron</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select 
                    value={customTheme.typography.fontSize}
                    onValueChange={(value: 'small' | 'medium' | 'large') => setCustomTheme({
                      ...customTheme,
                      typography: { ...customTheme.typography, fontSize: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Select 
                    value={customTheme.spacing.borderRadius}
                    onValueChange={(value: any) => setCustomTheme({
                      ...customTheme,
                      spacing: { ...customTheme.spacing, borderRadius: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle dark theme appearance</p>
                  </div>
                  <Button
                    variant={customTheme.darkMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCustomTheme({
                      ...customTheme,
                      darkMode: !customTheme.darkMode
                    })}
                  >
                    {customTheme.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Glassmorphism Effects</Label>
                    <p className="text-sm text-muted-foreground">Translucent glass-like effects</p>
                  </div>
                  <Button
                    variant={customTheme.effects.glassmorphism ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCustomTheme({
                      ...customTheme,
                      effects: { ...customTheme.effects, glassmorphism: !customTheme.effects.glassmorphism }
                    })}
                  >
                    {customTheme.effects.glassmorphism ? "On" : "Off"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">Smooth transitions and animations</p>
                  </div>
                  <Button
                    variant={customTheme.effects.animations ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCustomTheme({
                      ...customTheme,
                      effects: { ...customTheme.effects, animations: !customTheme.effects.animations }
                    })}
                  >
                    {customTheme.effects.animations ? "On" : "Off"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Shadow Intensity</Label>
                  <Select 
                    value={customTheme.effects.shadows}
                    onValueChange={(value: any) => setCustomTheme({
                      ...customTheme,
                      effects: { ...customTheme.effects, shadows: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="soft">Soft</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Exit Preview' : 'Preview'}
            </Button>
            
            <Button variant="outline" size="sm" onClick={exportTheme}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <label>
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importTheme}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleResetTheme}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSaveTheme}>
              <Save className="h-4 w-4 mr-2" />
              Apply Theme
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}