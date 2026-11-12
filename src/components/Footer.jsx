import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, ArrowUpRight } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { usePublicSiteContent } from '../services/publicSiteContent';

export default function Footer() {
  const siteContent = usePublicSiteContent();
  const corridors = (siteContent.footerCorridorsText || '').split(/\r?\n/).map((area) => area.trim()).filter(Boolean);
  return (
    <footer className="ph-footer mt-20 border-t border-slate-200/80 bg-white/80 backdrop-blur-2xl relative overflow-hidden">
      
      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <button 
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 text-left cursor-pointer rounded-lg bg-white p-1.5 ring-1 ring-slate-200/80 shadow-sm"
            >
              <BrandLogo className="h-14 w-auto object-contain" />
            </button>

            <p className="text-xs text-slate-600 leading-relaxed">
              {siteContent.footerDescription}
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs font-bold text-[#1B4D3E]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#1B4D3E]" /> {siteContent.footerTrustOne}
              </span>
              <span>•</span>
              <span>{siteContent.footerTrustTwo}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 text-xs font-semibold">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">{siteContent.footerNavTitle}</h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <Link to="/properties" className="hover:text-[#1B4D3E] flex items-center gap-1 cursor-pointer text-left">
                  <span>{siteContent.footerBrowseLink}</span> <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link to="/submit-land" className="hover:text-[#1B4D3E] flex items-center gap-1 cursor-pointer text-left">
                  <span>{siteContent.footerListLink}</span> <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#1B4D3E] flex items-center gap-1 cursor-pointer text-left">
                  <span>{siteContent.footerAboutLink}</span> <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#1B4D3E] flex items-center gap-1 cursor-pointer text-left">
                  <span>{siteContent.footerContactLink}</span> <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Chennai Corridors */}
          <div className="md:col-span-2 space-y-3 text-xs font-semibold">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">{siteContent.footerCorridorsTitle}</h4>
            <ul className="space-y-2 text-slate-600">{corridors.map((area) => <li key={area}>{area}</li>)}</ul>
          </div>

          {/* Contact & Support */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">{siteContent.footerContactTitle}</h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <p className="font-bold text-[#111827]">{siteContent.companyName} {siteContent.footerContactRole}</p>
              <p className="text-[#1B4D3E] font-extrabold flex items-center gap-1.5 text-sm">
                <Phone className="w-4 h-4" /> {siteContent.phone}
              </p>
              <p className="text-slate-500 text-[11px] flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {siteContent.email}
              </p>
              <p className="text-slate-500 text-[11px] pt-1">
                {siteContent.location} {siteContent.footerLocationSuffix}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Rights Notice */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 font-medium">
          <p>© {new Date().getFullYear()} {siteContent.companyName}. {siteContent.footerCopyright}</p>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => {
                const el = document.getElementById('plots-results-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#1B4D3E] cursor-pointer"
            >
              {siteContent.footerPropertyGuidanceLink}
            </button>
            <span>•</span>
            <Link
              to="/submit-land"
              className="hover:text-[#1B4D3E] cursor-pointer"
            >
              {siteContent.footerSellLink}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
