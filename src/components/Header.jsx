import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Phone, Plus, ChevronDown } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { usePublicSiteContent } from '../services/publicSiteContent';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const publicContent = usePublicSiteContent();
  const site = {
    companyName: publicContent.companyName,
    phone: publicContent.phone,
  };

  const navItems = [
    { to: '/', label: publicContent.navHome },
    { to: '/submit-land', label: publicContent.navListLand, highlight: true },
    { to: '/about', label: publicContent.navAbout },
    { to: '/contact', label: publicContent.navContact },
  ];
  const propertyLinks = [
    { to: '/properties', label: publicContent.navProperties },
    { to: '/properties?type=Residential Plot', label: publicContent.navResidential },
    { to: '/properties?type=Commercial Plot', label: publicContent.navCommercial },
    { to: '/properties?type=Joint Venture Plot', label: publicContent.navJointVenture },
    { to: '/properties?type=Agricultural Land', label: publicContent.navFarmLand },
  ];

  const phoneHref = site.phone ? `tel:${site.phone.replace(/[^\d+]/g, '')}` : '';

  return (
    <header className="ph-header sticky top-0 z-40 border-b border-[#e8e3d9] bg-white/95 backdrop-blur-xl">
      <div className="ph-header-main mx-auto flex h-[66px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center rounded-lg" aria-label={`${site.companyName || 'Prime Housing'} home`}>
          <div className="rounded-lg bg-white p-1.5 ring-1 ring-slate-200/80 shadow-sm">
            <BrandLogo className="h-10 w-auto object-contain md:h-11" />
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          <div className="relative">
            <button type="button" aria-haspopup="menu" aria-expanded={propertiesOpen} onClick={() => setPropertiesOpen((open) => !open)} className="inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-[13px] font-medium text-[#11251c] transition hover:text-[#087346]">
              {publicContent.navProperties}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${propertiesOpen ? 'rotate-180' : ''}`} />
            </button>
            {propertiesOpen && <div role="menu" className="absolute left-0 top-full z-50 mt-2 min-w-56 rounded-2xl border border-[#e3e8e3] bg-white p-2 shadow-xl">
              {propertyLinks.map((item) => <Link key={item.to} role="menuitem" to={item.to} onClick={() => setPropertiesOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#30483b] transition hover:bg-[#f1f5f0] hover:text-[#153d32]">{item.label}</Link>)}
            </div>}
          </div>
          {navItems.map((item) =>
            item.highlight ? (
              <Link
                key={item.to}
                to={item.to}
                className="ph-sell-link inline-flex items-center gap-1.5 rounded-full border border-[#2f6d51] bg-white px-4 py-2 text-[13px] font-semibold text-[#285d45] transition hover:bg-[#2f6d51] hover:text-white"
              >
                <Plus className="h-4 w-4 text-[#2f6d51]" />
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-2.5 py-2 text-[13px] font-medium transition ${
                    isActive
                      ? 'text-[#245743]'
                      : 'text-[#53645a] hover:text-[#173b2c]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {site.phone ? (
            <a
              href={phoneHref}
              aria-label={`Call the direct desk at ${site.phone}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#ded8cc] bg-white px-4 py-2 text-xs font-semibold text-[#33483b] transition hover:border-[#245743]"
            >
              <Phone className="h-3.5 w-3.5 text-[#245743]" />
              {site.phone}
            </a>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex h-12 min-h-[48px] min-w-[48px] w-12 items-center justify-center rounded-full border border-[#ded8cc] bg-white text-[#245743] transition-colors xl:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
      {mobileMenuOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }} className="overflow-hidden border-t border-[#e8e3d9] bg-white px-4 py-4 xl:hidden">
          <div className="space-y-2">
            {propertyLinks.map((item) => <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className="flex min-h-[48px] items-center rounded-md px-3.5 py-3 text-sm font-medium text-[#53645a] hover:bg-[#f0eee8]">{item.label}</Link>)}
            {navItems.map((item) =>
              item.highlight ? (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-[#2f6d51] bg-white px-4 py-3 text-sm font-semibold text-[#285d45]"
                >
                  <Plus className="h-4 w-4 text-[#2f6d51]" />
                  {item.label}
                </Link>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-[48px] items-center rounded-md px-3.5 py-3 text-sm font-medium ${
                      isActive ? 'bg-[#e8eee8] text-[#245743]' : 'text-[#53645a] hover:bg-[#f0eee8]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}

            {site.phone ? (
              <a
                href={phoneHref}
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-[#ded8cc] bg-white px-4 py-3 text-sm font-semibold text-[#33483b]"
              >
                <Phone className="h-4 w-4 text-[#245743]" />
                Call Direct Desk
              </a>
            ) : null}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
}
