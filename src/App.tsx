import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BrainCircuit, Gamepad2, Orbit, Smartphone } from 'lucide-react';
import { Contact } from './components/Contact';
import { HeroParticleScanner } from './components/HeroParticleScanner';
import { InteractiveLab } from './components/InteractiveLab';
import { PipelineGraph } from './components/PipelineGraph';
import { ProjectCard } from './components/ProjectCard';
import { SectionTitle } from './components/SectionTitle';
import { Timeline } from './components/Timeline';
import { projects } from './constants/projects';

const buildAreas = [
  {
    title: 'AI Products',
    copy: 'AI-assisted tools, creative workflows, and product systems built around real user behavior.',
    icon: BrainCircuit,
    code: 'AI',
  },
  {
    title: 'Mobile Apps',
    copy: 'Focused iOS and mobile experiments with fast prototyping, clear loops, and tactile polish.',
    icon: Smartphone,
    code: 'APP',
  },
  {
    title: 'Games',
    copy: 'Play systems, progression ideas, mechanics prototypes, and expressive digital toys.',
    icon: Gamepad2,
    code: 'GAME',
  },
  {
    title: 'Interactive Worlds',
    copy: 'Spatial interfaces, VR concepts, world archives, and object-memory experiences.',
    icon: Orbit,
    code: 'VR',
  },
];

function useCompactViewport() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px), (pointer: coarse)');
    const sync = () => setIsCompact(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return isCompact;
}

function App() {
  const isCompact = useCompactViewport();
  const reducedMotion = useReducedMotion();

  return (
    <main>
      <HeroParticleScanner isCompact={isCompact} />

      <section className="section section--build" id="build">
        <SectionTitle
          eyebrow="What We Build"
          title="Product craft, game feel, AI systems, and spatial interfaces under one roof."
          copy="BoniStudio is a small lab with a wide surface area: fast enough to prototype, technical enough to ship, visual enough to make the work memorable."
        />
        <div className="build-grid">
          {buildAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.article
                className="build-card"
                key={area.title}
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <span className="build-card__code">{area.code}</span>
                <Icon size={25} aria-hidden="true" />
                <h3>{area.title}</h3>
                <p>{area.copy}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="section section--projects" id="projects">
        <SectionTitle
          eyebrow="Projects"
          title="An archive of shipped apps, prototypes, and long-range worlds."
          copy="Each project is treated like a living object: product logic, visual language, build system, and future memory."
        />
        <div className="project-gallery">
          {projects.map((project, index) => (
            <ProjectCard project={project} index={index} key={project.title} />
          ))}
        </div>
      </section>

      <section className="section section--pipeline" id="pipeline">
        <SectionTitle
          eyebrow="AI Pipeline"
          title="Idea → GPT → Claude → Codex → Build → Deploy → Users"
          copy="The production system is AI-assisted by default: human taste sets direction, models expand options, Codex turns intent into working surfaces, users close the loop."
          align="center"
        />
        <PipelineGraph />
      </section>

      <section className="section section--lab" id="lab">
        <SectionTitle
          eyebrow="Interactive Lab"
          title="Small technical experiments that make the archive feel alive."
          copy="Particle reconstruction, neural maps, spatial cursors, and product records are mocked as a first lab surface for future deeper experiments."
        />
        <InteractiveLab />
      </section>

      <section className="section section--timeline" id="timeline">
        <SectionTitle
          eyebrow="Timeline"
          title="The studio grows as an archive, not a pitch deck."
        />
        <Timeline />
      </section>

      <Contact />
    </main>
  );
}

export default App;
