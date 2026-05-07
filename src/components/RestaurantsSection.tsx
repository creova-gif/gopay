import { useState } from 'react';
import {
  Clock, MapPin, Phone, Globe, Bike, Utensils, ShoppingBag,
  ChevronRight, ChevronDown, ChevronUp, Star, Wifi, Music,
  Truck, Flame, Award, Zap, Leaf, Tag
} from 'lucide-react';

interface RestaurantsSectionProps {
  onNavigate: (page: string) => void;
}

export function RestaurantsSection({ onNavigate }: RestaurantsSectionProps) {
  const [expandedRestaurants, setExpandedRestaurants] = useState<number[]>([]);

  const toggleRestaurant = (id: number) => {
    setExpandedRestaurants(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const restaurants = [
    {
      id: 1,
      name: 'The Slipway',
      cuisine: 'Seafood • Continental • Waterfront Dining',
      rating: 4.7,
      reviews: '3.2k',
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
      deliveryTime: '25-35 min',
      distance: '4.2 km',
      minOrder: '25,000',
      phone: '+255 22 260 0893',
      website: 'slipway.co.tz',
      hours: '8:00 AM - 11:00 PM',
      location: 'Msasani Peninsula, Dar es Salaam',
      priceRange: 'TZS 20,000 – 60,000',
      accentColor: '#38bdf8',
      specialBadge: { text: 'Premium', Icon: Award, bg: 'rgba(56,189,248,0.18)', color: '#38bdf8', glow: '#38bdf840' },
      badges: [
        { text: 'Ocean View', color: '#38bdf8' },
        { text: 'Table Booking', color: '#c084fc' },
      ],
    },
    {
      id: 2,
      name: 'Addis in Dar',
      cuisine: 'Ethiopian • Traditional • Coffee Ceremony',
      rating: 4.8,
      reviews: '2.8k',
      image: 'https://images.unsplash.com/photo-1609792790758-0994786ad983?w=800&q=80',
      deliveryTime: '20-30 min',
      distance: '2.1 km',
      minOrder: '15,000',
      phone: '+255 713 333 999',
      website: 'addisindar.co.tz',
      hours: '11:00 AM - 10:30 PM',
      location: 'Masaki, Dar es Salaam',
      priceRange: 'TZS 12,000 – 35,000',
      accentColor: '#f87171',
      specialBadge: { text: 'Most Popular', Icon: Flame, bg: 'rgba(248,113,113,0.18)', color: '#f87171', glow: '#f8717140' },
      badges: [
        { text: 'Free Delivery', color: '#4ade80' },
        { text: 'Vegetarian', color: '#4ade80' },
      ],
    },
    {
      id: 3,
      name: 'The Waterfront Sunset',
      cuisine: 'International • Grill • Fine Dining',
      rating: 4.9,
      reviews: '4.1k',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      deliveryTime: '30-40 min',
      distance: '5.8 km',
      minOrder: '30,000',
      phone: '+255 22 260 0380',
      website: 'waterfronttz.com',
      hours: '12:00 PM - 11:00 PM',
      location: 'Coco Beach, Dar es Salaam',
      priceRange: 'TZS 25,000 – 80,000',
      accentColor: '#fbbf24',
      specialBadge: { text: 'Top Rated', Icon: Star, bg: 'rgba(251,191,36,0.18)', color: '#fbbf24', glow: '#fbbf2440' },
      badges: [
        { text: 'Beach View', color: '#38bdf8' },
        { text: 'Live Music', color: '#c084fc' },
        { text: 'Reservations Only', color: '#fb923c' },
      ],
    },
    {
      id: 4,
      name: 'Karambezi Café',
      cuisine: 'Seafood • Swahili • Coastal Cuisine',
      rating: 4.6,
      reviews: '2.5k',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
      deliveryTime: '35-45 min',
      distance: '12.5 km',
      minOrder: '20,000',
      phone: '+255 777 415 175',
      website: 'karambezi.co.tz',
      hours: '11:00 AM - 10:00 PM',
      location: 'Sea Cliff, Dar es Salaam',
      priceRange: 'TZS 18,000 – 55,000',
      accentColor: '#4ade80',
      specialBadge: undefined,
      badges: [
        { text: 'Cliff-top Views', color: '#38bdf8' },
        { text: 'Fresh Catch Daily', color: '#4ade80' },
      ],
    },
    {
      id: 5,
      name: "Khan's BBQ",
      cuisine: 'Pakistani • Indian • BBQ • Halal',
      rating: 4.7,
      reviews: '3.6k',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
      deliveryTime: '15-25 min',
      distance: '1.5 km',
      minOrder: '10,000',
      phone: '+255 22 211 8487',
      website: 'khansbbq.co.tz',
      hours: '11:30 AM - 11:00 PM',
      location: 'Upanga, Dar es Salaam',
      priceRange: 'TZS 8,000 – 30,000',
      accentColor: '#fb923c',
      specialBadge: { text: 'Fast Delivery', Icon: Zap, bg: 'rgba(251,146,60,0.18)', color: '#fb923c', glow: '#fb923c40' },
      badges: [
        { text: 'Free Delivery', color: '#4ade80' },
        { text: 'Family Packs', color: '#fb923c' },
        { text: '20% Off Pickup', color: '#fbbf24' },
      ],
    },
    {
      id: 6,
      name: 'Chapan Bhog',
      cuisine: 'Indian • Vegetarian • South Indian',
      rating: 4.8,
      reviews: '2.9k',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
      deliveryTime: '20-30 min',
      distance: '3.2 km',
      minOrder: '12,000',
      phone: '+255 22 211 6645',
      website: 'chapanbhog.co.tz',
      hours: '11:00 AM - 10:00 PM',
      location: 'Kariakoo, Dar es Salaam',
      priceRange: 'TZS 6,000 – 25,000',
      accentColor: '#4ade80',
      specialBadge: { text: 'Pure Veg', Icon: Leaf, bg: 'rgba(74,222,128,0.18)', color: '#4ade80', glow: '#4ade8040' },
      badges: [
        { text: '100% Veg', color: '#4ade80' },
        { text: 'Lunch Buffet', color: '#fb923c' },
      ],
    },
    {
      id: 7,
      name: 'Mediterraneo',
      cuisine: 'Italian • Mediterranean • Pizza',
      rating: 4.7,
      reviews: '3.4k',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      deliveryTime: '25-35 min',
      distance: '4.8 km',
      minOrder: '18,000',
      phone: '+255 22 260 1198',
      website: 'mediterraneo.co.tz',
      hours: '12:00 PM - 11:00 PM',
      location: 'Masaki, Dar es Salaam',
      priceRange: 'TZS 15,000 – 50,000',
      accentColor: '#fb923c',
      specialBadge: undefined,
      badges: [
        { text: 'Wood-fired Pizza', color: '#fb923c' },
        { text: 'Outdoor Seating', color: '#38bdf8' },
      ],
    },
    {
      id: 8,
      name: 'Nawabi Khana',
      cuisine: 'Mughlai • Indian • Biryani • Halal',
      rating: 4.6,
      reviews: '2.1k',
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=80',
      deliveryTime: '20-30 min',
      distance: '2.8 km',
      minOrder: '15,000',
      phone: '+255 22 266 6687',
      website: 'nawabikhana.co.tz',
      hours: '11:00 AM - 11:00 PM',
      location: 'Oysterbay, Dar es Salaam',
      priceRange: 'TZS 10,000 – 40,000',
      accentColor: '#c084fc',
      specialBadge: { text: 'Biryani Specialist', Icon: Tag, bg: 'rgba(192,132,252,0.18)', color: '#c084fc', glow: '#c084fc40' },
      badges: [
        { text: 'Party Orders', color: '#c084fc' },
        { text: '15% Off Today', color: '#fbbf24' },
      ],
    },
  ];

  return (
    <div>
      <style>{`
        @keyframes pulse-live { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0.5} }
        @keyframes shimmer-cta { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .rest-card-dark { transition: transform 0.15s ease; }
        .rest-card-dark:active { transform: scale(0.985); }
        .cta-explore {
          background: linear-gradient(90deg,#16a34a 0%,#4ade80 40%,#16a34a 80%,#4ade80 100%);
          background-size: 300% auto;
          animation: shimmer-cta 4s linear infinite;
        }
      `}</style>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', animation: 'pulse-live 2s ease-in-out infinite' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>Migahawa & Baa</h3>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{restaurants.length} migahawa • Wazi sasa</p>
        </div>
        <button onClick={() => onNavigate('restaurants')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 20, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', cursor: 'pointer' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80' }}>Yote</span>
          <ChevronRight style={{ width: 13, height: 13, color: '#4ade80' }} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {restaurants.slice(0, 4).map(restaurant => {
          const isExpanded = expandedRestaurants.includes(restaurant.id);
          const acc = restaurant.accentColor;

          return (
            <div key={restaurant.id} className="rest-card-dark"
              style={{ borderRadius: 24, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.07)`, boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)` }}>

              {/* ── Hero image ── */}
              <div style={{ position: 'relative', height: 190, overflow: 'hidden' }}>
                <img src={restaurant.image} alt={restaurant.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />

                {/* Cinematic gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,13,8,1) 0%, rgba(8,13,8,0.6) 40%, rgba(8,13,8,0.1) 100%)' }} />

                {/* Accent glow edge */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${acc},transparent)`, opacity: 0.7 }} />

                {/* Top-right: Open Now */}
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'rgba(8,13,8,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(74,222,128,0.3)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'pulse-live 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80' }}>Wazi</span>
                </div>

                {/* Top-left: Rating */}
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 20, background: 'rgba(8,13,8,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Star style={{ width: 12, height: 12, fill: '#fbbf24', color: '#fbbf24' }} />
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff' }}>{restaurant.rating}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>({restaurant.reviews})</span>
                </div>

                {/* Bottom-left: Special badge */}
                {restaurant.specialBadge && (() => {
                  const B = restaurant.specialBadge;
                  const BIcon = B.Icon;
                  return (
                    <div style={{ position: 'absolute', bottom: 14, left: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: B.bg, backdropFilter: 'blur(12px)', border: `1px solid ${B.color}40`, boxShadow: `0 4px 16px ${B.glow}` }}>
                      <BIcon style={{ width: 12, height: 12, color: B.color }} />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: B.color }}>{B.text}</span>
                    </div>
                  );
                })()}

                {/* Bottom-right: Price range */}
                <div style={{ position: 'absolute', bottom: 14, right: 12, padding: '5px 10px', borderRadius: 20, background: 'rgba(8,13,8,0.65)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{restaurant.priceRange}</span>
                </div>
              </div>

              {/* ── Content panel ── */}
              <div style={{ padding: '16px 16px 14px' }}>
                {/* Name + cuisine */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', marginBottom: 3, letterSpacing: '-0.3px' }}>{restaurant.name}</h4>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{restaurant.cuisine}</p>
                  </div>
                  <button onClick={() => toggleRestaurant(restaurant.id)}
                    style={{ padding: '6px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', flexShrink: 0, marginLeft: 10 }}>
                    {isExpanded
                      ? <ChevronUp style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.6)' }} />
                      : <ChevronDown style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.6)' }} />}
                  </button>
                </div>

                {/* Quick stats strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                  {[
                    { Icon: Clock,  value: restaurant.deliveryTime, color: acc },
                    { Icon: MapPin, value: restaurant.distance,     color: acc },
                    { Icon: Truck,  value: 'Haraka',                color: '#4ade80' },
                  ].map((item, i) => {
                    const SIcon = item.Icon;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                        <SIcon style={{ width: 13, height: 13, color: item.color, marginBottom: 4 }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{item.value}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Feature badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {restaurant.badges.map((badge, i) => (
                    <span key={i} style={{ padding: '4px 10px', borderRadius: 20, fontSize: '10px', fontWeight: 700, color: badge.color, background: `${badge.color}14`, border: `1px solid ${badge.color}30` }}>
                      {badge.text}
                    </span>
                  ))}
                </div>

                {/* Expandable contact details */}
                {isExpanded && (
                  <div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '12px 14px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { Icon: Phone, value: restaurant.phone,   href: `tel:${restaurant.phone.replace(/\s/g, '')}`, color: '#60a5fa' },
                      { Icon: Globe, value: restaurant.website,  href: `https://${restaurant.website}`,             color: '#60a5fa' },
                      { Icon: Clock, value: restaurant.hours,    href: undefined,                                    color: acc },
                    ].map((row, i) => {
                      const RIcon = row.Icon;
                      const inner = (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 9, background: `${row.color}15`, border: `1px solid ${row.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <RIcon style={{ width: 13, height: 13, color: row.color }} />
                          </div>
                          <span style={{ fontSize: '12px', color: row.href ? row.color : 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{row.value}</span>
                        </div>
                      );
                      return row.href
                        ? <a key={i} href={row.href} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ textDecoration: 'none' }}>{inner}</a>
                        : <div key={i}>{inner}</div>;
                    })}
                    <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      Agizo la chini: <span style={{ color: '#fff', fontWeight: 700 }}>TZS {restaurant.minOrder}</span>
                    </div>
                  </div>
                )}

                {!isExpanded && (
                  <button onClick={() => toggleRestaurant(restaurant.id)}
                    style={{ fontSize: '11px', fontWeight: 700, color: acc, background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Mawasiliano na masaa →
                  </button>
                )}

                {/* Action buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => onNavigate('restaurants')}
                    className="rest-card-dark"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 46, borderRadius: 16, background: `linear-gradient(135deg,${acc}22,${acc}14)`, border: `1px solid ${acc}45`, cursor: 'pointer' }}>
                    <Utensils style={{ width: 15, height: 15, color: acc }} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: acc }}>Hifadhi Meza</span>
                  </button>
                  <button onClick={() => onNavigate('gofood')}
                    className="rest-card-dark"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 46, borderRadius: 16, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}>
                    <ShoppingBag style={{ width: 15, height: 15, color: '#fff' }} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Agiza Nyumbani</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Explore all CTA */}
        <button onClick={() => onNavigate('restaurants')}
          className="cta-explore rest-card-dark"
          style={{ width: '100%', height: 54, borderRadius: 20, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 6px 28px rgba(22,163,74,0.4)' }}>
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#000' }}>Gundua Migahawa Yote {restaurants.length}</span>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight style={{ width: 16, height: 16, color: '#000' }} />
          </div>
        </button>
      </div>
    </div>
  );
}
