import { ReactNode } from "react";

export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`flex gap-4 p-4 bg-muted/10 border border-primary border-l-4 rounded-2xl`}
    >
      <div className={`p-4 h-fit rounded-lg bg-muted text-primary`}>{icon}</div>

      <div>
        <h1 className="text-xl mb-2">{title}</h1>

        <h1 className="text-muted-foreground">{description}</h1>
      </div>
    </div>
  );
}
