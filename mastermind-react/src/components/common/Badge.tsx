import type { ReactNode, JSX } from "react";

interface BadgeProps {
  isVisible: boolean;
  label: string;
  color: string;
  value: ReactNode;
}

export default function Badge({ isVisible, label, color, value }: BadgeProps): JSX.Element | null {
  if (!isVisible) return null;

  return (
    <h5>
      {label}: <span className={`badge ${color}`}>{value}</span>
    </h5>
  );
}
