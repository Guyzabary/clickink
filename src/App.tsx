import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import SelectRole from './pages/SelectRole';
import Gallery from './pages/Gallery';
import Appointments from './pages/Appointments';
import Messages from './pages/Messages';
import About from './pages/About';
import Profile from './pages/Profile';
import Generate from './pages/Generate';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtistProfile from './pages/ArtistProfile';
import SearchResults from './pages/SearchResults';
import Following from './pages/Following';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/artist/:uid" element={<ArtistProfile />} />
            
            {/* Role Selection Route */}
            <Route
              path="/select-role"
              element={
                <ProtectedRoute>
                  <SelectRole />
                </ProtectedRoute>
              }
            />
            
            {/* Protected Routes - Clients Only */}
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Artists Only */}
            <Route
              path="/artist-dashboard"
              element={
                <ProtectedRoute allowedRoles={['artist']}>
                  <ArtistDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - All Authenticated Users */}
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/following"
              element={
                <ProtectedRoute>
                  <Following />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;