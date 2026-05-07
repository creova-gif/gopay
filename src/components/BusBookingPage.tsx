import { useState } from 'react';
import { ArrowLeft, Bus, Search, Clock, MapPin, Check, Wifi, Shield, ChevronRight, ArrowRight, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';
import { User } from '../App';

interface Props { user: User; accessToken: string; onBack: () => void; }

const ACCENT = '#4ade80';

const CITIES = ['Dar es Salaam', 'Arusha', 'Moshi', 'Mwanza', 'Dodoma', 'Mbeya', 'Morogoro', 'Tanga', 'Iringa', 'Zanzibar'];

interface BusOperator {
  id: string; name: string; abbr: string; color: string; rating: number;
  departure: string; arrival: string; duration: string;
  price: number; seats: number; class: string;
  amenities: string[]; boardingPoint: string;
}

const OPERATORS: BusOperator[] = [
  { id: 'ke-001', name: 'Kilimanjaro Express', abbr: 'KE', color: '#22d3ee', rating: 4.7, departure: '06:30', arrival: '14:30', duration: '8h', price: 35000, seats: 14, class: 'VIP', amenities: ['WiFi', 'AC', 'Viti vya Kulala', 'USB'], boardingPoint: 'Ubungo Bus Terminal' },
  { id: 'de-001', name: 'Dar Express', abbr: 'DE', color: '#60a5fa', rating: 4.5, departure: '07:00', arrival: '15:30', duration: '8h 30m', price: 28000, seats: 22, class: 'Executive', amenities: ['AC', 'Viti vya Kulala', 'Burudani'], boardingPoint: 'Ubungo Bus Terminal' },
  { id: 'rc-001', name: 'Royal Coach', abbr: 'RC', color: '#fbbf24', rating: 4.6, departure: '08:00', arrival: '16:00', duration: '8h', price: 40000, seats: 8, class: 'VIP Plus', amenities: ['WiFi', 'AC', 'Chakula', 'Viti vya Kibinafsi'], boardingPoint: 'Msimbazi Terminal' },
  { id: 'sc-001', name: 'Scandinavian', abbr: 'SC', color: '#c084fc', rating: 4.4, departure: '09:30', arrival: '18:00', duration: '8h 30m', price: 22000, seats: 30, class: 'Standard', amenities: ['AC', 'Sanduku la Mizigo'], boardingPoint: 'Ubungo Bus Terminal' },
];

const CLASS_ACCENT: Record<string, string> = {
  'VIP': '#22d3ee', 'VIP Plus': '#fbbf24', 'Executive': '#60a5fa', 'Standard': '#4ade80',
};

type Step = 'search' | 'operators' | 'seats' | 'payment' | 'confirmation';

const fmt = (n: number) => `TZS ${n.toLocaleString()}`;

const darkInput: React.CSSProperties = {
  width: '100%', height: 52, padding: '0 16px', borderRadius: 14,
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
};

const TOTAL_SEATS = 40;
const TAKEN_SEATS = [1, 5, 7, 12, 15, 18, 22, 27, 30, 35];

export function BusBookingPage({ user, accessToken, onBack }: Props) {
  const [step, setStep] = useState<Step>('search');
  const [from, setFrom] = useState('Dar es Salaam');
  const [to, setTo] = useState('Arusha');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [selectedOp, setSelectedOp] = useState<BusOperator | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [pin, setPin] = useState('');
  const [processing, setProcessing] = useState(false);
  const [ticketRef, setTicketRef] = useState('');

  const toggleSeat = (n: number) => {
    if (TAKEN_SEATS.includes(n)) return;
    setSelectedSeats(prev => prev.includes(n) ? prev.filter(s => s !== n) : prev.length < passengers ? [...prev, n] : prev);
  };

  const handlePay = async () => {
    if (!selectedOp || pin.length !== 4) return;
    setProcessing(true);
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-69a10ee8/travel/bus/book`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator: selectedOp.name, from, to, date, seats: selectedSeats, passengers, total: selectedOp.price * passengers, pin }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Imeshindwa kufanya booking. Jaribu tena.'); return; }
      setTicketRef(data.reference || `BUS-${Date.now().toString(36).toUpperCase()}`);
      setStep('confirmation');
    } catch { toast.error('Hitilafu ya mtandao. Angalia muunganisho wako na ujaribu tena.'); }
    finally { setProcessing(false); }
  };

  if (step === 'confirmation') return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <style>{`@keyframes bscale{0%{transform:scale(0) rotate(-8deg);opacity:0}60%{transform:scale(1.12) rotate(2deg)}100%{transform:scale(1) rotate(0);opacity:1}} @keyframes bslide{0%{transform:translateY(24px);opacity:0}100%{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ background: 'linear-gradient(180deg,rgba(74,222,128,0.12) 0%,transparent 60%)', padding: '60px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'bscale 0.6s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 12px 50px rgba(74,222,128,0.5)' }}>
          <Check style={{ width: 44, height: 44, color: '#fff' }} />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: 6, animation: 'bslide 0.5s ease 0.2s both' }}>Tiketi ya Basi Imethibitishwa!</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', animation: 'bslide 0.5s ease 0.3s both' }}>Tiketi yako ya dijitali iko tayari kupanda basi</p>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(74,222,128,0.25)', animation: 'bslide 0.5s ease 0.4s both' }}>
          <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg,rgba(22,163,74,0.15),rgba(74,222,128,0.06))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: selectedOp ? `${selectedOp.color}22` : '#16a34a22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900, color: selectedOp?.color ?? ACCENT }}>
                {selectedOp?.abbr}
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>{selectedOp?.name}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{selectedOp?.class} · Viti: {selectedSeats.join(', ')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <p style={{ fontSize: '26px', fontWeight: 900, color: '#fff' }}>{selectedOp?.departure}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{from.split(' ')[0]}</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{selectedOp?.duration}</p>
                <div style={{ height: 1, background: 'rgba(74,222,128,0.3)', marginTop: 4, position: 'relative' }}>
                  <Bus style={{ position: 'absolute', right: 0, top: -8, width: 16, height: 16, color: ACCENT }} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '26px', fontWeight: 900, color: '#fff' }}>{selectedOp?.arrival}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{to.split(' ')[0]}</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.03)' }}>
            {[['Tarehe', date], ['Abiria', `${passengers}`], ['Viti', selectedSeats.join(', ')]].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px dashed rgba(74,222,128,0.25)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Nambari ya Tiketi</p>
            <p style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '3px', color: ACCENT, fontFamily: 'monospace' }}>{ticketRef}</p>
          </div>
          <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, background: '#fff', borderRadius: 12, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 60, height: 60, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2 }}>
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} style={{ borderRadius: 1, background: (i % 7 === 0 || i % 5 === 2 || i < 6 || i > 29) ? '#000' : '#fff' }} />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Scan QR Code</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <Shield style={{ width: 18, height: 18, color: ACCENT, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: ACCENT, marginBottom: 2 }}>📱 Tiketi imetumwa kwa SMS</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Onyesha tiketi hii gari. Fika mapema dakika 30 kabla ya kuondoka.</p>
          </div>
        </div>

        <button onClick={onBack} style={{ width: '100%', height: 56, borderRadius: 18, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: '#fff', fontWeight: 900, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(22,163,74,0.4)' }}>
          Rudi Nyumbani
        </button>
      </div>
    </div>
  );

  if (step === 'payment' && selectedOp) return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setStep('seats')} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>Thibitisha na Lipa</h1>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(74,222,128,0.2)' }}>
          <div style={{ padding: '16px', background: 'linear-gradient(135deg,rgba(22,163,74,0.12),rgba(74,222,128,0.05))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${selectedOp.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: selectedOp.color }}>
                {selectedOp.abbr}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{selectedOp.name}</p>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: 8, background: `${CLASS_ACCENT[selectedOp.class]}20`, color: CLASS_ACCENT[selectedOp.class], fontWeight: 800 }}>{selectedOp.class}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{selectedOp.departure}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{from.split(' ')[0]}</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{selectedOp.duration}</p>
                <div style={{ height: 1, background: 'rgba(74,222,128,0.3)', marginTop: 4 }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{selectedOp.arrival}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{to.split(' ')[0]}</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)' }}>
            {[['Tarehe', date], ['Abiria', passengers.toString()], ['Viti', selectedSeats.join(', ')], ['Kupanda', selectedOp.boardingPoint]].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>Jumla</span>
              <span style={{ fontSize: '22px', fontWeight: 900, color: ACCENT }}>{fmt(selectedOp.price * passengers)}</span>
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>PIN ya Kuthibitisha</label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 56, height: 56, borderRadius: 16, background: pin.length > i ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)', border: `2px solid ${pin.length > i ? ACCENT : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: ACCENT, transition: 'all 0.2s' }}>
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
          style={{ width: '100%', height: 56, borderRadius: 18, background: pin.length === 4 ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(22,163,74,0.2)', border: 'none', color: pin.length === 4 ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '16px', cursor: pin.length !== 4 ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: pin.length === 4 ? '0 8px 30px rgba(22,163,74,0.4)' : 'none' }}>
          {processing ? 'Inashughulikia...' : `Lipa ${fmt(selectedOp.price * passengers)}`}
        </button>
      </div>
    </div>
  );

  if (step === 'seats' && selectedOp) return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 120 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => { setStep('operators'); setSelectedSeats([]); }} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
          </button>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>Chagua Viti</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{selectedOp.name} · {selectedSeats.length}/{passengers} vimechaguliwa</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[{ bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.3)', label: 'Inapatikana' }, { bg: '#16a34a', border: '#4ade80', label: 'Umechagua' }, { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.1)', label: 'Imechukuliwa' }].map(({ bg, border, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: bg, border: `1px solid ${border}` }} />
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, padding: '20px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)' }}>
              <Bus style={{ width: 18, height: 18, color: ACCENT }} />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Mbele ya Basi →</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, maxWidth: 280, margin: '0 auto' }}>
            {Array.from({ length: TOTAL_SEATS }, (_, i) => {
              const n = i + 1;
              const taken = TAKEN_SEATS.includes(n);
              const sel = selectedSeats.includes(n);
              const isAisle = (i % 4) === 1;
              return (
                <div key={n} style={{ position: 'relative' }}>
                  {isAisle && <div style={{ position: 'absolute', right: -3, top: 0, bottom: 0, width: 6 }} />}
                  <button onClick={() => toggleSeat(n)} disabled={taken}
                    style={{ width: '100%', height: 40, borderRadius: 9, fontSize: '11px', fontWeight: 800, border: sel ? `2px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.08)', cursor: taken ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                      background: taken ? 'rgba(255,255,255,0.06)' : sel ? '#16a34a' : 'rgba(74,222,128,0.08)',
                      color: taken ? 'rgba(255,255,255,0.2)' : sel ? '#fff' : ACCENT }}>
                    {n}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin style={{ width: 14, height: 14, color: ACCENT }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Mahali pa kupanda: <strong style={{ color: '#fff' }}>{selectedOp.boardingPoint}</strong></span>
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '14px 16px', background: 'rgba(8,13,8,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Viti vilivyochaguliwa: {selectedSeats.join(', ') || '—'}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Jumla ya Malipo</p>
          </div>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{fmt(selectedOp.price * passengers)}</span>
        </div>
        <button onClick={() => selectedSeats.length === passengers && setStep('payment')} disabled={selectedSeats.length !== passengers}
          style={{ width: '100%', height: 54, borderRadius: 18, background: selectedSeats.length === passengers ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(22,163,74,0.2)', border: 'none', color: selectedSeats.length === passengers ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '16px', cursor: selectedSeats.length !== passengers ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
          {selectedSeats.length === passengers ? 'Endelea Kulipa' : `Chagua viti ${passengers - selectedSeats.length} zaidi`}
        </button>
      </div>
    </div>
  );

  if (step === 'operators') return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <button onClick={() => setStep('search')} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
          </button>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>{from} → {to}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{date} · {passengers} abiria · {OPERATORS.length} waendeshaji</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {OPERATORS.map(op => {
          const clsColor = CLASS_ACCENT[op.class] ?? ACCENT;
          return (
            <button key={op.id} onClick={() => { setSelectedOp(op); setSelectedSeats([]); setStep('seats'); }}
              className="active:scale-[0.98] transition-transform text-left"
              style={{ width: '100%', padding: '18px', borderRadius: 22, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${op.color}18`, border: `1px solid ${op.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900, color: op.color }}>
                    {op.abbr}
                  </div>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff', marginBottom: 4 }}>{op.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: 8, background: `${clsColor}18`, color: clsColor, fontWeight: 800 }}>{op.class}</span>
                      <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star style={{ width: 11, height: 11, fill: '#fbbf24' }} />{op.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{fmt(op.price)}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>kwa mtu</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, padding: '12px', borderRadius: 14, background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{op.departure}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{from.split(' ')[0]}</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <Clock style={{ width: 11, height: 11 }} />{op.duration}
                  </p>
                  <div style={{ height: 1, background: 'rgba(74,222,128,0.25)', margin: '4px 8px' }} />
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{op.arrival}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{to.split(' ')[0]}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                {op.amenities.map(a => <span key={a} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: 8, background: 'rgba(74,222,128,0.08)', color: ACCENT, fontWeight: 700 }}>{a}</span>)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Nafasi {op.seats} zimebaki</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>Chagua Kiti</span>
                  <ChevronRight style={{ width: 14, height: 14, color: '#fff' }} />
                </div>
              </div>
            </button>
          );
        })}
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
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Mabasi ya Starehe</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>VIP · Executive · Uhakika wa Safari</p>
        </div>
      </div>

      <div style={{ borderRadius: 22, overflow: 'hidden', height: 160, background: 'linear-gradient(135deg,#052e16 0%,#14532d 50%,#166534 100%)', position: 'relative', margin: '16px 16px 0' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Bus style={{ width: 52, height: 52, color: ACCENT, filter: 'drop-shadow(0 4px 16px rgba(74,222,128,0.5))' }} />
          <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Safari Salama Tanzania</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>Mabasi bora · WiFi · AC · Burudani</p>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: ACCENT, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>KUTOKA</label>
              <select value={from} onChange={e => setFrom(e.target.value)} style={darkInput}>
                {CITIES.map(c => <option key={c} value={c} style={{ background: '#0f1a0f' }}>{c}</option>)}
              </select>
            </div>
            <button onClick={() => { const t = from; setFrom(to); setTo(t); }} style={{ padding: '12px', borderRadius: 14, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', cursor: 'pointer', marginTop: 20, flexShrink: 0 }}>
              <ArrowRight style={{ width: 18, height: 18, color: ACCENT }} />
            </button>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: ACCENT, display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>KWENDA</label>
              <select value={to} onChange={e => setTo(e.target.value)} style={darkInput}>
                {CITIES.map(c => <option key={c} value={c} style={{ background: '#0f1a0f' }}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
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

          <button onClick={() => date && from !== to && setStep('operators')} disabled={!date || from === to}
            style={{ width: '100%', height: 56, borderRadius: 18, background: (!date || from === to) ? 'rgba(22,163,74,0.2)' : 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', color: (!date || from === to) ? 'rgba(255,255,255,0.3)' : '#fff', fontWeight: 900, fontSize: '16px', cursor: (!date || from === to) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.3s', boxShadow: (!date || from === to) ? 'none' : '0 8px 30px rgba(22,163,74,0.4)' }}>
            <Search style={{ width: 18, height: 18 }} />Tafuta Mabasi
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { Icon: Shield, label: 'Tiketi Rasmi', color: ACCENT },
            { Icon: Wifi, label: 'WiFi Basi', color: '#60a5fa' },
            { Icon: Zap, label: 'Uthibitisho', color: '#fbbf24' },
          ].map(({ Icon, label, color }) => (
            <div key={label} style={{ padding: '14px 10px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <Icon style={{ width: 18, height: 18, color }} />
              </div>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
