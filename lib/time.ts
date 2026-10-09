export const DAY = 86400000;
export const WORK_DAY = 8 * 3600000;

export const pad = (n: number) => String(n).padStart(2, "0");

export function splitHms(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

export function hms(ms: number) {
  const { h, m, s } = splitHms(ms);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function dayKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function endOfDay(key: string) {
  const d = parseKey(key);
  d.setDate(d.getDate() + 1);
  return d;
}

export function timeStr(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function toInputValue(d: Date) {
  return `${dayKey(d)}T${timeStr(d)}`;
}

function addMonths(d: Date, n: number) {
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1, d.getHours(), d.getMinutes(), d.getSeconds());
  const lastDay = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(d.getDate(), lastDay));
  return r;
}

export function calendarParts(from: Date, to: Date) {
  let totalMonths = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();
  if (addMonths(from, totalMonths) > to) totalMonths -= 1;
  totalMonths = Math.max(0, totalMonths);
  const days = Math.max(0, Math.floor((to.getTime() - addMonths(from, totalMonths).getTime()) / DAY));
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    weeks: Math.floor(days / 7),
    days: days % 7,
  };
}

export function recordMs(checkIn: string, checkOut: string | null, now: number) {
  const end = checkOut ? new Date(checkOut).getTime() : now;
  return Math.max(0, end - new Date(checkIn).getTime());
}
