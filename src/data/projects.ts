export const projectIds = [
  'ovoCyberBeads',
  'atMyTable',
  'shiLeMa',
  'spaceStationVr',
  'hcPetFashion',
  'bonistudioWebsite',
] as const;

export type ProjectId = (typeof projectIds)[number];
export type ProjectAccent = 'cyan' | 'amber' | 'red' | 'violet' | 'green' | 'white';

export type ProjectMeta = {
  id: ProjectId;
  signal: string;
  accent: ProjectAccent;
  span?: 'wide' | 'tall';
};

export type Project = ProjectMeta & {
  title: string;
  type: string;
  description: string;
  status: string;
  year: string;
  tags: string[];
};

export type ProjectCopy = {
  id: ProjectId;
  title: string;
  type: string;
  description: string;
  status: string;
  year: string;
  tags: string[];
};

export const projectMeta: Record<ProjectId, ProjectMeta> = {
  ovoCyberBeads: {
    id: 'ovoCyberBeads',
    signal: 'OBC-01',
    accent: 'cyan',
    span: 'wide',
  },
  atMyTable: {
    id: 'atMyTable',
    signal: 'AMT-02',
    accent: 'amber',
  },
  shiLeMa: {
    id: 'shiLeMa',
    signal: 'SLA-03',
    accent: 'green',
  },
  spaceStationVr: {
    id: 'spaceStationVr',
    signal: 'SSV-04',
    accent: 'violet',
    span: 'tall',
  },
  hcPetFashion: {
    id: 'hcPetFashion',
    signal: 'HCP-05',
    accent: 'red',
  },
  bonistudioWebsite: {
    id: 'bonistudioWebsite',
    signal: 'BNS-06',
    accent: 'white',
    span: 'wide',
  },
};

export function composeProjects(projects: ProjectCopy[]): Project[] {
  return projects.map((project) => ({
    ...projectMeta[project.id],
    ...project,
  }));
}
