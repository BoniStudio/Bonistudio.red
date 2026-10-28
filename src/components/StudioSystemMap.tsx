import type { HeroSurfaceId, SiteContent } from '../i18n/content';

type StudioSystemMapProps = {
  content: SiteContent['hero']['engine'];
};

const previewCells = Array.from({ length: 12 }, (_, index) => index);
const previewRows = Array.from({ length: 5 }, (_, index) => index);
const orbitPoints = Array.from({ length: 6 }, (_, index) => index);

function SurfacePreview({ id }: { id: HeroSurfaceId }) {
  switch (id) {
    case 'products':
      return (
        <span className="studio-surface-preview studio-surface-preview--products" aria-hidden="true">
          <i /><i /><i />
          <b /><b />
        </span>
      );
    case 'games':
      return (
        <span className="studio-surface-preview studio-surface-preview--games" aria-hidden="true">
          <i className="studio-surface-preview__player" />
          {orbitPoints.slice(0, 4).map((point) => <b data-point={point} key={point} />)}
          <em />
        </span>
      );
    case 'systems':
      return (
        <span className="studio-surface-preview studio-surface-preview--systems" aria-hidden="true">
          {previewRows.map((row) => <i data-row={row} key={row} />)}
          <b /><em />
        </span>
      );
    case 'worlds':
      return (
        <span className="studio-surface-preview studio-surface-preview--worlds" aria-hidden="true">
          <i /><i /><i />
          {orbitPoints.map((point) => <b data-point={point} key={point} />)}
        </span>
      );
  }
}

export function StudioSystemMap({ content }: StudioSystemMapProps) {
  return (
    <nav className="studio-system-map" aria-label={content.ariaLabel}>
      <div className="studio-system-map__grid" aria-hidden="true" />

      <svg className="studio-system-map__links" viewBox="0 0 1000 720" preserveAspectRatio="none" aria-hidden="true">
        <path data-system-link d="M500 360 C408 294 350 220 248 154" />
        <path data-system-link d="M500 360 C610 288 666 218 758 154" />
        <path data-system-link d="M500 360 C404 430 350 510 248 568" />
        <path data-system-link d="M500 360 C606 430 665 506 758 568" />
        <circle cx="500" cy="360" r="224" />
        <circle cx="500" cy="360" r="158" />
      </svg>

      <div className="studio-system-map__core" data-system-core aria-hidden="true">
        <span className="studio-system-map__orbit studio-system-map__orbit--outer">
          {orbitPoints.map((point) => <i data-point={point} key={point} />)}
        </span>
        <span className="studio-system-map__orbit studio-system-map__orbit--inner" />
        <span className="studio-system-map__core-mark">BNS</span>
        <strong>{content.coreLabel}</strong>
        <small>{content.coreStatus}</small>
      </div>

      <div className="studio-system-map__packets" aria-hidden="true">
        {previewCells.map((packet) => <i data-packet={packet} key={packet} />)}
      </div>

      {content.surfaces.map((surface, index) => (
        <a
          className={`studio-surface-node studio-surface-node--${surface.id}`}
          href={surface.href}
          data-system-node
          key={surface.id}
        >
          <span className="studio-surface-node__meta">
            <i>{String(index + 1).padStart(2, '0')}</i>
            <em>{surface.signal}</em>
          </span>
          <strong>{surface.title}</strong>
          <small>{surface.detail}</small>
          <SurfacePreview id={surface.id} />
          <span className="studio-surface-node__status"><i /> OUTPUT CONNECTED</span>
        </a>
      ))}

      <div className="studio-system-map__caption" aria-hidden="true">
        <span>{content.status}</span>
        <i />
        <strong>{content.output}</strong>
      </div>
    </nav>
  );
}

export type { StudioSystemMapProps };
