import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface WriteButtonProps {
  className?: string;
  showTextOnMobile?: boolean;
}

export function WriteButton({ className = '', showTextOnMobile = true }: WriteButtonProps) {
  const { user, openAuthModal } = useAuth();

  const baseClasses = `group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[#716D65] hover:text-[#211E1A] hover:bg-[#EFECE6] transition-colors cursor-pointer text-[15px] sm:text-[16px] font-normal ${className}`;

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => openAuthModal('signin')}
        className={baseClasses}
        aria-label="Write a story"
      >
        <PenLine className="w-[20px] h-[20px] stroke-[1.5] text-[#716D65] group-hover:text-[#211E1A] transition-colors" />
        <span className={showTextOnMobile ? 'inline' : 'hidden sm:inline'}>Write</span>
      </button>
    );
  }

  return (
    <Link
      to="/write"
      className={baseClasses}
      aria-label="Write a story"
    >
      <PenLine className="w-[20px] h-[20px] stroke-[1.5] text-[#716D65] group-hover:text-[#211E1A] transition-colors" />
      <span className={showTextOnMobile ? 'inline' : 'hidden sm:inline'}>Write</span>
    </Link>
  );
}
