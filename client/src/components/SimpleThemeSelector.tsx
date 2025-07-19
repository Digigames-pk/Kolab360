import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check } from "lucide-react";
import { useTheme } from "./UnifiedThemeProvider";

export function SimpleThemeSelector() {
  const { theme: currentTheme, setTheme, availableThemes } = useTheme();

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
            {availableThemes.map((themeOption) => (
              <div
                key={themeOption.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent ${
                  currentTheme === themeOption.id ? 'border-primary bg-accent' : 'border-border'
                }`}
                onClick={() => setTheme(themeOption.id)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: themeOption.primary }}
                  />
                  <div>
                    <p className="font-medium text-sm">{themeOption.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Primary color theme
                    </p>
                  </div>
                </div>
                {currentTheme === themeOption.id && (
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