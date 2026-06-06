import Image from "next/image";

type BrandSize = "sm" | "md";

interface BrandMarkProps {
  size?: BrandSize;
  showIcon?: boolean;
  className?: string;
}

const SIZES = {
  sm: {
    wrap: "text-xl md:text-2xl",
    icon: 30,
  },
  md: {
    wrap: "text-lg",
    icon: 26,
  },
} as const;

export function BrandMark({ size = "sm", showIcon = true, className = "" }: BrandMarkProps) {
  const s = SIZES[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${s.wrap} ${className}`}>
      {showIcon && (
        <span className="relative shrink-0 rounded-md overflow-hidden bg-surface shadow-[0_1px_2px_rgba(24,22,20,0.06)] ring-1 ring-border/60">
          <Image
            src="/magdeburg-horse.png"
            alt=""
            width={s.icon}
            height={s.icon}
            className="block"
            priority={size === "sm"}
          />
        </span>
      )}
      <span className="font-serif tracking-tight text-ink leading-none">
        <span className="brand-mag" aria-hidden="true">
          MAG
        </span>
        <span className="text-ink/90">magdeburg</span>
      </span>
    </span>
  );
}
