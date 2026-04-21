import { describe, it, expect } from 'vitest';
import { categorize } from './categorizer';

describe('categorize', () => {
  it('classifies dev tools as 工作', () => {
    expect(categorize('C:\\Code\\Microsoft VS Code\\Code.exe', 'VS Code')).toBe('工作');
  });
  it('classifies browsers as 浏览', () => {
    expect(categorize('C:\\chrome.exe', 'Chrome')).toBe('浏览');
  });
  it('classifies chat apps as 沟通', () => {
    expect(categorize('C:\\feishu.exe', '飞书')).toBe('沟通');
  });
  it('classifies streaming as 娱乐', () => {
    expect(categorize('C:\\netflix.exe', 'Netflix')).toBe('娱乐');
  });
  it('defaults unknown apps to 其他', () => {
    expect(categorize('C:\\unknown.exe', 'Unknown')).toBe('其他');
  });
});
