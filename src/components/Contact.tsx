import { Github, Mail, Radio } from 'lucide-react';
import type { SiteContent } from '../i18n/content';

type ContactProps = {
  content: SiteContent['contact'];
  footer: SiteContent['footer'];
};

export function Contact({ content, footer }: ContactProps) {
  return (
    <footer className="contact-panel" id="contact">
      <div>
        <p>{content.eyebrow}</p>
        <h2>{content.title}</h2>
      </div>
      <div className="contact-panel__links">
        <a href="mailto:bonistudio.core@gmail.com" aria-label={content.emailLabel}>
          <Mail size={18} aria-hidden="true" />
          bonistudio.core@gmail.com
        </a>
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          <Github size={18} aria-hidden="true" />
          {content.githubLabel}
        </a>
        <a href="#contact" aria-label={content.socialAriaLabel}>
          <Radio size={18} aria-hidden="true" />
          {content.socialLabel}
        </a>
      </div>
      <div className="contact-panel__footer">
        <span>{footer.tagline}</span>
        <a href="#top">{footer.topLink}</a>
      </div>
    </footer>
  );
}
