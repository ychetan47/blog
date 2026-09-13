import { Link } from 'react-router-dom';
import type { Post } from '../types/index.js';

interface PickedForYouProps {
  stories: Post[];
}

export function PickedForYou({ stories }: PickedForYouProps) {
  if (!stories || stories.length === 0) {
    return null;
  }

  // Limit strictly to 3–5 items
  const items = stories.slice(0, 5);

  return (
    <aside aria-label="Picked for you" className="py-2">
      {/* Editorial Header */}
      <h3 className="text-xs uppercase tracking-[0.2em] text-[#716D65] font-medium mb-6">
        Picked for you
      </h3>

      {/* Stories List (Text-focused, No images, Compact) */}
      <div className="space-y-5">
        {items.map((story) => {
          const catName = story.category?.name || 'Journal';
          const subName = story.subcategories?.[0]?.name;
          const taxonomyLabel =
            subName && subName.toLowerCase() !== catName.toLowerCase()
              ? `${catName} · ${subName}`
              : catName;

          return (
            <article key={story.id} className="group">
              <Link to={`/blog/${story.slug}`} className="block">
                {/* Category · Topic */}
                <span className="text-[11px] sm:text-[12px] uppercase tracking-[0.18em] text-[#716D65] font-medium block">
                  {taxonomyLabel}
                </span>

                {/* Story Title */}
                <h4 className="font-editorial text-[17px] sm:text-[18px] text-[#211E1A] font-normal leading-snug group-hover:text-[#716D65] transition-colors mt-1.5 line-clamp-2">
                  {story.title}
                </h4>

                {/* Reading Time */}
                <span className="text-[12px] text-[#8A867E] mt-1.5 block">
                  {story.readingTime} min read
                </span>
              </Link>
            </article>
          );
        })}
      </div>

      {/* See More Topics Link */}
      <div className="mt-7 pt-4 border-t border-[#DDD9D0]/70">
        <Link
          to="/topics"
          className="inline-flex items-center gap-1.5 text-xs text-[#716D65] hover:text-[#211E1A] hover:underline underline-offset-4 tracking-wide transition-colors font-medium"
        >
          <span>See more topics →</span>
        </Link>
      </div>
    </aside>
  );
}

export default PickedForYou;
