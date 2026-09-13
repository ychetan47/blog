import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { AuthModal } from './components/AuthModal.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { HomePage } from './pages/HomePage.js';
import { BlogDetailPage } from './pages/BlogDetailPage.js';
import { LibraryPage } from './pages/LibraryPage.js';
import { StoriesPage } from './pages/StoriesPage.js';
import { WritePage } from './pages/WritePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { SignUpPage } from './pages/SignUpPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { TopicDiscoveryPage } from './pages/TopicDiscoveryPage.js';
import { TopicDetailPage } from './pages/TopicDetailPage.js';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#211E1A] selection:bg-[#DDD9D0] selection:text-[#211E1A]">
          <Navbar />
          <AuthModal />
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/blog/:slug"
                element={
                  <ProtectedRoute>
                    <BlogDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library"
                element={
                  <ProtectedRoute>
                    <LibraryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stories"
                element={
                  <ProtectedRoute>
                    <StoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/write"
                element={
                  <ProtectedRoute>
                    <WritePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/topics" element={<TopicDiscoveryPage />} />
              <Route path="/topics/:slug" element={<TopicDetailPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
