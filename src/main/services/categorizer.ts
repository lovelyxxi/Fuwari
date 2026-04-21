import type { Category } from '../../shared/tokens';

const RULES: { pattern: RegExp; category: Category }[] = [
  { pattern: /(code|webstorm|idea|rider|pycharm|vim|emacs|sublime|notepad\+\+|terminal|powershell|cmd|wsl)/i, category: '工作' },
  { pattern: /(figma|sketch|photoshop|illustrator|affinity|procreate|blender)/i, category: '工作' },
  { pattern: /(notion|obsidian|logseq|onenote|word|excel|powerpoint)/i, category: '工作' },
  { pattern: /(chrome|firefox|edge|safari|arc|brave|opera)/i, category: '浏览' },
  { pattern: /(wechat|weixin|dingtalk|feishu|lark|slack|teams|discord|telegram|qq|signal|mail|outlook|thunderbird)/i, category: '沟通' },
  { pattern: /(spotify|netflix|youtube|bilibili|steam|epicgames|vlc|iina|neteasemusic|qqmusic)/i, category: '娱乐' },
  { pattern: /(飞书|微信|钉钉|邮箱)/, category: '沟通' },
];

export function categorize(exePath: string, appName: string): Category {
  const haystack = `${exePath} ${appName}`;
  for (const r of RULES) {
    if (r.pattern.test(haystack)) return r.category;
  }
  return '其他';
}
