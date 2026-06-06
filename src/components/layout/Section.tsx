import { ReactNode } from "react";

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
  className?: string;
}

export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  className = "",
}: SectionProps) {
  return (
    <section id={id} className={`py-12 sm:py-16 md:py-24 scroll-mt-20 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-12 md:mb-16 animate-fade-in">
          <p className="section-eyebrow mb-3">{eyebrow}</p>
          <h2 className="section-title mb-4">{title}</h2>
          <p className="section-lead">{lead}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
