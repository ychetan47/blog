import { Link } from 'react-router-dom';
import type { Post } from '../types/index.js';

interface PickOfTheWeekProps {
  stories: Post[];
}

export function PickOfTheWeek({ stories }: PickOfTheWeekProps) {
  if (!stories || stories.length === 0) {
    return null;
  }

  // Exactly 3 (max 4) stories for the compact sidebar
  const items = stories.slice(0, 3);

  return (
    <section aria-label="Pick of the week">
      {/* Small uppercase editorial label */}
      <h3 className="text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#716D65] font-medium mb-3">
        Pick of the week
      </h3>

      {/* Stories List (Compact, no images, no excerpts) */}
      <div className="space-y-3.5">
        {items.map((story) => {
          const catName = story.category?.name || 'Journal';
          const subName = story.subcategories?.[0]?.name;
          const taxonomy =
            subName && subName.toLowerCase() !== catName.toLowerCase()
              ? `${catName} · ${subName}`
              : catName;

          return (
            <article key={story.id} className="group">
              <Link to={`/blog/${story.slug}`} className="block">
                {/* Category · Topic */}
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-[#716D65] font-medium block">
                  {taxonomy}
                </span>

                {/* Story title (16-18px serif, line-height 1.2-1.3) */}
                <h4 className="font-editorial text-[16px] sm:text-[17px] leading-[1.25] text-[#211E1A] font-medium group-hover:text-[#716D65] transition-colors mt-0.5 line-clamp-2">
                  {story.title}
                </h4>

                {/* Reading time */}
                <span className="text-[12px] text-[#8A867E] mt-0.5 block">
                  {story.readingTime} min read
                </span>
              </Link>
            </article>
          );
        })}
      </div>

      {/* See full list link */}
      <div className="mt-3">
        <Link
          to="/pick-of-the-week"
          className="inline-flex items-center gap-1 text-xs text-[#716D65] hover:text-[#211E1A] hover:underline underline-offset-4 tracking-wide transition-colors font-medium"
        >
          <span>See full list →</span>
        </Link>
      </div>
    </section>
  );
}

export default PickOfTheWeek;
