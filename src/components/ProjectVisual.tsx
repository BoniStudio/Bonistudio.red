import type { Project, ProjectId } from '../data/projects';

type ProjectVisualProps = {
  project: Project;
  active?: boolean;
};

const pixelCells = Array.from({ length: 64 }, (_, index) => index);
const tableSeats = Array.from({ length: 8 }, (_, index) => index);
const tableSignals = Array.from({ length: 5 }, (_, index) => index);
const rhythmBars = Array.from({ length: 12 }, (_, index) => index);
const organicCells = Array.from({ length: 7 }, (_, index) => index);
const dockingTicks = Array.from({ length: 16 }, (_, index) => index);
const dockingPorts = Array.from({ length: 6 }, (_, index) => index);
const warpThreads = Array.from({ length: 13 }, (_, index) => index);
const weftThreads = Array.from({ length: 9 }, (_, index) => index);
const recursiveFrames = Array.from({ length: 5 }, (_, index) => index);
const interfaceLines = Array.from({ length: 6 }, (_, index) => index);

const projectModifiers: Record<ProjectId, string> = {
  ovoCyberBeads: 'pixel-grid',
  atMyTable: 'table-orbit',
  shiLeMa: 'organic-rhythm',
  spaceStationVr: 'station-dock',
  hcPetFashion: 'textile-weave',
  bonistudioWebsite: 'recursive-interface',
};

function PixelGridVisual() {
  return (
    <div className="project-visual__scene project-visual__scene--pixel-grid">
      <div className="project-visual__pixel-field">
        {pixelCells.map((cell) => (
          <span
            className="project-visual__pixel"
            data-column={cell % 8}
            data-row={Math.floor(cell / 8)}
            key={cell}
          />
        ))}
      </div>
      <div className="project-visual__pixel-cursor">
        <span />
        <span />
      </div>
      <div className="project-visual__pixel-scan" />
    </div>
  );
}

function TableOrbitVisual() {
  return (
    <div className="project-visual__scene project-visual__scene--table-orbit">
      <div className="project-visual__table-orbit project-visual__table-orbit--outer">
        {tableSeats.map((seat) => (
          <span className="project-visual__table-seat" data-seat={seat} key={seat} />
        ))}
      </div>
      <div className="project-visual__table-orbit project-visual__table-orbit--inner">
        {tableSignals.map((signal) => (
          <span className="project-visual__table-signal" data-signal-index={signal} key={signal} />
        ))}
      </div>
      <div className="project-visual__table-surface">
        <span className="project-visual__table-center" />
        <span className="project-visual__table-route" />
      </div>
    </div>
  );
}

function OrganicRhythmVisual() {
  return (
    <div className="project-visual__scene project-visual__scene--organic-rhythm">
      <div className="project-visual__rhythm-track">
        {rhythmBars.map((bar) => (
          <span className="project-visual__rhythm-bar" data-beat={bar} key={bar} />
        ))}
      </div>
      <div className="project-visual__organic-body">
        {organicCells.map((cell) => (
          <span className="project-visual__organic-cell" data-cell={cell} key={cell} />
        ))}
        <span className="project-visual__organic-core" />
      </div>
      <div className="project-visual__rhythm-marker" />
    </div>
  );
}

function StationDockVisual() {
  return (
    <div className="project-visual__scene project-visual__scene--station-dock">
      <div className="project-visual__dock-axis project-visual__dock-axis--horizontal" />
      <div className="project-visual__dock-axis project-visual__dock-axis--vertical" />
      <div className="project-visual__dock-ring project-visual__dock-ring--outer">
        {dockingTicks.map((tick) => (
          <span className="project-visual__dock-tick" data-tick={tick} key={tick} />
        ))}
      </div>
      <div className="project-visual__dock-ring project-visual__dock-ring--middle">
        {dockingPorts.map((port) => (
          <span className="project-visual__dock-port" data-port={port} key={port} />
        ))}
      </div>
      <div className="project-visual__dock-ring project-visual__dock-ring--inner">
        <span className="project-visual__dock-aperture" />
      </div>
      <div className="project-visual__approach-rail">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function TextileWeaveVisual() {
  return (
    <div className="project-visual__scene project-visual__scene--textile-weave">
      <div className="project-visual__weave-plane">
        <div className="project-visual__warp">
          {warpThreads.map((thread) => (
            <span className="project-visual__warp-thread" data-thread={thread} key={thread} />
          ))}
        </div>
        <div className="project-visual__weft">
          {weftThreads.map((thread) => (
            <span className="project-visual__weft-thread" data-thread={thread} key={thread} />
          ))}
        </div>
        <div className="project-visual__fabric-fold project-visual__fabric-fold--one" />
        <div className="project-visual__fabric-fold project-visual__fabric-fold--two" />
      </div>
      <div className="project-visual__weave-swatch">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function RecursiveInterfaceVisual() {
  return (
    <div className="project-visual__scene project-visual__scene--recursive-interface">
      <div className="project-visual__recursive-stack">
        {recursiveFrames.map((frame) => (
          <div className="project-visual__recursive-frame" data-depth={frame} key={frame}>
            <span className="project-visual__recursive-header" />
            <span className="project-visual__recursive-sidebar" />
            <span className="project-visual__recursive-canvas" />
          </div>
        ))}
      </div>
      <div className="project-visual__interface-code">
        {interfaceLines.map((line) => (
          <span className="project-visual__interface-line" data-line={line} key={line} />
        ))}
      </div>
      <div className="project-visual__interface-pointer" />
    </div>
  );
}

function getProjectScene(projectId: ProjectId) {
  switch (projectId) {
    case 'ovoCyberBeads':
      return <PixelGridVisual />;
    case 'atMyTable':
      return <TableOrbitVisual />;
    case 'shiLeMa':
      return <OrganicRhythmVisual />;
    case 'spaceStationVr':
      return <StationDockVisual />;
    case 'hcPetFashion':
      return <TextileWeaveVisual />;
    case 'bonistudioWebsite':
      return <RecursiveInterfaceVisual />;
  }
}

export function ProjectVisual({ project, active = false }: ProjectVisualProps) {
  const className = [
    'project-visual',
    `project-visual--${projectModifiers[project.id]}`,
    active ? 'is-active' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      data-active={active ? 'true' : 'false'}
      data-project={project.id}
      data-signal={project.signal}
      aria-hidden="true"
    >
      {getProjectScene(project.id)}
    </div>
  );
}

export type { ProjectVisualProps };
