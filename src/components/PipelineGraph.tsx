import { motion, useReducedMotion } from 'framer-motion';
import { Cpu, GitBranch, Rocket, Sparkles } from 'lucide-react';
import type { PipelineNodeContent, PipelineNodeId } from '../i18n/content';

const pipelineIcons: Partial<Record<PipelineNodeId, typeof Sparkles>> = {
  idea: Sparkles,
  codex: Cpu,
  build: GitBranch,
  deploy: Rocket,
};

type PipelineGraphProps = {
  ariaLabel: string;
  nodes: PipelineNodeContent[];
};

export function PipelineGraph({ ariaLabel, nodes }: PipelineGraphProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pipeline-rail" aria-label={ariaLabel}>
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
        {nodes.map((node, index) => {
          const Icon = pipelineIcons[node.id];
          return (
            <motion.div
              className="pipeline-node"
              key={node.id}
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
