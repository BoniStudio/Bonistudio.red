import { motion, useReducedMotion } from 'framer-motion';
import { BrainCircuit, Gamepad2, Orbit, Smartphone } from 'lucide-react';
import type { BuildAreaContent, SiteContent } from '../i18n/content';
import { SectionTitle } from './SectionTitle';

const buildIcons = {
  ai: BrainCircuit,
  apps: Smartphone,
  games: Gamepad2,
  worlds: Orbit,
} satisfies Record<BuildAreaContent['id'], typeof BrainCircuit>;

type WhatWeBuildProps = {
  content: SiteContent['build'];
};

export function WhatWeBuild({ content }: WhatWeBuildProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section className="section section--build" id="build">
      <SectionTitle eyebrow={content.eyebrow} title={content.title} copy={content.copy} />
      <div className="build-grid">
        {content.areas.map((area, index) => {
          const Icon = buildIcons[area.id];
          return (
            <motion.article
              className="build-card"
              key={area.id}
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
            >
              <span className="build-card__code">{area.code}</span>
              <Icon size={25} aria-hidden="true" />
              <h3>{area.title}</h3>
              <p>{area.copy}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
