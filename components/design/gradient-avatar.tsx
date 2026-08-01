import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Avatars are gradient tiles with initials — the handoff ships no photos
 * anywhere. The gradient is chosen per identity so the same person is the
 * same colour everywhere in the product.
 */
const IDENTITY_GRADIENTS = {
  customer: "linear-gradient(135deg,#2563EB,#7C3AED)",
  technician: "linear-gradient(135deg,#2563EB,#0EA5E9)",
  admin: "linear-gradient(135deg,#0F172A,#475569)",
  emerald: "linear-gradient(135deg,#059669,#10B981)",
  amber: "linear-gradient(135deg,#D97706,#F59E0B)",
  violet: "linear-gradient(135deg,#7C3AED,#A78BFA)",
  red: "linear-gradient(135deg,#DC2626,#F87171)",
} as const;

export type IdentityKind = keyof typeof IDENTITY_GRADIENTS;

/** Stable pick for people whose role we don't know — same name, same tile. */
const OTHER_KINDS: IdentityKind[] = ["emerald", "amber", "violet", "red"];

const kindFromName = (name: string): IdentityKind => {
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return OTHER_KINDS[sum % OTHER_KINDS.length];
};

export function GradientAvatar({
  name,
  kind,
  size = 40,
  radius = 12,
  className,
}: {
  name: string;
  /** Omit to derive a stable colour from the name. */
  kind?: IdentityKind;
  size?: number;
  radius?: number;
  className?: string;
}) {
  const resolved = kind ?? kindFromName(name);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center font-bold text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: IDENTITY_GRADIENTS[resolved],
        fontSize: Math.max(11, Math.round(size * 0.33)),
      }}
    >
      {getInitials(name)}
    </span>
  );
}
