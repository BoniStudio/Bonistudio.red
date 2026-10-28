import { composeProjects, type Project, type ProjectCopy } from '../data/projects';

export const languages = ['en', 'zh'] as const;

export type Language = (typeof languages)[number];

export type BuildAreaId = 'ai' | 'apps' | 'systems' | 'games' | 'worlds';
export type PipelineNodeId = 'idea' | 'gpt' | 'claude' | 'codex' | 'build' | 'deploy' | 'users';
export type LabModuleId = 'scanner' | 'grid' | 'cursor' | 'archive';
export type OperationsPreviewId = 'dashboard' | 'production' | 'delivery' | 'inventory' | 'schedule';
export type HeroSurfaceId = 'products' | 'games' | 'systems' | 'worlds';

export type BuildAreaContent = {
  id: BuildAreaId;
  title: string;
  copy: string;
  code: string;
};

export type ProjectContent = Project;

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

export type HeroStatContent = {
  label: string;
  value: string;
  tone: 'cyan' | 'lime' | 'purple' | 'amber' | 'white';
};

export type OperationsCaseStudyContent = {
  cardCta: string;
  client: {
    label: string;
    name: string;
    logoSrc: string;
    logoAlt: string;
  };
  eyebrow: string;
  title: string;
  subtitle: string;
  overview: string;
  challenge: {
    eyebrow: string;
    title: string;
    copy: string;
  };
  solution: {
    eyebrow: string;
    title: string;
    items: {
      code: string;
      title: string;
      copy: string;
    }[];
  };
  demo: {
    eyebrow: string;
    title: string;
    copy: string;
    ariaLabel: string;
    disclaimer: string;
    previews: {
      id: OperationsPreviewId;
      label: string;
      detail: string;
    }[];
  };
  results: {
    eyebrow: string;
    title: string;
    copy: string;
    metrics: {
      value: string;
      label: string;
    }[];
  };
  role: {
    eyebrow: string;
    title: string;
    items: string[];
  };
  stack: {
    eyebrow: string;
    title: string;
    items: string[];
  };
  cta: {
    eyebrow: string;
    title: string;
    label: string;
  };
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
    engine: {
      ariaLabel: string;
      eyebrow: string;
      coreLabel: string;
      coreStatus: string;
      status: string;
      output: string;
      surfaces: {
        id: HeroSurfaceId;
        title: string;
        detail: string;
        signal: string;
        href: string;
      }[];
    };
    stats: HeroStatContent[];
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
    items: Project[];
  };
  caseStudies: {
    kitchenOperations: OperationsCaseStudyContent;
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
      title: 'BoniStudio | AI-native products, games, systems, and worlds',
      description: 'BoniStudio is an AI-native studio building products, games, business systems, and interactive worlds.',
    },
    nav: {
      brand: 'BoniStudio',
      kicker: 'AI-native studio',
      ariaLabel: 'Primary navigation',
      brandAriaLabel: 'Back to top',
      languageLabel: 'Select language',
      items: [
        { label: 'Home', href: '#top' },
        { label: 'Projects', href: '#projects' },
        { label: 'Pipeline', href: '#pipeline' },
        { label: 'Lab', href: '#lab' },
        { label: 'Timeline', href: '#timeline' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    hero: {
      kicker: 'AI-native studio / spatial archive',
      title: 'BoniStudio',
      subtitle: 'AI-native products, games, systems, and interactive worlds.',
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
      engine: {
        ariaLabel: 'BoniStudio creation engine and four output surfaces',
        eyebrow: 'Creation engine / live',
        coreLabel: 'AI core',
        coreStatus: 'Human-directed',
        status: 'One studio / four surfaces',
        output: 'Real products out',
        surfaces: [
          { id: 'products', title: 'Products', detail: 'Apps · tools · workflows', signal: 'SHIP / APP', href: '#projects' },
          { id: 'games', title: 'Games', detail: 'Mechanics · play · systems', signal: 'PLAY / LOOP', href: '#projects' },
          { id: 'systems', title: 'Systems', detail: 'Onigiri Sen · live operations', signal: 'LIVE / OPS', href: '#kitchen-operations' },
          { id: 'worlds', title: 'Worlds', detail: 'Spatial · VR · archives', signal: 'ENTER / XR', href: '#lab' },
        ],
      },
      stats: [
        { label: 'Studio', value: 'AI-native studio', tone: 'cyan' },
        { label: 'Base', value: 'Seattle x Global', tone: 'white' },
        { label: 'Surface', value: 'Products / Games / Systems / Worlds', tone: 'purple' },
      ],
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
          id: 'systems',
          title: 'Business Systems',
          copy: 'Operational platforms that connect teams, workflows, data, permissions, and field work across web and native apps.',
          code: 'OPS',
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
      title: 'An archive of shipped apps, live systems, prototypes, and long-range worlds.',
      copy: 'Each project is treated like a living object: product logic, operational reality, visual language, and build system grow together.',
      items: composeProjects([
        {
          id: 'ovoCyberBeads',
          title: 'OvO Cyber Beads',
          type: 'Creative iOS app',
          description: 'Pixel and perler-style digital beads for playful image building, pattern thinking, and tactile creation.',
          status: 'Shipped prototype',
          year: '2026',
          tags: ['iOS', 'Creative tool', 'Pixel craft'],
        },
        {
          id: 'atMyTable',
          title: 'AtMyTable',
          type: 'Family coordination',
          description: 'A gathering and food coordination app for families planning what to bring, cook, share, and remember.',
          status: 'Product concept',
          year: '2026',
          tags: ['Mobile', 'Family', 'Food ops'],
        },
        {
          id: 'shiLeMa',
          title: '屎了吗',
          type: 'Playful daily tracker',
          description: 'A deliberately light, daily poop tracking app with habit loops, tiny rituals, and memorable product tone.',
          status: 'Play lab',
          year: '2026',
          tags: ['Mobile', 'Habit', 'Health log'],
        },
        {
          id: 'spaceStationVr',
          title: 'Space Station / VR Game',
          type: 'Long-term world project',
          description: 'A spatial interactive world prototype exploring station life, movement systems, object memory, and VR presence.',
          status: 'Long-range R&D',
          year: '2027 target',
          tags: ['VR', 'Game systems', 'Worldbuilding'],
        },
        {
          id: 'hcPetFashion',
          title: 'HC Pet Fashion',
          type: 'Commerce experiment',
          description: 'A pet fashion commerce concept testing visual merchandising, small-brand storytelling, and AI-assisted catalog work.',
          status: 'Experiment',
          year: '2026',
          tags: ['Commerce', 'Brand', 'Pet fashion'],
        },
        {
          id: 'bonistudioWebsite',
          title: 'BoniStudio Website',
          type: 'AI-native showcase',
          description: 'This interactive studio archive: a living surface for products, games, AI workflow, and visual technology experiments.',
          status: 'Now online',
          year: '2026',
          tags: ['Three.js', 'R3F', 'AI studio'],
        },
        {
          id: 'kitchenOperations',
          title: 'Onigiri Sen Operations',
          type: 'Business operations · Web + iOS',
          description: 'A live platform built with Onigiri Sen, connecting production, delivery, inventory, scheduling, and reporting across web, iPhone, and iPad.',
          status: 'Live / In daily use',
          year: '2026',
          tags: ['Onigiri Sen', 'Web + iOS', 'Operations'],
        },
      ]),
    },
    caseStudies: {
      kitchenOperations: {
        cardCta: 'View full case study',
        client: {
          label: 'Client collaboration',
          name: 'Onigiri Sen',
          logoSrc: '/clients/onigiri-sen-symbol.png',
          logoAlt: 'Onigiri Sen brand symbol',
        },
        eyebrow: 'Delivered platform / 2026',
        title: 'Onigiri Sen Operations',
        subtitle: 'BoniStudio × Onigiri Sen · An all-in-one operations platform · Web + iOS',
        overview: 'BoniStudio designed and built Onigiri Sen Operations for Onigiri Sen, a West Coast rice-ball food producer with central kitchens in Seattle and San Jose. The platform consolidates production, delivery, inventory, scheduling, and reporting into one shared system across the web, iPhone, and iPad.',
        challenge: {
          eyebrow: '01 / The challenge',
          title: 'One operation, scattered across spreadsheets, chats, and disconnected files.',
          copy: 'Production plans and orders lived in separate spreadsheets. Deliveries and shifts were coordinated through group chats, while inventory and reports each had their own files. A multilingual, fast-changing kitchen team needed one simple, role-aware view of the operation.',
        },
        solution: {
          eyebrow: '02 / The system',
          title: 'A shared operational layer that works with the team already in place.',
          items: [
            {
              code: 'SYNC',
              title: 'Validated sheet sync',
              copy: 'Hourly sync with the team’s existing Google Sheets, with automatic validation before data enters the system.',
            },
            {
              code: 'MAKE',
              title: 'Production control',
              copy: 'Daily planning, actual-output confirmation, and shared kitchen views keep production aligned.',
            },
            {
              code: 'ROUTE',
              title: 'Delivery workflow',
              copy: 'Organized stops, one-tap navigation, driver assignment, and photo proof of delivery.',
            },
            {
              code: 'STOCK',
              title: 'Inventory signal',
              copy: 'Physical counts, low-stock alerts, purchase references, and manager-controlled item maintenance.',
            },
            {
              code: 'ACCESS',
              title: 'Role-aware access',
              copy: 'Kitchen and role permissions across English, Japanese, and Spanish interfaces.',
            },
          ],
        },
        demo: {
          eyebrow: '03 / Representative interface',
          title: 'A five-surface view of the operation.',
          copy: 'These programmatic demo views show the system architecture without exposing customer orders, employees, locations, or internal data.',
          ariaLabel: 'Select a representative operations module',
          disclaimer: 'Demo interface / representative system view',
          previews: [
            { id: 'dashboard', label: 'Dashboard', detail: 'Daily production, delivery, inventory alerts, and open tasks in one operational view.' },
            { id: 'production', label: 'Production', detail: 'Plans and confirmed output organized by day, kitchen, and product line.' },
            { id: 'delivery', label: 'Delivery', detail: 'Ordered stops, driver assignments, navigation handoff, and delivery confirmation.' },
            { id: 'inventory', label: 'Inventory', detail: 'Counts, low-stock signals, and manager-maintained purchasing references.' },
            { id: 'schedule', label: 'Schedule', detail: 'Role-ordered shifts, reusable weekly patterns, and shared kitchen visibility.' },
          ],
        },
        results: {
          eyebrow: '04 / Live result',
          title: 'A shipped system in daily operational use.',
          copy: 'Now used daily across two kitchens by about 15 staff, covering nine operational modules. The native iOS app passed Apple review for unlisted distribution in October 2026.',
          metrics: [
            { value: '2', label: 'Central kitchens' },
            { value: '~15', label: 'Daily users' },
            { value: '9', label: 'Operational modules' },
            { value: '3', label: 'Interface languages' },
          ],
        },
        role: {
          eyebrow: '05 / Our role',
          title: 'From workflow discovery to launch and ongoing support.',
          items: ['Product strategy', 'UI/UX design', 'Full-stack development', 'Native iOS development', 'Cloud deployment', 'App Store release', 'Ongoing support'],
        },
        stack: {
          eyebrow: '06 / System stack',
          title: 'Built for secure, multilingual, cross-platform operations.',
          items: ['React', 'TypeScript', 'Cloudflare Workers', 'D1', 'Auth0', 'SwiftUI', 'Google Sheets', 'AI-assisted development'],
        },
        cta: {
          eyebrow: 'Need a system that matches how your team actually works?',
          title: 'Turn the operational mess into one clear product surface.',
          label: 'Start a similar project',
        },
      },
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
      copy: 'Particle reconstruction, anomalous matter, neural maps, and product records are mocked as a first lab surface for future deeper experiments.',
      ariaLabel: 'Interactive lab modules',
      modules: [
        { id: 'scanner', title: 'Particle Scanner', label: 'object reconstruction', metric: '5.6k particles' },
        { id: 'grid', title: 'Neural Grid', label: 'latent routing map', metric: '42 nodes' },
        { id: 'cursor', title: 'Anomalous Matter', label: 'organic data core', metric: 'live mesh' },
        { id: 'archive', title: 'Product Archive', label: 'interactive index', metric: '7 records' },
      ],
      archiveItems: ['OvO', 'AMT', 'SLA', 'VR', 'HCP', 'BNS', 'OPS'],
    },
    timeline: {
      eyebrow: 'Timeline',
      title: 'The studio grows as an archive, not a pitch deck.',
      items: [
        { year: '2026', title: 'BoniStudio founded', detail: 'A small AI-native studio begins building in public.' },
        { year: '2026', title: 'Apps and operations platform shipped', detail: 'Mobile products and a live multi-platform operations system leave the lab.' },
        { year: '2026', title: 'AI-native workflow established', detail: 'GPT, Claude, Codex, and human direction become one production loop.' },
        { year: '2027', title: 'VR prototype target', detail: 'Space Station systems move toward a playable spatial prototype.' },
        { year: 'Future', title: 'Interactive worlds and AI products', detail: 'The archive expands into richer products, games, and living interfaces.' },
      ],
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Open channel for products, games, business systems, and AI-built worlds.',
      emailLabel: 'Email BoniStudio',
      githubLabel: 'GitHub',
      socialLabel: 'Social',
      socialAriaLabel: 'Social links',
    },
    footer: {
      tagline: 'Building the future, one product at a time.',
      topLink: 'Top',
    },
  },
  zh: {
    meta: {
      title: 'BoniStudio | AI 原生产品、游戏、企业系统与互动世界',
      description: 'BoniStudio 是一家构建 AI 原生产品、游戏、企业业务系统与互动世界的创作工作室。',
    },
    nav: {
      brand: 'BoniStudio',
      kicker: 'AI 原生工作室',
      ariaLabel: '主导航',
      brandAriaLabel: '回到顶部',
      languageLabel: '选择语言',
      items: [
        { label: '首页', href: '#top' },
        { label: '项目', href: '#projects' },
        { label: '流程', href: '#pipeline' },
        { label: '实验室', href: '#lab' },
        { label: '时间线', href: '#timeline' },
        { label: '联系', href: '#contact' },
      ],
    },
    hero: {
      kicker: 'AI 原生工作室 / 空间档案',
      title: 'BoniStudio',
      subtitle: 'AI 原生产品、游戏、企业系统与互动世界。',
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
      engine: {
        ariaLabel: 'BoniStudio 创造引擎与四个产品输出面',
        eyebrow: '创造引擎 / 在线',
        coreLabel: 'AI 核心',
        coreStatus: '由人主导',
        status: '一个工作室 / 四种产品表面',
        output: '真实产品持续上线',
        surfaces: [
          { id: 'products', title: '产品', detail: '应用 · 工具 · 工作流', signal: 'SHIP / APP', href: '#projects' },
          { id: 'games', title: '游戏', detail: '机制 · 玩法 · 系统', signal: 'PLAY / LOOP', href: '#projects' },
          { id: 'systems', title: '企业系统', detail: 'Onigiri Sen · 日常运营', signal: 'LIVE / OPS', href: '#kitchen-operations' },
          { id: 'worlds', title: '互动世界', detail: '空间 · VR · 档案', signal: 'ENTER / XR', href: '#lab' },
        ],
      },
      stats: [
        { label: '工作室', value: 'AI 原生工作室', tone: 'cyan' },
        { label: '坐标', value: 'Seattle x Global', tone: 'white' },
        { label: '方向', value: '产品 / 游戏 / 企业系统 / 互动世界', tone: 'purple' },
      ],
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
          id: 'systems',
          title: '企业业务系统',
          copy: '打造连接团队、流程、数据、权限与现场工作的运营平台，覆盖网页与原生应用。',
          code: 'OPS',
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
      title: '收录已发布应用、真实运营系统、原型和长期世界项目的档案。',
      copy: '每个项目都被当作一个活的对象来处理：产品逻辑、运营现实、视觉语言和构建系统一起生长。',
      items: composeProjects([
        {
          id: 'ovoCyberBeads',
          title: 'OvO Cyber Beads',
          type: '创意 iOS 应用',
          description: '以像素和拼豆风格构建图像，让图案思维、触感创作和轻量玩具感自然结合。',
          status: '已发布原型',
          year: '2026',
          tags: ['iOS', '创意工具', '像素手作'],
        },
        {
          id: 'atMyTable',
          title: 'AtMyTable',
          type: '家庭协作',
          description: '面向家庭聚餐的协作应用，用来计划谁带什么、做什么、分享什么，以及留下什么记忆。',
          status: '产品概念',
          year: '2026',
          tags: ['移动端', '家庭', '餐食协作'],
        },
        {
          id: 'shiLeMa',
          title: '屎了吗',
          type: '轻松日常记录',
          description: '一个刻意轻松的日常记录应用，用习惯循环、小仪式和鲜明语气降低健康记录的压力。',
          status: '玩法实验',
          year: '2026',
          tags: ['移动端', '习惯', '健康记录'],
        },
        {
          id: 'spaceStationVr',
          title: 'Space Station / VR Game',
          type: '长期世界项目',
          description: '一个空间互动世界原型，探索空间站生活、移动系统、物件记忆和 VR 临场感。',
          status: '长期研发',
          year: '2027 目标',
          tags: ['VR', '游戏系统', '世界构建'],
        },
        {
          id: 'hcPetFashion',
          title: 'HC Pet Fashion',
          type: '商业实验',
          description: '宠物时尚电商概念，用于测试视觉陈列、小品牌叙事和 AI 辅助目录工作流。',
          status: '实验中',
          year: '2026',
          tags: ['电商', '品牌', '宠物时尚'],
        },
        {
          id: 'bonistudioWebsite',
          title: 'BoniStudio Website',
          type: 'AI 原生展示面',
          description: '这个互动工作室档案，是产品、游戏、AI 工作流和视觉技术实验的动态展示面。',
          status: '已上线',
          year: '2026',
          tags: ['Three.js', 'R3F', 'AI 工作室'],
        },
        {
          id: 'kitchenOperations',
          title: 'Onigiri Sen Operations',
          type: '企业运营系统 · Web + iOS',
          description: 'BoniStudio 与 Onigiri Sen 联合交付的日常运营平台，把生产、配送、库存、排班与报表连接到网页、iPhone 与 iPad。',
          status: '已上线 / 日常使用',
          year: '2026',
          tags: ['Onigiri Sen', 'Web + iOS', '运营系统'],
        },
      ]),
    },
    caseStudies: {
      kitchenOperations: {
        cardCta: '查看完整案例',
        client: {
          label: '客户联合项目',
          name: 'Onigiri Sen',
          logoSrc: '/clients/onigiri-sen-symbol.png',
          logoAlt: 'Onigiri Sen 品牌符号',
        },
        eyebrow: '已交付平台 / 2026',
        title: 'Onigiri Sen Operations',
        subtitle: 'BoniStudio × Onigiri Sen · 一体化运营平台 · 网页 + iOS',
        overview: 'BoniStudio 为 Onigiri Sen 设计并开发了 Onigiri Sen Operations。客户在西雅图和圣何塞设有中央厨房，这套平台把生产、配送、库存、排班和报表集中到同一个系统，并在网页、iPhone 与 iPad 之间共享实时数据。',
        challenge: {
          eyebrow: '01 / 挑战',
          title: '同一套业务，被分散在表格、群聊和彼此孤立的文件里。',
          copy: '生产计划和订单分散在多份表格里，配送与排班依赖群聊协调，库存和报表各自使用不同文件。面对多语言、人员变化快的厨房团队，管理层缺少一个简单、按角色区分的全局视图。',
        },
        solution: {
          eyebrow: '02 / 系统方案',
          title: '不打断现有团队节奏，建立一层共享的运营系统。',
          items: [
            {
              code: 'SYNC',
              title: '表格同步与校验',
              copy: '每小时同步团队现有的 Google 表格，并在数据进入系统前自动完成一致性校验。',
            },
            {
              code: 'MAKE',
              title: '生产控制',
              copy: '把每日计划、实际产量确认和厨房共享视图连接在同一个生产流程中。',
            },
            {
              code: 'ROUTE',
              title: '配送工作流',
              copy: '自动整理站点、指派司机、一键导航，并通过照片完成送达确认。',
            },
            {
              code: 'STOCK',
              title: '库存信号',
              copy: '实物盘点、低库存预警、采购参考，以及管理层自助维护品目。',
            },
            {
              code: 'ACCESS',
              title: '角色化权限',
              copy: '按厨房与岗位隔离数据，并提供英语、日语和西班牙语界面。',
            },
          ],
        },
        demo: {
          eyebrow: '03 / 代表性界面',
          title: '用五个系统表面，看见整套运营。',
          copy: '以下程序化演示界面只表达系统结构，不包含客户订单、员工、地点或任何内部数据。',
          ariaLabel: '选择一个运营模块的代表性界面',
          disclaimer: '演示界面 / 代表性系统视图',
          previews: [
            { id: 'dashboard', label: '总览', detail: '把当天生产、配送、库存预警和未完成事项汇总为一个运营视图。' },
            { id: 'production', label: '生产', detail: '按日期、厨房和产品线组织计划与实际产量确认。' },
            { id: 'delivery', label: '配送', detail: '整合站点顺序、司机指派、导航交接和送达确认。' },
            { id: 'inventory', label: '库存', detail: '集中显示盘点、低库存信号和管理层维护的采购参考。' },
            { id: 'schedule', label: '排班', detail: '按岗位组织班次、复用每周模板，并适配厨房共享设备。' },
          ],
        },
        results: {
          eyebrow: '04 / 上线成果',
          title: '一套已经进入日常运营的交付系统。',
          copy: '目前已在两间厨房投入日常使用，覆盖约 15 名员工和 9 个业务模块。原生 iOS App 于 2026 年 10 月通过 Apple 审核，以非公开方式分发。',
          metrics: [
            { value: '2', label: '中央厨房' },
            { value: '约 15', label: '日常使用者' },
            { value: '9', label: '业务模块' },
            { value: '3', label: '界面语言' },
          ],
        },
        role: {
          eyebrow: '05 / 我们的工作',
          title: '从流程梳理，到上线，再到持续运维。',
          items: ['产品规划', 'UI/UX 设计', '全栈开发', '原生 iOS 开发', '云端部署', 'App Store 上架', '持续运维'],
        },
        stack: {
          eyebrow: '06 / 技术系统',
          title: '为安全、多语言与跨端运营而构建。',
          items: ['React', 'TypeScript', 'Cloudflare Workers', 'D1', 'Auth0', 'SwiftUI', 'Google Sheets', 'AI 辅助开发'],
        },
        cta: {
          eyebrow: '你的团队也在用表格和群聊拼接业务吗？',
          title: '把混乱的运营流程，变成一套清晰的产品界面。',
          label: '联系我们打造类似系统',
        },
      },
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
      copy: '粒子重构、异常物质、神经地图和产品记录被组合成第一层实验表面，为未来更深入的交互做准备。',
      ariaLabel: '互动实验室模块',
      modules: [
        { id: 'scanner', title: '粒子扫描器', label: '对象重构', metric: '5.6k 粒子' },
        { id: 'grid', title: '神经网格', label: '潜空间路由图', metric: '42 节点' },
        { id: 'cursor', title: '异常物质', label: '有机数据核心', metric: '实时网格' },
        { id: 'archive', title: '产品档案', label: '互动索引', metric: '7 条记录' },
      ],
      archiveItems: ['OvO', 'AMT', 'SLA', 'VR', 'HCP', 'BNS', 'OPS'],
    },
    timeline: {
      eyebrow: '时间线',
      title: '工作室会像档案一样生长，而不是像演示稿一样结束。',
      items: [
        { year: '2026', title: 'BoniStudio 成立', detail: '一个小型 AI 原生工作室开始公开构建。' },
        { year: '2026', title: '应用与运营平台上线', detail: '移动产品与一套投入日常使用的跨端运营系统离开实验室。' },
        { year: '2026', title: 'AI 原生工作流成型', detail: 'GPT、Claude、Codex 和人的方向感变成同一个生产循环。' },
        { year: '2027', title: 'VR 原型目标', detail: 'Space Station 系统朝可玩的空间原型推进。' },
        { year: '未来', title: '互动世界与 AI 产品', detail: '档案继续扩展为更丰富的产品、游戏和活的界面。' },
      ],
    },
    contact: {
      eyebrow: '联系',
      title: '为产品、游戏、企业系统和 AI 构建的世界保持开放通道。',
      emailLabel: '给 BoniStudio 发邮件',
      githubLabel: 'GitHub',
      socialLabel: '社交',
      socialAriaLabel: '社交链接',
    },
    footer: {
      tagline: '一次打造一个产品，慢慢建造未来。',
      topLink: '回到顶部',
    },
  },
};
