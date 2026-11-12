import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import RequireAdmin from './utils/RequireAdmin';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Inquiries from './pages/Inquiries';
import Sellers from './pages/Sellers';
import Users from './pages/Users';
import Messages from './pages/Messages';
import Locations from './pages/Locations';
import Insights from './pages/Insights';
import Logs from './pages/Logs';
import WebsiteContent from './pages/WebsiteContent';

export default function AdminRoutes({ redirectRoot = true }) {
  return (
    <AdminAuthProvider>
      <Routes>
        {redirectRoot && <Route path="/" element={<Navigate to="/admin/login" replace />} />}
        <Route path="/admin/login" element={<AdminLogin />} />
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
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {redirectRoot && <Route path="*" element={<Navigate to="/admin/login" replace />} />}
      </Routes>
    </AdminAuthProvider>
  );
}
