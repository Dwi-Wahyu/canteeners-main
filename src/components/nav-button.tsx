import Link from "next/link";
import { Button } from "./ui/button";

export default function NavButton({
  children,
  href,
  variant = "default",
  size = "default",
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
}) {
  return (
    <Button asChild variant={variant} size={size}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
