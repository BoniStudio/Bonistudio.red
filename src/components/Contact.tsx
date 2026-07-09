import { Github, Mail, Radio } from 'lucide-react';
import type { SiteContent } from '../i18n/content';
import { AccentTitle } from './AccentTitle';
import { GlassButton } from './GlassButton';

type ContactProps = {
  content: SiteContent['contact'];
};

export function Contact({ content }: ContactProps) {
  return (
    <section className="contact-panel" id="contact">
      <div>
        <p>{content.eyebrow}</p>
        <AccentTitle text={content.title} accent="cyan" />
      </div>
      <div className="contact-panel__links">
        <GlassButton href="mailto:bonistudio.core@gmail.com" aria-label={content.emailLabel}>
          <Mail size={18} aria-hidden="true" />
          bonistudio.core@gmail.com
        </GlassButton>
        <GlassButton href="https://github.com/BoniStudio" target="_blank" rel="noreferrer">
          <Github size={18} aria-hidden="true" />
          {content.githubLabel}
        </GlassButton>
        <GlassButton href="#contact" aria-label={content.socialAriaLabel}>
          <Radio size={18} aria-hidden="true" />
          {content.socialLabel}
        </GlassButton>
      </div>
    </section>
  );
}
