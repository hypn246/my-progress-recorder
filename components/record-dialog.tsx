"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toInputValue } from "@/lib/time";
import type { RecordRow } from "@/lib/types";

export type EditTarget = { mode: "add"; day: string } | { mode: "edit"; record: RecordRow };

type Props = {
  target: EditTarget;
  onClose: () => void;
  onSaved: () => void;
};

export function RecordDialog({ target, onClose, onSaved }: Props) {
  const editing = target.mode === "edit";
  const running = target.mode === "edit" && !target.record.check_out;

  const [checkIn, setCheckIn] = useState(
    target.mode === "edit" ? toInputValue(new Date(target.record.check_in)) : `${target.day}T09:00:00`
  );
  const [checkOut, setCheckOut] = useState(
    target.mode === "edit"
      ? target.record.check_out
        ? toInputValue(new Date(target.record.check_out))
        : ""
      : `${target.day}T17:00:00`
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(method: string, url: string, body?: object) {
    setBusy(true);
    setError("");
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) {
      onSaved();
      onClose();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error || "Something went wrong");
    setBusy(false);
  }

  function save() {
    const body = {
      check_in: checkIn ? new Date(checkIn).toISOString() : "",
      check_out: checkOut ? new Date(checkOut).toISOString() : "",
    };
    if (target.mode === "edit") send("PATCH", `/api/records/${target.record.id}`, body);
    else send("POST", "/api/records", body);
  }

  function remove() {
    if (target.mode !== "edit") return;
    if (confirm("Delete this record?")) send("DELETE", `/api/records/${target.record.id}`);
  }

  return (
    <Dialog title={editing ? "Edit record" : "Add record"} onClose={onClose}>
      <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="in">Check in</Label>
            <Input id="in" type="datetime-local" step="1" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="out">Check out</Label>
            <Input id="out" type="datetime-local" step="1" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            {running && <p className="text-xs text-muted-foreground">Leave empty if you are still working.</p>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            {editing && (
              <Button variant="outline" className="text-destructive" onClick={remove} disabled={busy}>
                Delete
              </Button>
            )}
            <Button className="flex-1" onClick={save} disabled={busy}>
              Save record
            </Button>
          </div>
      </div>
    </Dialog>
  );
}
