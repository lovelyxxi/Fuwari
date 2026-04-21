export function TomatoDoodle({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="58" r="34" fill="var(--peach)" stroke="var(--line)" strokeWidth="2.5" />
      <path d="M 32 50 Q 38 54 38 62" stroke="var(--cloud-white)" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M 42 28 Q 44 20 50 22 Q 56 16 58 24 Q 66 22 64 30 Q 58 34 50 32 Q 44 34 42 28 Z" fill="var(--mint)" stroke="var(--line)" strokeWidth="2" />
      <path d="M 50 22 L 50 32" stroke="var(--line)" strokeWidth="1.5" />
    </svg>
  );
}
