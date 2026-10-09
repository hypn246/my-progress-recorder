"use client";

import { useEffect, useState } from "react";
import { PaletteIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DEFAULT_THEME, THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(DEFAULT_THEME);

  useEffect(() => {
    setCurrent(document.documentElement.dataset.theme || DEFAULT_THEME);
  }, []);

  function choose(id: string) {
    document.documentElement.dataset.theme = id;
    localStorage.setItem("theme", id);
    setCurrent(id);
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Change theme">
        <PaletteIcon className="h-5 w-5" />
      </Button>
      {open && (
        <Dialog title="Theme" onClose={() => setOpen(false)}>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => choose(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-sm",
                  current === t.id ? "border-primary" : "border-border"
                )}
              >
                <span
                  data-theme={t.id}
                  className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-background"
                >
                  <span className="h-5 w-5 rounded-full bg-primary" />
                </span>
                {t.name}
              </button>
            ))}
          </div>
        </Dialog>
      )}
    </>
  );
}
