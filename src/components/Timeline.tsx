import { motion, useReducedMotion } from 'framer-motion';

const timelineItems = [
  { year: '2026', title: 'BoniStudio founded', detail: 'A small AI-native studio begins building in public.' },
  { year: '2026', title: 'First apps shipped', detail: 'Early mobile and creative product experiments leave the lab.' },
  { year: '2026', title: 'AI-native workflow established', detail: 'GPT, Claude, Codex, and human direction become one production loop.' },
  { year: '2027', title: 'VR prototype target', detail: 'Space Station systems move toward a playable spatial prototype.' },
  { year: 'Future', title: 'Interactive worlds and AI products', detail: 'The archive expands into richer products, games, and living interfaces.' },
];

export function Timeline() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="timeline-list">
      {timelineItems.map((item, index) => (
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
