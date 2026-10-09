"use client";

import { useState } from "react";
import { useData } from "@/components/data-provider";
import { useNow } from "@/components/use-now";
import { RecordDialog, type EditTarget } from "@/components/record-dialog";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { PencilIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DAY, dayKey, hms, parseKey, recordMs, timeStr } from "@/lib/time";
import type { RecordRow } from "@/lib/types";

const dayLabel = (key: string) =>
  parseKey(key).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export default function RecordsPage() {
  const { records, settings, reload } = useData();
  const now = useNow();
  const [editing, setEditing] = useState<EditTarget | null>(null);

  const byDay = new Map<string, RecordRow[]>();
  for (const r of records) {
    const key = dayKey(new Date(r.check_in));
    const list = byDay.get(key) || [];
    list.push(r);
    byDay.set(key, list);
  }

  const keys = new Set(byDay.keys());
  const today = new Date();
  for (let d = parseKey(settings.start_date); d <= today; d.setDate(d.getDate() + 1)) {
    keys.add(dayKey(d));
  }
  const days = Array.from(keys).sort().reverse();

  const totalMs = records.reduce((sum, r) => sum + recordMs(r.check_in, r.check_out, now), 0);

  return (
    <div>
      <header className="flex items-center justify-between px-5 pb-2 pt-4">
        <h1 className="text-lg font-semibold">Records</h1>
        <ThemeSwitcher />
      </header>
      <div className="px-5 pb-5">
        <p className="font-mono text-3xl font-semibold tabular-nums">{hms(totalMs)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          worked in total since {settings.start_date}
        </p>
      </div>

      {days.map((key) => {
        const list = (byDay.get(key) || []).sort(
          (a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
        );
        const dayMs = list.reduce((sum, r) => sum + recordMs(r.check_in, r.check_out, now), 0);

        return (
          <section key={key} className="border-t border-border px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{dayLabel(key)}</p>
                <p className="text-xs text-muted-foreground">
                  {list.length === 0 ? "No record" : `${list.length} session${list.length > 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-lg tabular-nums">{hms(dayMs)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Add record on ${key}`}
                  onClick={() => setEditing({ mode: "add", day: key })}
                >
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {list.map((r) => {
              const start = new Date(r.check_in);
              const end = r.check_out ? new Date(r.check_out) : null;
              const extraDays = end ? Math.round((parseKey(dayKey(end)).getTime() - parseKey(key).getTime()) / DAY) : 0;
              return (
                <button
                  key={r.id}
                  onClick={() => setEditing({ mode: "edit", record: r })}
                  className="mt-2 flex w-full items-center justify-between rounded-xl bg-muted px-3 py-3 text-left"
                >
                  <div>
                    <p className="font-mono text-sm tabular-nums">
                      {timeStr(start)} to {end ? timeStr(end) : "now"}
                      {extraDays > 0 && <span className="text-muted-foreground"> +{extraDays}d</span>}
                    </p>
                    <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                      {hms(recordMs(r.check_in, r.check_out, now))}
                      {!end && " (running)"}
                    </p>
                  </div>
                  <PencilIcon className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </section>
        );
      })}

      {editing && (
        <RecordDialog
          key={editing.mode === "edit" ? `edit-${editing.record.id}` : `add-${editing.day}`}
          target={editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </div>
  );
}
