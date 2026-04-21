import { useState, useEffect } from 'react';
import { PillAvatar } from './variants/PillAvatar';
import { PillBar } from './variants/PillBar';
import { StandingMascot } from './variants/StandingMascot';
import type { FloatingVariant, Mood } from '@shared/tokens';
import type { AppIconKind } from '../components/primitives/AppIcon';

export type WidgetState = 'pill' | 'card' | 'tooltip' | 'menu';
export interface CurrentApp { name: string; kind: AppIconKind; mins: number; }

interface FloatingWidgetProps {
  variant?: FloatingVariant;
  state?: WidgetState;
  mood?: Mood;
  curApp: CurrentApp;
  todayMins: number;
  onStateChange?: (s: WidgetState) => void;
}

export function FloatingWidget({
  variant = 'A',
  state: forcedState,
  mood = 'happy',
  curApp,
  todayMins,
  onStateChange,
}: FloatingWidgetProps) {
  const [state, setState] = useState<WidgetState>(forcedState ?? 'pill');
  useEffect(() => { if (forcedState) setState(forcedState); }, [forcedState]);
  const set = (s: WidgetState) => { setState(s); onStateChange?.(s); };

  const common = { state, set, curApp, todayMins, mood };
  if (variant === 'B') return <PillBar {...common} />;
  if (variant === 'C') return <StandingMascot {...common} />;
  return <PillAvatar {...common} />;
}
