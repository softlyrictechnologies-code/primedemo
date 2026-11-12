import React from 'react';
import { X, SlidersHorizontal, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export default function PlotComparisonDrawer({ comparePlots, onClose, onRemovePlot }) {
  if (comparePlots.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xl flex items-end sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-5 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1B4D3E] text-white flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#111827]">Plot Comparison Matrix</h3>
              <p className="text-xs text-slate-500 font-medium">Comparing {comparePlots.length} of 3 selected plots</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Table Content */}
        <div className="overflow-x-auto overflow-y-auto p-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-3 w-40 text-slate-400 uppercase font-extrabold text-[10px]">Property</th>
                {comparePlots.map((plot) => (
                  <th key={plot.id} className="p-3 min-w-[220px]">
                    <div className="relative bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center space-y-2">
                      <button
                        onClick={() => onRemovePlot(plot.id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600"
                        title="Remove from compare"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <img src={plot.image} alt={plot.title} className="w-full h-24 object-cover rounded-xl" />
                      <h4 className="font-extrabold text-[#111827] text-xs line-clamp-1">{plot.title}</h4>
                      <p className="text-sm font-black text-[#1B4D3E]">{plot.formattedPrice}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="p-3 font-extrabold text-slate-500">Location</td>
                {comparePlots.map(p => <td key={p.id} className="p-3 font-semibold text-slate-800">{p.location}</td>)}
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-500">Price / Sq.Ft</td>
                {comparePlots.map(p => <td key={p.id} className="p-3 font-extrabold text-[#1B4D3E]">₹{p.pricePerSqft.toLocaleString()}</td>)}
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-500">Total Plot Area</td>
                {comparePlots.map(p => <td key={p.id} className="p-3 font-semibold text-slate-800">{p.totalAreaSqft} sq.ft</td>)}
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-500">Plot Dimensions</td>
                {comparePlots.map(p => <td key={p.id} className="p-3 text-slate-800">{p.dimensions}</td>)}
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-500">Approval Type</td>
                {comparePlots.map(p => (
                  <td key={p.id} className="p-3 font-bold text-emerald-800">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                      {p.approval}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-500">Facing</td>
                {comparePlots.map(p => <td key={p.id} className="p-3 text-slate-800">{p.facing}</td>)}
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-500">Road Width</td>
                {comparePlots.map(p => <td key={p.id} className="p-3 text-slate-800">{p.roadWidth}</td>)}
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-500">YoY Growth</td>
                {comparePlots.map(p => <td key={p.id} className="p-3 font-extrabold text-emerald-700">{p.appreciationRate}</td>)}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
