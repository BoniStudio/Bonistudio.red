import type { Language, SiteContent } from '../i18n/content';
import { languageLabels, languages } from '../i18n/content';

type LanguageToggleProps = {
  label: SiteContent['nav']['languageLabel'];
  language: Language;
  onLanguageChange: (language: Language) => void;
};

export function LanguageToggle({ label, language, onLanguageChange }: LanguageToggleProps) {
  return (
    <div className="language-switch" role="group" aria-label={label}>
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
  );
}
