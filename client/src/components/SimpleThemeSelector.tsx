import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check } from "lucide-react";

const themes = [
  {
    id: "dark-purple",
    name: "Dark Purple",
    primary: "#8b5cf6",
    preview: "bg-purple-500"
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue", 
    primary: "#3b82f6",
    preview: "bg-blue-500"
  },
  {
    id: "forest-green",
    name: "Forest Green",
    primary: "#10b981",
    preview: "bg-emerald-500"
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    primary: "#f97316",
    preview: "bg-orange-500"
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    primary: "#1e40af",
    preview: "bg-blue-700"
  }
];

export function SimpleThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark-purple";
  });

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply primary color to CSS variables
    root.style.setProperty('--primary-color', theme.primary);
    
    // Apply to button styles directly
    const buttons = document.querySelectorAll('[data-theme-target="primary"]');
    buttons.forEach(button => {
      (button as HTMLElement).style.backgroundColor = theme.primary;
    });

    localStorage.setItem("theme", themeId);
    setCurrentTheme(themeId);
  };

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const currentThemeData = themes.find(t => t.id === currentTheme);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Choose Theme</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a color theme for your workspace
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent ${
                  currentTheme === theme.id ? 'border-primary bg-accent' : 'border-border'
                }`}
                onClick={() => applyTheme(theme.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full ${theme.preview}`} />
                  <span className="font-medium">{theme.name}</span>
                </div>
                {currentTheme === theme.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}