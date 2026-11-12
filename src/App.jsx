import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APP_MODE, isPublicOnly } from './config/appMode';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import SubmitLandPage from './pages/SubmitLandPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DevUiKitPage from './pages/DevUiKitPage';
import NotFoundPage from './pages/NotFoundPage';

const AdminRoutes = !isPublicOnly
  ? lazy(() => import('./admin/routes'))
  : null;

function AppMeta() {
  useEffect(() => {
    if (APP_MODE === 'admin') {
      document.title = 'Prime Housing Admin';
      let meta = document.querySelector('meta[name="robots"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', 'noindex,nofollow');
      return;
    }

    if (APP_MODE === 'public') {
      const meta = document.querySelector('meta[name="robots"]');
      if (meta) {
        meta.setAttribute('content', 'index,follow');
      }
    }
  }, []);

  return null;
}

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertyDetailsPage />} />
      <Route path="/property/:id" element={<PropertyDetailsPage />} />
      <Route path="/submit-land" element={<SubmitLandPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/admin/*" element={<NotFoundPage />} />
      {import.meta.env.DEV && <Route path="/dev/ui-kit" element={<DevUiKitPage />} />}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function AllRoutes() {
  return (
    <>
      <PublicRoutes />
      {AdminRoutes && <AdminRoutes redirectRoot={false} />}
    </>
  );
}

export default function App() {
  const showPublicRoutes = APP_MODE !== 'admin';
  const showAdminRoutes = APP_MODE !== 'public';

  return (
    <BrowserRouter>
      <AppMeta />
      <Suspense fallback={null}>
        {showPublicRoutes && APP_MODE === 'public' && <PublicRoutes />}
        {showAdminRoutes && APP_MODE === 'admin' && AdminRoutes && <AdminRoutes redirectRoot={true} />}
        {APP_MODE === 'all' && <AllRoutes />}
      </Suspense>
    </BrowserRouter>
  );
}
