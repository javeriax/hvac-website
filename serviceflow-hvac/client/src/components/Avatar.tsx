const PALETTE = [
  { bg: "bg-brand-700", text: "text-white" },
  { bg: "bg-clay-400", text: "text-brand-900" },
  { bg: "bg-brand-200", text: "text-brand-800" },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
  }
  return Math.abs(hash);
}

/** Initials avatar with a deterministic brand color -- avoids stock-photo placeholders. */
export default function Avatar({ name, className = "h-11 w-11" }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const { bg, text } = PALETTE[hashString(name) % PALETTE.length];

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-semibold ${bg} ${text} ${className}`}
    >
      {initials}
    </div>
  );
}
