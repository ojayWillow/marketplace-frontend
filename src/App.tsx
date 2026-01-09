import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PWAInstallPrompt from './components/PWAInstallPrompt'

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
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Listings = lazy(() => import('./pages/listings/Listings'))
const ListingDetail = lazy(() => import('./pages/listings/ListingDetail'))
const CreateListing = lazy(() => import('./pages/listings/CreateListing'))
const EditListing = lazy(() => import('./pages/listings/EditListing'))
const Tasks = lazy(() => import('./pages/Tasks'))
const TaskDetail = lazy(() => import('./pages/TaskDetail'))
const CreateTask = lazy(() => import('./pages/CreateTask'))
const EditTask = lazy(() => import('./pages/EditTask'))
const CreateOffering = lazy(() => import('./pages/CreateOffering'))
const OfferingDetail = lazy(() => import('./pages/OfferingDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const Messages = lazy(() => import('./pages/Messages'))
const Conversation = lazy(() => import('./pages/Conversation'))
const Favorites = lazy(() => import('./pages/Favorites'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminJobs = lazy(() => import('./pages/admin/AdminJobs'))
const AdminOfferings = lazy(() => import('./pages/admin/AdminOfferings'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

function App() {
  return (
    <>
      <Suspense fallback={<Layout><PageLoader /></Layout>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="listings" element={<Listings />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/:id" element={<TaskDetail />} />
            {/* Alias for /tasks */}
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
            <Route path="listings/:id" element={<ListingDetail />} />
            <Route
              path="listings/create"
              element={
                <ProtectedRoute>
                  <CreateListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="listings/:id/edit"
              element={
                <ProtectedRoute>
                  <EditListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* Favorites */}
            <Route path="favorites" element={<Favorites />} />
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
            {/* 404 catch-all route - must be last */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Panel - Separate layout */}
          <Route
            path="/admin"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminLayout />
              </Suspense>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="offerings" element={<AdminOfferings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </>
  )
}

export default App
