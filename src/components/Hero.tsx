import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { createScope, createTimeline, stagger } from 'animejs';
import { useEffect, useRef } from 'react';
import type { SiteContent } from '../i18n/content';
import { SignalField } from './SignalField';
import { StudioSystemMap } from './StudioSystemMap';

type HeroProps = {
  content: SiteContent['hero'];
  isCompact: boolean;
};

const titleRows = ['BONI', 'STUDIO'];

export function Hero({ content, isCompact }: HeroProps) {
  const root = useRef<HTMLElement>(null);
  const isChinese = /[\u3400-\u9fff]/u.test(content.kicker);

  useEffect(() => {
    if (!root.current) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scope = createScope({ root }).add(() => {
      if (reducedMotion) return;

      createTimeline({ defaults: { ease: 'outExpo' } })
        .add('.signal-hero__rail', { scaleX: [0, 1], duration: 900 })
        .add('[data-title-char]', {
          y: ['115%', '0%'],
          rotate: [5, 0],
          opacity: [0, 1],
          duration: 1050,
          delay: stagger(38),
        }, 120)
        .add('[data-system-link]', {
          opacity: [0, 0.7],
          strokeDashoffset: [120, 0],
          duration: 1050,
          delay: stagger(90),
        }, 240)
        .add('[data-system-node]', {
          opacity: [0, 1],
          scale: [0.82, 1],
          duration: 820,
          delay: stagger(100),
        }, 360)
        .add('[data-system-core]', {
          opacity: [0, 1],
          scale: [0.72, 1],
          duration: 920,
        }, 540)
        .add('[data-hero-copy]', {
          y: [22, 0],
          opacity: [0, 1],
          duration: 720,
          delay: stagger(90),
        }, 520)
        .add('.signal-hero__datum', {
          y: [16, 0],
          opacity: [0, 1],
          duration: 620,
          delay: stagger(80),
        }, 680)
        .add('.signal-hero__scroll', { opacity: [0, 1], duration: 500 }, 920);
    });

    return () => scope.revert();
  }, [content]);

  return (
    <section className="signal-hero" id="home" ref={root}>
      <SignalField className="signal-hero__visual" isCompact={isCompact} />

      <div className="signal-hero__eyebrow" data-hero-copy>
        <span>{content.kicker}</span>
        <span>{isCompact ? 'BNS / 2026' : 'Seattle — Global / est. 2026'}</span>
      </div>

      <div className="signal-hero__stage">
        <div className="signal-hero__identity">
          <h1 className="signal-hero__title" aria-label={content.title}>
            {titleRows.map((word) => (
              <span className="signal-hero__word" key={word}>
                {Array.from(word).map((character, index) => (
                  <span data-title-char aria-hidden="true" key={`${character}-${index}`}>
                    {character}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <div className="signal-hero__manifest" data-hero-copy aria-hidden="true">
            <span>AI AT THE CORE</span>
            <i />
            <span>REAL PRODUCTS OUT</span>
          </div>
        </div>

        <StudioSystemMap content={content.engine} />
      </div>

      <div className="signal-hero__rail" aria-hidden="true" />

      <div className="signal-hero__bottom">
        <div className="signal-hero__intro" data-hero-copy>
          <p>{content.subtitle}</p>
          <div className="signal-hero__actions" aria-label={content.actionsLabel}>
            <a className="signal-cta signal-cta--primary" href="#projects">
              {content.primaryCta}
              <ArrowDownRight aria-hidden="true" />
            </a>
            <a className="signal-cta" href="#lab">
              {content.secondaryCta}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>

        <dl className="signal-hero__data" data-hero-copy>
          {content.stats.map((stat, index) => (
            <div className="signal-hero__datum" key={stat.label}>
              <dt>{String(index + 1).padStart(2, '0')} / {stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <a className="signal-hero__scroll" href="#build">
        <span>{isChinese ? '滚动解码' : 'Scroll to decode'}</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
