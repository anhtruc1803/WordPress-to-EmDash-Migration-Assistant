"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@console/components/ui/button";
import { useEffect, useState } from "react";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="flex items-center justify-between h-14 border-b bg-card px-6 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          WordPress → EmDash Migration Console
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {mounted && (
          <div className="flex items-center border rounded-lg p-0.5 bg-muted">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${theme === 'light' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setTheme("light")}
              aria-label="Light mode"
            >
              <Sun className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${theme === 'dark' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setTheme("dark")}
              aria-label="Dark mode"
            >
              <Moon className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${theme === 'system' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setTheme("system")}
              aria-label="System mode"
            >
              <Monitor className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
