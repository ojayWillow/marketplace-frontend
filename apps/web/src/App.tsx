import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import PWAUpdatePrompt from './components/PWAUpdatePrompt'
import SocketProvider from './components/SocketProvider'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'

// Loading spinner component
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
)

// Lazy load all pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const OnboardingWizard = lazy(() => import('./pages/Onboarding'))
const VerifyPhone = lazy(() => import('./pages/auth/VerifyPhone'))
const CompleteProfile = lazy(() => import('./pages/auth/CompleteProfile'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const Tasks = lazy(() => import('./pages/Tasks'))
const TaskDetail = lazy(() => import('./pages/TaskDetail'))
const CreateTask = lazy(() => import('./pages/CreateTask'))
const EditTask = lazy(() => import('./pages/EditTask'))
const CreateOffering = lazy(() => import('./pages/CreateOffering'))
const EditOffering = lazy(() => import('./pages/EditOffering'))
const OfferingDetail = lazy(() => import('./pages/OfferingDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const Messages = lazy(() => import('./pages/Messages'))
const Conversation = lazy(() => import('./pages/Conversation'))
const WorkPage = lazy(() => import('./pages/WorkPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Legal pages
const Terms = lazy(() => import('./pages/legal/Terms'))
const Privacy = lazy(() => import('./pages/legal/Privacy'))

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminSubscriptions = lazy(() => import('./pages/admin/AdminSubscriptions'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminJobs = lazy(() => import('./pages/admin/AdminJobs'))
const AdminOfferings = lazy(() => import('./pages/admin/AdminOfferings'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminDisputes = lazy(() => import('./pages/admin/AdminDisputes'))

function App() {
  return (
    <ErrorBoundary>
      <SocketProvider>
        {/* Reset scroll position to top on every route change */}
        <ScrollToTop />

        <Suspense fallback={<Layout><PageLoader /></Layout>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Home - Redirects guests to /welcome, shows map for authenticated */}
              <Route index element={<Home />} />
              
              {/* Landing page - the single entry point for unauthenticated users */}
              <Route path="welcome" element={<LandingPage />} />
              
              {/* Onboarding wizard - requires auth but skips onboarding check */}
              <Route
                path="onboarding"
                element={
                  <ProtectedRoute skipOnboardingCheck skipPhoneCheck>
                    <OnboardingWizard />
                  </ProtectedRoute>
                }
              />
              
              {/* All auth routes redirect to the landing page (single sign-in flow) */}
              <Route path="login" element={<Navigate to="/welcome" replace />} />
              <Route path="register" element={<Navigate to="/welcome" replace />} />
              <Route path="phone-login" element={<Navigate to="/welcome" replace />} />
              {/* Verify phone - requires auth but skips phone check to avoid loop */}
              <Route
                path="verify-phone"
                element={
                  <ProtectedRoute skipPhoneCheck skipOnboardingCheck>
                    <VerifyPhone />
                  </ProtectedRoute>
                }
              />
              {/* Complete profile - redirect to onboarding (legacy route) */}
              <Route
                path="complete-profile"
                element={
                  <ProtectedRoute skipPhoneCheck skipOnboardingCheck>
                    <Navigate to="/onboarding" replace />
                  </ProtectedRoute>
                }
              />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              
              {/* Tasks/Quick Help */}
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/:id" element={<TaskDetail />} />
              <Route path="quick-help" element={<Navigate to="/tasks" replace />} />
              <Route
                path="tasks/create"
                element={
                  <ProtectedRoute>
                    <CreateTask />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tasks/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditTask />
                  </ProtectedRoute>
                }
              />
              
              {/* Offerings routes */}
              <Route path="offerings/:id" element={<OfferingDetail />} />
              <Route
                path="offerings/create"
                element={
                  <ProtectedRoute>
                    <CreateOffering />
                  </ProtectedRoute>
                }
              />
              <Route
                path="offerings/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditOffering />
                  </ProtectedRoute>
                }
              />
              
              {/* Work page - requires auth */}
              <Route
                path="work"
                element={
                  <ProtectedRoute>
                    <WorkPage />
                  </ProtectedRoute>
                }
              />
              
              {/* User Profile & Settings */}
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              
              {/* Messaging */}
              <Route
                path="messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="messages/:id"
                element={
                  <ProtectedRoute>
                    <Conversation />
                  </ProtectedRoute>
                }
              />
              
              {/* Public user profile */}
              <Route path="users/:id" element={<UserProfile />} />
              
              {/* Legal pages */}
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              
              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Panel */}
            <Route
              path="/admin"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminLayout />
                </Suspense>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="disputes" element={<AdminDisputes />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="offerings" element={<AdminOfferings />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Suspense>
        
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
      </SocketProvider>
    </ErrorBoundary>
  )
}

export default App
