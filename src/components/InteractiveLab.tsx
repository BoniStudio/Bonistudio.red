import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Box, Crosshair, Database, ScanLine } from 'lucide-react';
import type { LabModuleContent, LabModuleId } from '../i18n/content';

const labIcons: Record<LabModuleId, typeof ScanLine> = {
  scanner: ScanLine,
  grid: Box,
  cursor: Crosshair,
  archive: Database,
};

type InteractiveLabProps = {
  archiveItems: string[];
  ariaLabel: string;
  modules: LabModuleContent[];
};

export function InteractiveLab({ archiveItems, ariaLabel, modules }: InteractiveLabProps) {
  const [activeId, setActiveId] = useState<LabModuleContent['id']>('scanner');
  const [cursor, setCursor] = useState({ x: 52, y: 48 });
  const reducedMotion = useReducedMotion();
  const activeModule = useMemo(() => modules.find((module) => module.id === activeId) ?? modules[0], [activeId, modules]);

  if (!activeModule) {
    return null;
  }

  return (
    <div className="lab-shell">
      <div className="lab-shell__switcher" role="tablist" aria-label={ariaLabel}>
        {modules.map((module) => {
          const Icon = labIcons[module.id];
          const isActive = module.id === activeId;
          return (
            <button
              className={isActive ? 'is-active' : ''}
              type="button"
              key={module.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(module.id)}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{module.title}</span>
            </button>
          );
        })}
      </div>

      <motion.div
        className="lab-viewport"
        data-module={activeModule.id}
        style={{
          '--cursor-x': `${cursor.x}%`,
          '--cursor-y': `${cursor.y}%`,
        } as React.CSSProperties}
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          setCursor({
            x: ((event.clientX - bounds.left) / bounds.width) * 100,
            y: ((event.clientY - bounds.top) / bounds.height) * 100,
          });
        }}
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="lab-viewport__hud">
          <span>{activeModule.label}</span>
          <strong>{activeModule.metric}</strong>
        </div>
        <div className="lab-visual" aria-hidden="true">
          <div className="lab-visual__scanner">
            {Array.from({ length: 48 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
          <div className="lab-visual__grid">
            {Array.from({ length: 36 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
          <div className="lab-visual__cursor">
            <b />
            <b />
          </div>
          <div className="lab-visual__archive">
            {archiveItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
