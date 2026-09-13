import { getInitials, type UserLike } from '../lib/initials.js';

interface UserAvatarProps {
  user?: UserLike | null;
  isOpen?: boolean;
  onClick?: () => void;
  className?: string;
}

export function UserAvatar({
  user,
  isOpen = false,
  onClick,
  className = '',
}: UserAvatarProps) {
  const initials = getInitials(user);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open user menu"
      aria-expanded={isOpen}
      aria-haspopup="true"
      className={`relative inline-flex items-center justify-center w-[42px] h-[42px] sm:w-[44px] sm:h-[44px] rounded-full bg-[#E2E8F4] hover:bg-[#D6E0F0] text-[#32456C] border border-[#D0DCEF] font-medium text-[16px] sm:text-[17px] tracking-tight transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#32456C] ${className}`}
    >
      <span>{initials}</span>
    </button>
  );
}
