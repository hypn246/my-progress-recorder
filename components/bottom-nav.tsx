"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, TimerIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Today", icon: TimerIcon },
  { href: "/records", label: "Records", icon: CalendarIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium",
              pathname === href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
