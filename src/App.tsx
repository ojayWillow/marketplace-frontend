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
      </Route>
    </Routes>
  )
}

export default App