import { motion, useReducedMotion } from 'framer-motion';
import { AccentTitle, type AccentTone } from './AccentTitle';

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: 'left' | 'center';
  accent?: AccentTone;
};

export function SectionTitle({ eyebrow, title, copy, align = 'left', accent = 'cyan' }: SectionTitleProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`section-title section-title--${align}`}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <p>{eyebrow}</p>
      <AccentTitle text={title} accent={accent} />
      {copy ? <span>{copy}</span> : null}
    </motion.div>
  );
}
