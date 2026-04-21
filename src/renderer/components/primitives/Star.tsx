interface StarProps { size?: number; fill?: string; }
export function Star({ size = 14, fill = 'var(--lemon)' }: StarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'inline-block' }}>
      <path
        d="M 10 2 L 12 7 L 17 8 L 13 12 L 14 17 L 10 14.5 L 6 17 L 7 12 L 3 8 L 8 7 Z"
        fill={fill}
        stroke="var(--line)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
