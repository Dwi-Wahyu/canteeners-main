import { LucideIcon } from "lucide-react";

export interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
  isBreadcrumbLogo?: boolean;
}

type CustomIconComponent = React.ComponentType<CustomIconProps>;

export type IconType = LucideIcon | CustomIconComponent;
