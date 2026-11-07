import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicWebsite from './pages/PublicWebsite';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import SubmitLandPage from './pages/SubmitLandPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Admin Context & Protection
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import RequireAdmin from './admin/utils/RequireAdmin';

// Admin Layout
import AdminLayout from './admin/layouts/AdminLayout';

// Admin Pages
import AdminLogin from './admin/pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import Properties from './admin/pages/Properties';
import Inquiries from './admin/pages/Inquiries';
import Sellers from './admin/pages/Sellers';
import Locations from './admin/pages/Locations';
import WebsiteContent from './admin/pages/WebsiteContent';
import SettingsPage from './admin/pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* Public website routes */}
          <Route path="/" element={<PublicWebsite />} />
          <Route path="/properties" element={<PublicWebsite />} />
          <Route path="/property/:id" element={<PropertyDetailsPage />} />
          <Route path="/submit-land" element={<SubmitLandPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Console Routes */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="properties" element={<Properties />} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="sellers" element={<Sellers />} />
            <Route path="locations" element={<Locations />} />
            <Route path="content" element={<WebsiteContent />} />
            <Route path="website-content" element={<WebsiteContent />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="users" element={<Navigate to="settings" replace />} />
            <Route path="logs" element={<Navigate to="settings" replace />} />
            <Route path="messages" element={<Navigate to="content" replace />} />
            <Route path="insights" element={<Navigate to="content" replace />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Catch-all fallback: Return to Public Website */}
          <Route path="*" element={<PublicWebsite />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
