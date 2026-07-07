import type { Language, SiteContent } from '../i18n/content';
import { languageLabels, languages } from '../i18n/content';

type SiteHeaderProps = {
  content: SiteContent['nav'];
  language: Language;
  onLanguageChange: (language: Language) => void;
};

export function SiteHeader({ content, language, onLanguageChange }: SiteHeaderProps) {
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

        <div className="language-switch" role="group" aria-label={content.languageLabel}>
          {languages.map((option) => (
            <button
              className={option === language ? 'is-active' : ''}
              type="button"
              aria-pressed={option === language}
              key={option}
              onClick={() => onLanguageChange(option)}
            >
              {languageLabels[option]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
