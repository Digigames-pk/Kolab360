import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  availableThemes: ThemeOption[];
}

interface ThemeOption {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
}

const themes: ThemeOption[] = [
  {
    id: "dark-purple",
    name: "Dark Purple",
    primary: "hsl(265, 69%, 58%)",
    secondary: "hsl(262, 83%, 15%)",
    background: "hsl(224, 71%, 4%)",
    foreground: "hsl(213, 31%, 91%)",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue", 
    primary: "hsl(215, 80%, 50%)",
    secondary: "hsl(200, 50%, 15%)",
    background: "hsl(200, 50%, 3%)",
    foreground: "hsl(200, 20%, 95%)",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    primary: "hsl(145, 63%, 42%)",
    secondary: "hsl(142, 30%, 15%)",
    background: "hsl(140, 40%, 3%)",
    foreground: "hsl(140, 20%, 95%)",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    primary: "hsl(24, 95%, 53%)",
    secondary: "hsl(24, 50%, 15%)",
    background: "hsl(20, 40%, 3%)",
    foreground: "hsl(20, 20%, 95%)",
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    primary: "hsl(224, 76%, 45%)",
    secondary: "hsl(217, 32%, 17%)",
    background: "hsl(222, 84%, 5%)",
    foreground: "hsl(213, 31%, 91%)",
  }
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function UnifiedThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || "dark-purple";
  });

  const applyTheme = (themeId: string) => {
    const themeConfig = themes.find(t => t.id === themeId);
    if (!themeConfig) return;

    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--primary', themeConfig.primary);
    root.style.setProperty('--secondary', themeConfig.secondary);
    root.style.setProperty('--background', themeConfig.background);
    root.style.setProperty('--foreground', themeConfig.foreground);
    
    // Also set Tailwind-compatible HSL variables
    root.style.setProperty('--primary-hsl', themeConfig.primary.replace('hsl(', '').replace(')', ''));
    root.style.setProperty('--secondary-hsl', themeConfig.secondary.replace('hsl(', '').replace(')', ''));
    root.style.setProperty('--background-hsl', themeConfig.background.replace('hsl(', '').replace(')', ''));
    root.style.setProperty('--foreground-hsl', themeConfig.foreground.replace('hsl(', '').replace(')', ''));

    // Update body class
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeId}`);

    localStorage.setItem("app-theme", themeId);
    setTheme(themeId);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: applyTheme,
      availableThemes: themes 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a UnifiedThemeProvider');
  }
  return context;
}