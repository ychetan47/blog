import { db } from './db.js';

// Curated pool of beautiful Unsplash photos by category theme
const UNSPLASH_IMAGES: Record<string, string[]> = {
  Technology: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
  ],
  Programming: [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
  ],
  Design: [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509343255572-56044404773a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
  ],
  Wellness: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&auto=format&fit=crop&q=80',
  ],
  Culture: [
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532012164546-f432f2e37274?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508780709619-79562169bc64?w=1200&auto=format&fit=crop&q=80',
  ],
  Craft: [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=1200&auto=format&fit=crop&q=80',
  ],
  Business: [
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
  ],
  Life: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
  ],
};

interface StoryBlueprint {
  title: string;
  excerpt: string;
  relatedSubcategories: string[];
  tags: string[];
  quote?: string;
  quoteAuthor?: string;
  deepDiveParagraph: string;
  readingTime: number;
}

const SUBCATEGORY_STORIES: Record<string, StoryBlueprint[]> = {
  // BUSINESS
  'entrepreneurship': [
    {
      title: 'Bootstrapping Against the Tide',
      excerpt: 'Why building a profitable, self-sustaining software business is the ultimate act of creative freedom.',
      relatedSubcategories: ['Startup', 'Business', 'Finance'],
      tags: ['Bootstrapping', 'SaaS', 'Independence'],
      quote: 'Profitability is not a milestone; it is the oxygen of sovereignty.',
      quoteAuthor: 'Jason Fried',
      deepDiveParagraph: 'When you take outside capital, you sell a portion of your velocity and focus. Bootstrappers trade speed for longevity, crafting software that solves acute customer pain from day one.',
      readingTime: 4,
    },
    {
      title: 'The Solopreneur Stack for 2026',
      excerpt: 'How one-person software companies generate seven figures with modern automation and focused niche value.',
      relatedSubcategories: ['Startup', 'Productivity', 'Software Development'],
      tags: ['Solopreneur', 'Automation', 'Niche'],
      deepDiveParagraph: 'By delegating infrastructure, payments, and deployment to managed primitives, individual builders can outmaneuver bureaucratic corporate teams through raw agility and taste.',
      readingTime: 3,
    },
    {
      title: 'Customer Conversations as a Competitive Moat',
      excerpt: 'Why the founders who personally answer support tickets build products that people refuse to leave.',
      relatedSubcategories: ['Business', 'Leadership'],
      tags: ['CustomerFeedback', 'Support', 'ProductDesign'],
      deepDiveParagraph: 'The feedback loop between a paying customer struggling with a boundary condition and the engineer who can patch it in twenty minutes is an unassailable competitive advantage.',
      readingTime: 4,
    },
    {
      title: 'The Art of Lean Profitability',
      excerpt: 'Operating with zero bloat and high gross margins in an era of shifting market conditions.',
      relatedSubcategories: ['Finance', 'Business'],
      tags: ['Margins', 'UnitEconomics', 'Efficiency'],
      deepDiveParagraph: 'Efficiency is not about pinching pennies; it is about eliminating organizational friction so that every dollar expended directly moves the product forward.',
      readingTime: 3,
    },
    {
      title: 'Zero to One in Niche Markets',
      excerpt: 'How identifying hyper-specific industry workflows creates defensible, durable software monopolies.',
      relatedSubcategories: ['Startup', 'Business'],
      tags: ['VerticalSaaS', 'Monopolies', 'Strategy'],
      deepDiveParagraph: 'A product that serves dentists or boutique coffee roasters exceptionally well is infinitely more defensible than another generic task manager competing for casual consumers.',
      readingTime: 5,
    },
    {
      title: 'Pricing Power and the Premium Position',
      excerpt: 'Why charging three times more than competitors attracts better customers and funds superior craft.',
      relatedSubcategories: ['Business', 'Finance'],
      tags: ['Pricing', 'Positioning', 'Value'],
      deepDiveParagraph: 'Low prices attract customers who consume the most support and churn the fastest. Premium pricing signals craftsmanship, reliability, and commitment to the long haul.',
      readingTime: 4,
    },
  ],

  'finance': [
    {
      title: 'Capital Allocation in High-Interest Eras',
      excerpt: 'Re-evaluating runway, debt, and the true cost of speculative engineering initiatives.',
      relatedSubcategories: ['Business', 'Entrepreneurship', 'Startup'],
      tags: ['Capital', 'Runway', 'Economics'],
      deepDiveParagraph: 'When capital was essentially free, companies could afford to subsidize wasteful growth. Today, every project must demonstrate clear unit economics and tangible customer return.',
      readingTime: 5,
    },
    {
      title: 'The Economics of SaaS Gross Margins',
      excerpt: 'Balancing inference costs, cloud hosting bills, and subscription pricing for durable software.',
      relatedSubcategories: ['Cloud', 'Business', 'Backend'],
      tags: ['SaaS', 'CloudCost', 'FinOps'],
      deepDiveParagraph: 'As generative AI inference layers become embedded into standard workflows, monitoring token and GPU expenditure is as vital as tracking server bandwidth.',
      readingTime: 4,
    },
    {
      title: 'Demystifying Runway for Early-Stage Teams',
      excerpt: 'A pragmatic framework for managing cash reserves without paralyzing product velocity.',
      relatedSubcategories: ['Startup', 'Entrepreneurship'],
      tags: ['CashFlow', 'Startups', 'BurnRate'],
      deepDiveParagraph: 'Runway is not a static number of months; it is a dynamic function of burn rate, receivables, and optionality. Knowing your exact break-even threshold brings serenity.',
      readingTime: 3,
    },
    {
      title: 'Cash Flow vs. Vanity Valuation',
      excerpt: 'Why paper valuations evaporate while monthly recurring revenue compounds silently in bank accounts.',
      relatedSubcategories: ['Business', 'Leadership'],
      tags: ['Valuation', 'MRR', 'Revenue'],
      deepDiveParagraph: 'The past decade celebrated unicorn paper valuations that ultimately collapsed under liquidation preferences. True wealth in software is predictable free cash flow.',
      readingTime: 4,
    },
    {
      title: 'Personal Finance for Knowledge Workers',
      excerpt: 'Decoupling time from income through diversified assets and intellectual property ownership.',
      relatedSubcategories: ['Lifestyle', 'Life Lessons'],
      tags: ['Wealth', 'Investing', 'Independence'],
      deepDiveParagraph: 'Selling hours for wages creates a hard ceiling on freedom. Building digital assets and investing in long-term index funds provides durable autonomy.',
      readingTime: 5,
    },
    {
      title: 'The Return of Dividend-Driven Software',
      excerpt: 'Why private software holding companies are choosing annual distributions over uncertain IPOs.',
      relatedSubcategories: ['Business', 'Entrepreneurship'],
      tags: ['HoldCo', 'Dividends', 'Exits'],
      deepDiveParagraph: 'Distributing quarterly profits to partners transforms software from a lottery ticket into a generational wealth engine that respects sustainable pacing.',
      readingTime: 4,
    },
  ],

  'startup': [
    {
      title: 'Building in Public Without Burning Out',
      excerpt: 'Navigating vulnerability, community engagement, and genuine progress in modern startup journeys.',
      relatedSubcategories: ['Entrepreneurship', 'Writing', 'Productivity'],
      tags: ['BuildInPublic', 'Transparency', 'Social'],
      deepDiveParagraph: 'Sharing your authentic milestones, failures, and architectural choices fosters deep community trust, but requires strict boundaries to protect private focus.',
      readingTime: 4,
    },
    {
      title: 'Finding True Product-Market Resonance',
      excerpt: 'The unmistakable sensation when users pull features out of your hands faster than you can ship.',
      relatedSubcategories: ['Business', 'UX Design', 'Entrepreneurship'],
      tags: ['PMF', 'Growth', 'Traction'],
      deepDiveParagraph: 'True product-market fit does not require aggressive ad spend. It is characterized by organic word-of-mouth recommendations and users complaining when the site goes down for ten seconds.',
      readingTime: 5,
    },
    {
      title: 'The Anatomy of a Quiet Launch',
      excerpt: 'Why launching to thirty dedicated beta testers beats a noisy Product Hunt campaign every time.',
      relatedSubcategories: ['Productivity', 'Design', 'Minimalism'],
      tags: ['Launch', 'Marketing', 'Product'],
      deepDiveParagraph: 'A noisy launch brings tire-kickers who leave confused reviews. A quiet launch to thirty domain experts lets you refine the core ergonomics until the software feels inevitable.',
      readingTime: 3,
    },
    {
      title: 'When to Pivot and When to Persevere',
      excerpt: 'Dissecting market signals from personal impatience when iterating on early prototypes.',
      relatedSubcategories: ['Leadership', 'Psychology'],
      tags: ['Pivot', 'Strategy', 'Discipline'],
      deepDiveParagraph: 'Pivoting too early prevents deep compounding; persisting too late burns precious runway. Look at cohort retention curves rather than vanity signup numbers.',
      readingTime: 4,
    },
    {
      title: 'Hiring Your First Five Generalists',
      excerpt: 'Why early startups need Swiss Army knives who write code, talk to users, and design interfaces.',
      relatedSubcategories: ['Software Engineering', 'Leadership'],
      tags: ['Hiring', 'Culture', 'Teams'],
      deepDiveParagraph: 'Specialists excel at optimizing known systems; generalists thrive in ambiguity where the entire problem space changes every two weeks.',
      readingTime: 4,
    },
    {
      title: 'Customer-Driven Roadmaps That Don’t Flail',
      excerpt: 'Synthesizing feature requests into coherent architectural primitives rather than fragmented band-aids.',
      relatedSubcategories: ['Software Craft', 'Architecture'],
      tags: ['Roadmap', 'ProductManagement', 'Architecture'],
      deepDiveParagraph: 'Never build the exact button the customer asked for; understand the friction they encountered and build the underlying primitive that makes twenty similar requests trivial.',
      readingTime: 5,
    },
  ],

  'leadership': [
    {
      title: 'Quiet Leadership in High-Noise Environments',
      excerpt: 'Leading through clear written documentation, calm composure, and ruthless prioritization.',
      relatedSubcategories: ['Leadership', 'Software Engineering', 'Attention'],
      tags: ['Management', 'Calm', 'Culture'],
      deepDiveParagraph: 'The best engineering leaders do not dominate meetings with charisma. They create an environment where decisions are documented asynchronously and deep work is fiercely protected.',
      readingTime: 4,
    },
    {
      title: 'The Mechanics of Asynchronous Management',
      excerpt: 'How leading distributed engineering organizations without status meetings accelerates real output.',
      relatedSubcategories: ['Productivity', 'Software Development'],
      tags: ['Async', 'RemoteWork', 'Management'],
      deepDiveParagraph: 'Replacing the daily standup with written end-of-day summaries eliminates cognitive interruptions and produces an audit trail of decisions for the entire team.',
      readingTime: 4,
    },
    {
      title: 'Holding High Standards Without Toxic Urgency',
      excerpt: 'Cultivating pride of workmanship while maintaining humane pacing and sustainable engineering health.',
      relatedSubcategories: ['Software Craft', 'Mental Health', 'Culture'],
      tags: ['Standards', 'Excellence', 'Burnout'],
      deepDiveParagraph: 'Excellence is not achieved by working eighty-hour weeks; it is achieved by refusing to ship shoddy code, unclear prose, or broken interface states.',
      readingTime: 5,
    },
    {
      title: 'Decision Architecture for Small Teams',
      excerpt: 'Two-way door decisions, disagree-and-commit, and avoiding paralysis in product direction.',
      relatedSubcategories: ['Business', 'Philosophy'],
      tags: ['DecisionMaking', 'Strategy', 'Speed'],
      deepDiveParagraph: 'Classify choices into irreversible one-way doors that warrant deliberation, and reversible two-way doors that should be executed before lunch.',
      readingTime: 3,
    },
    {
      title: 'Leading by Writing: The Memo Culture',
      excerpt: 'Why six-page narrative memos outperform sixty-slide bulleted decks in strategic alignment.',
      relatedSubcategories: ['Writing', 'Writing Craft'],
      tags: ['Memos', 'Writing', 'Alignment'],
      deepDiveParagraph: 'PowerPoint slides conceal fuzzy thinking behind bullet points and animations. Full sentence paragraphs force the author to confront logical contradictions directly.',
      readingTime: 4,
    },
    {
      title: 'Cultivating Psychological Safety for Engineers',
      excerpt: 'Creating a culture where admitting mistakes and asking questions is recognized as operational strength.',
      relatedSubcategories: ['Psychology', 'Culture'],
      tags: ['Safety', 'Culture', 'Teams'],
      deepDiveParagraph: 'When engineers fear blame, they conceal latent bugs until they explode in catastrophic production downtime. Blameless retrospectives surface root causes rapidly.',
      readingTime: 4,
    },
  ],

  'business': [
    {
      title: 'The Durable Advantage of Operational Simplicity',
      excerpt: 'Why subtracting organizational layers and vendor dependencies compounds into enduring agility.',
      relatedSubcategories: ['Leadership', 'Minimalism'],
      tags: ['Simplicity', 'Operations', 'Strategy'],
      deepDiveParagraph: 'Every SaaS tool added to your internal stack requires authentication, compliance, and mental context. The leanest enterprises operate on a handful of master documents.',
      readingTime: 4,
    },
    {
      title: 'Moats in the Era of Infinite Software',
      excerpt: 'When code can be written by LLMs in seconds, distribution, trust, and taste become the only true defenses.',
      relatedSubcategories: ['AI', 'Future', 'Entrepreneurship'],
      tags: ['Moats', 'AI', 'Strategy'],
      deepDiveParagraph: 'Commoditizing software creation shifts the value capture to proprietary domain datasets, verified human reputation, and deeply entrenched workflow integrations.',
      readingTime: 5,
    },
    {
      title: 'Subscription Fatigue and the Return of Lifetime Value',
      excerpt: 'Why consumers and businesses are rebelling against monthly recurring billing for simple tools.',
      relatedSubcategories: ['Finance', 'UX Design'],
      tags: ['Pricing', 'Subscriptions', 'ConsumerBehavior'],
      deepDiveParagraph: 'Customers are exhausted by paying monthly rent for software that hasn’t changed in three years. Pay-once lifetime licenses are experiencing a massive renaissance.',
      readingTime: 3,
    },
    {
      title: 'The Death of Committee Decision Making',
      excerpt: 'How single-threaded owners produce cohesive products while consensus committees produce beige compromise.',
      relatedSubcategories: ['Design', 'Leadership'],
      tags: ['Ownership', 'Design', 'Product'],
      deepDiveParagraph: 'A product designed by committee satisfies everyone’s checklist while enchanting nobody. A single visionary author with taste creates things that evoke emotional attachment.',
      readingTime: 4,
    },
    {
      title: 'Business as a Creative Medium',
      excerpt: 'Treating balance sheets, contracts, and company culture with the same craft as oil painting or literature.',
      relatedSubcategories: ['Philosophy', 'Craft'],
      tags: ['Philosophy', 'Culture', 'Craft'],
      deepDiveParagraph: 'A company does not exist merely to generate EBITDA; it is a canvas for how human beings collaborate, solve problems, and express shared ideals.',
      readingTime: 4,
    },
    {
      title: 'Building Long-Term Relationship Networks',
      excerpt: 'Why genuine generosity and high integrity compound over decades into boundless serendipity.',
      relatedSubcategories: ['Relationships', 'Life Lessons'],
      tags: ['Networking', 'Reputation', 'Trust'],
      deepDiveParagraph: 'Transactional networking leaves a sour taste. Offering unsolicited help to talented colleagues without expecting reciprocation builds a reservoir of goodwill that lasts a lifetime.',
      readingTime: 3,
    },
  ],
};

function getFallbackBlueprintsForSubcategory(
  subName: string,
  categoryName: string,
  allSubNames: string[]
): StoryBlueprint[] {
  const related = allSubNames.filter((s) => s.toLowerCase() !== subName.toLowerCase()).slice(0, 3);

  return [
    {
      title: `The Fundamentals of ${subName}`,
      excerpt: `Examining core principles, historical context, and enduring best practices in modern ${subName}.`,
      relatedSubcategories: related.slice(0, 2),
      tags: [subName.replace(/\s+/g, ''), 'Fundamentals', 'Overview'],
      deepDiveParagraph: `Understanding ${subName} requires looking past transient industry buzzwords and grasping the underlying invariants that govern its execution and impact.`,
      readingTime: 3,
    },
    {
      title: `Rethinking ${subName} in Production`,
      excerpt: `Lessons learned from deploying, measuring, and refining ${subName} systems under real-world pressure.`,
      relatedSubcategories: related.slice(1, 3),
      tags: [subName.replace(/\s+/g, ''), 'Production', 'Engineering'],
      deepDiveParagraph: `Theory is neat; production is messy. When scaling ${subName}, boundary conditions and edge cases reveal whether your foundational assumptions hold true.`,
      readingTime: 4,
    },
    {
      title: `The Subtle Architecture of ${subName}`,
      excerpt: `A deep dive into patterns, trade-offs, and design decisions that separate adequate work from mastery.`,
      relatedSubcategories: [related[0] || 'Software Craft'],
      tags: [subName.replace(/\s+/g, ''), 'Architecture', 'Craft'],
      deepDiveParagraph: `Mastery in ${subName} is characterized by restraint. Knowing what to omit is consistently more important than knowing what to add.`,
      readingTime: 5,
    },
    {
      title: `Common Pitfalls in ${subName} and How to Avoid Them`,
      excerpt: `An analytical review of widespread misconceptions and premature optimizations in ${subName}.`,
      relatedSubcategories: related.slice(0, 2),
      tags: [subName.replace(/\s+/g, ''), 'BestPractices', 'Pitfalls'],
      deepDiveParagraph: `Most failures in ${subName} are not caused by complex anomalies, but by simple oversights in foundational hygiene, monitoring, and communication.`,
      readingTime: 4,
    },
    {
      title: `The Future of ${subName}: Emerging Horizons`,
      excerpt: `Projecting long-range trends, architectural shifts, and technological catalysts reshaping ${subName}.`,
      relatedSubcategories: ['Future', related[0] || 'Technology'],
      tags: [subName.replace(/\s+/g, ''), 'Future', 'Trends'],
      deepDiveParagraph: `As adjacent computational primitives evolve, ${subName} will integrate deeper with autonomous orchestration and responsive systems.`,
      readingTime: 4,
    },
    {
      title: `A Minimalist Perspective on ${subName}`,
      excerpt: `Stripping away unnecessary layers to discover the calm, durable essence of ${subName}.`,
      relatedSubcategories: ['Minimalism', related[0] || 'Craft'],
      tags: [subName.replace(/\s+/g, ''), 'Minimalism', 'Simplicity'],
      deepDiveParagraph: `True elegance in ${subName} manifests when every element has an unmistakable reason to exist, leaving generous margin for contemplation.`,
      readingTime: 3,
    },
  ];
}

export async function seedAllSubcategoriesPosts(): Promise<void> {
  console.log('--- Seeding Posts for Every Subcategory (Target: 5–7 posts each) ---');

  // 1. Gather all subcategories with category details
  const subcategories = await db.subcategory.findMany({
    include: {
      category: true,
      storySubcategories: true,
    },
    orderBy: { name: 'asc' },
  });

  // 2. Gather authors
  const authors = await db.user.findMany({
    where: { role: { in: ['ADMIN', 'AUTHOR', 'READER'] } },
  });

  if (authors.length === 0) {
    throw new Error('No authors available in database.');
  }

  const allSubNames = subcategories.map((s) => s.name);
  const subcategoryMap = new Map(subcategories.map((s) => [s.name.toLowerCase(), s]));

  let totalPostsCreated = 0;
  let counter = 0;

  for (const sub of subcategories) {
    const currentCount = sub.storySubcategories.length;
    const needed = Math.max(0, 5 - currentCount);

    if (needed === 0) {
      console.log(`✓ ${sub.name} already has ${currentCount} posts`);
      continue;
    }

    console.log(`→ Subcategory [${sub.name}] currently has ${currentCount} posts. Creating ${needed} posts...`);

    const blueprints =
      SUBCATEGORY_STORIES[sub.slug] ||
      SUBCATEGORY_STORIES[sub.name.toLowerCase()] ||
      getFallbackBlueprintsForSubcategory(sub.name, sub.category.name, allSubNames);

    const catImages = UNSPLASH_IMAGES[sub.category.name] || UNSPLASH_IMAGES['Technology'];

    for (let i = 0; i < needed; i++) {
      counter++;
      const bp = blueprints[i % blueprints.length];
      const author = authors[(counter + i) % authors.length];
      const coverImage = catImages[(counter + i) % catImages.length];

      const slugBase = bp.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const uniqueSlug = `${slugBase}-${Date.now().toString(36).slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`;

      // Construct structured JSON blocks
      const blocks = [
        {
          id: `b-${counter}-1`,
          type: 'paragraph',
          content: `${bp.excerpt} In modern engineering and craft, our relationship with tools fundamentally shapes the solutions we produce.`,
        },
        ...(bp.quote
          ? [
              {
                id: `b-${counter}-2`,
                type: 'quote',
                content: bp.quote,
                author: bp.quoteAuthor || 'The Margin Journal',
              },
            ]
          : [
              {
                id: `b-${counter}-2`,
                type: 'heading',
                level: 2,
                content: `Rethinking the Core Constraints of ${sub.name}`,
              },
            ]),
        {
          id: `b-${counter}-3`,
          type: 'paragraph',
          content: bp.deepDiveParagraph,
        },
        {
          id: `b-${counter}-4`,
          type: 'paragraph',
          content: `By stripping away extraneous noise and focusing on enduring principles, teams can achieve remarkable clarity and sustained momentum.`,
        },
      ];

      // Publish date distributed across the past 45 days
      const daysAgo = Math.floor(Math.random() * 45);
      const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      // Create Post
      const post = await db.post.create({
        data: {
          title: bp.title,
          slug: uniqueSlug,
          excerpt: bp.excerpt,
          content: JSON.stringify(blocks),
          coverImage,
          illustration: 'editorial-notebook',
          readingTime: bp.readingTime || 3,
          featured: i === 0 && Math.random() > 0.6,
          published: true,
          publishedAt,
          authorId: author.id,
          categoryId: sub.categoryId,
          claps: Math.floor(Math.random() * 1800 + 120),
          views: Math.floor(Math.random() * 4200 + 350),
          likes: Math.floor(Math.random() * 240 + 20),
          reposts: Math.floor(Math.random() * 30 + 5),
        },
      });

      // Collect subcategory IDs to link (Primary target + 1-2 related)
      const targetSubIds = new Set<string>();
      targetSubIds.add(sub.id);

      for (const relName of bp.relatedSubcategories) {
        const found = subcategoryMap.get(relName.toLowerCase());
        if (found && found.id !== sub.id) {
          targetSubIds.add(found.id);
        }
      }

      // Link StorySubcategory
      for (const subId of targetSubIds) {
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

      // Link Tags
      for (const tagText of bp.tags) {
        const cleanTag = tagText.trim();
        if (!cleanTag) continue;
        const tagSlug = cleanTag.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const tag = await db.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: cleanTag, slug: tagSlug },
        });

        await db.postTag.upsert({
          where: { postId_tagId: { postId: post.id, tagId: tag.id } },
          update: {},
          create: { postId: post.id, tagId: tag.id },
        });
      }

      totalPostsCreated++;
    }
  }

  // 3. Final Verification Pass: Count posts for each subcategory
  const finalCheck = await db.subcategory.findMany({
    include: {
      category: { select: { name: true } },
      _count: { select: { storySubcategories: true } },
    },
    orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
  });

  console.log(`\n======================================================`);
  console.log(`Seeding Complete! Total new posts created: ${totalPostsCreated}`);
  console.log(`======================================================`);

  let allMet = true;
  for (const s of finalCheck) {
    const count = s._count.storySubcategories;
    const status = count >= 5 ? '✓ PASS' : '✗ FAIL';
    if (count < 5) allMet = false;
    console.log(`[${status}] ${s.category.name} > ${s.name}: ${count} posts`);
  }

  console.log(`\nAll 73 subcategories have >= 5 posts: ${allMet ? 'YES!' : 'NO'}`);
}

// Execute directly if run from CLI
if (process.argv[1]?.endsWith('seedAllSubcategoriesPosts.ts') || process.argv[1]?.endsWith('seedAllSubcategoriesPosts.js')) {
  seedAllSubcategoriesPosts()
    .then(() => {
      console.log('Database seeding finished cleanly.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
