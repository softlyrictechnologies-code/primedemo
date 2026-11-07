import React, { useState } from 'react';
import { ShieldCheck, Users, Bell, Lock } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'Prime Housing Chennai',
    emailAlerts: true,
    approvalWorkflow: 'Manual review required',
    securityMode: 'Admin-only access',
  });

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">User and settings</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Administrative configuration</h2>
          </div>
          <div className="rounded-2xl bg-violet-50 px-3 py-2 text-violet-700 border border-violet-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">Security and access</h3>
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Lock className="h-4 w-4 text-violet-600" />
              <input value={settings.securityMode} onChange={(event) => setSettings((current) => ({ ...current, securityMode: event.target.value }))} className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Users className="h-4 w-4 text-violet-600" />
              <input value={settings.companyName} onChange={(event) => setSettings((current) => ({ ...current, companyName: event.target.value }))} className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">Notifications</h3>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-violet-600" />
                <span className="text-sm text-slate-700">Email alerts</span>
              </div>
              <button type="button" onClick={() => setSettings((current) => ({ ...current, emailAlerts: !current.emailAlerts }))} className={`h-6 w-11 rounded-full ${settings.emailAlerts ? 'bg-violet-600' : 'bg-slate-300'} relative transition`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${settings.emailAlerts ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <ShieldCheck className="h-4 w-4 text-violet-600" />
              <input value={settings.approvalWorkflow} onChange={(event) => setSettings((current) => ({ ...current, approvalWorkflow: event.target.value }))} className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
