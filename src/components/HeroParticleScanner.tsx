import { ArrowDownRight, FlaskConical } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { SiteContent } from '../i18n/content';
import { ParticleGlobe } from './ParticleGlobe';

function HeroBrandTitle({ title, reducedMotion }: { title: string; reducedMotion: boolean }) {
  return (
    <h1 id="hero-title" aria-label={title}>
      {Array.from(title).map((letter, index) => {
        const className = [
          'hero-title__letter',
          letter === 'B' ? 'hero-title__letter--b' : '',
        ].filter(Boolean).join(' ');

        return (
          <motion.span
            aria-hidden="true"
            className={className}
            initial={reducedMotion ? false : { opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.62, delay: 0.18 + index * 0.035, ease: [0.22, 1, 0.36, 1] }}
            key={`${letter}-${index}`}
          >
            {letter}
          </motion.span>
        );
      })}
    </h1>
  );
}

type HeroParticleScannerProps = {
  content: SiteContent['hero'];
  isCompact: boolean;
};

export function HeroParticleScanner({ content, isCompact }: HeroParticleScannerProps) {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero__layout">
        <motion.div
          className="hero__copy"
          initial={reducedMotion ? false : { opacity: 0, y: 24, filter: 'blur(12px)' }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.86, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="hero__kicker">{content.kicker}</p>
          <HeroBrandTitle title={content.title} reducedMotion={reducedMotion} />
          <p className="hero__subtitle">{content.subtitle}</p>
          <div className="hero__actions" aria-label={content.actionsLabel}>
            <a className="button button--primary" href="#projects">
              {content.primaryCta} <ArrowDownRight size={18} aria-hidden="true" />
            </a>
            <a className="button button--ghost" href="#lab">
              {content.secondaryCta} <FlaskConical size={18} aria-hidden="true" />
            </a>
          </div>
        </motion.div>

        <motion.div
          className="hero__visual"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96, filter: 'blur(14px)' }}
          animate={reducedMotion ? undefined : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="particle-earth-shell">
            <ParticleGlobe isCompact={isCompact} reducedMotion={reducedMotion} />
            <div className="particle-earth-shell__scan" />
            <div className="particle-earth-shell__axis" />
            <div className="particle-earth-shell__stream particle-earth-shell__stream--one" />
            <div className="particle-earth-shell__stream particle-earth-shell__stream--two" />
            <div className="particle-earth-shell__stream particle-earth-shell__stream--three" />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="hero__stats"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.76, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {content.stats.map((stat) => (
          <div className={`hero-stat hero-stat--${stat.tone}`} key={`${stat.label}-${stat.value}`}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
