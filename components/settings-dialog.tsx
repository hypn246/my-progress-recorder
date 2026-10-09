"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Settings } from "@/lib/types";

type Props = {
  settings: Settings;
  onClose: () => void;
  onSaved: () => void;
};

export function SettingsDialog({ settings, onClose, onSaved }: Props) {
  const [start, setStart] = useState(settings.start_date);
  const [target, setTarget] = useState(settings.target_date);
  const [hours, setHours] = useState(String(settings.target_hours));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_date: start, target_date: target, target_hours: Number(hours) }),
    });
    if (res.ok) {
      onSaved();
      onClose();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error || "Could not save");
    setBusy(false);
  }

  return (
    <Dialog title="Target" onClose={onClose}>
      <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="start">Start day</Label>
            <Input id="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target">Target day</Label>
            <Input id="target" type="date" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hours">Target hours to work</Label>
            <Input
              id="hours"
              type="number"
              inputMode="decimal"
              min="1"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" onClick={save} disabled={busy}>
            Save target
          </Button>
      </div>
    </Dialog>
  );
}
