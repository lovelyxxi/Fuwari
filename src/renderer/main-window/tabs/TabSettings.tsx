import { useState } from 'react';
import { CloudMascot } from '../../components/mascots/CloudMascot';
import { DoodleButton } from '../../components/primitives/DoodleButton';
import { SettingCard } from '../widgets/SettingCard';

export function TabSettings() {
  const [startOnBoot, setStartOnBoot] = useState(true);
  const [floating, setFloating] = useState(true);
  const [idleDet, setIdleDet] = useState(true);
  const [privacy, setPrivacy] = useState(false);
  const [sedentary, setSedentary] = useState(true);
  const [daily, setDaily] = useState(false);

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)', marginBottom: 18 }}>
        偏好设置
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <SettingCard title="开机自启动" desc="电脑开机时自动开始记录" value={startOnBoot} onChange={setStartOnBoot} />
        <SettingCard title="悬浮窗" desc="软件最小化时保留桌面小云朵" value={floating} onChange={setFloating} />
        <SettingCard title="空闲检测" desc="5 分钟不操作就自动停表" value={idleDet} onChange={setIdleDet} />
        <SettingCard title="隐私空白" desc="不记录包含 '密码' 的窗口" value={privacy} onChange={setPrivacy} />
        <SettingCard title="久坐提醒" desc="每 45 分钟温柔提醒一下" value={sedentary} onChange={setSedentary} />
        <SettingCard title="每日小结" desc="睡前推送今天的回顾卡片" value={daily} onChange={setDaily} />
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
        <DoodleButton>导出</DoodleButton>
        <DoodleButton variant="peach">清空</DoodleButton>
      </div>
    </div>
  );
}
