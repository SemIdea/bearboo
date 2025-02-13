import { SVGProps } from "react";
import { SwitchProps } from "@heroui/switch";

// Icon types
type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Theme types
interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

export type { IconSvgProps, ThemeSwitchProps };
