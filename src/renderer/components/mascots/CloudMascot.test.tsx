import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { CloudMascot } from './CloudMascot';

describe('CloudMascot', () => {
  it('renders an SVG scaled by size prop', () => {
    const { container } = render(<CloudMascot size={120} mood="happy" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute('width')).toBe('120');
  });

  it('applies wobble animation class when wobble=true (default)', () => {
    const { container } = render(<CloudMascot size={40} mood="calm" />);
    expect(container.querySelector('svg')!.className.baseVal).toContain('animate-wobble');
  });

  it('omits wobble class when wobble=false', () => {
    const { container } = render(<CloudMascot size={40} mood="calm" wobble={false} />);
    expect(container.querySelector('svg')!.className.baseVal).not.toContain('animate-wobble');
  });
});
