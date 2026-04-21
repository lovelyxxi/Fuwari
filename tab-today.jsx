// 主窗口各 Tab 页内容

// === 今日总览 ===
function TabToday({ compact }) {
  const totalMins = TODAY_APPS.reduce((s, a) => s + a.mins, 0);
  const h = Math.floor(totalMins / 60), m = totalMins % 60;
  const yesterdayDelta = -23; // 分钟

  return (
    <div style={{ padding: compact ? '20px 24px' : '28px 36px' }}>
      {/* 顶部问候 + 云云 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <CloudMascot size={80} mood="happy" />
        <div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 32, lineHeight: 1, color: 'var(--ink)' }}>
            下午好呀 ~
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 6 }}>
            今天已经专注了好一会儿啦，记得歇歇眼睛哦 💧
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: 1 }}>TODAY · 周四</div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 26, color: 'var(--ink)' }}>4月21日</div>
        </div>
      </div>

      {/* 大数字 + 饼图 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginBottom: 20 }}>
        <div className="doodle-border" style={{ padding: '22px 24px', background: 'var(--cloud-white)' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: 1 }}>今日总使用</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 64, lineHeight: 0.9, color: 'var(--ink)' }}>{h}</span>
            <span style={{ fontSize: 16, color: 'var(--ink-soft)', fontWeight: 700, marginRight: 8 }}>小时</span>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 48, lineHeight: 0.9, color: 'var(--ink)' }}>{m}</span>
            <span style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 700 }}>分</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <span className="chip" style={{ background: 'var(--mint)' }}>↓ 比昨天少 23 分</span>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>做得不错呢～</span>
          </div>
          {/* mini 分类条 */}
          <div style={{ marginTop: 18 }}>
            <div style={{
              display: 'flex', height: 14, overflow: 'hidden',
              border: '2px solid var(--line)',
              borderRadius: '8px 10px 8px 10px',
            }}>
              {CATEGORIES.map((c, i) => (
                <div key={c.name} style={{ background: c.color, width: `${c.mins/totalMins*100}%`, borderRight: i<CATEGORIES.length-1?'2px solid var(--line)':'none' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--ink-soft)' }}>
              {CATEGORIES.map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, background: c.color, border: '1.5px solid var(--line)', borderRadius: 2 }} />
                  {c.name} · {fmtMins(c.mins)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 分类圆圈 */}
        <div className="doodle-border" style={{ padding: 22, background: 'var(--cloud-white)', position: 'relative' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>分类占比</div>
          <PieDoodle size={170} />
          <div style={{ position: 'absolute', right: 12, top: 10, fontFamily: 'var(--font-hand)', fontSize: 16, color: 'var(--lilac-deep)', transform: 'rotate(6deg)' }}>
            ✦ 专注日
          </div>
        </div>
      </div>

      {/* 今日时间线 mini */}
      <div className="doodle-border" style={{ padding: '18px 22px', background: 'var(--cloud-white)', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: 1 }}>今日时间线</div>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--ink)' }}>一天的节奏</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>00 &nbsp;·&nbsp; 06 &nbsp;·&nbsp; 12 &nbsp;·&nbsp; 18 &nbsp;·&nbsp; 24</div>
        </div>
        <TimelineMini />
      </div>

      {/* 应用 top 3 快览 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {TODAY_APPS.slice(0,3).map((app, i) => (
          <div key={app.name} className="doodle-border b-tight" style={{ padding: '14px 16px', background: 'var(--cloud-white)', display: 'flex', gap: 12, alignItems: 'center', position: 'relative' }}>
            <AppIcon kind={app.kind} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{app.cat}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: 20, lineHeight: 1, color: 'var(--ink)' }}>{fmtMins(app.mins)}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontWeight: 700, marginTop: 2 }}>TOP {i+1}</div>
            </div>
            {i===0 && <div style={{ position:'absolute', top:-8, right:-6, transform:'rotate(15deg)'}}><Star size={22}/></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// 手绘风饼图
function PieDoodle({ size = 160 }) {
  const total = CATEGORIES.reduce((s, c) => s + c.mins, 0);
  let acc = 0;
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {CATEGORIES.map((c, i) => {
        const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
        acc += c.mins;
        const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(start) * r;
        const y1 = cy + Math.sin(start) * r;
        const x2 = cx + Math.cos(end) * r;
        const y2 = cy + Math.sin(end) * r;
        const large = end - start > Math.PI ? 1 : 0;
        return (
          <path
            key={c.name}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={c.color}
            stroke="var(--line)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      })}
      {/* 中心小圆 */}
      <circle cx={cx} cy={cy} r="18" fill="var(--cloud-white)" stroke="var(--line)" strokeWidth="2" />
      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" fontFamily="Caveat" fontSize="16" fill="var(--ink)">{Math.round(total/60)}h</text>
    </svg>
  );
}

// 每小时柱 mini
function TimelineMini() {
  const max = Math.max(...HOURLY);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 52 }}>
      {HOURLY.map((v, i) => {
        const hPx = max === 0 ? 0 : (v / max) * 48 + (v > 0 ? 4 : 0);
        const isNow = i === 15;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
            <div style={{
              width: '100%',
              height: hPx,
              background: isNow ? 'var(--lilac)' : v > 30 ? 'var(--mint)' : 'var(--blue)',
              border: v > 0 ? '1.5px solid var(--line)' : 'none',
              borderRadius: '4px 5px 1px 1px',
            }} />
            {isNow && <div style={{ position: 'absolute', top: -14, fontSize: 10, color: 'var(--lilac-deep)', fontWeight: 700 }}>现在</div>}
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { TabToday, PieDoodle, TimelineMini });
