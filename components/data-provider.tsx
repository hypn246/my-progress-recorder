"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { RecordRow, Settings } from "@/lib/types";

type DataContextValue = {
  records: RecordRow[];
  settings: Settings;
  reload: () => Promise<void>;
};

const DataContext = createContext<DataContextValue | null>(null);

export function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error("useData must be used inside DataProvider");
  return value;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [records, setRecords] = useState<RecordRow[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const [r, s] = await Promise.all([fetch("/api/records"), fetch("/api/settings")]);
      if (r.status === 401 || s.status === 401) {
        router.replace("/login");
        return;
      }
      if (!r.ok || !s.ok) throw new Error("Request failed");
      setRecords(await r.json());
      setSettings(await s.json());
      setError("");
    } catch {
      setError("Could not load your data. Check DATABASE_URL and that the tables exist.");
    }
  }, [router]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={reload}>Try again</Button>
      </div>
    );
  }

  if (!records || !settings) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <DataContext.Provider value={{ records, settings, reload }}>{children}</DataContext.Provider>;
}
