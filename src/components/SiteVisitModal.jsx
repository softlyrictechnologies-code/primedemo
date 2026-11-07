import React, { useState } from 'react';
import { X, Calendar, Clock, Car, CheckCircle2, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitInquiry } from '../services/propertyService';

export default function SiteVisitModal({ plot, onClose, onSuccessToast, onErrorToast }) {
  const [date, setDate] = useState('Tomorrow');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [transport, setTransport] = useState('shuttle');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!plot) return null;

  const handleBooking = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      onErrorToast?.('Please enter your name before booking a site visit.');
      return;
    }

    if (!cleanPhone) {
      onErrorToast?.('Please enter your WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitInquiry({
        propertyId: plot.id,
        propertyTitle: plot.title,
        customerName: cleanName,
        customerPhone: cleanPhone,
        preferredDate: date,
        preferredTime: timeSlot,
        transport,
        message: `Booked site visit for ${plot.title} (${plot.location}).`
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      onSuccessToast?.(`Site visit booked for ${plot.title} on ${date} at ${timeSlot}! Our Chennai site agent will call you.`);
      onClose();
    } catch (err) {
      console.error('Could not persist inquiry to Firestore:', err);
      onErrorToast?.(err?.message || 'We could not send your site-visit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">

      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-2xl overflow-hidden">

        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#1B4D3E] flex items-center justify-center text-emerald-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Schedule Free Site Visit</h3>
              <p className="text-xs text-slate-400 font-medium">Free Pick-up Cab from OMR / ECR Signal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBooking} className="p-6 space-y-5 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-3">
            <img src={plot.image} alt={plot.title} className="w-16 h-14 object-cover rounded-xl shrink-0" />
            <div>
              <h4 className="font-extrabold text-[#111827] text-xs line-clamp-1">{plot.title}</h4>
              <p className="text-slate-500 font-semibold text-[11px] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#1B4D3E]" /> {plot.location}
              </p>
              <p className="text-xs font-black text-[#1B4D3E] mt-0.5">{plot.formattedPrice}</p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Visit Date
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Tomorrow', 'This Saturday', 'This Sunday'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${
                    date === d
                      ? 'bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Preferred Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['10:00 AM', '02:00 PM', '04:30 PM'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeSlot(t)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                    timeSlot === t
                      ? 'bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Transport Option
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransport('shuttle')}
                className={`p-3 rounded-2xl text-left font-bold transition-all border flex items-center gap-2 ${
                  transport === 'shuttle'
                    ? 'bg-emerald-50 border-[#1B4D3E] text-[#1B4D3E]'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Car className="w-4 h-4 shrink-0 text-[#1B4D3E]" />
                <div>
                  <p className="text-xs">Free Prime Housing Cab</p>
                  <p className="text-[10px] font-normal text-slate-500">Pick from OMR/ECR hub</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTransport('self')}
                className={`p-3 rounded-2xl text-left font-bold transition-all border flex items-center gap-2 ${
                  transport === 'self'
                    ? 'bg-emerald-50 border-[#1B4D3E] text-[#1B4D3E]'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0 text-slate-500" />
                <div>
                  <p className="text-xs">Self Drive / Own Vehicle</p>
                  <p className="text-[10px] font-normal text-slate-500">Instant Pin on WhatsApp</p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="Ramesh V"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                WhatsApp Phone
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98400 XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B30] disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-xl shadow-[#1B4D3E]/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{isSubmitting ? 'Booking Your Visit...' : 'Confirm Free Site Visit Booking'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
