import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BrainCircuit, Gamepad2, Orbit, Smartphone } from 'lucide-react';
import { Contact } from './components/Contact';
import { HeroParticleScanner } from './components/HeroParticleScanner';
import { InteractiveLab } from './components/InteractiveLab';
import { PipelineGraph } from './components/PipelineGraph';
import { ProjectCard } from './components/ProjectCard';
import { SectionTitle } from './components/SectionTitle';
import { SiteHeader } from './components/SiteHeader';
import { Timeline } from './components/Timeline';
import { content, type BuildAreaContent, type Language } from './i18n/content';

const languageStorageKey = 'bonistudio.language';

const buildIcons = {
  ai: BrainCircuit,
  apps: Smartphone,
  games: Gamepad2,
  worlds: Orbit,
} satisfies Record<BuildAreaContent['id'], typeof BrainCircuit>;

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en';
  }

  try {
    const storedLanguage = window.localStorage.getItem(languageStorageKey);
    return storedLanguage === 'zh' || storedLanguage === 'en' ? storedLanguage : 'en';
  } catch {
    return 'en';
  }
}

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
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const isCompact = useCompactViewport();
  const reducedMotion = useReducedMotion();
  const siteContent = content[language];

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.body.dataset.language = language;
    document.title = siteContent.meta.title;

    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', siteContent.meta.description);

    try {
      window.localStorage.setItem(languageStorageKey, language);
    } catch {
      // localStorage can be unavailable in restricted browsing modes.
    }
  }, [language, siteContent.meta.description, siteContent.meta.title]);

  return (
    <>
      <SiteHeader content={siteContent.nav} language={language} onLanguageChange={setLanguage} />

      <main id="top">
        <HeroParticleScanner content={siteContent.hero} isCompact={isCompact} />

        <section className="section section--build" id="build">
          <SectionTitle
            eyebrow={siteContent.build.eyebrow}
            title={siteContent.build.title}
            copy={siteContent.build.copy}
          />
          <div className="build-grid">
            {siteContent.build.areas.map((area, index) => {
              const Icon = buildIcons[area.id];
              return (
                <motion.article
                  className="build-card"
                  key={area.id}
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
            eyebrow={siteContent.projects.eyebrow}
            title={siteContent.projects.title}
            copy={siteContent.projects.copy}
          />
          <div className="project-gallery">
            {siteContent.projects.items.map((project, index) => (
              <ProjectCard project={project} index={index} key={project.signal} />
            ))}
          </div>
        </section>

        <section className="section section--pipeline" id="pipeline">
          <SectionTitle
            eyebrow={siteContent.pipeline.eyebrow}
            title={siteContent.pipeline.title}
            copy={siteContent.pipeline.copy}
            align="center"
          />
          <PipelineGraph ariaLabel={siteContent.pipeline.ariaLabel} nodes={siteContent.pipeline.nodes} />
        </section>

        <section className="section section--lab" id="lab">
          <SectionTitle
            eyebrow={siteContent.lab.eyebrow}
            title={siteContent.lab.title}
            copy={siteContent.lab.copy}
          />
          <InteractiveLab
            archiveItems={siteContent.lab.archiveItems}
            ariaLabel={siteContent.lab.ariaLabel}
            modules={siteContent.lab.modules}
          />
        </section>

        <section className="section section--timeline" id="timeline">
          <SectionTitle
            eyebrow={siteContent.timeline.eyebrow}
            title={siteContent.timeline.title}
          />
          <Timeline items={siteContent.timeline.items} />
        </section>

        <Contact content={siteContent.contact} footer={siteContent.footer} />
      </main>
    </>
  );
}

export default App;
