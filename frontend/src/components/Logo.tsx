export function Logo({ size = "default", showText = true }: { size?: "sm" | "default" | "lg"; showText?: boolean }) {
  const sizeMap = {
    sm: { icon: "h-8 w-8", text: "text-lg" },
    default: { icon: "h-11 w-11", text: "text-xl" },
    lg: { icon: "h-14 w-14", text: "text-2xl" },
  };

  const dimensions = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      <svg
        className={`${dimensions.icon} text-brand-100`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer hexagon frame */}
        <path
          d="M24 4L40 12V36L24 44L8 36V12L24 4Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner sparkle/talent burst - 3 rays */}
        <circle cx="24" cy="24" r="6" fill="currentColor" opacity="0.8" />

        {/* Top ray */}
        <line x1="24" y1="24" x2="24" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        {/* Top-right ray */}
        <line x1="24" y1="24" x2="34" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        {/* Bottom-left ray */}
        <line x1="24" y1="24" x2="14" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Accent dots for recruitment flow */}
        <circle cx="16" cy="18" r="1.5" fill="currentColor" opacity="0.4" />
        <circle cx="32" cy="18" r="1.5" fill="currentColor" opacity="0.4" />
        <circle cx="24" cy="36" r="1.5" fill="currentColor" opacity="0.4" />
      </svg>

      {showText && (
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-brand-200/80 leading-none">TalentForge</p>
          <h2 className={`${dimensions.text} font-bold text-white leading-none`}>AI</h2>
        </div>
      )}
    </div>
  );
}

export function LogoCompact() {
  return (
    <svg
      className="h-9 w-9 text-brand-100"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 4L40 12V36L24 44L8 36V12L24 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="6" fill="currentColor" opacity="0.8" />
      <line x1="24" y1="24" x2="24" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="24" y1="24" x2="34" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="24" y1="24" x2="14" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="16" cy="18" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="32" cy="18" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="24" cy="36" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
