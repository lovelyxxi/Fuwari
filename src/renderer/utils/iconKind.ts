import type { AppIconKind } from '../components/primitives/AppIcon';

export function iconKindFor(appName: string, exePath: string): AppIconKind {
  const s = `${appName} ${exePath}`.toLowerCase();
  if (/code|cursor|vim|ide|rider|webstorm|pycharm|idea/.test(s)) return 'code';
  if (/figma|sketch|photoshop|illustr|affinity|procreate/.test(s)) return 'design';
  if (/feishu|slack|wechat|weixin|qq|discord|teams|dingtalk|telegram/.test(s)) return 'chat';
  if (/chrome|firefox|edge|safari|brave|opera|arc/.test(s)) return 'browse';
  if (/spotify|music|netease|qqmusic/.test(s)) return 'music';
  if (/youtube|bilibili|netflix|vlc|iina/.test(s)) return 'video';
  if (/steam|epic|game/.test(s)) return 'game';
  if (/notion|word|excel|office|obsidian|logseq|onenote/.test(s)) return 'doc';
  if (/mail|outlook|thunderbird/.test(s)) return 'mail';
  if (/terminal|cmd|powershell|pwsh|bash|wsl/.test(s)) return 'term';
  return 'doc';
}
