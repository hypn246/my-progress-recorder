import { BottomNav } from "@/components/bottom-nav";
import { DataProvider } from "@/components/data-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <main className="mx-auto min-h-dvh max-w-md pb-24">{children}</main>
      <BottomNav />
    </DataProvider>
  );
}
