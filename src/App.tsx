import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ListingsPage from './pages/listings/ListingsPage';
import ListingDetail from './pages/listings/ListingDetail';
import CreateListing from './pages/listings/CreateListing';
import MyListings from './pages/listings/MyListings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="listings">
          <Route index element={<ListingsPage />} />
          <Route path=":id" element={<ListingDetail />} />
          <Route
            path="create"
            element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="my"
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
