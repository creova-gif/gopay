import { useState } from 'react';
import { ArrowLeft, Train, Check, Shield, Clock, ChevronRight, Zap, MapPin, Star } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { User } from '../App';
import { toast } from 'sonner';

interface Props { user: User; accessToken: string; onBack: () => void; }

const ACCENT = '#f87171';

const ROUTES = [
  { id: 'dar-mor', from: 'Dar es Salaam', fromCode: 'DSM', to: 'Morogoro', toCode: 'MOR', duration: '2h 15m', distance: '200km', active: true },
  { id: 'mor-dod', from: 'Morogoro', fromCode: 'MOR', to: 'Dodoma', toCode: 'DOD', duration: '2h 30m', distance: '213km', active: false },
  { id: 'dod-mwz', from: 'Dodoma', fromCode: 'DOD', to: 'Mwanza', toCode: 'MWZ', duration: '5h', distance: '460km', active: false },
];

interface TrainClass { id: string; name: string; price: number; seats: number; perks: string[]; color: string; }
interface TrainSchedule { id: string; name: string; departure: string; arrival: string; classes: TrainClass[]; }

const CLASS_COLORS: Record<string, string> = { eco: '#4ade80', biz: '#60a5fa', vip: '#fbbf24' };

const SCHEDULES: TrainSchedule[] = [
  { id: 'sgr-001', name: 'SGR Express 1', departure: '06:00', arrival: '08:15',
    classes: [
      { id: 'eco', name: 'Uchumi', price: 15000, seats: 45, color: '#4ade80', perks: ['Kiti cha kubeba', 'WiFi bure', 'Socket ya umeme'] },
      { id: 'biz', name: 'Biashara', price: 35000, seats: 12, color: '#60a5fa', perks: ['Kiti pana', 'WiFi bure', 'Maji bure', 'Chakula kidogo'] },
      { id: 'vip', name: 'VIP Kibinafsi', price: 60000, seats: 6, color: '#fbbf24', perks: ['Kiti la kibinafsi', 'Chakula kamili', 'WiFi', 'Huduma ya ndani'] },
    ],
  },
  { id: 'sgr-002', name: 'SGR Express 2', departure: '10:30', arrival: '12:45',
    classes: [
      { id: 'eco', name: 'Uchumi', price: 15000, seats: 38, color: '#4ade80', perks: ['Kiti cha kubeba', 'WiFi bure', 'Socket ya umeme'] },
      { id: 'biz', name: 'Biashara', price: 35000, seats: 8, color: '#60a5fa', perks: ['Kiti pana', 'WiFi bure', 'Maji bure', 'Chakula kidogo'] },
    ],
  },
  { id: 'sgr-003', name: 'SGR Express 3', departure: '15:00', arrival: '17:15',
    classes: [
      { id: 'eco', name: 'Uchumi', price: 15000, seats: 52, color: '#4ade80', perks: ['Kiti cha kubeba', 'WiFi bure', 'Socket ya umeme'] },
      { id: 'biz', name: 'Biashara', price: 35000, seats: 14, color: '#60a5fa', perks: ['Kiti pana', 'WiFi bure', 'Maji bure', 'Chakula kidogo'] },
      { id: 'vip', name: 'VIP Kibinafsi', price: 60000, seats: 4, color: '#fbbf24', perks: ['Kiti la kibinafsi', 'Chakula kamili', 'WiFi', 'Huduma ya ndani'] },
    ],
  },
];

type Step = 'route' | 'schedule' | 'seat' | 'payment' | 'confirmation';

const fmt = (n: number) => `TZS ${n.toLocaleString()}`;

const darkInput: React.CSSProperties = {
  width: '100%', height: 52, padding: '0 16px', borderRadius: 14,
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
};

const TOTAL_SEATS = 60;
const TAKEN = [2, 7, 11, 15, 22, 28, 33, 40, 45, 50, 55, 58];

export function SGRBookingPage({ user, accessToken, onBack }: Props) {
  const [step, setStep] = useState<Step>('route');
  const [selectedRoute, setSelectedRoute] = useState(ROUTES[0]);
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [selectedSchedule, setSelectedSchedule] = useState<TrainSchedule | null>(null);
  const [selectedClass, setSelectedClass] = useState<TrainClass | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [pin, setPin] = useState('');
  const [processing, setProcessing] = useState(false);
  const [ticketRef, setTicketRef] = useState('');

  const toggleSeat = (n: number) => {
    if (TAKEN.includes(n)) return;
    setSelectedSeats(prev => prev.includes(n) ? prev.filter(s => s !== n) : prev.length < passengers ? [...prev, n] : prev);
  };

  const handlePay = async () => {
    if (!selectedSchedule || !selectedClass || pin.length !== 4) return;
    setProcessing(true);
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-69a10ee8/travel/sgr/book`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: selectedRoute.id, schedule: selectedSchedule.id, class: selectedClass.id, date, seats: selectedSeats, passengers, total: selectedClass.price * passengers, pin }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Imeshindwa kufanya booking. Jaribu tena.'); return; }
      setTicketRef(data.reference || `SGR-${Date.now().toString(36).toUpperCase()}`);
      setStep('confirmation');
    } catch { toast.error('Hitilafu ya mtandao. Angalia muunganisho wako.'); }
    finally { setProcessing(false); }
  };

  if (step === 'confirmation') return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <style>{`@keyframes tscale{0%{transform:scale(0);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}} @keyframes tslide{0%{transform:translateY(24px);opacity:0}100%{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ background: 'linear-gradient(180deg,rgba(248,113,113,0.12) 0%,transparent 60%)', padding: '60px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#991b1b,#f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'tscale 0.6s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 12px 50px rgba(248,113,113,0.5)' }}>
          <Check style={{ width: 44, height: 44, color: '#fff' }} />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: 6, animation: 'tslide 0.5s ease 0.2s both' }}>Tiketi ya SGR Imethibitishwa!</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', animation: 'tslide 0.5s ease 0.3s both' }}>QR code yako ya treni iko tayari</p>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(248,113,113,0.25)', animation: 'tslide 0.5s ease 0.4s both' }}>
          <div style={{ padding: '20px 20px 14px', background: 'linear-gradient(135deg,rgba(153,27,27,0.2),rgba(127,29,29,0.08))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(248,113,113,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Train style={{ width: 24, height: 24, color: ACCENT }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>Tanzania Railways Corporation</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{selectedSchedule?.name} · {selectedClass?.name}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <p style={{ fontSize: '26px', fontWeight: 900, color: '#fff' }}>{selectedSchedule?.departure}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{selectedRoute.from.split(' ')[0]}</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{selectedRoute.duration}</p>
                <div style={{ height: 2, background: 'rgba(248,113,113,0.3)', position: 'relative', borderRadius: 2 }}>
                  <Train style={{ position: 'absolute', right: 0, top: -7, width: 14, height: 14, color: ACCENT }} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '26px', fontWeight: 900, color: '#fff' }}>{selectedSchedule?.arrival}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{selectedRoute.to.split(' ')[0]}</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.03)' }}>
            {[['Tarehe', date], ['Darasa', selectedClass?.name ?? ''], ['Viti', selectedSeats.join(', ')], ['Abiria', `${passengers}`]].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 20px', background: 'rgba(0,0,0,0.25)', borderTop: '1px dashed rgba(248,113,113,0.25)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Nambari ya Tiketi</p>
            <p style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '3px', color: ACCENT, fontFamily: 'monospace' }}>{ticketRef}</p>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.15)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, background: '#fff', borderRadius: 12, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 60, height: 60, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2 }}>
                  {Array.from({ length: 36 }).map((_, i) => <div key={i} style={{ borderRadius: 1, background: (i % 7 === 0 || i % 5 === 2 || i < 6 || i > 29) ? '#000' : '#fff' }} />)}
                </div>
              </div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Scan QR Code</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <Shield style={{ width: 18, height: 18, color: ACCENT, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: ACCENT, marginBottom: 2 }}>📱 Tiketi imetumwa kwa SMS</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Onyesha QR code stesheni. Fika dakika 20 mapema.</p>
          </div>
        </div>

        <button onClick={onBack} style={{ width: '100%', height: 56, borderRadius: 18, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: '#fff', fontWeight: 900, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(22,163,74,0.4)' }}>
          Rudi Nyumbani
        </button>
      </div>
    </div>
  );

  if (step === 'payment') return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setStep('seat')} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>Thibitisha na Lipa</h1>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(248,113,113,0.2)' }}>
          <div style={{ padding: '16px', background: 'linear-gradient(135deg,rgba(153,27,27,0.2),rgba(127,29,29,0.06))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Train style={{ width: 20, height: 20, color: ACCENT }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{selectedSchedule?.name}</p>
                {selectedClass && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: 8, background: `${selectedClass.color}20`, color: selectedClass.color, fontWeight: 800 }}>{selectedClass.name}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{selectedSchedule?.departure}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{selectedRoute.from.split(' ')[0]}</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{selectedRoute.duration}</p>
                <div style={{ height: 1, background: 'rgba(248,113,113,0.3)', marginTop: 4 }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{selectedSchedule?.arrival}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{selectedRoute.to.split(' ')[0]}</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)' }}>
            {[['Njia', `${selectedRoute.from} → ${selectedRoute.to}`], ['Tarehe', date], ['Darasa', selectedClass?.name ?? ''], ['Viti', selectedSeats.join(', ')], ['Abiria', `${passengers}`]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>Jumla</span>
              <span style={{ fontSize: '22px', fontWeight: 900, color: ACCENT }}>{selectedClass ? fmt(selectedClass.price * passengers) : '–'}</span>
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>PIN ya Kuthibitisha</label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 56, height: 56, borderRadius: 16, background: pin.length > i ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)', border: `2px solid ${pin.length > i ? ACCENT : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: ACCENT, transition: 'all 0.2s' }}>
                {pin.length > i ? '●' : ''}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k) => (
              <button key={k} onClick={() => { if (k === '⌫') setPin(p => p.slice(0,-1)); else if (k && pin.length < 4) setPin(p => p + k); }}
                style={{ height: 52, borderRadius: 14, background: k === '⌫' ? 'rgba(239,68,68,0.12)' : k ? 'rgba(255,255,255,0.07)' : 'transparent', border: `1px solid ${k === '⌫' ? 'rgba(239,68,68,0.2)' : k ? 'rgba(255,255,255,0.1)' : 'transparent'}`, color: k === '⌫' ? '#f87171' : '#fff', fontSize: '18px', fontWeight: 800, cursor: k ? 'pointer' : 'default' }}>
                {k}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handlePay} disabled={processing || pin.length !== 4}
          style={{ width: '100%', height: 56, borderRadius: 18, background: pin.length === 4 ? 'linear-gradient(135deg,#991b1b,#7f1d1d)' : 'rgba(153,27,27,0.2)', border: 'none', color: pin.length === 4 ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '16px', cursor: pin.length !== 4 ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: pin.length === 4 ? '0 8px 30px rgba(153,27,27,0.5)' : 'none' }}>
          {processing ? 'Inashughulikia...' : selectedClass ? `Lipa ${fmt(selectedClass.price * passengers)}` : 'Lipa'}
        </button>
      </div>
    </div>
  );

  if (step === 'seat') return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 120 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <button onClick={() => { setStep('schedule'); setSelectedSeats([]); }} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
          </button>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>Chagua Viti</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{selectedClass?.name} · {selectedSeats.length}/{passengers} vimechaguliwa</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[{ bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', label: 'Inapatikana' }, { bg: '#991b1b', border: '#f87171', label: 'Umechagua' }, { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.08)', label: 'Imechukuliwa' }].map(({ bg, border, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 14, borderRadius: 4, background: bg, border: `1px solid ${border}` }} />
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, padding: '20px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>← Mbele ya Treni</span>
            </div>
            <Train style={{ width: 20, height: 20, color: ACCENT }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
            {Array.from({ length: TOTAL_SEATS }, (_, i) => {
              const n = i + 1;
              const taken = TAKEN.includes(n);
              const sel = selectedSeats.includes(n);
              const isAisle = (i % 5) === 2;
              return (
                <div key={n} style={{ position: 'relative' }}>
                  {isAisle ? (
                    <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.06)' }} />
                    </div>
                  ) : (
                    <button onClick={() => toggleSeat(n)} disabled={taken}
                      style={{ width: '100%', height: 36, borderRadius: 7, fontSize: '10px', fontWeight: 800, border: sel ? `2px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.07)', cursor: taken ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                        background: taken ? 'rgba(255,255,255,0.04)' : sel ? '#991b1b' : 'rgba(248,113,113,0.08)',
                        color: taken ? 'rgba(255,255,255,0.18)' : sel ? '#fff' : ACCENT }}>
                      {n}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '14px 16px', background: 'rgba(8,13,8,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Viti: {selectedSeats.join(', ') || '—'}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Jumla</p>
          </div>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{selectedClass ? fmt(selectedClass.price * passengers) : '–'}</span>
        </div>
        <button onClick={() => selectedSeats.length === passengers && setStep('payment')} disabled={selectedSeats.length !== passengers}
          style={{ width: '100%', height: 54, borderRadius: 18, background: selectedSeats.length === passengers ? 'linear-gradient(135deg,#991b1b,#7f1d1d)' : 'rgba(153,27,27,0.2)', border: 'none', color: selectedSeats.length === passengers ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '16px', cursor: selectedSeats.length !== passengers ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
          {selectedSeats.length === passengers ? 'Endelea Kulipa' : `Chagua viti ${passengers - selectedSeats.length} zaidi`}
        </button>
      </div>
    </div>
  );

  if (step === 'schedule') return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setStep('route')} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
        </button>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>{selectedRoute.from} → {selectedRoute.to}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{date} · {passengers} abiria · Chagua treni na darasa</p>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SCHEDULES.map(sch => (
          <div key={sch.id} style={{ borderRadius: 22, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ padding: '14px 16px', background: 'rgba(248,113,113,0.08)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Train style={{ width: 18, height: 18, color: ACCENT }} />
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>{sch.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{sch.departure}</span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>→</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{sch.arrival}</span>
              </div>
            </div>

            {sch.classes.map(cls => (
              <button key={cls.id} onClick={() => { setSelectedSchedule(sch); setSelectedClass(cls); setSelectedSeats([]); setStep('seat'); }}
                className="active:scale-[0.99] transition-transform"
                style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cls.color }} />
                    <span style={{ fontSize: '14px', fontWeight: 900, color: cls.color }}>{cls.name}</span>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 8, background: `${cls.color}18`, color: cls.color, fontWeight: 700 }}>{cls.seats} nafasi</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {cls.perks.slice(0, 3).map(p => <span key={p} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>· {p}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 12 }}>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{fmt(cls.price)}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>kwa mtu</p>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>SGR Express Train</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Tanzania Railways Corporation · Kisasa</p>
        </div>
      </div>

      <div style={{ position: 'relative', height: 180, background: 'linear-gradient(135deg,#1c0707 0%,#7f1d1d 50%,#991b1b 100%)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Train style={{ width: 52, height: 52, color: ACCENT, filter: 'drop-shadow(0 4px 16px rgba(248,113,113,0.6))' }} />
          <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>SGR – Uzoefu wa Kisasa</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {['WiFi', 'AC', 'Chakula', '250km/h'].map(tag => (
              <span key={tag} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: 12 }}>CHAGUA NJIA YA SAFARI</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ROUTES.map(r => (
              <button key={r.id} onClick={() => r.active && setSelectedRoute(r)} disabled={!r.active}
                style={{ padding: '16px', borderRadius: 18, background: selectedRoute.id === r.id ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedRoute.id === r.id ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.07)'}`, cursor: r.active ? 'pointer' : 'not-allowed', textAlign: 'left', opacity: r.active ? 1 : 0.45, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{r.fromCode}</span>
                      <ChevronRight style={{ width: 14, height: 14, color: ACCENT }} />
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{r.toCode}</span>
                    </div>
                    {selectedRoute.id === r.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT }} />}
                  </div>
                  {!r.active && <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>Hivi Karibuni</span>}
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{r.from} → {r.to}</p>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock style={{ width: 11, height: 11 }} />{r.duration}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{r.distance}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>TAREHE</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={darkInput} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>ABIRIA</label>
            <div style={{ display: 'flex', alignItems: 'center', height: 52, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '0 8px' }}>
              <button onClick={() => setPassengers(Math.max(1, passengers-1))} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>−</button>
              <span style={{ flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: 900, color: '#fff' }}>{passengers}</span>
              <button onClick={() => setPassengers(Math.min(9, passengers+1))} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        </div>

        <button onClick={() => date && setStep('schedule')} disabled={!date}
          style={{ width: '100%', height: 56, borderRadius: 18, background: date ? 'linear-gradient(135deg,#991b1b,#7f1d1d)' : 'rgba(153,27,27,0.2)', border: 'none', color: date ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '16px', cursor: !date ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: date ? '0 8px 30px rgba(153,27,27,0.5)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Train style={{ width: 18, height: 18 }} />Tazama Ratiba za Treni
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[{ Icon: Zap, label: 'Haraka', sub: 'Treni ya kisasa', color: ACCENT }, { Icon: Shield, label: 'Salama', sub: 'TANZARA certified', color: '#4ade80' }, { Icon: Star, label: 'Starehe', sub: 'Madaraja 3', color: '#fbbf24' }].map(({ Icon, label, sub, color }) => (
            <div key={label} style={{ padding: '14px 10px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <Icon style={{ width: 17, height: 17, color }} />
              </div>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#fff', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
