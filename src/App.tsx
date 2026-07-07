import { useEffect, useState } from 'react';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { InteractiveLab } from './components/InteractiveLab';
import { Pipeline } from './components/Pipeline';
import { Projects } from './components/Projects';
import { SectionTitle } from './components/SectionTitle';
import { Timeline } from './components/Timeline';
import { WhatWeBuild } from './components/WhatWeBuild';
import { content, type Language } from './i18n/content';

const languageStorageKey = 'bonistudio.language';

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
      <Header content={siteContent.nav} language={language} onLanguageChange={setLanguage} />

      <main id="top">
        <Hero content={siteContent.hero} isCompact={isCompact} />

        <WhatWeBuild content={siteContent.build} />

        <Projects content={siteContent.projects} />

        <Pipeline content={siteContent.pipeline} />

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

        <Contact content={siteContent.contact} />
      </main>
      <Footer content={siteContent.footer} />
    </>
  );
}

export default App;
