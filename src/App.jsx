import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import SubmitLandPage from './pages/SubmitLandPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DevUiKitPage from './pages/DevUiKitPage';

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
import Users from './admin/pages/Users';
import Messages from './admin/pages/Messages';
import Locations from './admin/pages/Locations';
import Insights from './admin/pages/Insights';
import Logs from './admin/pages/Logs';
import WebsiteContent from './admin/pages/WebsiteContent';

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* Public website routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/property/:id" element={<PropertyDetailsPage />} />
          <Route path="/submit-land" element={<SubmitLandPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {import.meta.env.DEV && <Route path="/dev/ui-kit" element={<DevUiKitPage />} />}

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
            <Route path="users" element={<Users />} />
            <Route path="messages" element={<Messages />} />
            <Route path="insights" element={<Insights />} />
            <Route path="logs" element={<Logs />} />
            <Route path="content" element={<WebsiteContent />} />
            <Route path="website-content" element={<WebsiteContent />} />
            <Route path="branding" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="settings" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Catch-all fallback: Return to Public Website */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
