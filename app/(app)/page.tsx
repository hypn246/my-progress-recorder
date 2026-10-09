"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/components/data-provider";
import { useNow } from "@/components/use-now";
import { Hms } from "@/components/hms";
import { UnitRow, type UnitItem } from "@/components/unit-row";
import { SettingsDialog } from "@/components/settings-dialog";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogOutIcon, PlayIcon, SlidersIcon, StopIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DAY, WORK_DAY, calendarParts, dayKey, endOfDay, recordMs, timeStr } from "@/lib/time";

const num = (n: number) => Math.floor(n).toLocaleString("en-US");

function workUnits(ms: number): UnitItem[] {
  return [
    { label: "work days (8h)", value: (ms / WORK_DAY).toFixed(1) },
    { label: "hours", value: num(ms / 3600000) },
    { label: "minutes", value: num(ms / 60000) },
    { label: "seconds", value: num(ms / 1000) },
  ];
}

export default function TodayPage() {
  const router = useRouter();
  const { records, settings, reload } = useData();
  const now = useNow();
  const [busy, setBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const open = records.find((r) => !r.check_out);
  const since = open ? now - new Date(open.check_in).getTime() : 0;

  const workedMs = records.reduce((sum, r) => sum + recordMs(r.check_in, r.check_out, now), 0);
  const targetMs = settings.target_hours * 3600000;
  const leftMs = Math.max(0, targetMs - workedMs);
  const percent = Math.min(100, (workedMs / targetMs) * 100);

  const targetEnd = endOfDay(settings.target_date);
  const msToTarget = Math.max(0, targetEnd.getTime() - now);
  const daysLeft = Math.max(1, Math.ceil(msToTarget / DAY));
  const avgMs = leftMs / daysLeft;
  const parts = calendarParts(new Date(now), targetEnd);
  const targetPassed = msToTarget === 0;

  async function toggle() {
    setBusy(true);
    await fetch("/api/toggle", { method: "POST" });
    await reload();
    setBusy(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div>
      <section className="rounded-b-[2rem] bg-primary px-5 pb-7 pt-4 text-primary-foreground">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Progress</h1>
          <div className="flex items-center">
            <ThemeSwitcher />
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} aria-label="Target settings">
              <SlidersIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
              <LogOutIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <p className="mb-3 flex items-center gap-2 text-sm">
          <span className={open ? "h-2.5 w-2.5 rounded-full bg-current" : "h-2.5 w-2.5 rounded-full border border-current"} />
          {open ? `Checked in at ${timeStr(new Date(open.check_in))} on ${dayKey(new Date(open.check_in))}` : "Not checked in"}
        </p>
        <Hms ms={since} className="justify-center text-[clamp(2.75rem,15.5vw,4.75rem)] font-bold" labelClassName="text-sm" />
        <Button size="xl" onClick={toggle} disabled={busy} variant="inverse" className="mt-8">
          {open ? <StopIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
          {open ? "Check out" : "Check in"}
        </Button>
      </section>

      <section className="px-5 py-6 text-center">
        <h2 className="text-sm text-muted-foreground">Average to work per day</h2>
        <Hms ms={avgMs} className="mt-3 text-4xl font-semibold" />
        <p className="mt-3 text-sm text-muted-foreground">{leftMs === 0 ? "You reached your target." : targetPassed ? "Target day has passed." : `Over the next ${daysLeft} day${daysLeft > 1 ? "s" : ""} to finish on time.`}</p>
      </section>

      <section className="space-y-3 border-t border-border px-5 py-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm text-muted-foreground">Time to target day</h2>
          <span className="text-sm text-muted-foreground">{settings.target_date}</span>
        </div>
        <p className="text-3xl font-semibold">
          {daysLeft} <span className="text-lg font-normal text-muted-foreground">{daysLeft > 1 ? "days" : "day"}</span>
        </p>
        <UnitRow
          items={[
            { label: "years", value: String(parts.years) },
            { label: "months", value: String(parts.months) },
            { label: "weeks", value: String(parts.weeks) },
            { label: "days", value: String(parts.days) },
          ]}
        />
        <UnitRow
          items={[
            { label: "total days", value: (msToTarget / DAY).toFixed(1) },
            { label: "total hours", value: num(msToTarget / 3600000) },
            { label: "total minutes", value: num(msToTarget / 60000) },
            { label: "total seconds", value: num(msToTarget / 1000) },
          ]}
        />
      </section>

      <section className="space-y-3 border-t border-border px-5 py-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm text-muted-foreground">Worked so far</h2>
          <span className="text-sm text-muted-foreground">
            {percent.toFixed(1)}% of {settings.target_hours} h
          </span>
        </div>
        <Hms ms={workedMs} className="text-3xl font-semibold" labelClassName="text-[11px]" />
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </div>
        <UnitRow items={workUnits(workedMs)} />
      </section>

      <section className="space-y-3 border-t border-border px-5 py-6">
        <h2 className="text-sm text-muted-foreground">Left to reach the target</h2>
        <Hms ms={leftMs} className="text-3xl font-semibold" labelClassName="text-[11px]" />
        <UnitRow items={workUnits(leftMs)} />
      </section>

      {showSettings && <SettingsDialog settings={settings} onClose={() => setShowSettings(false)} onSaved={reload} />}
    </div>
  );
}
