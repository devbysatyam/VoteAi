import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useAuthStore } from '../../store/authStore';

const mapContainerStyle = {
  position: 'absolute' as 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const DEFAULT_CENTER = {
  lat: 25.2820,
  lng: 83.0065
};

const BOOTHS = [
  { id: 1, name: 'Govt. Primary School, Shivpur', distance: '0.8 km', time: '11 min walk', status: 'Open', hours: '7:00 AM — 6:00 PM', queue: '~15 min', facilities: ['♿', '🚰', '🏖️'], lat: 25.28, lng: 83.00 },
  { id: 2, name: 'Community Hall, Lanka', distance: '1.2 km', time: '16 min walk', status: 'Open', hours: '7:00 AM — 6:00 PM', queue: '~25 min', facilities: ['♿', '🚰'], lat: 25.27, lng: 83.01 },
  { id: 3, name: 'Madhyamik Vidyalaya, Sigra', distance: '2.1 km', time: '28 min walk', status: 'Open', hours: '7:00 AM — 6:00 PM', queue: '~10 min', facilities: ['🚰', '🏖️', '👩'], lat: 25.29, lng: 82.99 },
  { id: 4, name: 'Town Hall, Godowlia', distance: '3.4 km', time: '12 min drive', status: 'Open', hours: '7:00 AM — 6:00 PM', queue: '~30 min', facilities: ['♿', '🚰', '🏖️', '👩'], lat: 25.30, lng: 83.02 },
];

const FILTERS = ['All', '♿ Wheelchair', '🚰 Water', '🏖️ Shade', '👩 Women\'s Queue'];

export default function BoothMap() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Dynamic booths based on geocoding
  const [dynamicBooths, setDynamicBooths] = useState(BOOTHS);
  const [selectedBooth, setSelectedBooth] = useState(dynamicBooths[0]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  if (loadError) {
    console.error("Google Maps API Loader Error:", loadError);
  }

  // Geocode user location once map script is loaded
  useEffect(() => {
    if (isLoaded && user?.constituency && user?.state) {
      const geocoder = new window.google.maps.Geocoder();
      const address = `${user.constituency}, ${user.state}, India`;
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          
          setMapCenter({ lat, lng });
          
          // Generate 4 dynamic booths scattered around the constituency
          const newBooths = [
            { id: 1, name: `Primary School, ${user.constituency} East`, distance: '0.8 km', time: '11 min walk', status: 'Open', hours: '7:00 AM — 6:00 PM', queue: '~15 min', facilities: ['♿', '🚰', '🏖️'], lat: lat + 0.005, lng: lng + 0.005 },
            { id: 2, name: `Community Hall, ${user.constituency} Central`, distance: '1.2 km', time: '16 min walk', status: 'Open', hours: '7:00 AM — 6:00 PM', queue: '~25 min', facilities: ['♿', '🚰'], lat: lat - 0.003, lng: lng - 0.004 },
            { id: 3, name: `Vidyalaya, ${user.constituency} North`, distance: '2.1 km', time: '28 min walk', status: 'Open', hours: '7:00 AM — 6:00 PM', queue: '~10 min', facilities: ['🚰', '🏖️', '👩'], lat: lat + 0.008, lng: lng - 0.002 },
            { id: 4, name: `Town Hall, ${user.constituency} West`, distance: '3.4 km', time: '12 min drive', status: 'Open', hours: '7:00 AM — 6:00 PM', queue: '~30 min', facilities: ['♿', '🚰', '🏖️', '👩'], lat: lat - 0.006, lng: lng + 0.007 },
          ];
          setDynamicBooths(newBooths);
          setSelectedBooth(newBooths[0]);
        }
      });
    }
  }, [isLoaded, user?.constituency, user?.state]);

  const filtered = activeFilter === 'All' ? dynamicBooths :
    dynamicBooths.filter(b => b.facilities.some(f => activeFilter.includes(f)));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: 'var(--color-card)', borderBottom: '0.5px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1 className="text-section" style={{ flex: 1 }}>Find My Booth</h1>
        </div>
        <input className="input" placeholder="Search by pincode or address..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 8 }} />
        <div className="carousel" style={{ paddingBottom: 0 }}>
          {FILTERS.map(f => (
            <button key={f} className={`btn btn-sm ${activeFilter === f ? 'btn-accent-light' : 'btn-secondary'}`} onClick={() => setActiveFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 300, overflow: 'hidden', width: '100%' }}>
        {loadError ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FCEBEB', color: '#E53935', padding: 20, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
              <div className="text-section">Map could not be loaded</div>
              <div className="text-caption">{loadError.message || 'Please check your API key and connection.'}</div>
            </div>
          </div>
        ) : isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={14}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: [
                { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
              ]
            }}
          >
            {filtered.map(booth => (
              <MarkerF
                key={booth.id}
                position={{ lat: booth.lat, lng: booth.lng }}
                onClick={() => setSelectedBooth(booth)}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                  fillColor: selectedBooth?.id === booth.id ? '#FF9933' : '#22409A',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                  scale: 12
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E8F0E8' }}>
            <span className="animate-pulse">Loading Map...</span>
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      {selectedBooth && (
        <div className="card animate-in" style={{ borderRadius: '12px 12px 0 0', padding: 20, borderTop: '2px solid var(--color-border)' }}>
          <div style={{ width: 40, height: 4, background: 'var(--color-border)', borderRadius: 2, margin: '0 auto 12px' }} />
          <div className="text-label" style={{ marginBottom: 4 }}>NEAREST BOOTH</div>
          <div className="text-section" style={{ marginBottom: 4 }}>{selectedBooth.name}</div>
          <div className="text-body" style={{ marginBottom: 8 }}>{selectedBooth.distance} · {selectedBooth.time} 🚶</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className="badge badge-green badge-pill">✅ {selectedBooth.status} {selectedBooth.hours}</span>
            <span className="badge badge-saffron badge-pill">⏳ Queue {selectedBooth.queue}</span>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {selectedBooth.facilities.map(f => <span key={f} style={{ fontSize: 20 }}>{f}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedBooth.lat},${selectedBooth.lng}`, '_blank')}
                aria-label={`Get directions to ${selectedBooth.name}`}
              >
                Get Directions
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => navigate('/walkthrough')}
              >
                View Details
              </button>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ flex: 1, borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
              onClick={() => navigate('/vote')}
            >
              🗳️ Simulate Voting Here
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
