import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import ThemesManager from './pages/ThemesManager';
import SystemConfig from './pages/SystemConfig';
import Login from './pages/Login';
import { Toaster } from 'sonner';

const ProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('admin_secret');
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/themes" element={<ProtectedRoute><ThemesManager /></ProtectedRoute>} />
        <Route path="/config" element={<ProtectedRoute><SystemConfig /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
