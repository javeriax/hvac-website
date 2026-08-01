import type { ComponentType } from "react";

// Rotates through three treatments so a grid of icons doesn't read as one
// stamped-out template card repeated N times.
const TREATMENTS = [
  "bg-brand-800 text-white",
  "bg-clay-500 text-white",
  "bg-brand-100 text-brand-800",
];

type IconProps = { className?: string };

const SIZES = {
  sm: { box: "h-10 w-10 rounded-xl", icon: "h-4 w-4" },
  md: { box: "h-14 w-14 rounded-2xl", icon: "h-6 w-6" },
};

export default function ServiceIconBadge({
  icon: Icon,
  index,
  size = "md",
}: {
  icon: ComponentType<IconProps>;
  index: number;
  size?: keyof typeof SIZES;
}) {
  const treatment = TREATMENTS[index % TREATMENTS.length];
  const { box, icon } = SIZES[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105 ${box} ${treatment}`}
    >
      <Icon className={icon} />
    </div>
  );
}
