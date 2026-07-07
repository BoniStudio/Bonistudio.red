import { motion, useReducedMotion } from 'framer-motion';
import { Cpu, GitBranch, Rocket, Sparkles } from 'lucide-react';

const pipelineNodes = [
  { label: 'Idea', detail: 'spark', icon: Sparkles },
  { label: 'GPT', detail: 'strategy' },
  { label: 'Claude', detail: 'systems' },
  { label: 'Codex', detail: 'build', icon: Cpu },
  { label: 'Build', detail: 'ship', icon: GitBranch },
  { label: 'Deploy', detail: 'release', icon: Rocket },
  { label: 'Users', detail: 'signal' },
];

export function PipelineGraph() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pipeline-rail" aria-label="AI-assisted creation pipeline">
      <div className="pipeline-rail__line" aria-hidden="true">
        {!reducedMotion ? (
          <>
            <motion.span
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 5.6, ease: 'linear', repeat: Infinity }}
            />
            <motion.span
              animate={{ x: ['-25%', '110%'] }}
              transition={{ duration: 7.2, ease: 'linear', repeat: Infinity, delay: 1.1 }}
            />
          </>
        ) : null}
      </div>
      <div className="pipeline-rail__nodes">
        {pipelineNodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <motion.div
              className="pipeline-node"
              key={node.label}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <div className="pipeline-node__orb">
                {Icon ? <Icon size={17} aria-hidden="true" /> : <span>{index + 1}</span>}
              </div>
              <strong>{node.label}</strong>
              <span>{node.detail}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
