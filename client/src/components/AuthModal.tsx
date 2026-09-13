import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    loginWithGoogle,
    refreshUser,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setError(null);
      setShowEmailForm(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const isSignIn = authModalMode === 'signin';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!isSignIn && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await api.auth.devLogin({
        email: email.trim(),
        name: name.trim() || email.split('@')[0],
      });
      await refreshUser();
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#211E1A]/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeAuthModal();
        }
      }}
    >
      <div className="relative w-full max-w-[440px] bg-[#F8F7F3] border border-[#DDD9D0] rounded-2xl shadow-2xl p-8 sm:p-10 text-center animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#716D65] hover:text-[#211E1A] hover:bg-[#EBE7DF] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-8">
          <p className="font-editorial text-3xl sm:text-4xl text-[#211E1A] font-normal tracking-tight mb-3">
            {isSignIn ? 'Welcome back.' : 'Join The Margin.'}
          </p>
          <p className="text-sm text-[#716D65] leading-relaxed max-w-xs mx-auto">
            {isSignIn
              ? 'Sign in to read stories, write essays, and personalize your reading feed.'
              : 'Create an account to read slow essays, share your ideas, and support independent writers.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-left">
            {error}
          </div>
        )}

        {/* Action Options */}
        <div className="space-y-3.5">
          {/* Official Google OAuth Button */}
          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-full border border-[#DDD9D0] hover:border-[#8A867E] bg-white hover:bg-stone-50 text-sm sm:text-base text-[#211E1A] font-medium transition-all shadow-2xs hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Collapsible Email form for testing / sandbox */}
          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full text-xs text-[#716D65] hover:text-[#211E1A] py-2 transition-colors cursor-pointer"
            >
              Sign in with email instead &rarr;
            </button>
          ) : (
            <form onSubmit={handleEmailSubmit} className="pt-2 text-left space-y-3">
              {!isSignIn && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#716D65] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Austen"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#DDD9D0] bg-white text-sm text-[#211E1A] focus:outline-hidden focus:border-[#211E1A]"
                    required={!isSignIn}
                  />
                </div>
              )}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#716D65] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#DDD9D0] bg-white text-sm text-[#211E1A] focus:outline-hidden focus:border-[#211E1A]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-full bg-[#211E1A] text-[#F8F7F3] text-sm font-medium hover:bg-[#3D3833] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating...' : isSignIn ? 'Sign in' : 'Create account'}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer Mode Switcher */}
        <div className="mt-8 pt-6 border-t border-[#DDD9D0] text-xs text-[#716D65]">
          {isSignIn ? (
            <p>
              No account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openAuthModal('signup');
                }}
                className="font-medium text-[#211E1A] hover:underline cursor-pointer"
              >
                Create one
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openAuthModal('signin');
                }}
                className="font-medium text-[#211E1A] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}

          <p className="mt-4 text-[11px] text-[#8A867E] leading-relaxed">
            Click “Continue with Google” to agree to The Margin’s Terms of Service and acknowledge that The Margin’s Privacy Policy applies.
          </p>
        </div>
      </div>
    </div>
  );
}
