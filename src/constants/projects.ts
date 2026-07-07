export type ProjectAccent = 'cyan' | 'amber' | 'red' | 'violet' | 'green' | 'white';

export type Project = {
  title: string;
  subtitle: string;
  description: string;
  status: string;
  year: string;
  tags: string[];
  accent: ProjectAccent;
  signal: string;
  span?: 'wide' | 'tall';
};

export const projects: Project[] = [
  {
    title: 'OvO Cyber Beads',
    subtitle: 'Creative iOS app',
    description: 'Pixel and perler-style digital beads for playful image building, pattern thinking, and tactile creation.',
    status: 'Shipped prototype',
    year: '2026',
    tags: ['iOS', 'Creative tool', 'Pixel craft'],
    accent: 'cyan',
    signal: 'OBC-01',
    span: 'wide',
  },
  {
    title: 'AtMyTable',
    subtitle: 'Family coordination',
    description: 'A gathering and food coordination app for families planning what to bring, cook, share, and remember.',
    status: 'Product concept',
    year: '2026',
    tags: ['Mobile', 'Family', 'Food ops'],
    accent: 'amber',
    signal: 'AMT-02',
  },
  {
    title: '屎了吗',
    subtitle: 'Playful daily tracker',
    description: 'A deliberately light, daily poop tracking app with habit loops, tiny rituals, and memorable product tone.',
    status: 'Play lab',
    year: '2026',
    tags: ['Mobile', 'Habit', 'Health log'],
    accent: 'green',
    signal: 'SLA-03',
  },
  {
    title: 'Space Station / VR Game',
    subtitle: 'Long-term world project',
    description: 'A spatial interactive world prototype exploring station life, movement systems, object memory, and VR presence.',
    status: 'Long-range R&D',
    year: '2027 target',
    tags: ['VR', 'Game systems', 'Worldbuilding'],
    accent: 'violet',
    signal: 'SSV-04',
    span: 'tall',
  },
  {
    title: 'HC Pet Fashion',
    subtitle: 'Commerce experiment',
    description: 'A pet fashion commerce concept testing visual merchandising, small-brand storytelling, and AI-assisted catalog work.',
    status: 'Experiment',
    year: '2026',
    tags: ['Commerce', 'Brand', 'Pet fashion'],
    accent: 'red',
    signal: 'HCP-05',
  },
  {
    title: 'BoniStudio Website',
    subtitle: 'AI-native showcase',
    description: 'This interactive studio archive: a living surface for products, games, AI workflow, and visual technology experiments.',
    status: 'Now online',
    year: '2026',
    tags: ['Three.js', 'R3F', 'AI studio'],
    accent: 'white',
    signal: 'BNS-06',
    span: 'wide',
  },
];
