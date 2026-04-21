import { Mood } from '@shared/tokens';

interface JellyMascotProps {
  size?: number;
  mood?: Mood;
}

export function JellyMascot({ size = 80, mood: _mood = 'happy' }: JellyMascotProps) {
  const W = 100, H = 110;

  return (
    <svg
      width={size}
      height={size * H / W}
      viewBox={`0 0 ${W} ${H}`}
      className="animate-wobble"
      style={{ overflow: 'visible' }}
    >
      <ellipse cx="50" cy="100" rx="28" ry="3" fill="rgba(42,42,60,0.1)" />
      {/* 果冻身 */}
      <path
        d="M 20 50
           Q 20 20 50 20
           Q 80 20 80 50
           Q 80 78 72 86
           Q 60 96 50 90
           Q 40 96 28 86
           Q 20 78 20 50 Z"
        fill="var(--lilac)"
        stroke="var(--line)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        opacity="0.9"
      />
      {/* 高光 */}
      <ellipse cx="36" cy="36" rx="6" ry="10" fill="var(--cloud-white)" opacity="0.55" />
      {/* 腮红 */}
      <circle cx="30" cy="58" r="4" fill="var(--peach)" opacity="0.7" />
      <circle cx="70" cy="58" r="4" fill="var(--peach)" opacity="0.7" />
      {/* 眼睛 */}
      <circle cx="40" cy="50" r="3" fill="var(--line)" className="animate-blink" />
      <circle cx="60" cy="50" r="3" fill="var(--line)" className="animate-blink" />
      <circle cx="41" cy="49" r="1" fill="var(--cloud-white)" />
      <circle cx="61" cy="49" r="1" fill="var(--cloud-white)" />
      {/* 嘴 */}
      <path d="M 45 62 Q 50 66 55 62" stroke="var(--line)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
