"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons";

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Dialog({ title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="sheet fixed inset-x-0 bottom-0 top-auto mx-auto mb-0 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-b-0 border-border bg-card p-0 text-foreground backdrop:bg-black/60"
    >
      <div className="p-5 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 rounded-lg p-2 text-muted-foreground hover:bg-muted"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
