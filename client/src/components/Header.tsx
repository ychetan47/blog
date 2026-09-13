import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { WriteButton } from './WriteButton.js';
import { UserAvatar } from './UserAvatar.js';
import { UserMenu } from './UserMenu.js';

export function Header() {
  const { user, openAuthModal } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F7F3]/95 backdrop-blur-xs border-b border-[#DDD9D0] transition-colors">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 h-20 sm:h-24 flex items-center justify-between">
        {/* LEFT: Publication Masthead */}
        <Link to="/" className="group inline-block select-none" aria-label="The Margin Home">
          <span className="font-editorial text-3xl sm:text-4xl text-[#211E1A] font-normal tracking-tight group-hover:text-[#716D65] transition-colors">
            The Margin
          </span>
        </Link>

        {/* RIGHT: Authenticated vs Unauthenticated Navigation */}
        {user ? (
          /* Authenticated Header: [ ✎ Write ]   [ XX ] */
          <div className="flex items-center gap-3 sm:gap-6">
            <WriteButton />

            {/* Avatar & User Dropdown */}
            <div className="relative">
              <UserAvatar
                user={user}
                isOpen={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
              />
              <UserMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
              />
            </div>
          </div>
        ) : (
          /* Unauthenticated Header: [ Write ]  [ Sign in ]  [ Get started ] */
          <div className="flex items-center gap-4 sm:gap-6 text-[15px] sm:text-[16px] font-normal">
            <WriteButton />

            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="text-[#211E1A] hover:text-[#716D65] transition-colors cursor-pointer hidden xs:inline-block"
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#211E1A] text-[#F8F7F3] text-sm font-medium hover:bg-[#3D3833] transition-colors cursor-pointer"
            >
              Get started
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
