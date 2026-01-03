import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Listings from './pages/listings/Listings'
import ListingDetail from './pages/listings/ListingDetail'
import CreateListing from './pages/listings/CreateListing'
import ProtectedRoute from './components/ProtectedRoute'
import Tasks from './pages/Tasks'
import CreateTask from './pages/CreateTask'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="listings" element={<Listings />} />
        <Route path="tasks" element={<Tasks />} />
        <Route
          path="tasks/create"
          element={
            <ProtectedRoute>
              <CreateTask />
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
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* Public user profile */}
        <Route path="users/:id" element={<UserProfile />} />
        {/* 404 catch-all route - must be last */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
