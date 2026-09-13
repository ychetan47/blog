import { Link } from 'react-router-dom';

interface RelatedStory {
  id: string;
  title: string;
  slug: string;
  readingTime: number;
}

interface KeepReadingProps {
  stories: RelatedStory[];
  className?: string;
}

export function KeepReading({ stories, className = '' }: KeepReadingProps) {
  if (!stories || stories.length === 0) return null;

  return (
    <section className={`pt-12 sm:pt-16 ${className}`} aria-label="Related stories">
      <h3 className="text-xs uppercase tracking-[0.18em] text-[#8A867E] mb-6">
        Keep Reading
      </h3>

      <div className="border-t border-[#DDD9D0]">
        {stories.map((story) => (
          <article
            key={story.id}
            className="border-b border-[#DDD9D0] py-5 flex items-baseline justify-between gap-4 group"
          >
            <Link
              to={`/blog/${story.slug}`}
              className="font-editorial text-xl sm:text-2xl text-[#211E1A] font-normal group-hover:text-[#716D65] transition-colors leading-snug"
            >
              {story.title}
            </Link>
            <span className="text-xs text-[#8A867E] shrink-0 uppercase tracking-wider whitespace-nowrap">
              {story.readingTime} min read
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
