// 模拟数据 + 共享小组件

const APP_COLORS = {
  mint: 'var(--mint)',
  blue: 'var(--blue)',
  lilac: 'var(--lilac)',
  peach: 'var(--peach)',
  lemon: 'var(--lemon)',
};

// 手绘应用图标 —— 用简单几何+文字避免版权
function AppIcon({ kind, size = 32 }) {
  const icons = {
    code:   { bg: '#2A2A3C', glyph: '</>', fg: '#B8E0D2' },
    design: { bg: '#C8B6FF', glyph: '✎',  fg: '#2A2A3C' },
    chat:   { bg: '#A4C8F0', glyph: '💬', fg: '#2A2A3C' },
    doc:    { bg: '#FFE5A8', glyph: '📄', fg: '#2A2A3C' },
    video:  { bg: '#FFCFB8', glyph: '▶',  fg: '#2A2A3C' },
    music:  { bg: '#B8E0D2', glyph: '♪',  fg: '#2A2A3C' },
    browse: { bg: '#A4C8F0', glyph: '🌐', fg: '#2A2A3C' },
    mail:   { bg: '#C8B6FF', glyph: '✉',  fg: '#2A2A3C' },
    game:   { bg: '#FFCFB8', glyph: '♥',  fg: '#2A2A3C' },
    shop:   { bg: '#FFE5A8', glyph: '🛍', fg: '#2A2A3C' },
    term:   { bg: '#2A2A3C', glyph: '_',  fg: '#B8E0D2' },
    draw:   { bg: '#B8E0D2', glyph: '✏', fg: '#2A2A3C' },
  };
  const i = icons[kind] || icons.doc;
  return (
    <div style={{
      width: size, height: size,
      background: i.bg, color: i.fg,
      border: '2px solid var(--line)',
      borderRadius: `${size*0.28}px ${size*0.32}px ${size*0.28}px ${size*0.32}px / ${size*0.32}px ${size*0.28}px ${size*0.32}px ${size*0.28}px`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5, fontWeight: 700,
      flexShrink: 0,
      lineHeight: 1,
    }}>{i.glyph}</div>
  );
}

const TODAY_APPS = [
  { name: 'VS Code',      kind: 'code',   mins: 183, cat: '工作', color: 'var(--mint)'  },
  { name: '飞书',         kind: 'chat',   mins: 96,  cat: '沟通', color: 'var(--blue)'  },
  { name: 'Figma',        kind: 'design', mins: 74,  cat: '工作', color: 'var(--lilac)' },
  { name: 'Chrome',       kind: 'browse', mins: 58,  cat: '浏览', color: 'var(--blue)'  },
  { name: 'Notion',       kind: 'doc',    mins: 41,  cat: '工作', color: 'var(--lemon)' },
  { name: 'Spotify',      kind: 'music',  mins: 32,  cat: '娱乐', color: 'var(--mint)'  },
  { name: 'YouTube',      kind: 'video',  mins: 24,  cat: '娱乐', color: 'var(--peach)' },
  { name: '微信',         kind: 'mail',   mins: 18,  cat: '沟通', color: 'var(--lilac)' },
];

const CATEGORIES = [
  { name: '工作', mins: 298, color: 'var(--mint)'  },
  { name: '沟通', mins: 114, color: 'var(--blue)'  },
  { name: '浏览', mins: 58,  color: 'var(--lilac)' },
  { name: '娱乐', mins: 56,  color: 'var(--peach)' },
];

// 一天 24h 每小时使用时长（分钟）
const HOURLY = [
  0,0,0,0,0,0,0,5,   // 0-7
  42,55,58,48,25,50,58,56, // 8-15
  55,52,30,15,20,30,10,2,  // 16-23
];

// 周数据
const WEEKLY = [
  { d: '一', mins: 380 },
  { d: '二', mins: 456 },
  { d: '三', mins: 412 },
  { d: '四', mins: 528 },
  { d: '五', mins: 495 },
  { d: '六', mins: 180 },
  { d: '日', mins: 245 },
];

function fmtMins(m) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm}分`;
  if (mm === 0) return `${h}时`;
  return `${h}时${mm}分`;
}

// 手绘线 —— 不规则，用作"下划线"
function HandLine({ w = 100, color = 'var(--ink)', thickness = 2 }) {
  return (
    <svg width={w} height="6" viewBox={`0 0 ${w} 6`} style={{ display: 'block' }}>
      <path
        d={`M 2 3 Q ${w*0.25} ${Math.random()>0.5?1:5} ${w*0.5} 3 T ${w-2} 3`}
        fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round"
      />
    </svg>
  );
}

// 星星 —— 手绘
function Star({ size = 14, fill = 'var(--lemon)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'inline-block' }}>
      <path
        d="M 10 2 L 12 7 L 17 8 L 13 12 L 14 17 L 10 14.5 L 6 17 L 7 12 L 3 8 L 8 7 Z"
        fill={fill} stroke="var(--line)" strokeWidth="1.3" strokeLinejoin="round"
      />
    </svg>
  );
}

// 小太阳
function SunDoodle({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="7" fill="var(--lemon)" stroke="var(--line)" strokeWidth="2" />
      {[0,45,90,135,180,225,270,315].map(a => {
        const r = a * Math.PI / 180;
        const x1 = 20 + Math.cos(r) * 10;
        const y1 = 20 + Math.sin(r) * 10;
        const x2 = 20 + Math.cos(r) * 15;
        const y2 = 20 + Math.sin(r) * 15;
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />;
      })}
    </svg>
  );
}

// 番茄
function TomatoDoodle({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {/* 身 */}
      <circle cx="50" cy="58" r="34" fill="var(--peach)" stroke="var(--line)" strokeWidth="2.5" />
      <path d="M 32 50 Q 38 54 38 62" stroke="var(--cloud-white)" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* 叶子 */}
      <path d="M 42 28 Q 44 20 50 22 Q 56 16 58 24 Q 66 22 64 30 Q 58 34 50 32 Q 44 34 42 28 Z" fill="var(--mint)" stroke="var(--line)" strokeWidth="2" />
      <path d="M 50 22 L 50 32" stroke="var(--line)" strokeWidth="1.5" />
    </svg>
  );
}

Object.assign(window, {
  AppIcon, TODAY_APPS, CATEGORIES, HOURLY, WEEKLY,
  fmtMins, HandLine, Star, SunDoodle, TomatoDoodle, APP_COLORS,
});
