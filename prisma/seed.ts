import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding The Margin database...");

  // Clean existing data
  await prisma.storyComment.deleteMany();
  await prisma.storyClap.deleteMany();
  await prisma.storyRepost.deleteMany();
  await prisma.savedStory.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();

  // 1. Create Default Settings
  await prisma.settings.create({
    data: {
      id: "default",
      siteName: "The Margin",
      siteDescription: "An independent journal about reading, craft, and quiet software.",
      heroTitle: "Slow reading for a fast internet.",
      heroSubtitle:
        "Essays on typography, attention and the craft of making things worth finishing.",
      authorName: "Devansh Rao",
      authorBio:
        "Writer and engineer observing software craft, interface tranquility, and distributed systems.",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      githubUrl: "https://github.com",
      twitterUrl: "https://twitter.com",
      linkedinUrl: "https://linkedin.com",
    },
  });

  // 2. Create Authors & Users
  const passwordHash = await bcrypt.hash("admin123", 10);
  const authorDevansh = await prisma.user.create({
    data: {
      email: "devansh@themargin.io",
      name: "Devansh Rao",
      passwordHash,
      role: "ADMIN",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      bio: "Editor-at-large at The Margin. Writing on typography, interface quietude, and slow craft.",
      topics: ["Design", "UX Design", "Software Engineering", "Productivity", "Writing"],
    },
  });

  const authorMira = await prisma.user.create({
    data: {
      email: "mira@themargin.io",
      name: "Mira Solberg",
      passwordHash,
      role: "AUTHOR",
      avatarUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      bio: "Essayist exploring editorial design, books, and cultural whitespace.",
      topics: ["Culture", "Philosophy", "Writing", "Books", "Art"],
    },
  });

  const authorChetan = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Chetan Yadav",
      passwordHash,
      role: "ADMIN",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Senior Software Engineer writing on distributed systems, Kafka, Spring Boot, and mindful productivity.",
      topics: ["Programming", "Software Development", "Java", "DevOps", "AI"],
    },
  });

  // 3. Create Categories matching the design
  const categoriesData = [
    {
      name: "Design",
      slug: "design",
      description: "Quiet interfaces, typography systems, and intentional visual hierarchy.",
      color: "#E0EDFD",
    },
    {
      name: "Culture",
      slug: "culture",
      description: "Whitespace, reading habits, books, and creative philosophies.",
      color: "#EFE8FD",
    },
    {
      name: "Craft",
      slug: "craft",
      description: "The discipline of building software and objects worth keeping.",
      color: "#FEF2D6",
    },
    {
      name: "Technology",
      slug: "technology",
      description: "AI, cloud infrastructure, architectures, and the digital landscape.",
      color: "#E0EDFD",
    },
    {
      name: "Programming",
      slug: "programming",
      description: "Languages, distributed systems, backend reliability, and clean code.",
      color: "#DCF5E8",
    },
    {
      name: "Wellness",
      slug: "wellness",
      description: "Mindfulness, attention restoration, and navigating cognitive overload.",
      color: "#FCE7F0",
    },
  ];

  const categoriesMap: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoriesMap[cat.slug] = created;
  }

  // 4. Create Tags matching the Onboarding taxonomy
  const tagsList = [
    "Design",
    "UX",
    "UX Design",
    "Technology",
    "Programming",
    "Software Development",
    "Software Engineering",
    "Java",
    "Python",
    "DevOps",
    "Web Development",
    "Culture",
    "Writing",
    "Philosophy",
    "Books",
    "Psychology",
    "Productivity",
    "Mental Health",
    "Self Improvement",
    "Mindfulness",
    "AI",
    "Data Science",
    "Kafka",
    "System Design",
  ];

  const tagsMap: Record<string, any> = {};
  for (const t of tagsList) {
    const slug = t.toLowerCase().replace(/\s+/g, "-");
    const created = await prisma.tag.create({
      data: { name: t, slug },
    });
    tagsMap[t] = created;
  }

  // 5. Create Stories matching Screenshot 3 & 5
  const posts = [
    {
      title: "The case for quiet interfaces",
      slug: "the-case-for-quiet-interfaces",
      excerpt: "Every notification is a small negotiation. Most of them we lose.",
      coverImage:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
      readingTime: 1,
      featured: true,
      published: true,
      views: 14200,
      likes: 1240,
      claps: 10100,
      reposts: 91,
      authorId: authorDevansh.id,
      categoryId: categoriesMap["design"].id,
      tagNames: ["Design", "UX Design", "Technology", "Software Engineering"],
      content: `Every notification is a small negotiation. Most of them we lose.

Software used to be a tool that stayed in the drawer until you reached for it. It had no opinions about when you used it, no red dots to demand your glance, and no algorithmic incentives to prolong your visit.

### The Auditory & Visual Tax

Over the last decade, product design quietly pivoted from solving problems to extracting minutes. We wrapped interfaces in high-frequency feedback loops:
- Pulsing badges
- Unprompted banners
- Artificial urgency counts

When an interface refuses to be quiet, the cognitive cost is passed entirely to the reader.

> "A quiet interface does not announce its cleverness. It respects your attention as an unrenewable resource."

### The Principles of Calm Software

1. **Passive until invoked**: An application should remain inert until the human decides to act.
2. **No phantom urgency**: Never manufacture false scarcity or synthetic notifications.
3. **Respecting the margin**: Generous negative space is not wasted real estate; it is room for the mind to breathe.
`,
    },
    {
      title: "Against the homepage carousel",
      slug: "against-the-homepage-carousel",
      excerpt: "If everything is featured, nothing is.",
      coverImage: null, // text-led story matching Screenshot 3!
      readingTime: 1,
      featured: false,
      published: true,
      views: 6800,
      likes: 540,
      claps: 4200,
      reposts: 38,
      authorId: authorDevansh.id,
      categoryId: categoriesMap["design"].id,
      tagNames: ["Design", "UX Design", "Web Development", "Culture"],
      content: `If everything is featured, nothing is.

The automated carousel is the quintessential artifact of committee design. When marketing, editorial, and product cannot agree on what truly matters, they stack five slides into a revolving banner and call it a compromise.

Users rarely interact beyond the first slide. By sliding content under the user's feet without their consent, we induce cognitive disorientation.

### The Antidote: Editorial Conviction

Choose one thing. Present it with confidence. If an essay or story is truly exceptional, give it the entire stage. If it is not, let it sit quietly in the archive.
`,
    },
    {
      title: "An interview with the margin",
      slug: "an-interview-with-the-margin",
      excerpt: "White space, asked to explain itself, declines to comment.",
      coverImage:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80",
      readingTime: 1,
      featured: true,
      published: true,
      views: 11200,
      likes: 980,
      claps: 8300,
      reposts: 76,
      authorId: authorMira.id,
      categoryId: categoriesMap["culture"].id,
      tagNames: ["Culture", "Writing", "Philosophy", "Books"],
      content: `White space, asked to explain itself, declines to comment.

In bookbinding, the margin is not the leftover paper after the text is printed; it is the physical frame that allows human hands to hold the volume without covering a single word.

Without the margin, the text is unapproachable.

### The Sacred Border

When we read on screens today, the text presses tightly against the glass edges. Sidebars buzz with animated advertisements, sticky headers jump with every scroll, and floating chat bubbles obscure paragraphs.

To read well, one must first be able to breathe. The Margin exists to revive the luxury of slow, uninterrupted reflection.
`,
    },
    {
      title: "Building Reliable Kafka Consumers in Production",
      slug: "building-reliable-kafka-consumers",
      excerpt:
        "Designing Kafka consumers that remain reliable under high load, handling poison pills, retry topics, and dead-letter queues gracefully.",
      coverImage:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
      readingTime: 8,
      featured: true,
      published: true,
      views: 9400,
      likes: 810,
      claps: 6500,
      reposts: 54,
      authorId: authorChetan.id,
      categoryId: categoriesMap["programming"].id,
      tagNames: [
        "Programming",
        "Software Engineering",
        "Java",
        "DevOps",
        "Technology",
      ],
      content: `### Resilient Event Consumption

Kafka is the bedrock of modern event-driven backbones. While publishing messages is typically straightforward, building consumers that survive unexpected traffic spikes, poison pills, and downstream outages requires disciplined engineering.

\`\`\`java
@Service
public class OrderEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventConsumer.class);
    private final OrderProcessingService orderProcessingService;

    public OrderEventConsumer(OrderProcessingService orderProcessingService) {
        this.orderProcessingService = orderProcessingService;
    }

    @KafkaListener(
        topics = "orders.v1",
        groupId = "order-fulfillment-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleOrderEvent(@Payload OrderCreatedEvent event) {
        orderProcessingService.process(event);
    }
}
\`\`\`

### Dead Letter Topics (DLT) & Non-Blocking Retries

Instead of blocking the partition upon encountering an unhandled payload, forward failures through dedicated retry topics with exponential backoff:

\`\`\`sql
-- Atomic idempotent consumer tracking
INSERT INTO processed_events (event_id, event_type, processed_at)
VALUES ('evt_98432a', 'ORDER_CREATED', NOW())
ON CONFLICT (event_id) DO NOTHING;
\`\`\`
`,
    },
    {
      title: "Designing Distributed Locks with Redis and PostgreSQL",
      slug: "designing-distributed-locks-with-redis-and-postgresql",
      excerpt:
        "A deep comparison of Redlock vs PostgreSQL Advisory Locks, clock drift implications, and choosing the right locking strategy.",
      coverImage:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
      readingTime: 7,
      featured: false,
      published: true,
      views: 7300,
      likes: 620,
      claps: 5100,
      reposts: 42,
      authorId: authorChetan.id,
      categoryId: categoriesMap["programming"].id,
      tagNames: [
        "Programming",
        "Software Development",
        "Data Science",
        "System Design",
      ],
      content: `When scaling across distributed nodes, JVM locks are insufficient. 

### PostgreSQL Advisory Locks

If your primary data store is PostgreSQL, advisory locks offer transactional atomicity without introducing extra cluster dependencies:

\`\`\`sql
-- Try acquire advisory lock without blocking
SELECT pg_try_advisory_xact_lock(42);
\`\`\`

Fast, clean, and automatically released upon transaction completion.
`,
    },
    {
      title: "You're not Lazy, Bored or unmotivated.",
      slug: "youre-not-lazy-bored-or-unmotivated",
      excerpt:
        "Why cognitive overload and unclear next physical actions mask themselves as procrastination, and the subtle shift that restores momentum.",
      coverImage:
        "https://images.unsplash.com/photo-1507842229451-7f01be8860bc?w=1200&auto=format&fit=crop&q=80",
      readingTime: 5,
      featured: false,
      published: true,
      views: 12500,
      likes: 1100,
      claps: 9200,
      reposts: 85,
      authorId: authorDevansh.id,
      categoryId: categoriesMap["wellness"].id,
      tagNames: [
        "Psychology",
        "Productivity",
        "Mental Health",
        "Self Improvement",
        "Mindfulness",
      ],
      content: `Procrastination is rarely an issue of laziness. It is almost always **cognitive ambiguity**.

When a task on your list is labeled "Work on system refactor", your brain perceives a foggy cloud of 50 undefined subtasks. 

Reduce the task down to the first physical motion:
- \`Open src/main.rs and add one unit test.\`

Inertia dissolves, and focus returns.
`,
    },
  ];

  for (const p of posts) {
    const { tagNames, ...postData } = p;
    const post = await prisma.post.create({
      data: postData,
    });

    for (const tagName of tagNames) {
      if (tagsMap[tagName]) {
        await prisma.postTag.create({
          data: {
            postId: post.id,
            tagId: tagsMap[tagName].id,
          },
        });
      }
    }

    // Seed sample comments
    await prisma.storyComment.create({
      data: {
        postId: post.id,
        userId: authorDevansh.id,
        authorName: "Devansh Rao",
        authorAvatar: authorDevansh.avatarUrl,
        content: "Delighted to share this with our readers at The Margin.",
      },
    });

    // Seed a saved story for authorChetan so Library has Saved (1)
    if (post.slug === "the-case-for-quiet-interfaces") {
      await prisma.savedStory.create({
        data: {
          userId: authorChetan.id,
          postId: post.id,
        },
      });
    }
  }

  console.log("Database seeded successfully with The Margin content!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
