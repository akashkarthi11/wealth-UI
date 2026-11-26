import type { ReactNode } from "react";

// Small outline icons, one place. Decorative: the label next to each one carries the meaning.
function Svg({ children }: { children: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const MailIcon = () => (
  <Svg>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 8 8 6 8-6" />
  </Svg>
);

export const LockIcon = () => (
  <Svg>
    <rect x="4" y="10" width="16" height="10" rx="3" />
    <path d="M8 10V8a4 4 0 0 1 8 0v2" />
  </Svg>
);

export const EyeIcon = () => (
  <Svg>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOffIcon = () => (
  <Svg>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.700 9.700 0 0 0 4-.9" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Svg>
);

export const AlertIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.1" />
  </Svg>
);

export const PulseIcon = () => (
  <Svg>
    <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />
  </Svg>
);
