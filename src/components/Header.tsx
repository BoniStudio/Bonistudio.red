import type { Language, SiteContent } from '../i18n/content';
import { LanguageToggle } from './LanguageToggle';

type HeaderProps = {
  content: SiteContent['nav'];
  language: Language;
  onLanguageChange: (language: Language) => void;
};

export function Header({ content, language, onLanguageChange }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-brand" href="#top" aria-label={content.brandAriaLabel}>
          <span>{content.brand}</span>
          <small>{content.kicker}</small>
        </a>

        <nav className="site-header__nav" aria-label={content.ariaLabel}>
          {content.items.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <LanguageToggle
          label={content.languageLabel}
          language={language}
          onLanguageChange={onLanguageChange}
        />
      </div>
    </header>
  );
}
