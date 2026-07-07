import { motion, useReducedMotion } from 'framer-motion';
import type { TimelineItemContent } from '../i18n/content';

type TimelineProps = {
  items: TimelineItemContent[];
};

export function Timeline({ items }: TimelineProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="timeline-list">
      {items.map((item, index) => (
        <motion.article
          className="timeline-item"
          key={`${item.year}-${item.title}`}
          initial={reducedMotion ? false : { opacity: 0, x: -24 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: index * 0.08 }}
        >
          <span>{item.year}</span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
