import { CloudMascot } from '../../components/mascots/CloudMascot';
import { DoodleButton } from '../../components/primitives/DoodleButton';
import { SettingCard } from '../widgets/SettingCard';
import { usePrefs } from '../../hooks/usePrefs';
import type { FloatingVariant, MascotKind, Theme } from '@shared/tokens';

export function TabSettings() {
  const { prefs, update } = usePrefs();
  if (!prefs) return <div style={{ padding: 40 }}>加载中…</div>;

  const onExport = async () => {
    const events = await window.api.data.exportAll();
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudcloud-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onClear = async () => {
    if (!confirm('确定要清空所有历史数据？此操作不可撤销。')) return;
    await window.api.data.clearAll();
    alert('已清空～云云会重新记录');
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)', marginBottom: 18 }}>
        偏好设置
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <SettingCard title="开机自启动" desc="电脑开机时自动开始记录" value={prefs.startOnBoot} onChange={(v) => void update('startOnBoot', v)} />
        <SettingCard title="悬浮窗" desc="软件最小化时保留桌面小云朵" value={prefs.floatingEnabled} onChange={(v) => void update('floatingEnabled', v)} />
        <SettingCard title="空闲检测" desc="5 分钟不操作就自动停表" value={prefs.idleDetection} onChange={(v) => void update('idleDetection', v)} />
        <SettingCard title="隐私空白" desc="不记录包含 '密码' 的窗口" value={prefs.privacyBlank} onChange={(v) => void update('privacyBlank', v)} />
        <SettingCard title="久坐提醒" desc="每 45 分钟温柔提醒一下" value={prefs.sedentaryReminder} onChange={(v) => void update('sedentaryReminder', v)} />
        <SettingCard title="每日小结" desc="睡前推送今天的回顾卡片" value={prefs.dailySummary} onChange={(v) => void update('dailySummary', v)} />
      </div>

      {/* External-choice row: theme / mascot / variant */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 14 }}>
        <ChoiceCard title="主题" value={prefs.theme} options={[['light', '白天'], ['dark', '夜晚']]} onChange={(v) => void update('theme', v as Theme)} />
        <ChoiceCard title="吉祥物" value={prefs.mascotKind} options={[['cloud', '云云'], ['jelly', '果冻']]} onChange={(v) => void update('mascotKind', v as MascotKind)} />
        <ChoiceCard title="悬浮窗样式" value={prefs.floatingVariant} options={[['A', '云朵'], ['B', '胶囊'], ['C', '站立']]} onChange={(v) => void update('floatingVariant', v as FloatingVariant)} />
      </div>

      <div className="doodle-border" style={{
        marginTop: 18, padding: '18px 22px', background: 'var(--cloud-white)',
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <CloudMascot size={56} mood="calm" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>所有数据都保存在你的电脑里</div>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>
            云云不会把你的活动上传到任何地方。可以随时导出或清空～
          </div>
        </div>
        <DoodleButton onClick={onExport}>导出</DoodleButton>
        <DoodleButton variant="peach" onClick={onClear}>清空</DoodleButton>
      </div>
    </div>
  );
}

interface ChoiceCardProps<T extends string> {
  title: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}

function ChoiceCard<T extends string>({ title, value, options, onChange }: ChoiceCardProps<T>) {
  return (
    <div className="doodle-border b-tight" style={{ padding: '14px 18px', background: 'var(--cloud-white)' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(([k, label]) => (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={`tab-doodle ${value === k ? 'active' : ''}`}
            style={{ fontSize: 12 }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
