import { useState } from 'react';
import { toast } from 'sonner';
import { User } from '../App';
import {
  ArrowLeft, Ship, MapPin, Calendar, Users, Clock,
  Shield, Anchor, ChevronRight, Check, Car, Waves
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FerryBookingPageProps { user: User; accessToken: string; onBack: () => void; }

type Step = 'route' | 'ferry' | 'details' | 'payment' | 'confirmation';

interface FerryRoute { id: string; label: string; from: string; to: string; popular?: boolean; image: string; description: string; duration: string; }
interface FerrySchedule {
  id: string; operator: string; route: string; vessel: string;
  departureTime: string; arrivalTime: string; duration: string;
  price: { passenger: number; vehicle: number };
  capacity: number; amenities: string[]; image: string; available: boolean; badge?: string;
}

const ACCENT = '#22d3ee';

const ROUTES: FerryRoute[] = [
  { id: 'dar-zanzibar', label: 'Dar → Zanzibar', from: 'Dar es Salaam', to: 'Zanzibar Stone Town', popular: true, duration: '2h 30m', description: 'Safari maarufu zaidi baharini Tanzania', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { id: 'dar-pemba', label: 'Dar → Pemba', from: 'Dar es Salaam', to: 'Pemba Island', duration: '5h', description: 'Kisiwa cha matumbawe na utulivu', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { id: 'zanzibar-pemba', label: 'Zanzibar → Pemba', from: 'Zanzibar Stone Town', to: 'Pemba Island', duration: '3h', description: 'Visiwa vya pwani ya kaskazini', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { id: 'mwanza-ukerewe', label: 'Mwanza → Ukerewe', from: 'Mwanza', to: 'Ukerewe Island', duration: '2h', description: 'Kisiwa kikubwa zaidi Ziwa Victoria', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
];

const SCHEDULES: FerrySchedule[] = [
  { id: 'azam-001', operator: 'Azam Marine', route: 'dar-zanzibar', vessel: 'Azam Fast Ferry 1', departureTime: '07:00', arrivalTime: '09:30', duration: '2h 30m', price: { passenger: 35000, vehicle: 150000 }, capacity: 350, amenities: ['AC', 'Baa ya Chakula', 'TV', 'Bafuni'], image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', available: true, badge: 'Maarufu' },
  { id: 'azam-002', operator: 'Azam Marine', route: 'dar-zanzibar', vessel: 'Azam Fast Ferry 2', departureTime: '12:30', arrivalTime: '15:00', duration: '2h 30m', price: { passenger: 35000, vehicle: 150000 }, capacity: 350, amenities: ['AC', 'Baa ya Chakula', 'TV', 'Bafuni'], image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', available: true },
  { id: 'kili-001', operator: 'Kilimanjaro Fast Ferries', route: 'dar-zanzibar', vessel: 'Kilimanjaro VII', departureTime: '09:30', arrivalTime: '12:00', duration: '2h 30m', price: { passenger: 40000, vehicle: 180000 }, capacity: 400, amenities: ['VIP Lounge', 'AC', 'Mkahawa', 'TV', 'WiFi'], image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', available: true, badge: 'Premium' },
  { id: 'dar-pemba-001', operator: 'Coastal Fast Ferries', route: 'dar-pemba', vessel: 'Pemba Express', departureTime: '08:00', arrivalTime: '13:00', duration: '5h', price: { passenger: 55000, vehicle: 200000 }, capacity: 200, amenities: ['AC', 'Chakula', 'Bafuni'], image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', available: true },
  { id: 'znz-pemba-001', operator: 'Azam Marine', route: 'zanzibar-pemba', vessel: 'Zanzibar Express', departureTime: '10:00', arrivalTime: '13:00', duration: '3h', price: { passenger: 45000, vehicle: 170000 }, capacity: 250, amenities: ['AC', 'Baa ya Chakula', 'Bafuni'], image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', available: true },
  { id: 'mwanza-001', operator: 'Victoria Ferry Services', route: 'mwanza-ukerewe', vessel: 'MV Victoria', departureTime: '07:30', arrivalTime: '09:30', duration: '2h', price: { passenger: 15000, vehicle: 80000 }, capacity: 300, amenities: ['AC', 'Bafuni'], image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', available: true },
];

const STEPS: { id: Step; label: string }[] = [
  { id: 'route', label: 'Njia' }, { id: 'ferry', label: 'Meli' },
  { id: 'details', label: 'Maelezo' }, { id: 'payment', label: 'Lipa' },
];

const fmt = (n: number) => `TZS ${n.toLocaleString()}`;

const darkInput: React.CSSProperties = {
  width: '100%', height: 52, padding: '0 16px', borderRadius: 14,
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
};

function StepBar({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.id === current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '12px 16px 0' }}>
      {STEPS.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, transition: 'all 0.3s',
              background: i < idx ? ACCENT : i === idx ? ACCENT : 'rgba(255,255,255,0.1)',
              color: i <= idx ? '#000' : 'rgba(255,255,255,0.4)',
              boxShadow: i === idx ? `0 0 16px ${ACCENT}60` : 'none' }}>
              {i < idx ? <Check style={{ width: 14, height: 14 }} /> : i + 1}
            </div>
            <span style={{ fontSize: '9px', fontWeight: 700, color: i <= idx ? ACCENT : 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, margin: '0 4px', marginBottom: 16, background: i < idx ? ACCENT : 'rgba(255,255,255,0.1)', borderRadius: 2, transition: 'all 0.3s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function FerryBookingPage({ user, accessToken, onBack }: FerryBookingPageProps) {
  const [step, setStep] = useState<Step>('route');
  const [selectedRoute, setSelectedRoute] = useState<FerryRoute | null>(null);
  const [selectedFerry, setSelectedFerry] = useState<FerrySchedule | null>(null);
  const [travelDate, setTravelDate] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [hasVehicle, setHasVehicle] = useState(false);
  const [vehicleType, setVehicleType] = useState('Gari Dogo');
  const [pin, setPin] = useState('');
  const [processing, setProcessing] = useState(false);
  const [ticketRef, setTicketRef] = useState('');

  const schedules = SCHEDULES.filter(s => s.route === (selectedRoute?.id ?? ''));
  const total = selectedFerry ? selectedFerry.price.passenger * passengerCount + (hasVehicle ? selectedFerry.price.vehicle : 0) : 0;

  const handleBook = async () => {
    if (!selectedFerry || !travelDate || pin.length !== 4) return;
    setProcessing(true);
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-69a10ee8/travel/ferry/book`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ferryId: selectedFerry.id, operator: selectedFerry.operator, route: selectedFerry.route, from: selectedRoute?.from, to: selectedRoute?.to, departureTime: selectedFerry.departureTime, travelDate, passengers: passengerCount, hasVehicle, vehicleType: hasVehicle ? vehicleType : null, totalAmount: total, pin }),
      });
      const data = await res.json();
      if (res.ok) { setTicketRef(data.reference || `FRY-${Date.now().toString(36).toUpperCase()}`); setStep('confirmation'); setPin(''); }
      else toast.error(data.error || 'Imeshindwa kufanya booking. Jaribu tena.');
    } catch { toast.error('Hitilafu ya mtandao. Angalia muunganisho wako.'); }
    finally { setProcessing(false); }
  };

  if (step === 'confirmation') return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <style>{`@keyframes fscale{0%{transform:scale(0) rotate(-10deg);opacity:0}60%{transform:scale(1.1) rotate(2deg)}100%{transform:scale(1) rotate(0deg);opacity:1}} @keyframes fslide{0%{transform:translateY(30px);opacity:0}100%{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ background: `linear-gradient(180deg,${ACCENT}18 0%,transparent 60%)`, padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg,${ACCENT},#0ea5e9)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'fscale 0.6s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: `0 12px 50px ${ACCENT}50` }}>
          <Check style={{ width: 44, height: 44, color: '#000' }} />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: 6, animation: 'fslide 0.5s ease 0.2s both' }}>Tiketi Imethibitishwa!</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', animation: 'fslide 0.5s ease 0.3s both' }}>Tiketi yako ya boti iko tayari kutumika</p>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ borderRadius: 24, overflow: 'hidden', background: `linear-gradient(135deg,rgba(34,211,238,0.12),rgba(14,165,233,0.06))`, border: `1px solid ${ACCENT}30`, animation: 'fslide 0.5s ease 0.4s both' }}>
          <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${ACCENT}20` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: `${ACCENT}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ship style={{ width: 22, height: 22, color: ACCENT }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>{selectedFerry?.operator}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{selectedFerry?.vessel}</p>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: 20, background: `${ACCENT}20`, color: ACCENT, fontWeight: 800 }}>LIPA</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '26px', fontWeight: 900, color: '#fff' }}>{selectedFerry?.departureTime}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{selectedRoute?.from?.split(' ')[0]}</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{selectedFerry?.duration}</p>
                <div style={{ position: 'relative', height: 2, background: `${ACCENT}30` }}>
                  <Waves style={{ position: 'absolute', left: '50%', top: -8, transform: 'translateX(-50%)', width: 16, height: 16, color: ACCENT }} />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '26px', fontWeight: 900, color: '#fff' }}>{selectedFerry?.arrivalTime}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{selectedRoute?.to?.split(' ')[0]}</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '14px 20px' }}>
            {[['Tarehe', travelDate], ['Abiria', `${passengerCount}`], hasVehicle ? ['Gari', vehicleType] : null].filter(Boolean).map(([k,v]) => (
              <div key={k!} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 20px', background: 'rgba(0,0,0,0.2)', borderTop: `1px dashed ${ACCENT}25` }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Nambari ya Tiketi</p>
            <p style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '3px', color: ACCENT, fontFamily: 'monospace' }}>{ticketRef}</p>
          </div>
          <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, background: '#fff', borderRadius: 12, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 60, height: 60, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2 }}>
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} style={{ borderRadius: 1, background: (i % 7 === 0 || i % 5 === 2 || i < 6 || i > 29 || (i >= 12 && i <= 17)) ? '#000' : '#fff' }} />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Scan QR Code</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: 16, background: `${ACCENT}10`, border: `1px solid ${ACCENT}25`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield style={{ width: 18, height: 18, color: ACCENT, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: ACCENT, marginBottom: 2 }}>📱 Tiketi imetumwa kwa SMS</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Onyesha tiketi hii bandarini. Fika mapema dakika 30.</p>
          </div>
        </div>

        <button onClick={onBack} style={{ width: '100%', height: 54, borderRadius: 18, background: `linear-gradient(135deg,${ACCENT},#0ea5e9)`, border: 'none', color: '#000', fontWeight: 900, fontSize: '16px', cursor: 'pointer', boxShadow: `0 8px 30px ${ACCENT}40` }}>
          Rudi Nyumbani
        </button>
      </div>
    </div>
  );

  if (step === 'payment' && selectedFerry && selectedRoute) return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => setStep('details')} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>Thibitisha na Lipa</h1>
        </div>
        <StepBar current="payment" />
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${ACCENT}25` }}>
          <div style={{ padding: '16px', background: `linear-gradient(135deg,rgba(34,211,238,0.1),rgba(14,165,233,0.05))` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Ship style={{ width: 20, height: 20, color: ACCENT }} />
              <p style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>{selectedFerry.operator}</p>
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{selectedFerry.vessel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{selectedFerry.departureTime}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{selectedRoute.from.split(' ').slice(0,2).join(' ')}</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{selectedFerry.duration}</p>
                <div style={{ height: 1, background: `${ACCENT}40`, marginTop: 4 }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{selectedFerry.arrivalTime}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{selectedRoute.to.split(' ').slice(0,2).join(' ')}</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)' }}>
            {[
              ['Tarehe', travelDate],
              ['Abiria', `${passengerCount} x ${fmt(selectedFerry.price.passenger)}`],
              ...(hasVehicle ? [['Gari', `1 x ${fmt(selectedFerry.price.vehicle)}`]] : []),
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{k}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>Jumla</span>
              <span style={{ fontSize: '22px', fontWeight: 900, color: ACCENT }}>{fmt(total)}</span>
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>PIN ya Kuthibitisha Malipo</label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 56, height: 56, borderRadius: 16, background: pin.length > i ? `${ACCENT}20` : 'rgba(255,255,255,0.06)', border: `2px solid ${pin.length > i ? ACCENT : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: ACCENT, transition: 'all 0.2s' }}>
                {pin.length > i ? '●' : ''}
              </div>
            ))}
          </div>
          <input type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,''))} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} autoFocus />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k) => (
              <button key={k} onClick={() => { if (k === '⌫') setPin(p => p.slice(0,-1)); else if (k && pin.length < 4) setPin(p => p + k); }}
                style={{ height: 52, borderRadius: 14, background: k === '⌫' ? 'rgba(239,68,68,0.12)' : k ? 'rgba(255,255,255,0.07)' : 'transparent', border: `1px solid ${k === '⌫' ? 'rgba(239,68,68,0.2)' : k ? 'rgba(255,255,255,0.1)' : 'transparent'}`, color: k === '⌫' ? '#f87171' : '#fff', fontSize: '18px', fontWeight: 800, cursor: k ? 'pointer' : 'default' }}>
                {k}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleBook} disabled={processing || pin.length !== 4}
          style={{ width: '100%', height: 56, borderRadius: 18, background: pin.length === 4 ? `linear-gradient(135deg,${ACCENT},#0ea5e9)` : 'rgba(34,211,238,0.2)', border: 'none', color: pin.length === 4 ? '#000' : 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '16px', cursor: pin.length !== 4 ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: pin.length === 4 ? `0 8px 30px ${ACCENT}40` : 'none' }}>
          {processing ? 'Inashughulikia...' : `Lipa ${fmt(total)}`}
        </button>
      </div>
    </div>
  );

  if (step === 'details' && selectedFerry && selectedRoute) return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => setStep('ferry')} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>Maelezo ya Safari</h1>
        </div>
        <StepBar current="details" />
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ padding: '16px', borderRadius: 18, background: `${ACCENT}0e`, border: `1px solid ${ACCENT}25` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Ship style={{ width: 18, height: 18, color: ACCENT }} />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{selectedRoute.from} → {selectedRoute.to}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{selectedFerry.operator} · {selectedFerry.departureTime} – {selectedFerry.arrivalTime}</p>
            </div>
          </div>
        </div>

        {[
          { label: 'TAREHE YA SAFARI', el: <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={darkInput} /> },
          { label: 'IDADI YA ABIRIA', el: (
            <div style={{ display: 'flex', alignItems: 'center', height: 52, gap: 12 }}>
              <button onClick={() => setPassengerCount(Math.max(1, passengerCount-1))} style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>−</button>
              <span style={{ flex: 1, textAlign: 'center', fontSize: '24px', fontWeight: 900, color: '#fff' }}>{passengerCount}</span>
              <button onClick={() => setPassengerCount(Math.min(20, passengerCount+1))} style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>+</button>
            </div>
          )},
        ].map(({ label, el }) => (
          <div key={label}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</label>
            {el}
          </div>
        ))}

        <button onClick={() => setHasVehicle(!hasVehicle)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 16, background: hasVehicle ? `${ACCENT}12` : 'rgba(255,255,255,0.04)', border: `1px solid ${hasVehicle ? ACCENT+'40' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', transition: 'all 0.25s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Car style={{ width: 20, height: 20, color: hasVehicle ? ACCENT : 'rgba(255,255,255,0.5)' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Pamoja na Gari</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>Ongeza {fmt(selectedFerry.price.vehicle)} kwa gari</p>
            </div>
          </div>
          <div style={{ width: 44, height: 26, borderRadius: 13, background: hasVehicle ? ACCENT : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'all 0.25s' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: hasVehicle ? 21 : 3, transition: 'all 0.25s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
          </div>
        </button>

        {hasVehicle && (
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: 8 }}>AINA YA GARI</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['Gari Dogo', 'Pikap', 'Lori Ndogo', 'Basi'].map(v => (
                <button key={v} onClick={() => setVehicleType(v)}
                  style={{ padding: '12px', borderRadius: 12, background: vehicleType === v ? `${ACCENT}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${vehicleType === v ? ACCENT+'50' : 'rgba(255,255,255,0.08)'}`, color: vehicleType === v ? ACCENT : 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Abiria {passengerCount}x</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{fmt(selectedFerry.price.passenger * passengerCount)}</span>
          </div>
          {hasVehicle && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Gari</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{fmt(selectedFerry.price.vehicle)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>Jumla</span>
            <span style={{ fontSize: '22px', fontWeight: 900, color: ACCENT }}>{fmt(total)}</span>
          </div>
        </div>

        <button onClick={() => travelDate && setStep('payment')} disabled={!travelDate}
          style={{ width: '100%', height: 56, borderRadius: 18, background: travelDate ? `linear-gradient(135deg,${ACCENT},#0ea5e9)` : 'rgba(34,211,238,0.2)', border: 'none', color: travelDate ? '#000' : 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '16px', cursor: !travelDate ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}>
          Endelea Kulipa
        </button>
      </div>
    </div>
  );

  if (step === 'ferry' && selectedRoute) return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => setStep('route')} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
          </button>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>{selectedRoute.from} → {selectedRoute.to}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{schedules.length} meli zinapatikana</p>
          </div>
        </div>
        <StepBar current="ferry" />
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>
            <Ship style={{ width: 48, height: 48, margin: '0 auto 12px' }} />
            <p>Hakuna ratiba kwa njia hii kwa sasa</p>
          </div>
        ) : schedules.map(ferry => {
          const isPremium = ferry.badge === 'Premium';
          return (
            <button key={ferry.id} onClick={() => { setSelectedFerry(ferry); setStep('details'); }}
              className="active:scale-[0.98] transition-transform text-left"
              style={{ width: '100%', borderRadius: 22, overflow: 'hidden', background: isPremium ? `linear-gradient(160deg,rgba(34,211,238,0.12),rgba(14,165,233,0.06))` : 'rgba(255,255,255,0.04)', border: `1px solid ${isPremium ? ACCENT+'35' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', boxShadow: isPremium ? `0 4px 24px ${ACCENT}20` : 'none' }}>
              <div style={{ position: 'relative', height: 110 }}>
                <ImageWithFallback src={ferry.image} alt={ferry.operator} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,13,8,0.9) 0%, rgba(8,13,8,0.4) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Ship style={{ width: 16, height: 16, color: ACCENT }} />
                      <p style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>{ferry.operator}</p>
                      {ferry.badge && (
                        <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: 8, background: isPremium ? `${ACCENT}25` : 'rgba(251,191,36,0.2)', color: isPremium ? ACCENT : '#fbbf24', fontWeight: 800 }}>{ferry.badge}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{ferry.vessel} · {ferry.capacity} abiria</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{fmt(ferry.price.passenger)}</p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>kwa mtu</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{ferry.departureTime}</p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Kuondoka</p>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Clock style={{ width: 11, height: 11 }} />{ferry.duration}
                    </p>
                    <div style={{ height: 1, background: `${ACCENT}30`, marginTop: 4, position: 'relative' }}>
                      <Waves style={{ position: 'absolute', right: 0, top: -8, width: 14, height: 14, color: ACCENT }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{ferry.arrivalTime}</p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Kuwasili</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                  {ferry.amenities.map(a => <span key={a} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: 8, background: `${ACCENT}10`, color: ACCENT, fontWeight: 700 }}>{a}</span>)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${ACCENT}15` }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Gari: {fmt(ferry.price.vehicle)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: `linear-gradient(135deg,${ACCENT},#0ea5e9)` }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#000' }}>Chagua</span>
                    <ChevronRight style={{ width: 14, height: 14, color: '#000' }} />
                  </div>
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
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={onBack} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Meli za Baharini</h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Zanzibar · Pemba · Victoria · na zaidi</p>
          </div>
        </div>
        <StepBar current="route" />
      </div>

      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <ImageWithFallback src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Ocean" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,13,8,0.3) 0%, rgba(8,13,8,0.85) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Waves style={{ width: 20, height: 20, color: ACCENT }} />
            <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Safari ya Baharini</p>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>Azam Marine · Kilimanjaro Fast Ferries · Coastal Ferries</p>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[
            { Icon: Shield, label: 'Tiketi Rasmi', sub: 'Uthibitisho wa papo hapo', color: ACCENT },
            { Icon: Anchor, label: 'QR Offline', sub: 'Inafanya kazi bila mtandao', color: '#4ade80' },
          ].map(({ Icon, label, sub, color }) => (
            <div key={label} style={{ padding: '14px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon style={{ width: 18, height: 18, color }} />
              </div>
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#fff', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{sub}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Chagua Njia Yako</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ROUTES.map(route => (
            <button key={route.id} onClick={() => { setSelectedRoute(route); setStep('ferry'); }}
              className="active:scale-[0.98] transition-transform text-left"
              style={{ width: '100%', borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', position: 'relative' }}>
              <div style={{ position: 'relative', height: 90 }}>
                <ImageWithFallback src={route.image} alt={route.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,13,8,0.92) 0%, rgba(8,13,8,0.5) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <Anchor style={{ width: 14, height: 14, color: ACCENT }} />
                      <p style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>{route.label}</p>
                      {route.popular && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 8, background: `${ACCENT}25`, color: ACCENT, fontWeight: 800 }}>Maarufu</span>}
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{route.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <Clock style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.4)' }} />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginRight: 6 }}>{route.duration}</span>
                    <ChevronRight style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.3)' }} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
