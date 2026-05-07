import { UnifiedBookingSystemUltimate as UnifiedBookingSystem } from './UnifiedBookingSystemUltimate';
import { useState } from 'react';
import { User } from '../App';
import {
  ArrowLeft, Bus, Ship, Plane, Hotel, Mountain, Users, MapPin,
  ChevronRight, Star, Check, Train, Search,
  ArrowRight, Shield, Sparkles, TrendingUp, Zap, Heart,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TravelPageRedesignedProps {
  user: User;
  accessToken: string;
  onBack: () => void;
}

type BookingService = 'flights' | 'ferry' | 'buses' | 'sgr' | 'hotels' | 'parks' | 'ai';

const SVC = {
  flights: { accent: '#60a5fa', glow: 'rgba(96,165,250,0.25)',  gradient: 'linear-gradient(160deg,#0f172a 0%,#1e3a8a 55%,#1d4ed8 100%)' },
  ferry:   { accent: '#22d3ee', glow: 'rgba(34,211,238,0.25)',  gradient: 'linear-gradient(160deg,#0c1a2e 0%,#0c4a6e 55%,#0369a1 100%)' },
  buses:   { accent: '#4ade80', glow: 'rgba(74,222,128,0.25)',  gradient: 'linear-gradient(160deg,#052e16 0%,#14532d 55%,#166534 100%)' },
  sgr:     { accent: '#f87171', glow: 'rgba(248,113,113,0.25)', gradient: 'linear-gradient(160deg,#1c0707 0%,#7f1d1d 55%,#991b1b 100%)' },
  hotels:  { accent: '#fb923c', glow: 'rgba(251,146,60,0.25)',  gradient: 'linear-gradient(160deg,#1c0a00 0%,#7c2d12 55%,#c2410c 100%)' },
  parks:   { accent: '#34d399', glow: 'rgba(52,211,153,0.25)',  gradient: 'linear-gradient(160deg,#022c22 0%,#065f46 55%,#047857 100%)' },
};

export function TravelPageRedesigned({ user, accessToken, onBack }: TravelPageRedesignedProps) {
  const [showUnifiedBooking, setShowUnifiedBooking] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState<BookingService | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 })
      .format(amount).replace('TSh', 'TZS');

  const quickBookDestinations = [
    {
      name: 'Zanzibar Paradise',
      subtitle: 'Beach & Culture',
      image: 'https://images.unsplash.com/photo-1707296450219-2d9cc08bdef0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxaYW56aWJhciUyMGJlYWNoJTIwc3Vuc2V0fGVufDF8fHx8MTc2NzkwMTQ4OHww&ixlib=rb-4.1.0&q=80&w=1080',
      from: 25000, badge: 'LIVE DEAL', discount: '-30%', service: 'flights' as BookingService,
    },
    {
      name: 'Serengeti Safari',
      subtitle: 'Wildlife Adventure',
      image: 'https://images.unsplash.com/photo-1641133292545-32e441e60190?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTZXJlbmdldGklMjBzYWZhcmklMjB3aWxkbGlmZXxlbnwxfHx8fDE3Njc4NzU1NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      from: 280000, badge: 'MAARUFU', discount: null, service: 'parks' as BookingService,
    },
    {
      name: 'Kilimanjaro Trek',
      subtitle: 'Mountain Expedition',
      image: 'https://images.unsplash.com/photo-1650668302197-7f556c34cb91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNb3VudCUyMEtpbGltYW5qYXJvJTIwc3Vuc2V0fGVufDF8fHx8MTc2NzkwMTUyOHww&ixlib=rb-4.1.0&q=80&w=1080',
      from: 450000, badge: null, discount: null, service: 'hotels' as BookingService,
    },
  ];

  const goBook = (service: BookingService) => { setSelectedBookingService(service); setShowUnifiedBooking(true); };

  if (showUnifiedBooking && selectedBookingService) {
    return (
      <UnifiedBookingSystem
        user={user}
        accessToken={accessToken}
        onBack={() => { setShowUnifiedBooking(false); setSelectedBookingService(null); }}
        initialService={selectedBookingService}
      />
    );
  }

  const tickerText = '🔥 Zanzibar Ferry 30% OFF  •  Precision Air TZS 155K  •  SGR 25% OFF  •  Hotels kuanzia TZS 80K  •  Serengeti Safari TZS 280K  •  ';

  return (
    <div style={{ minHeight: '100vh', background: '#080d08', color: '#fff', paddingBottom: 48 }}>
      <style>{`
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes glowBlob { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.15)} }
        @keyframes liveDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }
      `}</style>

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-20" style={{ background: 'rgba(8,13,8,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ padding: '16px 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} className="active:scale-95 transition-transform"
              style={{ padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <ArrowLeft style={{ width: 20, height: 20, color: '#fff' }} />
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Gundua Tanzania</h1>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Real-time bookings · Live prices</p>
            </div>
            <button className="active:scale-95 transition-transform"
              onClick={() => goBook('bus')}
              style={{ padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
              <Search style={{ width: 20, height: 20, color: '#fff' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── LOYALTY + LIVE TICKER ── */}
      <div style={{ padding: '16px 16px 0' }}>
        {/* Loyalty strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#b45309,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star style={{ width: 20, height: 20, color: '#fff', fill: '#fff' }} />
              <div style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: '50%', background: '#4ade80', border: '2px solid #080d08', animation: 'liveDot 2s ease-in-out infinite' }} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>GO Rewards Points</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Pata 5% kila safari · Tumia wakati wowote</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '26px', fontWeight: 900, color: '#fbbf24', letterSpacing: '-1px', lineHeight: 1 }}>{user.loyaltyPoints ?? 0}</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>pointi</p>
          </div>
        </div>

        {/* Live deals ticker */}
        <div style={{ borderRadius: 14, overflow: 'hidden', padding: '10px 0', background: 'linear-gradient(90deg,#b45309,#c2410c,#9a3412)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ padding: '0 12px', flexShrink: 0 }}>
            <Zap style={{ width: 16, height: 16, color: '#fff' }} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', width: 'max-content', animation: 'ticker 22s linear infinite' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', paddingRight: 40 }}>{tickerText}</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', paddingRight: 40 }}>{tickerText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESTINATIONS CAROUSEL ── */}
      <div style={{ padding: '20px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp style={{ width: 18, height: 18, color: '#f87171' }} />
              Maeneo Maarufu
            </h2>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Bei za sasa · Imesasishwa sasa hivi</p>
          </div>
          <button onClick={() => goBook('bus')} style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            Ona Zote <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '0 16px 6px', scrollbarWidth: 'none' }}>
          {quickBookDestinations.map((dest, idx) => (
            <button key={idx} onClick={() => goBook(dest.service)}
              className="active:scale-[0.98] transition-transform"
              style={{ flexShrink: 0, width: 240, borderRadius: 22, overflow: 'hidden', position: 'relative', border: 'none', padding: 0, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <div style={{ position: 'relative', height: 200 }}>
                <ImageWithFallback src={dest.image} alt={dest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)' }} />

                {dest.badge && (
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: '#dc2626' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'liveDot 1.5s ease-in-out infinite' }} />
                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#fff' }}>{dest.badge}</span>
                  </div>
                )}

                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>Inapatikana</span>
                </div>

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 14px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', marginBottom: 3 }}>{dest.name}</h3>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin style={{ width: 10, height: 10 }} />{dest.subtitle}
                      </p>
                    </div>
                    <Heart style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.8)', flexShrink: 0 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Kuanzia</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{formatCurrency(dest.from)}</p>
                        {dest.discount && <span style={{ fontSize: '10px', fontWeight: 900, background: '#fbbf24', color: '#1c1400', padding: '2px 6px', borderRadius: 8 }}>{dest.discount}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 12, background: '#16a34a' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Weka</span>
                      <ArrowRight style={{ width: 13, height: 13, color: '#fff' }} />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── BOOK YOUR JOURNEY — magazine mosaic ── */}
      <div style={{ padding: '24px 16px 0' }}>

        {/* Editorial section header */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', color: '#4ade80', textTransform: 'uppercase', marginBottom: 5 }}>— Huduma za Kusafiri</p>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1.1 }}>Anza Safari<br/>Yako Leo</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'liveDot 2s ease-in-out infinite' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80' }}>Mifumo Online</span>
              </div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>Washirika wa moja kwa moja<br/>Uthibitisho wa papo hapo</p>
            </div>
          </div>
          {/* Decorative rule */}
          <div style={{ marginTop: 14, height: 1, background: 'linear-gradient(90deg,#4ade80,rgba(74,222,128,0.1),transparent)' }} />
        </div>

        {/* ── ROW 1: FLIGHTS — full-width hero card ── */}
        <button onClick={() => goBook('flights')}
          className="active:scale-[0.985] transition-transform"
          style={{ width: '100%', borderRadius: 24, overflow: 'hidden', position: 'relative', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 12, display: 'block', boxShadow: '0 12px 48px rgba(96,165,250,0.25)' }}>
          <div style={{ position: 'relative', height: 210 }}>
            <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1080&q=80" alt="Flights"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(15,23,42,0.95) 0%,rgba(30,58,138,0.7) 50%,rgba(15,23,42,0.3) 100%)' }} />
            {/* Live deal badge */}
            <div style={{ position: 'absolute', top: 16, right: 16, padding: '6px 14px', borderRadius: 20, background: 'linear-gradient(135deg,#dc2626,#f97316)', boxShadow: '0 4px 16px rgba(220,38,38,0.5)' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#fff' }}>OKOA 25%</span>
            </div>
            {/* Service icon pill top-left */}
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <Plane style={{ width: 14, height: 14, color: '#60a5fa' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>Ndege</span>
            </div>
            {/* Bottom content */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 18px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 4 }}>Ndege za Ndani</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                    {['Njia 40+', 'Siku Moja', 'Amani'].map(c => (
                      <span key={c} style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.35)', color: '#93c5fd' }}>{c}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Precision Air · Air Tanzania · +3</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Kuanzia</p>
                  <p style={{ fontSize: '24px', fontWeight: 900, color: '#60a5fa', letterSpacing: '-0.5px', lineHeight: 1 }}>TZS 155K</p>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', padding: '7px 12px', borderRadius: 12, background: '#2563eb', border: 'none' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Weka</span>
                    <ArrowRight style={{ width: 13, height: 13, color: '#fff' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* ── ROW 2: FERRY + BUSES — 2-column ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            {
              service: 'ferry' as BookingService,
              Icon: Ship, label: 'Ferry Zanzibar', price: 'TZS 24.5K',
              image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
              accent: '#22d3ee', badge: '🔥 -30%', badgeBg: 'linear-gradient(135deg,#d97706,#f59e0b)',
              overlay: 'linear-gradient(160deg,rgba(12,26,46,0.95) 0%,rgba(3,105,161,0.6) 100%)',
              chips: ['Kila Siku', 'Masaa 2–4'],
              rating: 4.8,
            },
            {
              service: 'buses' as BookingService,
              Icon: Bus, label: 'Mabasi VIP', price: 'TZS 25K+',
              image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80',
              accent: '#4ade80', badge: null, badgeBg: '',
              overlay: 'linear-gradient(160deg,rgba(5,46,22,0.95) 0%,rgba(22,101,52,0.6) 100%)',
              chips: ['WiFi & AC', 'VIP'],
              rating: null,
            },
          ].map(card => {
            const CardIcon = card.Icon;
            return (
              <button key={card.service} onClick={() => goBook(card.service)}
                className="active:scale-[0.97] transition-transform"
                style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', border: 'none', padding: 0, cursor: 'pointer', boxShadow: `0 8px 32px ${card.accent}22` }}>
                <div style={{ position: 'relative', height: 185 }}>
                  <img src={card.image} alt={card.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: card.overlay }} />
                  {card.badge && (
                    <div style={{ position: 'absolute', top: 10, right: 10, padding: '4px 8px', borderRadius: 10, background: card.badgeBg }}>
                      <span style={{ fontSize: '9px', fontWeight: 900, color: '#fff' }}>{card.badge}</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
                    <CardIcon style={{ width: 12, height: 12, color: card.accent }} />
                    {card.rating && (
                      <>
                        <Star style={{ width: 10, height: 10, fill: '#fbbf24', color: '#fbbf24' }} />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff' }}>{card.rating}</span>
                      </>
                    )}
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 12px 12px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', marginBottom: 5 }}>{card.label}</p>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                      {card.chips.map(c => (
                        <span key={c} style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: 8, background: `${card.accent}20`, color: card.accent, border: `1px solid ${card.accent}35` }}>{c}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: '13px', fontWeight: 900, color: card.accent }}>{card.price}</p>
                      <div style={{ padding: '5px 10px', borderRadius: 10, background: `${card.accent}22`, border: `1px solid ${card.accent}45` }}>
                        <ArrowRight style={{ width: 12, height: 12, color: card.accent }} />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── ROW 3: SGR — full-width with government stamp ── */}
        <button onClick={() => goBook('sgr')}
          className="active:scale-[0.985] transition-transform"
          style={{ width: '100%', borderRadius: 24, overflow: 'hidden', position: 'relative', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 12, display: 'block', boxShadow: '0 12px 40px rgba(248,113,113,0.2)' }}>
          <div style={{ position: 'relative', height: 160 }}>
            <img src="https://images.unsplash.com/photo-1474487548417-781cb6d646ea?w=1080&q=80" alt="SGR Train"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(28,7,7,0.97) 0%,rgba(127,29,29,0.8) 50%,rgba(28,7,7,0.5) 100%)' }} />
            {/* Gov stamp */}
            <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 16px rgba(79,70,229,0.5)' }}>
              <Shield style={{ width: 11, height: 11, color: '#fff' }} />
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#fff' }}>Serikali Imethibitisha</span>
            </div>
            <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(248,113,113,0.3)' }}>
              <Train style={{ width: 13, height: 13, color: '#f87171' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>SGR Express</span>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.4px', marginBottom: 4 }}>Dar → Morogoro · Kila Siku</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Saa 1.5', 'Darasa la 1 & 2', 'TZS 15K+'].map(c => (
                    <span key={c} style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: 'rgba(248,113,113,0.18)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.3)' }}>{c}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 14, background: '#991b1b', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Weka</span>
                <ArrowRight style={{ width: 12, height: 12, color: '#fff' }} />
              </div>
            </div>
          </div>
        </button>

        {/* ── ROW 4: HOTELS + PARKS — 2-column ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            {
              service: 'hotels' as BookingService,
              Icon: Hotel, label: 'Hoteli & Lodges', price: 'TZS 80K+',
              image: 'https://images.unsplash.com/photo-1551882547-ff40c4fe5eb3?w=600&q=80',
              accent: '#fb923c', badge: null, badgeBg: '',
              overlay: 'linear-gradient(160deg,rgba(28,10,0,0.95) 0%,rgba(194,65,12,0.65) 100%)',
              chips: ['500+ Hoteli', 'Bei Bora'],
            },
            {
              service: 'parks' as BookingService,
              Icon: Mountain, label: 'Mbuga za Taifa', price: 'TZS 280K+',
              image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80',
              accent: '#34d399', badge: '🌿 UNESCO', badgeBg: 'linear-gradient(135deg,#047857,#059669)',
              overlay: 'linear-gradient(160deg,rgba(2,44,34,0.95) 0%,rgba(4,120,87,0.65) 100%)',
              chips: ['Mbuga 16', 'TANAPA'],
            },
          ].map(card => {
            const CardIcon = card.Icon;
            return (
              <button key={card.service} onClick={() => goBook(card.service)}
                className="active:scale-[0.97] transition-transform"
                style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', border: 'none', padding: 0, cursor: 'pointer', boxShadow: `0 8px 32px ${card.accent}22` }}>
                <div style={{ position: 'relative', height: 185 }}>
                  <img src={card.image} alt={card.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: card.overlay }} />
                  {card.badge && (
                    <div style={{ position: 'absolute', top: 10, right: 10, padding: '4px 8px', borderRadius: 10, background: card.badgeBg }}>
                      <span style={{ fontSize: '9px', fontWeight: 900, color: '#fff' }}>{card.badge}</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
                    <CardIcon style={{ width: 12, height: 12, color: card.accent }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 12px 12px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', marginBottom: 5 }}>{card.label}</p>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                      {card.chips.map(c => (
                        <span key={c} style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: 8, background: `${card.accent}20`, color: card.accent, border: `1px solid ${card.accent}35` }}>{c}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: '13px', fontWeight: 900, color: card.accent }}>{card.price}</p>
                      <div style={{ padding: '5px 10px', borderRadius: 10, background: `${card.accent}22`, border: `1px solid ${card.accent}45` }}>
                        <ArrowRight style={{ width: 12, height: 12, color: card.accent }} />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── AI TRAVEL ASSISTANT ── */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ borderRadius: 24, padding: '24px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#1e1b4b 0%,#4c1d95 40%,#7e22ce 70%,#be185d 100%)', border: '1px solid rgba(196,181,253,0.2)', boxShadow: '0 8px 40px rgba(126,34,206,0.3)' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', animation: 'glowBlob 5s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles style={{ width: 26, height: 26, color: '#fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>AI Travel Assistant</p>
                <span style={{ fontSize: '10px', fontWeight: 900, padding: '3px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>KIPYA</span>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: 16 }}>Pata mapendekezo ya kibinafsi, linganisha bei, gundua ofa za siri</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => goBook('ai')} className="active:scale-95 transition-transform"
                  style={{ padding: '10px 22px', borderRadius: 14, background: '#fff', color: '#7e22ce', fontWeight: 900, fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                  Uliza AI Sasa
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Users style={{ width: 14, height: 14, color: '#fff' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>2.4K wanatumia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST STRIP ── */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Shield style={{ width: 16, height: 16, color: '#4ade80' }} />
          <p style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>Kwa nini weka na goPay?</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { Icon: Shield,  accent: '#4ade80', label: 'Malipo Salama',      sub: 'SSL iliyofichwa' },
            { Icon: Zap,     accent: '#60a5fa', label: 'Uthibitisho Papo',   sub: 'Wakati halisi'   },
            { Icon: Heart,   accent: '#c4b5fd', label: 'Bei Bora Zaidi',     sub: 'Dhamana ya bei'  },
          ].map(({ Icon, accent, label, sub }) => (
            <div key={label} style={{ borderRadius: 16, padding: '14px 10px', textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `${accent}14`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Icon style={{ width: 22, height: 22, color: accent }} />
              </div>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#fff', marginBottom: 3 }}>{label}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
