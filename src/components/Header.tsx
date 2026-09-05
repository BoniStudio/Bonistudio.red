import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Language, SiteContent } from '../i18n/content';

type HeaderProps = {
  content: SiteContent['nav'];
  language: Language;
  onLanguageChange: (language: Language) => void;
};

export function Header({ content, language, onLanguageChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="signal-header" data-reveal="header">
      <a className="signal-brand" href="#top" aria-label={content.brandAriaLabel}>
        <span className="signal-brand__mark" aria-hidden="true">
          <i />
          <i />
        </span>
        <span>
          <strong>{content.brand}</strong>
          <small>{content.kicker}</small>
        </span>
      </a>

      <nav className={`signal-nav${menuOpen ? ' is-open' : ''}`} aria-label={content.ariaLabel}>
        <div className="signal-nav__index" aria-hidden="true">BNS / INDEX—06</div>
        {content.items.map((item, index) => (
          <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="signal-header__tools">
        <span className="signal-header__status" aria-label={language === 'zh' ? '工作室状态：在线' : 'Studio status: online'}>
          <i aria-hidden="true" /> Live
        </span>
        <div className="signal-language" role="group" aria-label={content.languageLabel}>
          <button
            type="button"
            className={language === 'en' ? 'is-active' : ''}
            onClick={() => onLanguageChange('en')}
            aria-pressed={language === 'en'}
          >
            EN
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            className={language === 'zh' ? 'is-active' : ''}
            onClick={() => onLanguageChange('zh')}
            aria-pressed={language === 'zh'}
          >
            中文
          </button>
        </div>
        <button
          className="signal-menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen
            ? (language === 'zh' ? '关闭菜单' : 'Close menu')
            : (language === 'zh' ? '打开菜单' : 'Open menu')}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
