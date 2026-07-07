import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Box, Crosshair, Database, ScanLine } from 'lucide-react';

type LabModule = {
  id: 'scanner' | 'grid' | 'cursor' | 'archive';
  title: string;
  label: string;
  metric: string;
  icon: typeof ScanLine;
};

const labModules: LabModule[] = [
  { id: 'scanner', title: 'Particle Scanner', label: 'object reconstruction', metric: '5.6k particles', icon: ScanLine },
  { id: 'grid', title: 'Neural Grid', label: 'latent routing map', metric: '42 nodes', icon: Box },
  { id: 'cursor', title: 'Spatial Cursor', label: 'presence field', metric: 'live vector', icon: Crosshair },
  { id: 'archive', title: 'Product Archive', label: 'interactive index', metric: '6 records', icon: Database },
];

export function InteractiveLab() {
  const [activeId, setActiveId] = useState<LabModule['id']>('scanner');
  const [cursor, setCursor] = useState({ x: 52, y: 48 });
  const reducedMotion = useReducedMotion();
  const activeModule = useMemo(() => labModules.find((module) => module.id === activeId) ?? labModules[0], [activeId]);

  return (
    <div className="lab-shell">
      <div className="lab-shell__switcher" role="tablist" aria-label="Interactive lab modules">
        {labModules.map((module) => {
          const Icon = module.icon;
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
            {['OvO', 'AMT', 'SLA', 'VR', 'HCP', 'BNS'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
