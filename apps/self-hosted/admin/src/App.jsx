import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import ThemesManager from './pages/ThemesManager';
import SystemConfig from './pages/SystemConfig';
import Login from './pages/Login';
import { Toaster } from 'sonner';

function App() {
  const isAdmin = localStorage.getItem('admin_secret');

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={isAdmin ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/themes" element={<ThemesManager />} />
          <Route path="/config" element={<SystemConfig />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
