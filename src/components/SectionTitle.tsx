import { motion, useReducedMotion } from 'framer-motion';

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: 'left' | 'center';
};

export function SectionTitle({ eyebrow, title, copy, align = 'left' }: SectionTitleProps) {
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
      <h2>{title}</h2>
      {copy ? <span>{copy}</span> : null}
    </motion.div>
  );
}
