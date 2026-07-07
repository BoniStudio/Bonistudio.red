import type { SiteContent } from '../i18n/content';

type FooterProps = {
  content: SiteContent['footer'];
};

export function Footer({ content }: FooterProps) {
  return (
    <footer className="site-footer">
      <span>{content.tagline}</span>
      <a href="#top">{content.topLink}</a>
    </footer>
  );
}
