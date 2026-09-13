import { db } from './db.js';

export const TAXONOMY_DATA = [
  {
    category: {
      name: 'Technology',
      slug: 'technology',
      description: 'AI, cloud infrastructure, architectures, and the digital landscape.',
      color: '#E0EDFD',
    },
    subcategories: [
      { name: 'AI', slug: 'ai', description: 'Artificial intelligence paradigms and systems' },
      { name: 'Artificial Intelligence', slug: 'artificial-intelligence', description: 'Theoretical and applied AI' },
      { name: 'AI Agent', slug: 'ai-agent', description: 'Autonomous agents and tool-calling systems' },
      { name: 'LLM', slug: 'llm', description: 'Large language models and prompting architectures' },
      { name: 'ChatGPT', slug: 'chatgpt', description: 'Conversational interfaces and OpenAI systems' },
      { name: 'Cybersecurity', slug: 'cybersecurity', description: 'System resilience and security engineering' },
      { name: 'AWS', slug: 'aws', description: 'Amazon Web Services and cloud patterns' },
      { name: 'Kubernetes', slug: 'kubernetes', description: 'Container orchestration and cluster operations' },
      { name: 'Cloud', slug: 'cloud', description: 'Cloud infrastructure and distributed computing' },
      { name: 'UX Design', slug: 'ux-design', description: 'Human interface design and interaction' },
      { name: 'UX', slug: 'ux', description: 'User experience principles' },
      { name: 'Android', slug: 'android', description: 'Mobile systems and Android platform' },
      { name: 'iOS', slug: 'ios', description: 'Apple iOS ecosystem and engineering' },
      { name: 'Apple', slug: 'apple', description: 'Ecosystem analysis and hardware craft' },
      { name: 'Future', slug: 'future', description: 'Long-range digital trends and forecasts' },
    ],
  },
  {
    category: {
      name: 'Programming',
      slug: 'programming',
      description: 'Languages, distributed systems, backend reliability, and clean code.',
      color: '#DCF5E8',
    },
    subcategories: [
      { name: 'Java', slug: 'java', description: 'JVM architecture and enterprise Java' },
      { name: 'Kafka', slug: 'kafka', description: 'Event streaming, message brokers, and consumers' },
      { name: 'Backend', slug: 'backend', description: 'Server-side engineering and API design' },
      { name: 'Distributed Systems', slug: 'distributed-systems', description: 'Consensus, replication, and fault tolerance' },
      { name: 'Spring Boot', slug: 'spring-boot', description: 'Modern microservices framework' },
      { name: 'Microservices', slug: 'microservices', description: 'Service decomposition and orchestration' },
      { name: 'Python', slug: 'python', description: 'Python language, concurrency, and data workflows' },
      { name: 'JavaScript', slug: 'javascript', description: 'Modern ECMAScript and client/server runtimes' },
      { name: 'TypeScript', slug: 'typescript', description: 'Static typing for JavaScript' },
      { name: 'Software Development', slug: 'software-development', description: 'Practices, architecture, and code craft' },
      { name: 'Software Engineering', slug: 'software-engineering', description: 'Systems engineering and team standards' },
      { name: 'Data Science', slug: 'data-science', description: 'Statistical analysis and computational data' },
      { name: 'Machine Learning', slug: 'machine-learning', description: 'Predictive models and training pipelines' },
      { name: 'DevOps', slug: 'devops', description: 'CI/CD, observability, and release automation' },
      { name: 'Web Development', slug: 'web-development', description: 'Frontend, browsers, and web protocols' },
      { name: 'React', slug: 'react', description: 'Component architectures and declarative UI' },
      { name: 'Go', slug: 'go', description: 'High-concurrency systems and Golang' },
      { name: 'Rust', slug: 'rust', description: 'Memory safety without garbage collection' },
    ],
  },
  {
    category: {
      name: 'Design',
      slug: 'design',
      description: 'Quiet interfaces, typography systems, and intentional visual hierarchy.',
      color: '#E0EDFD',
    },
    subcategories: [
      { name: 'Design', slug: 'design', description: 'Visual communication and aesthetic balance' },
      { name: 'Typography', slug: 'typography', description: 'Type design, hierarchy, and editorial layout' },
      { name: 'Interface Design', slug: 'interface-design', description: 'Digital UI patterns and interaction mechanics' },
      { name: 'Minimalism', slug: 'minimalism', description: 'Subtracting noise to reveal essence' },
      { name: 'Design Systems', slug: 'design-systems', description: 'Tokens, component libraries, and scale' },
      { name: 'Visual Design', slug: 'visual-design', description: 'Composition, color theory, and balance' },
    ],
  },
  {
    category: {
      name: 'Wellness',
      slug: 'wellness',
      description: 'Mindfulness, attention restoration, and navigating cognitive overload.',
      color: '#FCE7F0',
    },
    subcategories: [
      { name: 'Mindfulness', slug: 'mindfulness', description: 'Attention control and mental quietude' },
      { name: 'Psychology', slug: 'psychology', description: 'Cognitive models and behavior' },
      { name: 'Productivity', slug: 'productivity', description: 'Intentional output and distraction reduction' },
      { name: 'Mental Health', slug: 'mental-health', description: 'Sustained cognitive and emotional health' },
      { name: 'Self Improvement', slug: 'self-improvement', description: 'Habits and deliberate practice' },
      { name: 'Spirituality', slug: 'spirituality', description: 'Contemplative inquiry and peace' },
      { name: 'Personal Growth', slug: 'personal-growth', description: 'Evolving perspective and maturity' },
      { name: 'Wellness', slug: 'wellness', description: 'Physical and mental equilibrium' },
      { name: 'Fitness', slug: 'fitness', description: 'Movement, vitality, and health' },
      { name: 'Motivation', slug: 'motivation', description: 'Inner drive and overcoming inertia' },
    ],
  },
  {
    category: {
      name: 'Culture',
      slug: 'culture',
      description: 'Whitespace, reading habits, books, and creative philosophies.',
      color: '#EFE8FD',
    },
    subcategories: [
      { name: 'Culture', slug: 'culture', description: 'Societal currents and artistic movements' },
      { name: 'Science', slug: 'science', description: 'Empirical discovery and natural law' },
      { name: 'Books', slug: 'books', description: 'Literature, long-form reading, and libraries' },
      { name: 'Philosophy', slug: 'philosophy', description: 'Epistemology, ethics, and inquiry' },
      { name: 'Writing', slug: 'writing', description: 'The craft of sentences and prose' },
      { name: 'Creativity', slug: 'creativity', description: 'Generative imagination and ideation' },
      { name: 'Art', slug: 'art', description: 'Visual expression and aesthetic form' },
      { name: 'Music', slug: 'music', description: 'Acoustic space and composition' },
    ],
  },
  {
    category: {
      name: 'Craft',
      slug: 'craft',
      description: 'The discipline of building software and objects worth keeping.',
      color: '#FEF2D6',
    },
    subcategories: [
      { name: 'Software Craft', slug: 'software-craft', description: 'Pride of workmanship in code' },
      { name: 'Writing Craft', slug: 'writing-craft', description: 'Editing, cadence, and concision' },
      { name: 'Attention', slug: 'attention', description: 'Deep work and protected focus' },
      { name: 'Architecture', slug: 'architecture', description: 'Intentional structural design' },
      { name: 'Patience', slug: 'patience', description: 'Long-term thinking and restraint' },
    ],
  },
  {
    category: {
      name: 'Life',
      slug: 'life',
      description: 'Human relationships, lived experiences, and reflections.',
      color: '#FCE5B8',
    },
    subcategories: [
      { name: 'Life', slug: 'life', description: 'Everyday lived reality and reflection' },
      { name: 'Relationships', slug: 'relationships', description: 'Human connection and empathy' },
      { name: 'Love', slug: 'love', description: 'Devotion, intimacy, and care' },
      { name: 'Life Lessons', slug: 'life-lessons', description: 'Wisdom earned through experience' },
      { name: 'Travel', slug: 'travel', description: 'Exploring unfamiliar landscapes' },
      { name: 'Lifestyle', slug: 'lifestyle', description: 'Intentional daily rhythms' },
    ],
  },
  {
    category: {
      name: 'Business',
      slug: 'business',
      description: 'Independent enterprise, sustainable models, and capital.',
      color: '#CCEAF5',
    },
    subcategories: [
      { name: 'Business', slug: 'business', description: 'Commercial enterprise and trade' },
      { name: 'Startup', slug: 'startup', description: 'Early-stage venture creation' },
      { name: 'Leadership', slug: 'leadership', description: 'Guiding teams with clarity and empathy' },
      { name: 'Entrepreneurship', slug: 'entrepreneurship', description: 'Risk, initiative, and building' },
      { name: 'Finance', slug: 'finance', description: 'Capital allocation and economics' },
    ],
  },
];

export async function seedTaxonomy() {
  console.log('Seeding and verifying taxonomy (Categories & Subcategories)...');

  const subcategoryMap = new Map<string, string>(); // name.toLowerCase() -> subcategory.id

  for (const group of TAXONOMY_DATA) {
    // 1. Upsert Category
    const category = await db.category.upsert({
      where: { slug: group.category.slug },
      update: {
        name: group.category.name,
        description: group.category.description,
        color: group.category.color,
      },
      create: {
        name: group.category.name,
        slug: group.category.slug,
        description: group.category.description,
        color: group.category.color,
      },
    });

    // 2. Upsert Subcategories
    for (const sub of group.subcategories) {
      const createdSub = await db.subcategory.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          description: sub.description,
          categoryId: category.id,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          categoryId: category.id,
        },
      });

      subcategoryMap.set(sub.name.toLowerCase(), createdSub.id);
      subcategoryMap.set(sub.slug.toLowerCase(), createdSub.id);
    }
  }

  // 3. Link Subcategories to existing stories
  const linkPostSubcategories = async (postSlug: string, subcategoryNames: string[]) => {
    const post = await db.post.findUnique({ where: { slug: postSlug } });
    if (!post) return;

    for (const name of subcategoryNames) {
      const subId = subcategoryMap.get(name.toLowerCase());
      if (subId) {
        await db.storySubcategory.upsert({
          where: {
            postId_subcategoryId: {
              postId: post.id,
              subcategoryId: subId,
            },
          },
          update: {},
          create: {
            postId: post.id,
            subcategoryId: subId,
          },
        });
      }
    }
  };

  // Associate subcategories for existing stories
  await linkPostSubcategories('building-reliable-kafka-consumers', [
    'Java',
    'Kafka',
    'Distributed Systems',
    'Backend',
    'Microservices',
  ]);

  await linkPostSubcategories('designing-distributed-locks-with-redis-and-postgresql', [
    'Distributed Systems',
    'Backend',
    'Software Architecture',
    'Software Engineering',
  ]);

  await linkPostSubcategories('the-case-for-quiet-interfaces', [
    'Design',
    'Typography',
    'Interface Design',
    'UX Design',
    'Minimalism',
  ]);

  await linkPostSubcategories('the-architecture-of-quiet-interfaces', [
    'Design',
    'Interface Design',
    'Software Craft',
    'Minimalism',
  ]);

  await linkPostSubcategories('youre-not-lazy-bored-or-unmotivated', [
    'Mindfulness',
    'Psychology',
    'Productivity',
    'Mental Health',
  ]);

  await linkPostSubcategories('against-the-homepage-carousel', [
    'Design',
    'UX Design',
    'Interface Design',
  ]);

  await linkPostSubcategories('notes-on-writing-shorter-why-400-words-beat-2000', [
    'Writing',
    'Writing Craft',
    'Attention',
  ]);

  // 4. Ensure prompt example story "The future of AI agents" exists!
  let aiStory = await db.post.findUnique({ where: { slug: 'the-future-of-ai-agents' } });
  if (!aiStory) {
    const techCat = await db.category.findUnique({ where: { slug: 'technology' } });
    const author = (await db.user.findFirst({ where: { role: 'ADMIN' } })) || (await db.user.findFirst());
    if (techCat && author) {
      aiStory = await db.post.create({
        data: {
          title: 'The future of AI agents',
          slug: 'the-future-of-ai-agents',
          excerpt: 'Why useful software may become smaller, quieter, and more personal through autonomous tool-calling agents.',
          content: JSON.stringify([
            {
              id: 'b-ai-1',
              type: 'paragraph',
              content: 'Over the last six months, the paradigm of generative intelligence has shifted away from conversational novelty toward autonomous execution.',
            },
            {
              id: 'b-ai-2',
              type: 'quote',
              content: 'The most profound technologies are those that disappear. They weave themselves into the fabric of everyday life until they are indistinguishable from it.',
              author: 'Mark Weiser',
            },
            {
              id: 'b-ai-3',
              type: 'heading',
              level: 2,
              content: 'From Chat to Tool-Calling Orchestration',
            },
            {
              id: 'b-ai-4',
              type: 'paragraph',
              content: 'Rather than sitting in chat windows pasting prompts back and forth, AI agents operate directly on tools, APIs, and file systems. Through standard protocols like Model Context Protocol (MCP) and retrieval-augmented reasoning, software becomes proactive.',
            },
            {
              id: 'b-ai-5',
              type: 'code',
              language: 'typescript',
              content: `interface AgentAction {
  tool: string;
  parameters: Record<string, unknown>;
  confidence: number;
}

export async function executePlan(plan: AgentAction[]): Promise<void> {
  for (const step of plan) {
    await invokeTool(step.tool, step.parameters);
  }
}`,
            },
          ]),
          coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          readingTime: 3,
          published: true,
          publishedAt: new Date(),
          authorId: author.id,
          categoryId: techCat.id,
        },
      });
    }
  }

  if (aiStory) {
    await linkPostSubcategories('the-future-of-ai-agents', [
      'AI',
      'Artificial Intelligence',
      'AI Agent',
      'LLM',
    ]);
  }

  // 5. Migrate existing users' legacy `user.topics` into relational `UserInterest` records!
  const users = await db.user.findMany({ select: { id: true, topics: true, interests: { select: { subcategoryId: true } } } });
  for (const u of users) {
    if (u.topics && u.topics.length > 0) {
      for (const t of u.topics) {
        const subId = subcategoryMap.get(t.toLowerCase());
        if (subId) {
          await db.userInterest.upsert({
            where: {
              userId_subcategoryId: {
                userId: u.id,
                subcategoryId: subId,
              },
            },
            update: {},
            create: {
              userId: u.id,
              subcategoryId: subId,
            },
          });
        }
      }
    }
  }

  console.log('Taxonomy and recommendation relationships initialized successfully.');
}
