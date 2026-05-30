import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 11.2 12 4l8 7.2" />
      <path d="M6.5 10.5V20h11v-9.5" />
      <path d="M9.5 20v-5h5v5" />
    </IconBase>
  );
}

export function CoachIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.8v3" />
      <path d="m17.8 6.2-2.1 2.1" />
      <path d="m6.2 6.2 2.1 2.1" />
      <path d="M5 12.5c0-3.3 3.1-6 7-6s7 2.7 7 6-3.1 6-7 6a8 8 0 0 1-2.3-.3L6 20l.9-3.1A5.6 5.6 0 0 1 5 12.5Z" />
      <path d="M9.2 12h5.6" />
      <path d="M10.5 14.5h3" />
    </IconBase>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M7.5 15.5 10.4 12l2.8 2.1 4-6.1" />
      <path d="M7.5 8.2h.1" />
      <path d="M12 8.2h.1" />
    </IconBase>
  );
}

export function PlannerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7.5 4.5h9A2.5 2.5 0 0 1 19 7v10a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17V7a2.5 2.5 0 0 1 2.5-2.5Z" />
      <path d="M8 9h8" />
      <path d="M8 13h3" />
      <path d="m13.8 14.2 1.4 1.4 2.4-3" />
      <path d="M9 3v3" />
      <path d="M15 3v3" />
    </IconBase>
  );
}

export function UserSettingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15.5 19a5 5 0 0 0-9 0" />
      <path d="M11 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M18.5 13.5v1.2" />
      <path d="M18.5 19.3v1.2" />
      <path d="m15.9 15 1 .6" />
      <path d="m20.1 18.4 1 .6" />
      <path d="m15.9 19 1-.6" />
      <path d="m20.1 15.6 1-.6" />
      <path d="M18.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </IconBase>
  );
}

export function BikeBoltIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.5 18.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M17.5 18.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M6.5 15.5h4l2-5h2.5l2.5 5" />
      <path d="M9 8.5h3" />
      <path d="M11.5 15.5 9.2 10" />
      <path d="m16 4-2 4h3l-2 4" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </IconBase>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.5 13.4 9l5.1 3-5.1 3L12 20.5 10.6 15l-5.1-3 5.1-3L12 3.5Z" />
      <path d="M19 4.5v3" />
      <path d="M20.5 6h-3" />
    </IconBase>
  );
}

export function EmptySparkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 7.5h12" />
      <path d="M6 12h7" />
      <path d="M6 16.5h5" />
      <path d="m17 13 .7 1.9 1.8.6-1.8.6L17 18l-.7-1.9-1.8-.6 1.8-.6L17 13Z" />
    </IconBase>
  );
}
