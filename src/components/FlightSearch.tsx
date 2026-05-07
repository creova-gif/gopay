import { useState } from 'react';
import { ArrowLeft, Plane, Search, ArrowRight, Clock, Shield, Zap, Users, Calendar, ChevronDown, Check } from 'lucide-react';
import { FlightBookingPage } from './FlightBookingPage';

interface Props { accessToken: string; onBack: () => void; }
interface Flight {
  id: string; airline: string; from: string; to: string;
  departure: string; arrival: string; duration: string;
  price: number; seats: number; aircraftType: string;
}

const ACCENT = '#60a5fa';

const TZ_AIRPORTS = [
  { code: 'DAR', name: 'Dar es Salaam', full: 'Julius Nyerere International' },
  { code: 'ZNZ', name: 'Zanzibar', full: 'Abeid Amani Karume International' },
  { code: 'JRO', name: 'Kilimanjaro', full: 'Kilimanjaro International' },
  { code: 'MWZ', name: 'Mwanza', full: 'Mwanza Airport' },
  { code: 'ARK', name: 'Arusha', full: 'Arusha Airport' },
  { code: 'DOD', name: 'Dodoma', full: 'Dodoma Airport' },
  { code: 'MBI', name: 'Mbeya', full: 'Songwe Airport' },
];

const AIRLINES: Record<string, { color: string; logo: string }> = {
  'Precision Air': { color: '#ef4444', logo: 'PW' },
  'Air Tanzania': { color: '#1d4ed8', logo: 'TC' },
  'Safari Air Link': { color: '#16a34a', logo: 'SA' },
};

const SAMPLE_FLIGHTS: Flight[] = [
  { id: 'PW101', airline: 'Precision Air', from: 'DAR', to: 'ZNZ', departure: '07:00', arrival: '07:40', duration: '40m', price: 155000, seats: 24, aircraftType: 'ATR 72' },
  { id: 'TC201', airline: 'Air Tanzania', from: 'DAR', to: 'ZNZ', departure: '09:30', arrival: '10:10', duration: '40m', price: 170000, seats: 12, aircraftType: 'Bombardier Q400' },
  { id: 'PW103', airline: 'Precision Air', from: 'DAR', to: 'ZNZ', departure: '12:00', arrival: '12:40', duration: '40m', price: 145000, seats: 8, aircraftType: 'ATR 72' },
  { id: 'PW201', airline: 'Precision Air', from: 'DAR', to: 'JRO', departure: '06:30', arrival: '07:45', duration: '1h 15m', price: 285000, seats: 18, aircraftType: 'ATR 72' },
  { id: 'TC301', airline: 'Air Tanzania', from: 'DAR', to: 'JRO', departure: '10:00', arrival: '11:15', duration: '1h 15m', price: 310000, seats: 22, aircraftType: 'Bombardier Q400' },
  { id: 'PW301', airline: 'Precision Air', from: 'DAR', to: 'MWZ', departure: '08:00', arrival: '09:30', duration: '1h 30m', price: 340000, seats: 15, aircraftType: 'ATR 72' },
  { id: 'SA401', airline: 'Safari Air Link', from: 'JRO', to: 'DAR', departure: '13:00', arrival: '14:15', duration: '1h 15m', price: 275000, seats: 9, aircraftType: 'Cessna Caravan' },
  { id: 'PW401', airline: 'Precision Air', from: 'ZNZ', to: 'DAR', departure: '08:30', arrival: '09:10', duration: '40m', price: 150000, seats: 20, aircraftType: 'ATR 72' },
];

const fmt = (n: number) => `TZS ${n.toLocaleString()}`;

const darkInput: React.CSSProperties = {
  width: '100%', height: 52, padding: '0 16px', borderRadius: 14,
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
};

type SortMode = 'cheap' | 'fast' | 'best';

export function FlightSearch({ accessToken, onBack }: Props) {
  const [step, setStep] = useState<'search' | 'results' | 'booking'>('search');
  const [fromCode, setFromCode] = useState('DAR');
  const [toCode, setToCode] = useState('ZNZ');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [results, setResults] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('cheap');

  const fromAirport = TZ_AIRPORTS.find(a => a.code === fromCode)!;
  const toAirport = TZ_AIRPORTS.find(a => a.code === toCode)!;

  const search = () => {
    const matches = SAMPLE_FLIGHTS.filter(f => f.from === fromCode && f.to === toCode);
    setResults(matches.length > 0 ? matches : SAMPLE_FLIGHTS.filter(f => f.from === fromCode).slice(0, 3));
    setStep('results');
  };

  const swap = () => { const t = fromCode; setFromCode(toCode); setToCode(t); };

  const sorted = [...results].sort((a, b) => {
    if (sortMode === 'cheap') return a.price - b.price;
    if (sortMode === 'fast') return a.duration.localeCompare(b.duration);
    return b.seats - a.seats;
  });

  if (step === 'booking' && selectedFlight) {
    return <FlightBookingPage flight={selectedFlight} passengers={passengers} departDate={date} accessToken={accessToken} onBack={() => setStep('results')} onBookingComplete={onBack} />;
  }

  if (step === 'results') return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => setStep('search')} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{fromCode}</span>
              <Plane style={{ width: 16, height: 16, color: ACCENT, transform: 'rotate(90deg)' }} />
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{toCode}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{date} · {passengers} abiria · Moja kwa Moja</p>
          </div>
          <div style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 10, background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: ACCENT }}>{results.length} ndege</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {([['cheap', 'Bei Nafuu'], ['fast', 'Haraka'], ['best', 'Nafasi']] as [SortMode, string][]).map(([mode, label]) => (
            <button key={mode} onClick={() => setSortMode(mode)}
              style={{ flex: 1, height: 34, borderRadius: 10, background: sortMode === mode ? ACCENT : 'rgba(255,255,255,0.06)', border: `1px solid ${sortMode === mode ? ACCENT : 'rgba(255,255,255,0.1)'}`, color: sortMode === mode ? '#000' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map((fl, idx) => {
          const airline = AIRLINES[fl.airline] ?? { color: ACCENT, logo: '✈' };
          const isCheapest = idx === 0 && sortMode === 'cheap';
          return (
            <button key={fl.id} onClick={() => { setSelectedFlight(fl); setStep('booking'); }}
              className="active:scale-[0.98] transition-transform text-left"
              style={{ width: '100%', borderRadius: 22, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: `1px solid ${isCheapest ? ACCENT+'35' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', boxShadow: isCheapest ? `0 4px 24px ${ACCENT}18` : 'none' }}>
              <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: `${airline.color}22`, border: `1px solid ${airline.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: airline.color }}>
                      {airline.logo}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>{fl.airline}</p>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{fl.aircraftType} · {fl.id}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{fmt(fl.price)}</p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>kwa mtu · {fmt(fl.price * passengers)} jumla</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'center', minWidth: 60 }}>
                    <p style={{ fontSize: '28px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{fl.departure}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{fl.from}</p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock style={{ width: 10, height: 10 }} />{fl.duration}
                    </span>
                    <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.12)', position: 'relative' }}>
                      <div style={{ position: 'absolute', right: -2, top: -7, width: 16, height: 16, borderRadius: '50%', background: `${ACCENT}20`, border: `1px solid ${ACCENT}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plane style={{ width: 10, height: 10, color: ACCENT }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 700 }}>Moja kwa Moja</span>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 60 }}>
                    <p style={{ fontSize: '28px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{fl.arrival}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{fl.to}</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: 8, background: fl.seats < 10 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)', color: fl.seats < 10 ? '#f87171' : 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                    {fl.seats} nafasi
                  </span>
                  {isCheapest && <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: 8, background: `${ACCENT}15`, color: ACCENT, fontWeight: 700 }}>Bei Nafuu Zaidi</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: `linear-gradient(135deg,${ACCENT},#3b82f6)` }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff' }}>Chagua</span>
                  <ArrowRight style={{ width: 13, height: 13, color: '#fff' }} />
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
      <style>{`@keyframes fplane{0%{left:10%}100%{left:85%}} .fplane-anim{animation:fplane 3s ease-in-out infinite alternate}`}</style>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Ndege za Ndani</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Njia 40+ · Uthibitisho wa Papo Hapo</p>
        </div>
      </div>

      <div style={{ position: 'relative', height: 180, background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#1d4ed8 100%)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{fromCode}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{fromAirport.name}</p>
            </div>
            <div style={{ flex: 1, maxWidth: 120, position: 'relative', height: 40, display: 'flex', alignItems: 'center' }}>
              <svg viewBox="0 0 120 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <path d="M 5 35 Q 60 5 115 35" stroke="rgba(96,165,250,0.5)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                <circle cx="5" cy="35" r="3" fill={ACCENT} />
                <circle cx="115" cy="35" r="3" fill={ACCENT} />
              </svg>
              <div style={{ position: 'absolute', top: 2, left: '45%', transform: 'translateX(-50%)' }}>
                <Plane style={{ width: 18, height: 18, color: '#fff', filter: 'drop-shadow(0 2px 8px rgba(96,165,250,0.8))' }} />
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{toCode}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{toAirport.name}</p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Precision Air · Air Tanzania · Safari Air Link</p>
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, padding: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: 14 }}>SAFARI YAKO</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: ACCENT, marginBottom: 6 }}>KUTOKA</label>
              <div style={{ position: 'relative' }}>
                <select value={fromCode} onChange={e => setFromCode(e.target.value)} style={{ ...darkInput, paddingLeft: 40 }}>
                  {TZ_AIRPORTS.map(a => <option key={a.code} value={a.code} style={{ background: '#0f1a0f' }}>{a.code} – {a.name}</option>)}
                </select>
                <Plane style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: ACCENT }} />
              </div>
            </div>
            <button onClick={swap} style={{ padding: '12px', borderRadius: 14, background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, cursor: 'pointer', marginTop: 18, flexShrink: 0 }}>
              <ArrowRight style={{ width: 18, height: 18, color: ACCENT }} />
            </button>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: ACCENT, marginBottom: 6 }}>KWENDA</label>
              <div style={{ position: 'relative' }}>
                <select value={toCode} onChange={e => setToCode(e.target.value)} style={{ ...darkInput, paddingLeft: 40 }}>
                  {TZ_AIRPORTS.map(a => <option key={a.code} value={a.code} style={{ background: '#0f1a0f' }}>{a.code} – {a.name}</option>)}
                </select>
                <Plane style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%) rotate(90deg)', width: 16, height: 16, color: 'rgba(255,255,255,0.4)' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                <Calendar style={{ width: 12, height: 12 }} />TAREHE
              </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={darkInput} />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                <Users style={{ width: 12, height: 12 }} />ABIRIA
              </label>
              <div style={{ display: 'flex', alignItems: 'center', height: 52, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '0 8px', gap: 4 }}>
                <button onClick={() => setPassengers(Math.max(1, passengers - 1))} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>−</button>
                <span style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 900, color: '#fff' }}>{passengers}</span>
                <button onClick={() => setPassengers(Math.min(9, passengers + 1))} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>+</button>
              </div>
            </div>
          </div>

          <button onClick={search} disabled={!date || fromCode === toCode}
            style={{ width: '100%', height: 56, borderRadius: 18, background: (!date || fromCode === toCode) ? `${ACCENT}20` : `linear-gradient(135deg,${ACCENT},#3b82f6)`, border: 'none', color: (!date || fromCode === toCode) ? 'rgba(255,255,255,0.3)' : '#fff', fontWeight: 900, fontSize: '16px', cursor: (!date || fromCode === toCode) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.3s', boxShadow: (!date || fromCode === toCode) ? 'none' : `0 8px 30px ${ACCENT}40` }}>
            <Search style={{ width: 18, height: 18 }} />Tafuta Ndege
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { Icon: Shield, label: 'Salama & Imara', sub: 'Malipo yaliyolindwa', color: '#4ade80' },
            { Icon: Zap, label: 'Papo Hapo', sub: 'Tiketi mara moja', color: ACCENT },
            { Icon: Check, label: 'Ndani ya TZ', sub: 'Njia za ndani tu', color: '#fbbf24' },
          ].map(({ Icon, label, sub, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <Icon style={{ width: 18, height: 18, color }} />
              </div>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#fff', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
            </div>
          ))}
        </div>

        <div style={{ borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ padding: '14px 16px 10px', fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>NJIA MAARUFU</p>
          {[
            { from: 'DAR', to: 'ZNZ', label: 'Dar → Zanzibar', price: 'Kuanzia TZS 145,000', tag: 'Maarufu' },
            { from: 'DAR', to: 'JRO', label: 'Dar → Kilimanjaro', price: 'Kuanzia TZS 285,000', tag: 'Safari' },
            { from: 'DAR', to: 'MWZ', label: 'Dar → Mwanza', price: 'Kuanzia TZS 340,000', tag: 'Kaskazini' },
          ].map(route => (
            <button key={route.from + route.to} onClick={() => { setFromCode(route.from); setToCode(route.to); }}
              style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Plane style={{ width: 14, height: 14, color: ACCENT }} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{route.label}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{route.price}</p>
                </div>
              </div>
              <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: 8, background: `${ACCENT}15`, color: ACCENT, fontWeight: 700 }}>{route.tag}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
