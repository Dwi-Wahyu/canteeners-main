import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function NavButton({
  children,
  href,
  variant = "default",
  size = "default",
  className,
}: {
  children: React.ReactNode;
  href: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}) {
  return (
    <Button asChild variant={variant} size={size} className={cn(className)}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
