interface AuthorCardProps {
  name: string;
  role?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  className?: string;
}

export function AuthorCard({
  name,
  role = 'Contributing writer',
  bio,
  avatarUrl,
  className = '',
}: AuthorCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`bg-[#F3F1EB] border border-[#DDD9D0] rounded-sm p-6 sm:p-8 flex items-start gap-4 sm:gap-6 ${className}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-[#DDD9D0] shrink-0"
        />
      ) : (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#E5E1D8] border border-[#DDD9D0] flex items-center justify-center font-editorial text-lg sm:text-xl text-[#211E1A] shrink-0">
          {initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className="font-editorial text-xl sm:text-2xl text-[#211E1A] font-normal tracking-tight">
          {name}
        </h4>
        <p className="text-xs uppercase tracking-[0.14em] text-[#8A867E] mt-0.5">
          {role}
        </p>
        <p className="text-sm sm:text-base text-[#716D65] mt-2.5 leading-relaxed font-normal">
          {bio ||
            'Interface designer and occasional essayist. Believes most screens are shouting.'}
        </p>
      </div>
    </div>
  );
}
