import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import type { Project } from '../data/projects';

type ProjectCardProps = {
  project: Project;
  index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      className={`project-card project-card--${project.accent} ${project.span ? `project-card--${project.span}` : ''}`}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reducedMotion ? undefined : { y: -8, rotateX: 1.2, rotateY: -1.2 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.24), ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="project-card__scan" />
      <div className="project-card__header">
        <span>{project.signal}</span>
        <span>{project.status}</span>
      </div>
      <div className="project-card__body">
        <p>{project.type}</p>
        <h3>{project.title}</h3>
        <span>{project.description}</span>
      </div>
      <div className="project-card__footer">
        <div className="project-card__tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <span className="project-card__year">
          {project.year}
          <ExternalLink size={15} aria-hidden="true" />
        </span>
      </div>
    </motion.article>
  );
}
