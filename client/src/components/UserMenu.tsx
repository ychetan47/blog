import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Bookmark, UserRound, BookOpen, Compass, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export function UserMenu({ isOpen, onClose }: UserMenuProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleSignOut = async () => {
    onClose();
    await logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Explore topics', icon: Compass, path: '/topics' },
    { label: 'Library', icon: Bookmark, path: '/library' },
    { label: 'Profile', icon: UserRound, path: '/profile' },
    { label: 'Stories', icon: BookOpen, path: '/stories' },
  ];

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="User navigation"
      className="absolute right-0 top-full mt-2.5 w-[230px] bg-[#F8F7F3] border border-[#DDD9D0] rounded-xl shadow-md shadow-stone-900/5 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      <div className="space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => handleNavigate(item.path)}
              className="w-full h-11 flex items-center gap-3.5 px-3 rounded-lg text-[15px] text-[#716D65] hover:text-[#211E1A] hover:bg-[#EFECE6] transition-colors cursor-pointer group text-left"
            >
              <Icon className="w-[18px] h-[18px] shrink-0 stroke-[1.75] text-[#716D65] group-hover:text-[#211E1A] transition-colors" />
              <span className="font-normal">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtle divider */}
      <div className="my-1.5 border-t border-[#DDD9D0]" />

      {/* Sign out */}
      <button
        type="button"
        role="menuitem"
        onClick={handleSignOut}
        className="w-full h-11 flex items-center gap-3.5 px-3 rounded-lg text-[15px] text-[#716D65] hover:text-[#211E1A] hover:bg-[#EFECE6] transition-colors cursor-pointer group text-left"
      >
        <LogOut className="w-[18px] h-[18px] shrink-0 stroke-[1.75] text-[#716D65] group-hover:text-[#211E1A] transition-colors" />
        <span className="font-normal">Sign out</span>
      </button>
    </div>
  );
}
