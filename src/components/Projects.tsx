import type { SiteContent } from '../i18n/content';
import { ProjectCard } from './ProjectCard';
import { SectionTitle } from './SectionTitle';

type ProjectsProps = {
  content: SiteContent['projects'];
};

export function Projects({ content }: ProjectsProps) {
  return (
    <section className="section section--projects" id="projects">
      <SectionTitle eyebrow={content.eyebrow} title={content.title} copy={content.copy} />
      <div className="project-gallery">
        {content.items.map((project, index) => (
          <ProjectCard project={project} index={index} key={project.id} />
        ))}
      </div>
    </section>
  );
}
