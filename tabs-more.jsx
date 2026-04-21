// 应用排行 / 周月统计 / 专注 / 设置

function TabApps() {
  const [filter, setFilter] = React.useState('全部');
  const cats = ['全部', ...new Set(TODAY_APPS.map(a=>a.cat))];
  const list = filter === '全部' ? TODAY_APPS : TODAY_APPS.filter(a=>a.cat===filter);
  const max = Math.max(...list.map(a=>a.mins));

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)' }}>应用排行榜</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>看看谁在偷偷抢占你的今天～</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {cats.map(c => (
            <button key={c} className={`tab-doodle ${filter===c?'active':''}`} onClick={()=>setFilter(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((app, i) => (
          <div key={app.name} className="doodle-border b-tight" style={{ padding: '14px 18px', background: 'var(--cloud-white)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 28, width: 36, color: i<3?'var(--lilac-deep)':'var(--ink-mute)', textAlign: 'center' }}>
              {i+1}
            </div>
            <AppIcon kind={app.kind} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{app.name}</div>
                <span className="chip" style={{ background: app.color }}>{app.cat}</span>
              </div>
              <div style={{ height: 10, background: 'var(--paper-deep)', borderRadius: 5, overflow: 'hidden', border: '1.5px solid var(--line)' }}>
                <div style={{ height: '100%', width: `${(app.mins/max)*100}%`, background: app.color, borderRight: '1.5px solid var(--line)' }} />
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 70 }}>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: 24, lineHeight: 1, color: 'var(--ink)' }}>{fmtMins(app.mins)}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}>{Math.round(app.mins/60*10)/10}h</div>
            </div>
            <button className="btn-doodle" style={{ padding: '4px 10px', fontSize: 11, boxShadow: '2px 2px 0 var(--line)' }}>⏱ 限额</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabTimeline() {
  const max = Math.max(...HOURLY);
  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)' }}>今天的时光小径</div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>一天是怎么过去的呢？</div>
      </div>

      <div className="doodle-border" style={{ padding: '28px 24px 18px', background: 'var(--cloud-white)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 200, position: 'relative' }}>
          {/* 虚线水平参考 */}
          {[0.25, 0.5, 0.75].map(p => (
            <div key={p} style={{ position: 'absolute', left:0, right:0, bottom: `${p*100}%`, borderTop: '1px dashed var(--ink-mute)' }} />
          ))}
          {HOURLY.map((v, i) => {
            const hPx = max === 0 ? 0 : (v / max) * 190 + (v > 0 ? 4 : 0);
            const isNow = i === 15;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%', position: 'relative' }}>
                <div style={{
                  width: '100%',
                  height: hPx,
                  background: isNow ? 'var(--lilac)' : (v > 40 ? 'var(--mint)' : v > 15 ? 'var(--blue)' : 'var(--peach)'),
                  border: v > 0 ? '1.8px solid var(--line)' : 'none',
                  borderRadius: '5px 7px 1px 1px',
                }} />
                {isNow && (
                  <div style={{ position: 'absolute', bottom: hPx + 8, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                    <div className="doodle-border b-tight" style={{ padding: '4px 8px', background: 'var(--lemon)', fontSize: 10, fontWeight: 700 }}>
                      ⬇ 现在 · Figma
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-mute)', marginTop: 8, paddingTop: 8, borderTop: '1.5px dashed var(--ink-mute)' }}>
          {[0,3,6,9,12,15,18,21,24].map(h => <span key={h}>{String(h).padStart(2,'0')}:00</span>)}
        </div>
      </div>

      {/* 高光瞬间 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginTop:18 }}>
        <HighlightCard icon="☀" title="最专注的时段" value="10:00 - 11:30" note="写了 127 行代码" />
        <HighlightCard icon="☕" title="最长的小憩" value="13:15 - 14:00" note="好好吃了午饭呢" />
        <HighlightCard icon="💧" title="切换应用" value="48 次" note="比昨天少一点啦" />
      </div>
    </div>
  );
}
function HighlightCard({ icon, title, value, note }) {
  return (
    <div className="doodle-border b-tight" style={{ padding:'14px 16px', background:'var(--cloud-white)' }}>
      <div style={{ fontSize:22 }}>{icon}</div>
      <div style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:700, marginTop:4 }}>{title}</div>
      <div style={{ fontFamily:'var(--font-hand)', fontSize:22, color:'var(--ink)', marginTop:2 }}>{value}</div>
      <div style={{ fontSize:11, color:'var(--ink-mute)', marginTop:2 }}>{note}</div>
    </div>
  );
}

function TabStats() {
  const max = Math.max(...WEEKLY.map(d=>d.mins));
  const avg = Math.round(WEEKLY.reduce((s,d)=>s+d.mins,0)/7);
  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)' }}>本周回顾</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>4月15日 - 4月21日</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button className="tab-doodle active">周</button>
          <button className="tab-doodle">月</button>
          <button className="tab-doodle">年</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16 }}>
        <div className="doodle-border" style={{ padding:'22px 24px', background: 'var(--cloud-white)' }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:12, height: 200 }}>
            {WEEKLY.map((d, i) => {
              const h = (d.mins/max)*180 + 10;
              const isToday = i === 3;
              return (
                <div key={d.d} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ fontSize:10, color:'var(--ink-mute)', marginBottom:4 }}>{fmtMins(d.mins)}</div>
                  <div className="bar-doodle" style={{
                    width:'100%',
                    height: h,
                    background: isToday ? 'var(--lilac)' : 'var(--mint)',
                  }} />
                  <div style={{ marginTop:8, fontSize:13, fontFamily:'var(--font-hand)', color: isToday?'var(--lilac-deep)':'var(--ink-soft)', fontWeight: isToday?700:400 }}>
                    {d.d}
                  </div>
                </div>
              );
            })}
          </div>
          {/* 平均线标签 */}
          <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:10, fontSize:12, color:'var(--ink-soft)' }}>
            <span className="chip" style={{ background:'var(--lemon)' }}>日均 {fmtMins(avg)}</span>
            <span>比上周 ↑ 8%</span>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <StatCard label="总时长" big="42h" note="本周一共" bg="var(--blue)" />
          <StatCard label="最高一天" big="周四" note="8h 48m" bg="var(--lilac)" />
          <StatCard label="专注番茄" big="23 🍅" note="打败了 78% 的用户" bg="var(--peach)" />
        </div>
      </div>

      {/* 小鼓励 */}
      <div className="doodle-border" style={{ marginTop:18, padding:'16px 20px', background:'var(--mint)', display:'flex', gap:16, alignItems:'center' }}>
        <CloudMascot size={60} mood="happy" />
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'var(--font-hand)', fontSize:24, color:'var(--ink)' }}>这周辛苦啦 🌿</div>
          <div style={{ fontSize:13, color:'var(--ink-soft)', marginTop:2 }}>周六的休息时间最充足，周四最专注。保持这个节奏就很好哦～</div>
        </div>
      </div>
    </div>
  );
}
function StatCard({ label, big, note, bg }) {
  return (
    <div className="doodle-border b-tight" style={{ padding:'14px 18px', background:bg, flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
      <div style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:700, letterSpacing:1 }}>{label}</div>
      <div style={{ fontFamily:'var(--font-hand)', fontSize:30, color:'var(--ink)', lineHeight:1, marginTop:2 }}>{big}</div>
      <div style={{ fontSize:11, color:'var(--ink-soft)', marginTop:2 }}>{note}</div>
    </div>
  );
}

function TabFocus() {
  const [running, setRunning] = React.useState(false);
  const [secs, setSecs] = React.useState(25 * 60);
  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs(s => Math.max(0, s-1)), 1000);
    return () => clearInterval(t);
  }, [running]);
  const mm = String(Math.floor(secs/60)).padStart(2,'0');
  const ss = String(secs%60).padStart(2,'0');
  const pct = 1 - secs / (25 * 60);

  return (
    <div style={{ padding: '20px 32px 28px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap: 24 }}>
        {/* 番茄 */}
        <div style={{ flex: 1, display: 'flex', flexDirection:'column', alignItems: 'center', textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-hand)', fontSize:32, color:'var(--ink)' }}>来颗番茄吧 🍅</div>
          <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:2 }}>专心 25 分钟，休息 5 分钟</div>

          <div style={{ position:'relative', marginTop:16 }}>
            {/* 大圆（手绘） */}
            <svg width="230" height="230" viewBox="0 0 230 230">
              <circle cx="115" cy="115" r="100" fill="var(--peach)" stroke="var(--line)" strokeWidth="2.5" />
              <circle cx="115" cy="115" r="100" fill="none" stroke="var(--line)" strokeWidth="4" strokeDasharray={`${pct*628} 628`} strokeDashoffset="0" transform="rotate(-90 115 115)" strokeLinecap="round" />
              <path d="M 90 40 Q 95 28 115 32 Q 130 22 140 36 Q 160 28 155 48 Q 135 60 115 54 Q 95 58 90 40 Z" fill="var(--mint)" stroke="var(--line)" strokeWidth="2" />
              <text x="115" y="128" textAnchor="middle" fontFamily="Nunito" fontWeight="800" fontSize="54" fill="var(--ink)">{mm}:{ss}</text>
            </svg>
          </div>

          <div style={{ display:'flex', gap:10, marginTop: 18 }}>
            <button className="btn-doodle primary" onClick={()=>setRunning(r=>!r)}>{running ? '⏸ 暂停' : '▶ 开始专注'}</button>
            <button className="btn-doodle" onClick={()=>{ setRunning(false); setSecs(25*60); }}>↺ 重置</button>
          </div>
        </div>

        {/* 右：今日番茄清单 + 设定 */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="doodle-border b-tight" style={{ padding: '14px 16px', background:'var(--cloud-white)' }}>
            <div style={{ fontSize: 11, color:'var(--ink-soft)', fontWeight:700, letterSpacing:1 }}>今天的番茄</div>
            <div style={{ fontFamily:'var(--font-hand)', fontSize:30, color:'var(--ink)', lineHeight:1, margin:'4px 0 10px' }}>5 / 8</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {Array.from({length:8}).map((_,i)=>(
                <div key={i} style={{ width:24, height:24, opacity: i<5?1:0.35 }}>
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <circle cx="12" cy="14" r="8" fill={i<5?'var(--peach)':'var(--paper-deep)'} stroke="var(--line)" strokeWidth="1.5"/>
                    <path d="M 9 6 Q 12 3 15 6" stroke="var(--line)" strokeWidth="1.5" fill="var(--mint)"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>

          <div className="doodle-border b-tight" style={{ padding: '14px 16px', background:'var(--cloud-white)' }}>
            <div style={{ fontSize: 11, color:'var(--ink-soft)', fontWeight:700, letterSpacing:1, marginBottom:6 }}>本轮任务</div>
            <input defaultValue="完成屏幕时间 App 的 UI" style={{
              width: '100%', border:'none', borderBottom:'1.5px dashed var(--ink-mute)',
              background:'transparent', fontSize:14, padding:'4px 0', outline:'none', color:'var(--ink)', fontFamily:'inherit'
            }} />
          </div>

          <div className="doodle-border b-tight" style={{ padding: '14px 16px', background:'var(--lemon)' }}>
            <div style={{ fontSize: 12, color:'var(--ink)', fontWeight:700 }}>专注期间</div>
            <label style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, fontSize:13 }}>
              <input type="checkbox" defaultChecked /> 屏蔽娱乐类应用
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, fontSize:13 }}>
              <input type="checkbox" defaultChecked /> 隐藏通知
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, fontSize:13 }}>
              <input type="checkbox" /> 白噪音陪伴
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabSettings() {
  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)', marginBottom: 18 }}>偏好设置</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <SettingCard title="开机自启动"  desc="电脑开机时自动开始记录" on />
        <SettingCard title="悬浮窗"       desc="软件最小化时保留桌面小云朵" on />
        <SettingCard title="空闲检测"     desc="5 分钟不操作就自动停表" on />
        <SettingCard title="隐私空白"     desc="不记录包含 '密码' 的窗口" />
        <SettingCard title="久坐提醒"     desc="每 45 分钟温柔提醒一下"  on />
        <SettingCard title="每日小结"     desc="睡前推送今天的回顾卡片" />
      </div>

      <div className="doodle-border" style={{ marginTop:18, padding:'18px 22px', background:'var(--cloud-white)', display:'flex', alignItems:'center', gap:18 }}>
        <CloudMascot size={56} mood="calm" />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, color:'var(--ink-soft)', fontWeight:700 }}>所有数据都保存在你的电脑里</div>
          <div style={{ fontSize:12, color:'var(--ink-mute)', marginTop:2 }}>
            云云不会把你的活动上传到任何地方。可以随时导出或清空～
          </div>
        </div>
        <button className="btn-doodle">导出</button>
        <button className="btn-doodle peach">清空</button>
      </div>
    </div>
  );
}
function SettingCard({ title, desc, on }) {
  const [v, setV] = React.useState(!!on);
  return (
    <div className="doodle-border b-tight" style={{ padding:'14px 18px', background:'var(--cloud-white)', display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'var(--ink)' }}>{title}</div>
        <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:2 }}>{desc}</div>
      </div>
      <button onClick={()=>setV(!v)} style={{
        width:44, height:24, border:'2px solid var(--line)', borderRadius:14,
        background: v ? 'var(--mint)' : 'var(--paper-deep)',
        padding:0, cursor:'pointer', position:'relative', flexShrink:0,
      }}>
        <div style={{
          width:16, height:16, borderRadius:'50%', background:'var(--cloud-white)',
          border:'1.5px solid var(--line)',
          position:'absolute', top:2, left: v ? 22 : 2, transition:'left .15s',
        }} />
      </button>
    </div>
  );
}

Object.assign(window, { TabApps, TabTimeline, TabStats, TabFocus, TabSettings });
