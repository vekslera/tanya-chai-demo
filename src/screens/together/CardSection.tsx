import type { ReactNode } from 'react';

/** A labeled section of an Avos uBanim card. */
export function CardSection({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className ? `together-section ${className}` : 'together-section'}>
      <h2 className="together-label">{label}</h2>
      {children}
    </section>
  );
}
