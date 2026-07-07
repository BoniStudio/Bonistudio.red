export const languages = ['en', 'zh'] as const;

export type Language = (typeof languages)[number];

export type ProjectAccent = 'cyan' | 'amber' | 'red' | 'violet' | 'green' | 'white';

export type BuildAreaId = 'ai' | 'apps' | 'games' | 'worlds';
export type PipelineNodeId = 'idea' | 'gpt' | 'claude' | 'codex' | 'build' | 'deploy' | 'users';
export type LabModuleId = 'scanner' | 'grid' | 'cursor' | 'archive';

export type BuildAreaContent = {
  id: BuildAreaId;
  title: string;
  copy: string;
  code: string;
};

export type ProjectContent = {
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

export type PipelineNodeContent = {
  id: PipelineNodeId;
  label: string;
  detail: string;
};

export type LabModuleContent = {
  id: LabModuleId;
  title: string;
  label: string;
  metric: string;
};

export type TimelineItemContent = {
  year: string;
  title: string;
  detail: string;
};

export type SiteContent = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    brand: string;
    kicker: string;
    ariaLabel: string;
    brandAriaLabel: string;
    languageLabel: string;
    items: {
      label: string;
      href: string;
    }[];
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    actionsLabel: string;
    primaryCta: string;
    secondaryCta: string;
    telemetryLeft: {
      label: string;
      value: string;
    };
    telemetryRight: {
      label: string;
      value: string;
    };
  };
  build: {
    eyebrow: string;
    title: string;
    copy: string;
    areas: BuildAreaContent[];
  };
  projects: {
    eyebrow: string;
    title: string;
    copy: string;
    items: ProjectContent[];
  };
  pipeline: {
    eyebrow: string;
    title: string;
    copy: string;
    ariaLabel: string;
    nodes: PipelineNodeContent[];
  };
  lab: {
    eyebrow: string;
    title: string;
    copy: string;
    ariaLabel: string;
    modules: LabModuleContent[];
    archiveItems: string[];
  };
  timeline: {
    eyebrow: string;
    title: string;
    items: TimelineItemContent[];
  };
  contact: {
    eyebrow: string;
    title: string;
    emailLabel: string;
    githubLabel: string;
    socialLabel: string;
    socialAriaLabel: string;
  };
  footer: {
    tagline: string;
    topLink: string;
  };
};

export const languageLabels: Record<Language, string> = {
  en: 'EN',
  zh: '中文',
};

export const content: Record<Language, SiteContent> = {
  en: {
    meta: {
      title: 'BoniStudio | AI-native products, games, and interactive worlds',
      description: 'BoniStudio is an AI-native studio building products, games, and interactive worlds.',
    },
    nav: {
      brand: 'BoniStudio',
      kicker: 'AI-native studio',
      ariaLabel: 'Primary navigation',
      brandAriaLabel: 'Back to top',
      languageLabel: 'Select language',
      items: [
        { label: 'Build', href: '#build' },
        { label: 'Projects', href: '#projects' },
        { label: 'Pipeline', href: '#pipeline' },
        { label: 'Lab', href: '#lab' },
        { label: 'Timeline', href: '#timeline' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    hero: {
      kicker: 'BoniStudio / interactive archive 001',
      title: 'BoniStudio',
      subtitle: 'AI-native products, games, and interactive worlds.',
      actionsLabel: 'Primary actions',
      primaryCta: 'Explore Projects',
      secondaryCta: 'View Lab',
      telemetryLeft: {
        label: 'BNS//RECONSTRUCT',
        value: 'volumetric archive online',
      },
      telemetryRight: {
        label: 'signal 06',
        value: 'AI-native studio',
      },
    },
    build: {
      eyebrow: 'What We Build',
      title: 'Product craft, game feel, AI systems, and spatial interfaces under one roof.',
      copy: 'BoniStudio is a small lab with a wide surface area: fast enough to prototype, technical enough to ship, visual enough to make the work memorable.',
      areas: [
        {
          id: 'ai',
          title: 'AI Products',
          copy: 'AI-assisted tools, creative workflows, and product systems built around real user behavior.',
          code: 'AI',
        },
        {
          id: 'apps',
          title: 'Mobile Apps',
          copy: 'Focused iOS and mobile experiments with fast prototyping, clear loops, and tactile polish.',
          code: 'APP',
        },
        {
          id: 'games',
          title: 'Games',
          copy: 'Play systems, progression ideas, mechanics prototypes, and expressive digital toys.',
          code: 'GAME',
        },
        {
          id: 'worlds',
          title: 'Interactive Worlds',
          copy: 'Spatial interfaces, VR concepts, world archives, and object-memory experiences.',
          code: 'VR',
        },
      ],
    },
    projects: {
      eyebrow: 'Projects',
      title: 'An archive of shipped apps, prototypes, and long-range worlds.',
      copy: 'Each project is treated like a living object: product logic, visual language, build system, and future memory.',
      items: [
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
      ],
    },
    pipeline: {
      eyebrow: 'AI Pipeline',
      title: 'Idea -> GPT -> Claude -> Codex -> Build -> Deploy -> Users',
      copy: 'The production system is AI-assisted by default: human taste sets direction, models expand options, Codex turns intent into working surfaces, users close the loop.',
      ariaLabel: 'AI-assisted creation pipeline',
      nodes: [
        { id: 'idea', label: 'Idea', detail: 'spark' },
        { id: 'gpt', label: 'GPT', detail: 'strategy' },
        { id: 'claude', label: 'Claude', detail: 'systems' },
        { id: 'codex', label: 'Codex', detail: 'build' },
        { id: 'build', label: 'Build', detail: 'ship' },
        { id: 'deploy', label: 'Deploy', detail: 'release' },
        { id: 'users', label: 'Users', detail: 'signal' },
      ],
    },
    lab: {
      eyebrow: 'Interactive Lab',
      title: 'Small technical experiments that make the archive feel alive.',
      copy: 'Particle reconstruction, neural maps, spatial cursors, and product records are mocked as a first lab surface for future deeper experiments.',
      ariaLabel: 'Interactive lab modules',
      modules: [
        { id: 'scanner', title: 'Particle Scanner', label: 'object reconstruction', metric: '5.6k particles' },
        { id: 'grid', title: 'Neural Grid', label: 'latent routing map', metric: '42 nodes' },
        { id: 'cursor', title: 'Spatial Cursor', label: 'presence field', metric: 'live vector' },
        { id: 'archive', title: 'Product Archive', label: 'interactive index', metric: '6 records' },
      ],
      archiveItems: ['OvO', 'AMT', 'SLA', 'VR', 'HCP', 'BNS'],
    },
    timeline: {
      eyebrow: 'Timeline',
      title: 'The studio grows as an archive, not a pitch deck.',
      items: [
        { year: '2026', title: 'BoniStudio founded', detail: 'A small AI-native studio begins building in public.' },
        { year: '2026', title: 'First apps shipped', detail: 'Early mobile and creative product experiments leave the lab.' },
        { year: '2026', title: 'AI-native workflow established', detail: 'GPT, Claude, Codex, and human direction become one production loop.' },
        { year: '2027', title: 'VR prototype target', detail: 'Space Station systems move toward a playable spatial prototype.' },
        { year: 'Future', title: 'Interactive worlds and AI products', detail: 'The archive expands into richer products, games, and living interfaces.' },
      ],
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Open channel for products, games, and AI-built worlds.',
      emailLabel: 'Email BoniStudio',
      githubLabel: 'GitHub',
      socialLabel: 'Social',
      socialAriaLabel: 'Social links',
    },
    footer: {
      tagline: 'BoniStudio builds AI-native products, games, and interactive worlds.',
      topLink: 'Top',
    },
  },
  zh: {
    meta: {
      title: 'BoniStudio | AI 原生产品、游戏与互动世界',
      description: 'BoniStudio 是一家构建 AI 原生产品、游戏与互动世界的创作工作室。',
    },
    nav: {
      brand: 'BoniStudio',
      kicker: 'AI 原生工作室',
      ariaLabel: '主导航',
      brandAriaLabel: '回到顶部',
      languageLabel: '选择语言',
      items: [
        { label: '构建', href: '#build' },
        { label: '项目', href: '#projects' },
        { label: '流程', href: '#pipeline' },
        { label: '实验室', href: '#lab' },
        { label: '时间线', href: '#timeline' },
        { label: '联系', href: '#contact' },
      ],
    },
    hero: {
      kicker: 'BoniStudio / 互动档案 001',
      title: 'BoniStudio',
      subtitle: 'AI 原生产品、游戏与互动世界。',
      actionsLabel: '主要操作',
      primaryCta: '查看项目',
      secondaryCta: '进入实验室',
      telemetryLeft: {
        label: 'BNS//重构',
        value: '体积档案在线',
      },
      telemetryRight: {
        label: '信号 06',
        value: 'AI 原生工作室',
      },
    },
    build: {
      eyebrow: '我们构建什么',
      title: '把产品手感、游戏体验、AI 系统与空间界面放在同一个屋檐下。',
      copy: 'BoniStudio 是一个小型创作实验室，覆盖面很宽：足够快，能持续原型；足够技术化，能真正上线；也足够重视视觉，让作品被记住。',
      areas: [
        {
          id: 'ai',
          title: 'AI 产品',
          copy: '围绕真实用户行为打造 AI 辅助工具、创作流程与产品系统。',
          code: 'AI',
        },
        {
          id: 'apps',
          title: '移动应用',
          copy: '聚焦 iOS 与移动端实验，以快速原型、清晰循环和触感细节推进。',
          code: 'APP',
        },
        {
          id: 'games',
          title: '游戏',
          copy: '探索玩法系统、成长曲线、机制原型和有表达感的数字玩具。',
          code: 'GAME',
        },
        {
          id: 'worlds',
          title: '互动世界',
          copy: '构建空间界面、VR 概念、世界档案与带有物件记忆的体验。',
          code: 'VR',
        },
      ],
    },
    projects: {
      eyebrow: '项目',
      title: '收录已发布应用、原型和长期世界项目的档案。',
      copy: '每个项目都被当作一个活的对象来处理：产品逻辑、视觉语言、构建系统和未来记忆一起生长。',
      items: [
        {
          title: 'OvO Cyber Beads',
          subtitle: '创意 iOS 应用',
          description: '以像素和拼豆风格构建图像，让图案思维、触感创作和轻量玩具感自然结合。',
          status: '已发布原型',
          year: '2026',
          tags: ['iOS', '创意工具', '像素手作'],
          accent: 'cyan',
          signal: 'OBC-01',
          span: 'wide',
        },
        {
          title: 'AtMyTable',
          subtitle: '家庭协作',
          description: '面向家庭聚餐的协作应用，用来计划谁带什么、做什么、分享什么，以及留下什么记忆。',
          status: '产品概念',
          year: '2026',
          tags: ['移动端', '家庭', '餐食协作'],
          accent: 'amber',
          signal: 'AMT-02',
        },
        {
          title: '屎了吗',
          subtitle: '轻松日常记录',
          description: '一个刻意轻松的日常记录应用，用习惯循环、小仪式和鲜明语气降低健康记录的压力。',
          status: '玩法实验',
          year: '2026',
          tags: ['移动端', '习惯', '健康记录'],
          accent: 'green',
          signal: 'SLA-03',
        },
        {
          title: 'Space Station / VR Game',
          subtitle: '长期世界项目',
          description: '一个空间互动世界原型，探索空间站生活、移动系统、物件记忆和 VR 临场感。',
          status: '长期研发',
          year: '2027 目标',
          tags: ['VR', '游戏系统', '世界构建'],
          accent: 'violet',
          signal: 'SSV-04',
          span: 'tall',
        },
        {
          title: 'HC Pet Fashion',
          subtitle: '商业实验',
          description: '宠物时尚电商概念，用于测试视觉陈列、小品牌叙事和 AI 辅助目录工作流。',
          status: '实验中',
          year: '2026',
          tags: ['电商', '品牌', '宠物时尚'],
          accent: 'red',
          signal: 'HCP-05',
        },
        {
          title: 'BoniStudio Website',
          subtitle: 'AI 原生展示面',
          description: '这个互动工作室档案，是产品、游戏、AI 工作流和视觉技术实验的动态展示面。',
          status: '已上线',
          year: '2026',
          tags: ['Three.js', 'R3F', 'AI 工作室'],
          accent: 'white',
          signal: 'BNS-06',
          span: 'wide',
        },
      ],
    },
    pipeline: {
      eyebrow: 'AI 流程',
      title: '想法 -> GPT -> Claude -> Codex -> 构建 -> 部署 -> 用户',
      copy: '生产系统默认由 AI 辅助：人的品味设定方向，模型扩展选择，Codex 把意图变成可工作的界面，用户反馈完成闭环。',
      ariaLabel: 'AI 辅助创作流程',
      nodes: [
        { id: 'idea', label: '想法', detail: '火花' },
        { id: 'gpt', label: 'GPT', detail: '策略' },
        { id: 'claude', label: 'Claude', detail: '系统' },
        { id: 'codex', label: 'Codex', detail: '构建' },
        { id: 'build', label: 'Build', detail: '成品' },
        { id: 'deploy', label: 'Deploy', detail: '发布' },
        { id: 'users', label: '用户', detail: '信号' },
      ],
    },
    lab: {
      eyebrow: '互动实验室',
      title: '用小型技术实验，让档案具备生命感。',
      copy: '粒子重构、神经地图、空间光标和产品记录被组合成第一层实验表面，为未来更深入的交互做准备。',
      ariaLabel: '互动实验室模块',
      modules: [
        { id: 'scanner', title: '粒子扫描器', label: '对象重构', metric: '5.6k 粒子' },
        { id: 'grid', title: '神经网格', label: '潜空间路由图', metric: '42 节点' },
        { id: 'cursor', title: '空间光标', label: '临场域', metric: '实时向量' },
        { id: 'archive', title: '产品档案', label: '互动索引', metric: '6 条记录' },
      ],
      archiveItems: ['OvO', 'AMT', 'SLA', 'VR', 'HCP', 'BNS'],
    },
    timeline: {
      eyebrow: '时间线',
      title: '工作室会像档案一样生长，而不是像演示稿一样结束。',
      items: [
        { year: '2026', title: 'BoniStudio 成立', detail: '一个小型 AI 原生工作室开始公开构建。' },
        { year: '2026', title: '第一批应用上线', detail: '早期移动端与创意产品实验离开实验室。' },
        { year: '2026', title: 'AI 原生工作流成型', detail: 'GPT、Claude、Codex 和人的方向感变成同一个生产循环。' },
        { year: '2027', title: 'VR 原型目标', detail: 'Space Station 系统朝可玩的空间原型推进。' },
        { year: '未来', title: '互动世界与 AI 产品', detail: '档案继续扩展为更丰富的产品、游戏和活的界面。' },
      ],
    },
    contact: {
      eyebrow: '联系',
      title: '为产品、游戏和 AI 构建的世界保持开放通道。',
      emailLabel: '给 BoniStudio 发邮件',
      githubLabel: 'GitHub',
      socialLabel: '社交',
      socialAriaLabel: '社交链接',
    },
    footer: {
      tagline: 'BoniStudio 构建 AI 原生产品、游戏与互动世界。',
      topLink: '回到顶部',
    },
  },
};
