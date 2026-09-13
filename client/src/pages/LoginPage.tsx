import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F8F7F3] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Editorial Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="font-editorial text-4xl sm:text-5xl text-[#211E1A] font-normal tracking-tight">
              The Margin
            </h1>
          </Link>
          <p className="text-sm text-[#716D65] mt-2">
            Slow reading for a fast internet.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#F8F7F3] border border-[#DDD9D0] rounded-xl p-8 sm:p-10 text-center">
          <h2 className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
            Welcome to the Journal
          </h2>
          <p className="text-xs text-[#716D65] mb-8">
            Sign in with your Google account to access your saved essays, personalize your feed, and publish stories.
          </p>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-lg">
              {error}
            </div>
          )}

          {/* Official Google OAuth Sign-in Button */}
          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-full border border-[#DDD9D0] hover:border-[#8A867E] hover:bg-[#F3F1EB] text-sm text-[#211E1A] font-medium transition-all shadow-2xs cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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

          <p className="mt-8 text-[11px] text-[#8A867E] leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy. Authentication is securely handled via Google OAuth 2.0.
          </p>
        </div>
      </div>
    </div>
  );
}
