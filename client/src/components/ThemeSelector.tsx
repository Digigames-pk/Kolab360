import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check } from "lucide-react";

const themes = [
  {
    id: "dark-purple",
    name: "Dark Purple",
    preview: "bg-gradient-to-r from-purple-900 to-indigo-900",
    colors: {
      primary: "261 83% 58%",
      secondary: "262 83% 15%",
      background: "224 71% 4%",
      foreground: "213 31% 91%",
      muted: "223 47% 11%",
      accent: "262 83% 15%",
      border: "216 34% 17%",
    }
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    preview: "bg-gradient-to-r from-blue-900 to-cyan-800",
    colors: {
      primary: "200 98% 39%",
      secondary: "200 50% 15%",
      background: "200 50% 3%",
      foreground: "200 20% 95%",
      muted: "200 50% 10%",
      accent: "200 50% 15%",
      border: "200 30% 18%",
    }
  },
  {
    id: "forest-green",
    name: "Forest Green",
    preview: "bg-gradient-to-r from-green-900 to-emerald-800",
    colors: {
      primary: "142 76% 36%",
      secondary: "142 30% 15%",
      background: "140 40% 3%",
      foreground: "140 20% 95%",
      muted: "140 30% 10%",
      accent: "142 30% 15%",
      border: "140 30% 18%",
    }
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    preview: "bg-gradient-to-r from-orange-900 to-red-800",
    colors: {
      primary: "24 95% 53%",
      secondary: "24 50% 15%",
      background: "20 40% 3%",
      foreground: "20 20% 95%",
      muted: "20 30% 10%",
      accent: "24 50% 15%",
      border: "20 30% 18%",
    }
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    preview: "bg-gradient-to-r from-slate-900 to-blue-900",
    colors: {
      primary: "217 91% 60%",
      secondary: "217 32% 17%",
      background: "222 84% 5%",
      foreground: "213 31% 91%",
      muted: "217 32% 17%",
      accent: "217 32% 17%",
      border: "217 32% 17%",
    }
  }
];

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark-purple";
  });

  const applyTheme = (theme: typeof themes[0]) => {
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    localStorage.setItem("theme", theme.id);
    setCurrentTheme(theme.id);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Choose your theme</h4>
          <div className="grid grid-cols-1 gap-2">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                  currentTheme === theme.id ? "border-primary bg-muted/30" : "border-border"
                }`}
                onClick={() => applyTheme(theme)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full ${theme.preview}`} />
                  <span className="text-sm font-medium">{theme.name}</span>
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