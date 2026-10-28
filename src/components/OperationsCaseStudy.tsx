import { ArrowUpRight, Mail } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import type { Language, OperationsCaseStudyContent } from '../i18n/content';
import { OperationsPreview } from './OperationsPreview';

type OperationsCaseStudyProps = {
  content: OperationsCaseStudyContent;
  language: Language;
};

export function OperationsCaseStudy({ content, language }: OperationsCaseStudyProps) {
  const [activePreview, setActivePreview] = useState(content.demo.previews[0].id);
  const selectedPreview = content.demo.previews.find((preview) => preview.id === activePreview) ?? content.demo.previews[0];
  const mailSubject = language === 'zh' ? '企业运营系统合作咨询' : 'Business operations platform inquiry';

  const handlePreviewKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % content.demo.previews.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + content.demo.previews.length) % content.demo.previews.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = content.demo.previews.length - 1;
    else return;

    event.preventDefault();
    setActivePreview(content.demo.previews[next].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <section
      className="case-study-system"
      id="kitchen-operations"
      aria-labelledby="operations-case-title"
      data-reveal-section
    >
      <div className="case-study-system__topline" data-reveal-item>
        <span>FIELD CASE / OPS—07</span>
        <span>{content.eyebrow}</span>
        <span>WEB · IPHONE · IPAD</span>
      </div>

      <header className="case-study-hero">
        <div className="case-study-hero__signal" data-reveal-item>
          <span><i /> LIVE SYSTEM</span>
          <span>SEATTLE ↔ SAN JOSE</span>
        </div>
        <div className="case-study-client" data-reveal-item>
          <div className="case-study-client__studio">
            <span>BONISTUDIO</span>
            <small>{content.client.label}</small>
          </div>
          <b aria-hidden="true">×</b>
          <div className="case-study-client__brand">
            <img src={content.client.logoSrc} alt={content.client.logoAlt} />
            <strong>{content.client.name}</strong>
          </div>
        </div>
        <h2 id="operations-case-title" data-reveal-item>{content.title}</h2>
        <p data-reveal-item>{content.subtitle}</p>
        <div className="case-study-hero__overview" data-reveal-item>
          <span>OVERVIEW / 001</span>
          <p>{content.overview}</p>
        </div>
      </header>

      <div className="case-study-challenge" data-reveal-item>
        <div>
          <span>{content.challenge.eyebrow}</span>
          <h3>{content.challenge.title}</h3>
        </div>
        <p>{content.challenge.copy}</p>
      </div>

      <section className="case-study-solution" aria-labelledby="operations-solution-title">
        <div className="case-study-block-heading" data-reveal-item>
          <span>{content.solution.eyebrow}</span>
          <h3 id="operations-solution-title">{content.solution.title}</h3>
        </div>
        <div className="case-study-solution__grid">
          {content.solution.items.map((item, index) => (
            <article data-reveal-item key={item.code}>
              <span>{String(index + 1).padStart(2, '0')} / {item.code}</span>
              <h4>{item.title}</h4>
              <p>{item.copy}</p>
              <i aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="case-study-demo" aria-labelledby="operations-demo-title">
        <div className="case-study-block-heading" data-reveal-item>
          <span>{content.demo.eyebrow}</span>
          <h3 id="operations-demo-title">{content.demo.title}</h3>
          <p>{content.demo.copy}</p>
        </div>

        <div className="case-study-demo__console" data-reveal-item>
          <div className="case-study-demo__tabs" role="tablist" aria-label={content.demo.ariaLabel}>
            {content.demo.previews.map((preview, index) => (
              <button
                type="button"
                role="tab"
                id={`operations-tab-${preview.id}`}
                aria-controls="operations-preview-panel"
                aria-selected={preview.id === activePreview}
                tabIndex={preview.id === activePreview ? 0 : -1}
                className={preview.id === activePreview ? 'is-active' : ''}
                onClick={() => setActivePreview(preview.id)}
                onKeyDown={(event) => handlePreviewKeys(event, index)}
                key={preview.id}
              >
                <span>0{index + 1}</span>
                <strong>{preview.label}</strong>
              </button>
            ))}
          </div>

          <div
            className="case-study-demo__panel"
            role="tabpanel"
            id="operations-preview-panel"
            aria-labelledby={`operations-tab-${activePreview}`}
          >
            <div className="case-study-demo__panel-copy">
              <span>MODE / {activePreview.toUpperCase()}</span>
              <h4>{selectedPreview.label}</h4>
              <p>{selectedPreview.detail}</p>
            </div>
            <OperationsPreview mode={activePreview} />
            <span className="case-study-demo__disclaimer">{content.demo.disclaimer}</span>
          </div>
        </div>
      </section>

      <section className="case-study-results" aria-labelledby="operations-results-title">
        <div className="case-study-block-heading" data-reveal-item>
          <span>{content.results.eyebrow}</span>
          <h3 id="operations-results-title">{content.results.title}</h3>
          <p>{content.results.copy}</p>
        </div>
        <dl className="case-study-results__metrics" data-reveal-item>
          {content.results.metrics.map((metric, index) => (
            <div key={metric.label}>
              <dt>{String(index + 1).padStart(2, '0')} / {metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="case-study-delivery">
        <section data-reveal-item aria-labelledby="operations-role-title">
          <span>{content.role.eyebrow}</span>
          <h3 id="operations-role-title">{content.role.title}</h3>
          <ul>
            {content.role.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
        <section data-reveal-item aria-labelledby="operations-stack-title">
          <span>{content.stack.eyebrow}</span>
          <h3 id="operations-stack-title">{content.stack.title}</h3>
          <ul>
            {content.stack.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </div>

      <div className="case-study-cta" data-reveal-item>
        <span>{content.cta.eyebrow}</span>
        <h3>{content.cta.title}</h3>
        <a href={`mailto:bonistudio.core@gmail.com?subject=${encodeURIComponent(mailSubject)}`}>
          <Mail aria-hidden="true" />
          {content.cta.label}
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

export type { OperationsCaseStudyProps };
