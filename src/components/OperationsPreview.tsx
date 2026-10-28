import type { CSSProperties } from 'react';
import type { OperationsPreviewId } from '../i18n/content';

type OperationsPreviewProps = {
  mode: OperationsPreviewId;
};

const dashboardBars = [42, 68, 55, 84, 72, 91, 78];
const productionCells = Array.from({ length: 30 }, (_, index) => index);
const deliveryStops = Array.from({ length: 7 }, (_, index) => index);
const inventoryRows = Array.from({ length: 6 }, (_, index) => index);
const scheduleDays = Array.from({ length: 7 }, (_, index) => index);

function DashboardPreview() {
  return (
    <div className="operations-preview__dashboard">
      <div className="operations-preview__kpis"><i /><i /><i /></div>
      <div className="operations-preview__activity">
        <span /><span /><span /><span />
      </div>
      <div className="operations-preview__chart">
        {dashboardBars.map((height, index) => (
          <i style={{ '--bar-height': `${height}%` } as CSSProperties} key={index} />
        ))}
      </div>
    </div>
  );
}

function ProductionPreview() {
  return (
    <div className="operations-preview__production">
      <div className="operations-preview__production-head"><span /><span /><span /></div>
      <div className="operations-preview__production-grid">
        {productionCells.map((cell) => <i data-cell={cell} key={cell} />)}
      </div>
      <div className="operations-preview__completion"><i /><span /></div>
    </div>
  );
}

function DeliveryPreview() {
  return (
    <div className="operations-preview__delivery">
      <div className="operations-preview__route-line operations-preview__route-line--one" />
      <div className="operations-preview__route-line operations-preview__route-line--two" />
      <div className="operations-preview__route-line operations-preview__route-line--three" />
      {deliveryStops.map((stop) => <i data-stop={stop} key={stop} />)}
      <span className="operations-preview__vehicle" />
    </div>
  );
}

function InventoryPreview() {
  return (
    <div className="operations-preview__inventory">
      <div className="operations-preview__inventory-head"><span /><span /><span /><span /></div>
      {inventoryRows.map((row) => (
        <div className="operations-preview__inventory-row" data-row={row} key={row}>
          <i /><span /><span /><em />
        </div>
      ))}
    </div>
  );
}

function SchedulePreview() {
  return (
    <div className="operations-preview__schedule">
      {scheduleDays.map((day) => (
        <div className="operations-preview__day" data-day={day} key={day}>
          <span />
          <i /><i /><i />
        </div>
      ))}
    </div>
  );
}

function getPreview(mode: OperationsPreviewId) {
  switch (mode) {
    case 'dashboard':
      return <DashboardPreview />;
    case 'production':
      return <ProductionPreview />;
    case 'delivery':
      return <DeliveryPreview />;
    case 'inventory':
      return <InventoryPreview />;
    case 'schedule':
      return <SchedulePreview />;
  }
}

export function OperationsPreview({ mode }: OperationsPreviewProps) {
  return (
    <div className="operations-preview" data-mode={mode} aria-hidden="true">
      <div className="operations-preview__chrome">
        <span /><span /><span />
      </div>
      <div className="operations-preview__rail"><i /><i /><i /><i /><i /></div>
      <div className="operations-preview__surface" key={mode}>{getPreview(mode)}</div>
      <div className="operations-preview__signal" />
    </div>
  );
}

export type { OperationsPreviewProps };
