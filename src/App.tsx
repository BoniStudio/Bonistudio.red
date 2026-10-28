import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Github,
  Mail,
  Radio,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ExperimentField } from './components/ExperimentField';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { OperationsCaseStudy } from './components/OperationsCaseStudy';
import { ProjectVisual } from './components/ProjectVisual';
import { useSignalMotion } from './hooks/useSignalMotion';
import {
  content,
  type BuildAreaId,
  type LabModuleId,
  type Language,
  type SiteContent,
} from './i18n/content';

const languageStorageKey = 'bonistudio.language';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
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

type SectionIntroProps = {
  index: string;
  eyebrow: string;
  title: string;
  copy?: string;
  invert?: boolean;
};

function SectionIntro({ index, eyebrow, title, copy, invert = false }: SectionIntroProps) {
  return (
    <header className={`signal-section-intro${invert ? ' is-inverted' : ''}`}>
      <div className="signal-section-intro__meta" data-reveal-item>
        <span>{index}</span>
        <span>{eyebrow}</span>
      </div>
      <h2 data-reveal-item>{title}</h2>
      {copy && <p data-reveal-item>{copy}</p>}
    </header>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [activeBuild, setActiveBuild] = useState<BuildAreaId>('ai');
  const [activeProject, setActiveProject] = useState(0);
  const [activeLab, setActiveLab] = useState<LabModuleId>('scanner');
  const isCompact = useCompactViewport();
  const pageRoot = useRef<HTMLDivElement>(null);
  const siteContent = content[language];
  const projectTotal = siteContent.projects.items.length;
  const selectedBuild = siteContent.build.areas.find((area) => area.id === activeBuild) ?? siteContent.build.areas[0];
  const selectedProject = siteContent.projects.items[activeProject];
  const selectedLab = siteContent.lab.modules.find((module) => module.id === activeLab) ?? siteContent.lab.modules[0];

  const ui = useMemo(() => language === 'zh' ? {
    skip: '跳到主要内容',
    capabilitySignal: '当前能力信号',
    projectCount: `${projectTotal} 个持续进化的项目对象`,
    previous: '上一个项目',
    next: '下一个项目',
    selectProject: '选择项目',
    pipelineStatus: '生产信号已接通',
    labInstruction: '选择模式，移动指针改变信号场',
    opening: ['开启', '通道'],
    write: '发起合作信号',
    follow: '查看构建记录',
    socialSoon: '社交信号 / 即将接入',
    archive: '产品档案',
    live: '实时系统',
    top: '回到顶部',
  } : {
    skip: 'Skip to main content',
    capabilitySignal: 'Active capability signal',
    projectCount: `${projectTotal} evolving project objects`,
    previous: 'Previous project',
    next: 'Next project',
    selectProject: 'Select project',
    pipelineStatus: 'Production signal connected',
    labInstruction: 'Select a mode, then move your pointer through the field',
    opening: ['OPEN', 'CHANNEL'],
    write: 'Start a collaboration signal',
    follow: 'View the build log',
    socialSoon: 'Social signal / coming online',
    archive: 'Product archive',
    live: 'Live system',
    top: 'Back to top',
  }, [language, projectTotal]);

  useSignalMotion(pageRoot, language);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const target = document.getElementById(hash);
    if (!target) return;

    let cancelled = false;
    let secondFrame: number | undefined;
    const scrollToTarget = () => {
      if (cancelled) return;
      target.scrollIntoView({ block: 'start' });
    };

    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(scrollToTarget);
    });
    const layoutCheck = window.setTimeout(scrollToTarget, 450);

    void document.fonts?.ready.then(scrollToTarget);
    window.addEventListener('load', scrollToTarget, { once: true });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(layoutCheck);
      window.removeEventListener('load', scrollToTarget);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.body.dataset.language = language;
    document.title = siteContent.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', siteContent.meta.description);
    try {
      window.localStorage.setItem(languageStorageKey, language);
    } catch {
      // localStorage may be unavailable in restricted browsing modes.
    }
  }, [language, siteContent.meta.description, siteContent.meta.title]);

  const changeProject = (direction: number) => {
    const total = siteContent.projects.items.length;
    setActiveProject((current) => (current + direction + total) % total);
  };

  const handleLabKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const modules = siteContent.lab.modules;
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % modules.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + modules.length) % modules.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = modules.length - 1;
    else return;

    event.preventDefault();
    setActiveLab(modules[next].id);
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[next]?.focus();
  };

  return (
    <div className="signal-site" ref={pageRoot}>
      <a className="signal-skip" href="#main-content">{ui.skip}</a>
      <div className="signal-cursor" aria-hidden="true" />
      <Header content={siteContent.nav} language={language} onLanguageChange={setLanguage} />

      <main id="main-content">
        <div id="top" />
        <Hero content={siteContent.hero} isCompact={isCompact} />

        <section className="capabilities signal-section" id="build" data-reveal-section>
          <SectionIntro
            index="01 / 06"
            eyebrow={siteContent.build.eyebrow}
            title={siteContent.build.title}
            copy={siteContent.build.copy}
          />

          <div className="capabilities__system">
            <div className="capabilities__list" data-reveal-item>
              {siteContent.build.areas.map((area, index) => (
                <button
                  type="button"
                  className={area.id === activeBuild ? 'is-active' : ''}
                  onClick={() => setActiveBuild(area.id)}
                  onMouseEnter={() => !isCompact && setActiveBuild(area.id)}
                  aria-pressed={area.id === activeBuild}
                  key={area.id}
                >
                  <span className="capabilities__number">0{index + 1}</span>
                  <span className="capabilities__copy">
                    <strong>{area.title}</strong>
                    <small>{area.copy}</small>
                  </span>
                  <span className="capabilities__code">{area.code}</span>
                </button>
              ))}
            </div>

            <div className={`capability-visual capability-visual--${selectedBuild.id}`} data-reveal-item aria-live="polite">
              <div className="capability-visual__hud">
                <span>{ui.capabilitySignal}</span>
                <span>0{siteContent.build.areas.findIndex((area) => area.id === selectedBuild.id) + 1} / {String(siteContent.build.areas.length).padStart(2, '0')}</span>
              </div>
              <div className="capability-visual__core" aria-hidden="true">
                <i /><i /><i /><i />
                <span>{selectedBuild.code}</span>
              </div>
              <div className="capability-visual__footer">
                <strong>{selectedBuild.title}</strong>
                <span>BNS—CAP / {selectedBuild.id.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="projects-system signal-section" id="projects" data-reveal-section>
          <SectionIntro
            index="02 / 06"
            eyebrow={siteContent.projects.eyebrow}
            title={siteContent.projects.title}
            copy={siteContent.projects.copy}
          />

          <div className="projects-system__meta" data-reveal-item>
            <span>{ui.projectCount}</span>
            <span>{String(activeProject + 1).padStart(2, '0')} / {String(siteContent.projects.items.length).padStart(2, '0')}</span>
          </div>

          <div className="projects-system__body">
            <div className="project-selector" aria-label={ui.selectProject} data-reveal-item>
              {siteContent.projects.items.map((project, index) => (
                <button
                  type="button"
                  className={index === activeProject ? 'is-active' : ''}
                  onClick={() => setActiveProject(index)}
                  onMouseEnter={() => !isCompact && setActiveProject(index)}
                  aria-pressed={index === activeProject}
                  key={project.id}
                >
                  <span>{project.signal}</span>
                  <strong>{project.title}</strong>
                  <small>{project.year}</small>
                </button>
              ))}
            </div>

            <article
              className={`project-stage project-stage--${selectedProject.accent}`}
              data-reveal-item
              key={`${language}-${selectedProject.id}`}
              style={{ '--project-progress': `${((activeProject + 1) / siteContent.projects.items.length) * 100}%` } as CSSProperties}
            >
              <div className="project-stage__visual">
                <ProjectVisual project={selectedProject} active />
                <div className="project-stage__status"><i /> {selectedProject.status}</div>
                <div className="project-stage__signal">{selectedProject.signal}</div>
              </div>
              <div className="project-stage__content">
                <div>
                  <span>{selectedProject.type}</span>
                  <span>{selectedProject.year}</span>
                </div>
                <h3>{selectedProject.title}</h3>
                <p>{selectedProject.description}</p>
                <ul aria-label={language === 'zh' ? '项目标签' : 'Project tags'}>
                  {selectedProject.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
                {selectedProject.id === 'kitchenOperations' && (
                  <a className="project-stage__case-link" href="#kitchen-operations">
                    {siteContent.caseStudies.kitchenOperations.cardCta}
                    <ArrowDownRight aria-hidden="true" />
                  </a>
                )}
              </div>
              <div className="project-stage__controls">
                <button type="button" onClick={() => changeProject(-1)} aria-label={ui.previous}>
                  <ArrowLeft aria-hidden="true" />
                </button>
                <div><span>{String(activeProject + 1).padStart(2, '0')}</span><i /><span>{String(projectTotal).padStart(2, '0')}</span></div>
                <button type="button" onClick={() => changeProject(1)} aria-label={ui.next}>
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </article>
          </div>
        </section>

        <OperationsCaseStudy content={siteContent.caseStudies.kitchenOperations} language={language} />

        <section className="pipeline-system signal-section" id="pipeline" data-reveal-section>
          <SectionIntro
            index="03 / 06"
            eyebrow={siteContent.pipeline.eyebrow}
            title={siteContent.pipeline.title}
            copy={siteContent.pipeline.copy}
          />

          <div className="pipeline-system__status" data-reveal-item>
            <span><i /> {ui.pipelineStatus}</span>
            <span>BNS / AI—NATIVE PROTOCOL</span>
          </div>

          <div className="pipeline-track" aria-label={siteContent.pipeline.ariaLabel} data-reveal-item>
            <div className="pipeline-track__base" aria-hidden="true" />
            <div className="pipeline-track__beam" aria-hidden="true" />
            {siteContent.pipeline.nodes.map((node, index) => (
              <div className="pipeline-track__node" data-pipeline-node key={node.id}>
                <span>0{index + 1}</span>
                <i aria-hidden="true" />
                <strong>{node.label}</strong>
                <small>{node.detail}</small>
              </div>
            ))}
          </div>

          <div className="pipeline-system__equation" aria-hidden="true" data-reveal-item>
            <span>HUMAN TASTE</span><i>×</i><span>MACHINE RANGE</span><i>×</i><span>REAL USERS</span><b>=</b><strong>SHIPPED INTELLIGENCE</strong>
          </div>
        </section>

        <section className="lab-system signal-section" id="lab" data-reveal-section>
          <SectionIntro
            index="04 / 06"
            eyebrow={siteContent.lab.eyebrow}
            title={siteContent.lab.title}
            copy={siteContent.lab.copy}
          />

          <div className="lab-system__console" data-reveal-item>
            <div className="lab-tabs" role="tablist" aria-label={siteContent.lab.ariaLabel}>
              <div className="lab-tabs__meta"><span>{ui.live}</span><i /></div>
              {siteContent.lab.modules.map((module, index) => (
                <button
                  type="button"
                  role="tab"
                  id={`lab-tab-${module.id}`}
                  aria-controls="lab-panel"
                  aria-selected={module.id === activeLab}
                  tabIndex={module.id === activeLab ? 0 : -1}
                  className={module.id === activeLab ? 'is-active' : ''}
                  onClick={() => setActiveLab(module.id)}
                  onKeyDown={(event) => handleLabKeys(event, index)}
                  key={module.id}
                >
                  <span>0{index + 1}</span>
                  <span><strong>{module.title}</strong><small>{module.label}</small></span>
                  <em>{module.metric}</em>
                </button>
              ))}
              <p>{ui.labInstruction}</p>
            </div>

            <div
              className={`lab-viewport lab-viewport--${activeLab}`}
              role="tabpanel"
              id="lab-panel"
              aria-labelledby={`lab-tab-${activeLab}`}
              key={activeLab}
            >
              <ExperimentField mode={activeLab} isCompact={isCompact} />
              <div className="lab-viewport__hud lab-viewport__hud--top">
                <span>MODE / {activeLab.toUpperCase()}</span>
                <span>LATENCY 08MS</span>
              </div>
              <div className="lab-viewport__reticle" aria-hidden="true"><i /><i /></div>
              <div className="lab-viewport__caption">
                <span>{selectedLab.label}</span>
                <strong>{selectedLab.title}</strong>
                <em>{selectedLab.metric}</em>
              </div>
              {activeLab === 'archive' && (
                <div className="lab-viewport__archive" aria-label={ui.archive}>
                  {siteContent.lab.archiveItems.map((item) => <span key={item}>{item}</span>)}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="timeline-system signal-section" id="timeline" data-reveal-section>
          <SectionIntro
            index="05 / 06"
            eyebrow={siteContent.timeline.eyebrow}
            title={siteContent.timeline.title}
            invert
          />

          <div className="timeline-system__body">
            <div className="timeline-rail" aria-hidden="true"><div className="timeline-rail__progress" /></div>
            {siteContent.timeline.items.map((item, index) => (
              <article className="timeline-entry" data-reveal-item key={`${item.year}-${index}`}>
                <span className="timeline-entry__index">0{index + 1}</span>
                <strong className="timeline-entry__year">{item.year}</strong>
                <div><h3>{item.title}</h3><p>{item.detail}</p></div>
                <i aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section className="contact-system" id="contact" data-reveal-section>
          <div className="contact-system__top" data-reveal-item>
            <span>06 / 06</span>
            <span>{siteContent.contact.eyebrow}</span>
            <span>BONISTUDIO / SEATTLE—GLOBAL</span>
          </div>
          <h2 data-reveal-item>
            <span>{ui.opening[0]}</span>
            <span>{ui.opening[1]}</span>
          </h2>
          <p data-reveal-item>{siteContent.contact.title}</p>
          <div className="contact-system__links" data-reveal-item>
            <a href="mailto:bonistudio.core@gmail.com" aria-label={siteContent.contact.emailLabel}>
              <span><Mail aria-hidden="true" /> {ui.write}</span>
              <strong>bonistudio.core@gmail.com</strong>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href="https://github.com/BoniStudio" target="_blank" rel="noreferrer">
              <span><Github aria-hidden="true" /> {ui.follow}</span>
              <strong>{siteContent.contact.githubLabel} / BONISTUDIO</strong>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <div className="contact-system__soon" aria-label={siteContent.contact.socialAriaLabel}>
              <Radio aria-hidden="true" /><span>{ui.socialSoon}</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="signal-footer">
        <span>© 2026 BONISTUDIO</span>
        <p>{siteContent.footer.tagline}</p>
        <a href="#top">{ui.top} <ArrowUp aria-hidden="true" /></a>
      </footer>
    </div>
  );
}

export default App;
