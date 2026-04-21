export default function App() {
  return (
    <div className="paper-bg" style={{ padding: 40 }}>
      <div className="doodle-border" style={{ padding: 20, background: 'var(--cloud-white)' }}>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 32 }}>Hello CloudCloud ☁</div>
        <button className="btn-doodle primary" style={{ marginTop: 12 }}>点我试试</button>
      </div>
    </div>
  );
}
