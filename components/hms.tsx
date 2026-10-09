import { cn } from "@/lib/utils";
import { pad, splitHms } from "@/lib/time";

type Props = {
  ms: number;
  className?: string;
  labelClassName?: string;
};

export function Hms({ ms, className, labelClassName = "text-xs" }: Props) {
  const { h, m, s } = splitHms(ms);
  const parts = [
    { value: pad(h), label: "hour" },
    { value: pad(m), label: "minute" },
    { value: pad(s), label: "second" },
  ];
  return (
    <div className={cn("flex justify-center items-center font-mono tabular-nums leading-none", className)}>
      {parts.map((p, i) => (
        <div key={p.label} className="flex items-start">
          {i > 0 && <span className="px-[0.12em] opacity-50">:</span>}
          <div className="flex flex-col items-center gap-1.5">
            <span>{p.value}</span>
            <span className={cn("font-sans font-normal opacity-70", labelClassName)}>{p.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
