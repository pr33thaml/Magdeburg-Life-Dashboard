interface NarrativeBridgeProps {
  text: string;
}

export function NarrativeBridge({ text }: NarrativeBridgeProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <p className="font-serif text-base sm:text-lg md:text-xl text-ink-muted italic max-w-2xl leading-relaxed border-l-2 border-accent pl-4 sm:pl-6">
        {text}
      </p>
    </div>
  );
}
