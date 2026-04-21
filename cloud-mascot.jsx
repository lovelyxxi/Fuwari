// 云朵吉祥物：名字叫 "云云"，会根据使用时长变表情
// moods: happy | calm | sleepy | worried | alert

function CloudMascot({ size = 80, mood = 'happy', wobble = true }) {
  const expr = {
    happy:   { eye: 'dot',   mouth: 'smile' },
    calm:    { eye: 'line',  mouth: 'flat' },
    sleepy:  { eye: 'zz',    mouth: 'o' },
    worried: { eye: 'wide',  mouth: 'wobble' },
    alert:   { eye: 'wide',  mouth: 'smile' },
  }[mood] || { eye: 'dot', mouth: 'smile' };

  // 手绘 path 风云朵
  const W = 120, H = 90;
  return (
    <svg
      width={size}
      height={size * H / W}
      viewBox={`0 0 ${W} ${H}`}
      className={wobble ? 'animate-wobble' : ''}
      style={{ overflow: 'visible' }}
    >
      {/* 云影 */}
      <ellipse cx="60" cy="80" rx="40" ry="3" fill="rgba(42,42,60,0.1)" />

      {/* 云身（填充） */}
      <path
        d="M 22 55
           Q 14 56 12 48
           Q 8 38 18 34
           Q 20 22 34 22
           Q 40 12 52 14
           Q 62 6 74 14
           Q 86 10 92 22
           Q 106 24 106 38
           Q 112 48 102 54
           Q 98 62 88 60
           Q 76 66 64 60
           Q 50 66 40 60
           Q 30 62 22 55 Z"
        fill="var(--cloud-white)"
        stroke="var(--line)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* 腮红 */}
      <ellipse cx="34" cy="48" rx="5" ry="3" fill="var(--peach)" opacity="0.7" />
      <ellipse cx="86" cy="48" rx="5" ry="3" fill="var(--peach)" opacity="0.7" />

      {/* 眼睛 */}
      {expr.eye === 'dot' && (
        <>
          <circle cx="46" cy="40" r="3" fill="var(--line)" className="animate-blink" />
          <circle cx="74" cy="40" r="3" fill="var(--line)" className="animate-blink" />
          <circle cx="47" cy="39" r="1" fill="var(--cloud-white)" />
          <circle cx="75" cy="39" r="1" fill="var(--cloud-white)" />
        </>
      )}
      {expr.eye === 'line' && (
        <>
          <path d="M 42 41 Q 46 39 50 41" stroke="var(--line)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 70 41 Q 74 39 78 41" stroke="var(--line)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {expr.eye === 'zz' && (
        <>
          <path d="M 42 41 L 50 41" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 70 41 L 78 41" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
          <text x="90" y="26" fontSize="11" fontFamily="Caveat" fill="var(--lilac-deep)">z</text>
          <text x="96" y="20" fontSize="9"  fontFamily="Caveat" fill="var(--lilac-deep)">z</text>
        </>
      )}
      {expr.eye === 'wide' && (
        <>
          <circle cx="46" cy="40" r="4" fill="var(--cloud-white)" stroke="var(--line)" strokeWidth="1.8" />
          <circle cx="74" cy="40" r="4" fill="var(--cloud-white)" stroke="var(--line)" strokeWidth="1.8" />
          <circle cx="46" cy="41" r="1.8" fill="var(--line)" />
          <circle cx="74" cy="41" r="1.8" fill="var(--line)" />
        </>
      )}

      {/* 嘴 */}
      {expr.mouth === 'smile' && (
        <path d="M 54 50 Q 60 56 66 50" stroke="var(--line)" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {expr.mouth === 'flat' && (
        <path d="M 55 52 L 65 52" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
      )}
      {expr.mouth === 'o' && (
        <ellipse cx="60" cy="52" rx="3" ry="4" fill="var(--peach-deep)" stroke="var(--line)" strokeWidth="1.5" />
      )}
      {expr.mouth === 'wobble' && (
        <path d="M 54 52 Q 57 49 60 52 T 66 52" stroke="var(--line)" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

// 果冻备用角色（更圆） — 变体用
function JellyMascot({ size = 80, mood = 'happy' }) {
  const W = 100, H = 110;
  return (
    <svg width={size} height={size * H / W} viewBox={`0 0 ${W} ${H}`} className="animate-wobble" style={{ overflow: 'visible' }}>
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

Object.assign(window, { CloudMascot, JellyMascot });
