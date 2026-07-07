import type { ComponentProps } from 'react';
import { HeroParticleScanner } from './HeroParticleScanner';

type HeroProps = ComponentProps<typeof HeroParticleScanner>;

export function Hero(props: HeroProps) {
  return <HeroParticleScanner {...props} />;
}
