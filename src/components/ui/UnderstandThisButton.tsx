"use client";

interface UnderstandThisButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export function UnderstandThisButton({ label, onClick, className = "" }: UnderstandThisButtonProps) {
  return (
    <button
      type="button"
      data-cursor-interactive
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-accent/30 text-accent bg-accent-muted/80 hover:bg-accent/10 transition-all hover:shadow-soft whitespace-nowrap ${className}`}
    >
      {label}
    </button>
  );
}
