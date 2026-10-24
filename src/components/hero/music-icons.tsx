type MusicIconProps = {
  className?: string;
};

export function SpeakerIcon({ className }: MusicIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      <path d="M4 9h3l5-4v14l-5-4H4V9Z" />
      <path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" />
    </svg>
  );
}

export function SpeakerOffIcon({ className }: MusicIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      <path d="M4 9h3l5-4v14l-5-4H4V9Z" />
      <path d="m15 9 6 6M21 9l-6 6" />
    </svg>
  );
}

export function PlayIcon({ className }: MusicIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />
    </svg>
  );
}

export function NextTrackIcon({ className }: MusicIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path d="M5 5v14l9-7-9-7Z" fill="currentColor" />
      <path d="M18 5h2v14h-2z" fill="currentColor" />
    </svg>
  );
}

export function DiscIcon({ className }: MusicIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="square" />
    </svg>
  );
}
