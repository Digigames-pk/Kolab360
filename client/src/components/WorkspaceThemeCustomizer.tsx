import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Palette, 
  Paintbrush, 
  Wand2, 
  Download, 
  Upload, 
  Share2, 
  RotateCcw, 
  Eye, 
  Save,
  Sparkles,
  Sunset,
  Moon,
  Sun,
  Waves,
  Mountain,
  Leaf,
  Coffee,
  Cherry,
  Globe,
  Zap,
  Heart,
  Star,
  Flame,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

interface WorkspaceTheme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  presets: {
    borderRadius: number;
    spacing: number;
    shadows: boolean;
    animations: boolean;
    glassEffect: boolean;
  };
  created: Date;
  author?: string;
  isPublic: boolean;
  likes: number;
  tags: string[];
}

const predefinedThemes: WorkspaceTheme[] = [
  {
    id: "midnight-purple",
    name: "Midnight Purple",
    description: "Deep purple tones for night owls",
    colors: {
      primary: "#8B5CF6",
      secondary: "#A78BFA",
      accent: "#EC4899",
      background: "#0F0F1A",
      surface: "#1A1B2E",
      text: "#E5E7EB",
      muted: "#6B7280",
      border: "#374151"
    },
    presets: {
      borderRadius: 12,
      spacing: 16,
      shadows: true,
      animations: true,
      glassEffect: true
    },
    created: new Date(),
    author: "Kolab360",
    isPublic: true,
    likes: 127,
    tags: ["dark", "purple", "professional"]
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    description: "Calming blues inspired by the sea",
    colors: {
      primary: "#0EA5E9",
      secondary: "#38BDF8",
      accent: "#10B981",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#1F2937",
      muted: "#6B7280",
      border: "#E5E7EB"
    },
    presets: {
      borderRadius: 8,
      spacing: 12,
      shadows: false,
      animations: true,
      glassEffect: false
    },
    created: new Date(),
    author: "Design Team",
    isPublic: true,
    likes: 89,
    tags: ["light", "blue", "minimal"]
  },
  {
    id: "forest-green",
    name: "Forest Green",
    description: "Natural greens for productivity",
    colors: {
      primary: "#059669",
      secondary: "#10B981",
      accent: "#F59E0B",
      background: "#F9FAFB",
      surface: "#FFFFFF",
      text: "#111827",
      muted: "#6B7280",
      border: "#D1D5DB"
    },
    presets: {
      borderRadius: 16,
      spacing: 20,
      shadows: true,
      animations: false,
      glassEffect: true
    },
    created: new Date(),
    author: "Nature Lover",
    isPublic: true,
    likes: 156,
    tags: ["light", "green", "nature"]
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    description: "Warm oranges for creative energy",
    colors: {
      primary: "#EA580C",
      secondary: "#FB923C",
      accent: "#DC2626",
      background: "#FFF7ED",
      surface: "#FFFFFF",
      text: "#1C1917",
      muted: "#78716C",
      border: "#E7E5E4"
    },
    presets: {
      borderRadius: 20,
      spacing: 18,
      shadows: true,
      animations: true,
      glassEffect: false
    },
    created: new Date(),
    author: "Creative Studio",
    isPublic: true,
    likes: 203,
    tags: ["light", "orange", "creative"]
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    description: "Elegant pinks with golden accents",
    colors: {
      primary: "#EC4899",
      secondary: "#F472B6",
      accent: "#F59E0B",
      background: "#FDF2F8",
      surface: "#FFFFFF",
      text: "#1F2937",
      muted: "#6B7280",
      border: "#F3E8FF"
    },
    presets: {
      borderRadius: 14,
      spacing: 16,
      shadows: true,
      animations: true,
      glassEffect: true
    },
    created: new Date(),
    author: "Luxury Brand",
    isPublic: true,
    likes: 175,
    tags: ["light", "pink", "elegant"]
  }
];

export function WorkspaceThemeCustomizer({ 
  isOpen, 
  onClose,
  onThemeChange
}: {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (theme: WorkspaceTheme) => void;
}) {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("presets");
  const [currentTheme, setCurrentTheme] = useState<WorkspaceTheme>(predefinedThemes[0]);
  const [customTheme, setCustomTheme] = useState<WorkspaceTheme>({
    ...predefinedThemes[0],
    id: "custom",
    name: "My Custom Theme",
    author: user?.firstName + " " + user?.lastName
  });
  const [showPreview, setShowPreview] = useState(false);
  const [colorPicker, setColorPicker] = useState<string | null>(null);

  const generateRandomTheme = () => {
    const colors = [
      "#8B5CF6", "#EC4899", "#0EA5E9", "#10B981", "#F59E0B", 
      "#EF4444", "#8B5A2B", "#6366F1", "#059669", "#DC2626"
    ];
    
    const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
    
    const newTheme: WorkspaceTheme = {
      ...customTheme,
      id: "generated-" + Date.now(),
      name: "Generated Theme",
      colors: {
        ...customTheme.colors,
        primary: randomColor(),
        secondary: randomColor(),
        accent: randomColor()
      },
      presets: {
        borderRadius: Math.floor(Math.random() * 20) + 8,
        spacing: Math.floor(Math.random() * 16) + 12,
        shadows: Math.random() > 0.5,
        animations: Math.random() > 0.3,
        glassEffect: Math.random() > 0.6
      }
    };
    
    setCustomTheme(newTheme);
    setCurrentTheme(newTheme);
  };

  const applyThemePreview = (theme: WorkspaceTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--surface', theme.colors.surface);
    root.style.setProperty('--text', theme.colors.text);
    root.style.setProperty('--muted', theme.colors.muted);
    root.style.setProperty('--border', theme.colors.border);
    root.style.setProperty('--radius', theme.presets.borderRadius + 'px');
  };

  const resetToDefault = () => {
    const defaultTheme = predefinedThemes[0];
    setCurrentTheme(defaultTheme);
    setCustomTheme(defaultTheme);
    applyThemePreview(defaultTheme);
  };

  const PresetThemes = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predefinedThemes.map((theme) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                currentTheme.id === theme.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setCurrentTheme(theme);
                applyThemePreview(theme);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{theme.likes}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Color Preview */}
                <div className="flex space-x-1 mb-3">
                  {Object.entries(theme.colors).slice(0, 4).map(([key, color]) => (
                    <div
                      key={key}
                      className="w-8 h-8 rounded border border-border/50"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {theme.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Author & Actions */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>by {theme.author}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onThemeChange(theme);
                      onClose();
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Create Your Own</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Design a custom theme that perfectly matches your brand and style
          </p>
          <Button onClick={() => setSelectedTab("custom")}>
            <Wand2 className="h-4 w-4 mr-2" />
            Start Customizing
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const CustomThemeEditor = () => (
    <div className="space-y-6">
      {/* Theme Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Paintbrush className="h-5 w-5" />
            <span>Theme Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme-name">Theme Name</Label>
              <Input
                id="theme-name"
                value={customTheme.name}
                onChange={(e) => setCustomTheme({ ...customTheme, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="theme-desc">Description</Label>
              <Input
                id="theme-desc"
                value={customTheme.description}
                onChange={(e) => setCustomTheme({ ...customTheme, description: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Customization */}
      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(customTheme.colors).map(([key, color]) => (
              <div key={key} className="space-y-2">
                <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                <div className="flex space-x-2">
                  <div
                    className="w-12 h-10 rounded border border-border cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => setColorPicker(key)}
                  />
                  <Input
                    value={color}
                    onChange={(e) => {
                      const newColors = { ...customTheme.colors, [key]: e.target.value };
                      const newTheme = { ...customTheme, colors: newColors };
                      setCustomTheme(newTheme);
                      applyThemePreview(newTheme);
                    }}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Design Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Design Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="flex items-center justify-between">
              Border Radius
              <span className="text-sm text-muted-foreground">{customTheme.presets.borderRadius}px</span>
            </Label>
            <Slider
              value={[customTheme.presets.borderRadius]}
              onValueChange={(value) => {
                const newPresets = { ...customTheme.presets, borderRadius: value[0] };
                const newTheme = { ...customTheme, presets: newPresets };
                setCustomTheme(newTheme);
                applyThemePreview(newTheme);
              }}
              min={0}
              max={24}
              step={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="flex items-center justify-between">
              Spacing
              <span className="text-sm text-muted-foreground">{customTheme.presets.spacing}px</span>
            </Label>
            <Slider
              value={[customTheme.presets.spacing]}
              onValueChange={(value) => {
                const newPresets = { ...customTheme.presets, spacing: value[0] };
                setCustomTheme({ ...customTheme, presets: newPresets });
              }}
              min={8}
              max={32}
              step={2}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={customTheme.presets.shadows}
                onCheckedChange={(checked) => {
                  const newPresets = { ...customTheme.presets, shadows: checked };
                  setCustomTheme({ ...customTheme, presets: newPresets });
                }}
              />
              <Label>Drop Shadows</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={customTheme.presets.animations}
                onCheckedChange={(checked) => {
                  const newPresets = { ...customTheme.presets, animations: checked };
                  setCustomTheme({ ...customTheme, presets: newPresets });
                }}
              />
              <Label>Animations</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={customTheme.presets.glassEffect}
                onCheckedChange={(checked) => {
                  const newPresets = { ...customTheme.presets, glassEffect: checked };
                  setCustomTheme({ ...customTheme, presets: newPresets });
                }}
              />
              <Label>Glass Effect</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={generateRandomTheme}>
            <Zap className="h-4 w-4 mr-2" />
            Generate Random
          </Button>
          <Button variant="outline" onClick={resetToDefault}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Theme
          </Button>
          <Button onClick={() => {
            onThemeChange(customTheme);
            onClose();
          }}>
            Apply Theme
          </Button>
        </div>
      </div>
    </div>
  );

  const ThemeGallery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Community Themes</h3>
          <p className="text-sm text-muted-foreground">Discover themes created by other users</p>
        </div>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Share Theme
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predefinedThemes.map((theme) => (
          <Card key={theme.id} className="group hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex space-x-1">
                  {Object.values(theme.colors).slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-border/50"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Badge variant="outline" className="ml-auto">
                  <Star className="h-3 w-3 mr-1" />
                  {theme.likes}
                </Badge>
              </div>
              <CardTitle className="text-base">{theme.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{theme.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">by {theme.author}</span>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button size="sm">Apply</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] overflow-hidden p-0">
        <DialogHeader className="p-6 border-b border-border/50">
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-primary" />
            <span>Workspace Theme Customizer</span>
          </DialogTitle>
          <DialogDescription>
            Personalize your workspace with custom colors, layouts, and design elements
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
            <div className="border-b border-border/50 px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="presets" className="flex items-center space-x-2">
                  <Crown className="h-4 w-4" />
                  <span>Preset Themes</span>
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center space-x-2">
                  <Wand2 className="h-4 w-4" />
                  <span>Custom Editor</span>
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Theme Gallery</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-12rem)]">
              <TabsContent value="presets" className="mt-0">
                <PresetThemes />
              </TabsContent>
              <TabsContent value="custom" className="mt-0">
                <CustomThemeEditor />
              </TabsContent>
              <TabsContent value="gallery" className="mt-0">
                <ThemeGallery />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer with Preview Toggle */}
        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showPreview}
                  onCheckedChange={setShowPreview}
                />
                <Label>Live Preview</Label>
              </div>
              <Badge variant="outline">
                Theme: {currentTheme.name}
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setSelectedTab("custom")}>
                Customize
              </Button>
              <Button onClick={() => {
                onThemeChange(currentTheme);
                onClose();
              }}>
                Apply & Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}