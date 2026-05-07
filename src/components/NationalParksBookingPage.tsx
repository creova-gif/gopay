import { useState } from 'react';
import { ArrowLeft, Mountain, Check, Shield, Star, MapPin, Clock, ChevronRight, Sparkles, Trees, Camera, Binoculars } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { User } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface Props { user: User; accessToken: string; onBack: () => void; }

const ACCENT = '#34d399';

interface Package { id: string; name: string; price: number; duration: string; includes: string[]; badge?: string; }
interface Park {
  id: string; name: string; region: string; image: string;
  entryFee: { resident: number; nonResident: number };
  rating: number; highlights: string[]; category: string; color: string;
  packages: Package[];
}

const CAT_COLORS: Record<string, string> = {
  'UNESCO': '#fbbf24', 'Wildlife': '#34d399', 'Forest': '#4ade80', 'Mountain': '#60a5fa',
};

const PARKS: Park[] = [
  { id: 'serengeti', name: 'Serengeti', region: 'Mara Region', rating: 4.9, category: 'UNESCO', color: '#fbbf24',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    entryFee: { resident: 5000, nonResident: 70 },
    highlights: ['Uhamiaji Mkubwa', 'Big Five', 'Puto ya Hewa'],
    packages: [
      { id: 'ser-day', name: 'Siku Moja ya Safari', price: 280000, duration: '1 siku', includes: ['Mwongozo', 'Gari 4x4', 'Chakula cha mchana', 'Leseni ya TANAPA'], badge: 'Maarufu' },
      { id: 'ser-2d', name: 'Usiku 1 / Siku 2', price: 580000, duration: '2 siku', includes: ['Mwongozo', 'Gari', 'Chakula cha mchana 2x', 'Leseni', 'Kambi ya usiku'] },
      { id: 'ser-3d', name: 'Uzoefu Kamili', price: 950000, duration: '3 siku', includes: ['Gari la kibinafsi', 'Mwongozo mtaalamu', 'Chakula 3x', 'Hoteli/Kambi', 'Leseni'], badge: 'Premium' },
    ],
  },
  { id: 'ngorongoro', name: 'Ngorongoro', region: 'Arusha Region', rating: 4.8, category: 'UNESCO', color: '#fbbf24',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    entryFee: { resident: 5000, nonResident: 70 },
    highlights: ['Crater Safari', 'Big Five', 'Utamaduni wa Maasai'],
    packages: [
      { id: 'ngo-day', name: 'Crater Safari', price: 310000, duration: '1 siku', includes: ['Mwongozo', 'Gari 4x4', 'Chakula', 'Leseni'], badge: 'Kipekee' },
      { id: 'ngo-2d', name: 'Crater + Rim', price: 620000, duration: '2 siku', includes: ['Gari', 'Mwongozo', 'Chakula 2x', 'Hoteli'] },
    ],
  },
  { id: 'kilimanjaro', name: 'Kilimanjaro NP', region: 'Kilimanjaro Region', rating: 4.7, category: 'Mountain', color: '#60a5fa',
    image: 'https://images.unsplash.com/photo-1650668302197-7f556c34cb91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    entryFee: { resident: 5000, nonResident: 70 },
    highlights: ['Kilele cha Uhuru', 'Milima ya Volcanic', 'Mazingira ya kipekee'],
    packages: [
      { id: 'kili-day', name: 'Ziara ya Siku', price: 180000, duration: '1 siku', includes: ['Mwongozo', 'Leseni', 'Chakula kidogo'] },
      { id: 'kili-5d', name: 'Njia ya Marangu 5 Siku', price: 2800000, duration: '5 siku', includes: ['Mwongozo', 'Vibeba', 'Chakula 3x', 'Kambi', 'Leseni', 'Gari'], badge: 'Usafiri' },
    ],
  },
  { id: 'tarangire', name: 'Tarangire NP', region: 'Manyara Region', rating: 4.6, category: 'Wildlife', color: '#34d399',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    entryFee: { resident: 3500, nonResident: 50 },
    highlights: ['Makundi ya Tembo', 'Miti ya Baobab', 'Ndege wa Aina Nyingi'],
    packages: [
      { id: 'tar-day', name: 'Safari ya Siku Moja', price: 220000, duration: '1 siku', includes: ['Mwongozo', 'Gari 4x4', 'Chakula', 'Leseni'], badge: 'Bora' },
    ],
  },
  { id: 'zanzibar', name: 'Jozani Forest', region: 'Zanzibar', rating: 4.5, category: 'Forest', color: '#4ade80',
    image: 'https://images.unsplash.com/photo-1707296450219-2d9cc08bdef0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    entryFee: { resident: 3000, nonResident: 10 },
    highlights: ['Kima Mwekundu', 'Mikoko', 'Matembezi ya Asili'],
    packages: [
      { id: 'joz-tour', name: 'Ziara ya Msitu', price: 45000, duration: '2-3 masaa', includes: ['Mwongozo', 'Leseni', 'Matembezi'], badge: 'Bei Nafuu' },
    ],
  },
];

const CATEGORIES = ['Zote', 'UNESCO', 'Wildlife', 'Mountain', 'Forest'];

const fmt = (n: number) => `TZS ${n.toLocaleString()}`;

const darkInput: React.CSSProperties = {
  width: '100%', height: 52, padding: '0 16px', borderRadius: 14,
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
};

type Step = 'browse' | 'detail' | 'package' | 'details' | 'payment' | 'confirmation';

export function NationalParksBookingPage({ user, accessToken, onBack }: Props) {
  const [step, setStep] = useState<Step>('browse');
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [visitDate, setVisitDate] = useState('');
  const [visitors, setVisitors] = useState(1);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [nationality, setNationality] = useState('Mtanzania');
  const [pin, setPin] = useState('');
  const [processing, setProcessing] = useState(false);
  const [permitRef, setPermitRef] = useState('');
  const [catFilter, setCatFilter] = useState('Zote');

  const filteredParks = catFilter === 'Zote' ? PARKS : PARKS.filter(p => p.category === catFilter);
  const total = selectedPkg ? selectedPkg.price * visitors : 0;

  const handlePay = async () => {
    if (!selectedPark || !selectedPkg || pin.length !== 4) return;
    setProcessing(true);
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-69a10ee8/travel/parks/book`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ park: selectedPark.id, package: selectedPkg.id, date: visitDate, visitors, visitorName, visitorPhone, nationality, total, pin }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Imeshindwa kufanya booking. Jaribu tena.'); return; }
      setPermitRef(data.reference || `TANAPA-${Date.now().toString(36).toUpperCase()}`);
      setStep('confirmation');
    } catch { toast.error('Hitilafu ya mtandao. Angalia muunganisho wako.'); }
    finally { setProcessing(false); }
  };

  if (step === 'confirmation') return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <style>{`@keyframes pscale{0%{transform:scale(0);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}} @keyframes pslide{0%{transform:translateY(24px);opacity:0}100%{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ background: 'linear-gradient(180deg,rgba(52,211,153,0.14) 0%,transparent 60%)', padding: '60px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#047857,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'pscale 0.6s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 12px 50px rgba(52,211,153,0.5)' }}>
          <Check style={{ width: 44, height: 44, color: '#fff' }} />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: 6, animation: 'pslide 0.5s ease 0.2s both' }}>Kibali Chako Kimethibitishwa!</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', animation: 'pslide 0.5s ease 0.3s both' }}>Ruhusa rasmi ya TANAPA imeandaliwa</p>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(52,211,153,0.25)', animation: 'pslide 0.5s ease 0.4s both' }}>
          <div style={{ position: 'relative', height: 140 }}>
            {selectedPark && <ImageWithFallback src={selectedPark.image} alt={selectedPark.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,13,8,0.2) 0%, rgba(8,13,8,0.85) 100%)' }} />
            <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
              <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{selectedPark?.name}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{selectedPkg?.name} · {selectedPkg?.duration}</p>
            </div>
          </div>
          <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.03)' }}>
            {[['Tarehe', visitDate], ['Wageni', `${visitors}`], ['Jina', visitorName], ['Utaifa', nationality]].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px dashed rgba(52,211,153,0.25)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Nambari ya Kibali</p>
            <p style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '2px', color: ACCENT, fontFamily: 'monospace' }}>{permitRef}</p>
          </div>
          <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, background: '#fff', borderRadius: 12, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 60, height: 60, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2 }}>
                  {Array.from({ length: 36 }).map((_, i) => <div key={i} style={{ borderRadius: 1, background: (i % 7 === 0 || i % 5 === 2 || i < 6 || i > 29) ? '#000' : '#fff' }} />)}
                </div>
              </div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Kibali cha TANAPA · Scan</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <Shield style={{ width: 18, height: 18, color: ACCENT, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: ACCENT, marginBottom: 2 }}>📱 Kibali kimetumwa kwa SMS</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Onyesha kibali hiki langoni. Furahia safari yako!</p>
          </div>
        </div>

        <button onClick={onBack} style={{ width: '100%', height: 56, borderRadius: 18, background: 'linear-gradient(135deg,#047857,#065f46)', border: 'none', color: '#fff', fontWeight: 900, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(4,120,87,0.4)' }}>
          Rudi Nyumbani
        </button>
      </div>
    </div>
  );

  if (step === 'payment') return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setStep('details')} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>Thibitisha na Lipa</h1>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(52,211,153,0.2)' }}>
          <div style={{ padding: '16px', background: 'linear-gradient(135deg,rgba(4,120,87,0.15),rgba(6,95,70,0.06))' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <Mountain style={{ width: 20, height: 20, color: ACCENT, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>{selectedPark?.name}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{selectedPkg?.name} · {selectedPkg?.duration}</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)' }}>
            {[['Tarehe', visitDate], ['Wageni', `${visitors}`], ['Jina', visitorName], ['Utaifa', nationality]].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{k}</span>
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
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>PIN ya Kuthibitisha</label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 56, height: 56, borderRadius: 16, background: pin.length > i ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)', border: `2px solid ${pin.length > i ? ACCENT : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: ACCENT, transition: 'all 0.2s' }}>
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
          style={{ width: '100%', height: 56, borderRadius: 18, background: pin.length === 4 ? 'linear-gradient(135deg,#047857,#065f46)' : 'rgba(4,120,87,0.2)', border: 'none', color: pin.length === 4 ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '16px', cursor: pin.length !== 4 ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: pin.length === 4 ? '0 8px 30px rgba(4,120,87,0.4)' : 'none' }}>
          {processing ? 'Inashughulikia...' : `Lipa ${fmt(total)}`}
        </button>
      </div>
    </div>
  );

  if (step === 'details') return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setStep('detail')} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>Maelezo ya Wageni</h1>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ padding: '14px 16px', borderRadius: 16, background: `${ACCENT}0d`, border: `1px solid ${ACCENT}25` }}>
          <p style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{selectedPark?.name} · {selectedPkg?.name}</p>
          <p style={{ fontSize: '13px', fontWeight: 800, color: ACCENT }}>{selectedPkg ? fmt(selectedPkg.price) : ''} kwa mtu</p>
        </div>

        {[
          { label: 'TAREHE YA ZIARA', el: <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={darkInput} /> },
          { label: 'IDADI YA WAGENI', el: (
            <div style={{ display: 'flex', alignItems: 'center', height: 52, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '0 8px', gap: 4 }}>
              <button onClick={() => setVisitors(Math.max(1, visitors-1))} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>−</button>
              <span style={{ flex: 1, textAlign: 'center', fontSize: '22px', fontWeight: 900, color: '#fff' }}>{visitors}</span>
              <button onClick={() => setVisitors(Math.min(20, visitors+1))} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>+</button>
            </div>
          )},
          { label: 'JINA KAMILI', el: <input type="text" value={visitorName} onChange={e => setVisitorName(e.target.value)} placeholder="Jina la mtembeaji mkuu" style={darkInput} /> },
          { label: 'NAMBARI YA SIMU', el: <input type="tel" value={visitorPhone} onChange={e => setVisitorPhone(e.target.value)} placeholder="+255 XXX XXX XXX" style={darkInput} /> },
          { label: 'UTAIFA', el: (
            <select value={nationality} onChange={e => setNationality(e.target.value)} style={darkInput}>
              <option value="Mtanzania" style={{ background: '#0f1a0f' }}>Mtanzania (Bei ya Raia)</option>
              <option value="Mwafrika" style={{ background: '#0f1a0f' }}>Mwafrika Mwingine</option>
              <option value="Mgeni" style={{ background: '#0f1a0f' }}>Mgeni wa Kimataifa (USD)</option>
            </select>
          )},
        ].map(({ label, el }) => (
          <div key={label}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</label>
            {el}
          </div>
        ))}

        <div style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Wageni {visitors}x</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{fmt(total)}</span>
          </div>
        </div>

        <button onClick={() => visitDate && visitorName && visitorPhone && setStep('payment')} disabled={!visitDate || !visitorName || !visitorPhone}
          style={{ width: '100%', height: 56, borderRadius: 18, background: visitDate && visitorName && visitorPhone ? 'linear-gradient(135deg,#047857,#065f46)' : 'rgba(4,120,87,0.2)', border: 'none', color: visitDate && visitorName && visitorPhone ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '16px', cursor: !visitDate || !visitorName || !visitorPhone ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}>
          Endelea Kulipa
        </button>
      </div>
    </div>
  );

  if (step === 'detail' && selectedPark) return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div style={{ position: 'relative', height: 300 }}>
        <ImageWithFallback src={selectedPark.image} alt={selectedPark.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,13,8,0.3) 0%, rgba(8,13,8,0.95) 100%)' }} />
        <div style={{ position: 'absolute', top: 16, left: 16 }}>
          <button onClick={() => setStep('browse')} style={{ padding: 10, borderRadius: '50%', background: 'rgba(8,13,8,0.7)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 18, height: 18, color: '#fff' }} />
          </button>
        </div>
        <div style={{ position: 'absolute', top: 14, right: 16 }}>
          <span style={{ fontSize: '11px', padding: '5px 12px', borderRadius: 10, background: `${CAT_COLORS[selectedPark.category] ?? ACCENT}25`, color: CAT_COLORS[selectedPark.category] ?? ACCENT, fontWeight: 800, border: `1px solid ${CAT_COLORS[selectedPark.category] ?? ACCENT}40` }}>{selectedPark.category}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
          <p style={{ fontSize: '30px', fontWeight: 900, color: '#fff', marginBottom: 6 }}>{selectedPark.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '13px', color: '#fbbf24', fontWeight: 700 }}>
              <Star style={{ width: 13, height: 13, fill: '#fbbf24' }} />{selectedPark.rating}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
              <MapPin style={{ width: 12, height: 12 }} />{selectedPark.region}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: 10 }}>VIVUTIO VYA MBUGA</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedPark.highlights.map(h => (
              <span key={h} style={{ fontSize: '12px', padding: '7px 14px', borderRadius: 12, background: `${ACCENT}12`, border: `1px solid ${ACCENT}25`, color: ACCENT, fontWeight: 700 }}>{h}</span>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: '14px', fontWeight: 900, color: '#fff', marginBottom: 12 }}>Chagua Pakiti Yako</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedPark.packages.map(pkg => {
              const isTop = pkg.badge === 'Premium' || pkg.badge === 'Maarufu';
              return (
                <button key={pkg.id} onClick={() => { setSelectedPkg(pkg); setStep('details'); }}
                  className="active:scale-[0.98] transition-transform text-left"
                  style={{ width: '100%', padding: '18px', borderRadius: 20, background: isTop ? 'linear-gradient(160deg,rgba(4,120,87,0.2),rgba(52,211,153,0.06))' : 'rgba(255,255,255,0.04)', border: `1px solid ${isTop ? ACCENT+'35' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', boxShadow: isTop ? '0 4px 24px rgba(52,211,153,0.12)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>{pkg.name}</p>
                        {pkg.badge && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 8, background: 'rgba(251,191,36,0.18)', color: '#fbbf24', fontWeight: 800 }}>{pkg.badge}</span>}
                      </div>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock style={{ width: 11, height: 11 }} />{pkg.duration}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{fmt(pkg.price)}</p>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>kwa mtu</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {pkg.includes.map(inc => <span key={inc} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: 8, background: `${ACCENT}10`, color: ACCENT, fontWeight: 700 }}>✓ {inc}</span>)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 40 }}>
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button onClick={onBack} style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Mbuga za Taifa</h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Mbuga 16 · Vibali Rasmi · TANAPA</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {CATEGORIES.map(cat => {
            const clr = cat === 'Zote' ? ACCENT : (CAT_COLORS[cat] ?? ACCENT);
            return (
              <button key={cat} onClick={() => setCatFilter(cat)}
                style={{ flexShrink: 0, height: 32, padding: '0 14px', borderRadius: 10, background: catFilter === cat ? `${clr}20` : 'rgba(255,255,255,0.06)', border: `1px solid ${catFilter === cat ? clr+'50' : 'rgba(255,255,255,0.1)'}`, color: catFilter === cat ? clr : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ position: 'relative', height: 190, overflow: 'hidden', margin: '16px 16px 0', borderRadius: 22 }}>
        <ImageWithFallback src="https://images.unsplash.com/photo-1516426122078-c23e76319801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Wildlife" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,13,8,0.6) 0%, rgba(4,120,87,0.3) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Mountain style={{ width: 20, height: 20, color: ACCENT }} />
            <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Gundua Tanzania</p>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>Serengeti · Ngorongoro · Kilimanjaro · na zaidi</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {[{ Icon: Camera, label: 'Picha' }, { Icon: Binoculars, label: 'Big Five' }, { Icon: Sparkles, label: 'UNESCO' }].map(({ Icon, label }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }}>
                <Icon style={{ width: 11, height: 11 }} />{label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredParks.map(park => {
          const catColor = CAT_COLORS[park.category] ?? ACCENT;
          return (
            <button key={park.id} onClick={() => { setSelectedPark(park); setStep('detail'); }}
              className="active:scale-[0.98] transition-transform text-left"
              style={{ width: '100%', borderRadius: 22, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}>
              <div style={{ position: 'relative', height: 160 }}>
                <ImageWithFallback src={park.image} alt={park.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,13,8,0.15) 0%, rgba(8,13,8,0.85) 100%)' }} />
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: 20, background: `${catColor}25`, color: catColor, fontWeight: 800, border: `1px solid ${catColor}40` }}>{park.category}</span>
                </div>
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 10, background: 'rgba(0,0,0,0.5)', color: '#fbbf24', fontWeight: 700 }}>★ {park.rating}</span>
                </div>
                <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff', marginBottom: 2 }}>{park.name}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin style={{ width: 10, height: 10 }} />{park.region}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: ACCENT }}>Kuanzia</p>
                    <p style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{fmt(park.packages[0].price)}</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {park.highlights.slice(0, 2).map(h => <span key={h} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: 8, background: 'rgba(52,211,153,0.1)', color: ACCENT, fontWeight: 700 }}>{h}</span>)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{park.packages.length} pakiti</span>
                  <ChevronRight style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
