import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = {
  "dark-purple": {
    name: "Dark Purple",
    colors: {
      "--primary": "hsl(265, 69%, 58%)",
      "--primary-foreground": "hsl(210, 40%, 98%)",
      "--background": "hsl(0, 0%, 100%)",
      "--foreground": "hsl(222.2, 84%, 4.9%)",
    }
  },
  "ocean-blue": {
    name: "Ocean Blue",
    colors: {
      "--primary": "hsl(215, 80%, 50%)",
      "--primary-foreground": "hsl(210, 40%, 98%)",
      "--background": "hsl(0, 0%, 100%)",
      "--foreground": "hsl(222.2, 84%, 4.9%)",
    }
  },
  "forest-green": {
    name: "Forest Green",
    colors: {
      "--primary": "hsl(145, 63%, 42%)",
      "--primary-foreground": "hsl(210, 40%, 98%)",
      "--background": "hsl(0, 0%, 100%)",
      "--foreground": "hsl(222.2, 84%, 4.9%)",
    }
  },
  "sunset-orange": {
    name: "Sunset Orange",
    colors: {
      "--primary": "hsl(24, 95%, 53%)",
      "--primary-foreground": "hsl(210, 40%, 98%)",
      "--background": "hsl(0, 0%, 100%)",
      "--foreground": "hsl(222.2, 84%, 4.9%)",
    }
  },
  "midnight-blue": {
    name: "Midnight Blue",
    colors: {
      "--primary": "hsl(224, 76%, 45%)",
      "--primary-foreground": "hsl(210, 40%, 98%)",
      "--background": "hsl(0, 0%, 100%)",
      "--foreground": "hsl(222.2, 84%, 4.9%)",
    }
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark-purple";
  });

  const applyTheme = (themeName: string) => {
    const themeConfig = themes[themeName as keyof typeof themes];
    if (!themeConfig) return;

    const root = document.documentElement;
    Object.entries(themeConfig.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Apply theme to body classes for better coverage
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeName}`);

    localStorage.setItem("theme", themeName);
    setTheme(themeName);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}