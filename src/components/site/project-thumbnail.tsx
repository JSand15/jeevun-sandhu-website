const gradients = [
  "from-blue-500/25 via-background to-background",
  "from-violet-500/25 via-background to-background",
  "from-emerald-500/20 via-background to-background",
  "from-amber-500/20 via-background to-background",
];

function hashToIndex(value: string, mod: number) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1000;
  }
  return hash % mod;
}

export function ProjectThumbnail({
  name,
  slug,
}: {
  name: string;
  slug: string;
}) {
  const gradient = gradients[hashToIndex(slug, gradients.length)];
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <span className="text-foreground/15 font-display text-8xl font-semibold select-none">
        {initial}
      </span>
    </div>
  );
}
