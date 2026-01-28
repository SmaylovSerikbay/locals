'use client';

import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useItemsStore } from '@/store/useItemsStore';
import { useCreateStore } from '@/store/useCreateStore';
import { useTranslations } from 'next-intl';
import ItemDrawer from './ItemDrawer';
import CreateDrawer from './CreateDrawer';
import { useEffect, useState } from 'react';
import { Check, Navigation } from 'lucide-react';

// Custom Marker Icons
const createCustomIcon = (emoji: string, color: string) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      background-color: ${color};
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      border: 3px solid white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">${emoji}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

const taskIcon = createCustomIcon('📦', '#FCD34D'); // Yellow for Tasks
const eventIcon = createCustomIcon('🎉', '#60A5FA'); // Blue for Events

function UserLocationHandler() {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 15);
    });
  }, [map]);

  const goToMyLocation = () => {
    map.locate().on("locationfound", function (e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, 15);
    });
  };

  return (
      <>
         {position && (
             <Marker 
                position={position} 
                icon={L.divIcon({
                    className: 'user-pin',
                    html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md relative">
                              <div class="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping"></div>
                           </div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })}
             />
         )}
         <button 
            onClick={goToMyLocation}
            className="absolute top-20 right-3 z-[400] w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all border border-gray-100"
         >
            <Navigation className="w-5 h-5 text-blue-500 fill-blue-500" />
         </button>
      </>
  );
}

function LocationSelector() {
  const map = useMap();
  const { step, setStep, setLocation, setIsOpen } = useCreateStore();
  const t = useTranslations('CreateFlow');
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (step !== 2) return;

    const onMoveStart = () => setIsMoving(true);
    const onMoveEnd = () => setIsMoving(false);

    map.on('movestart', onMoveStart);
    map.on('moveend', onMoveEnd);

    return () => {
      map.off('movestart', onMoveStart);
      map.off('moveend', onMoveEnd);
    };
  }, [map, step]);

  if (step !== 2) return null;

  const handleConfirm = () => {
    const center = map.getCenter();
    setLocation([center.lat, center.lng]);
    setStep(3);
    setIsOpen(true);
  };

  return (
    <>
      {/* Thought Bubble Target Indicator (NPC Style) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none -mt-[80px] flex flex-col items-center">
         
         <div className={`transition-all duration-300 flex flex-col items-center ${isMoving ? 'scale-110 -translate-y-2' : 'scale-100 translate-y-0'}`}>
             {/* The Bubble */}
             <div className="bg-white px-6 py-3 rounded-full shadow-xl border-2 border-gray-100 relative mb-1">
                 <span className="font-bold text-gray-800 text-sm whitespace-nowrap flex items-center gap-2">
                    🤔 {t('set_location_instruction')}
                 </span>
             </div>
             
             {/* Thought Dots */}
             <div className="w-3 h-3 bg-white rounded-full shadow-md border border-gray-100 mb-1"></div>
             <div className="w-1.5 h-1.5 bg-white rounded-full shadow-md border border-gray-100"></div>
         </div>

      </div>
      
      {/* Target Pin (The 'Head' of the thinker) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none -mt-4">
          <div className="w-4 h-4 bg-black rounded-full shadow-lg border-2 border-white relative z-10"></div>
          {/* Shadow/Grounding */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-black/20 rounded-full blur-[2px]"></div>
      </div>

      {/* Confirm Button */}
      <div className="absolute bottom-36 left-0 right-0 z-[400] flex justify-center pointer-events-none px-4">
         <button 
           onClick={handleConfirm}
           className="group pointer-events-auto bg-black text-white px-6 py-4 rounded-[32px] font-bold shadow-2xl flex items-center gap-3 active:scale-95 transition-all duration-300 hover:shadow-black/20 w-full max-w-[280px] justify-center"
         >
           <span className="text-lg">{t('confirm_location')}</span>
           <div className="bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors">
              <Check className="w-5 h-5" />
           </div>
         </button>
      </div>
    </>
  );
}

export default function Map() {
  const { items, setSelectedItem, fetchNearbyItems, loading } = useItemsStore();
  const [filter, setFilter] = useState<'ALL' | 'TASK' | 'EVENT'>('ALL');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Fetch nearby items when component mounts or location changes
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          
          // Fetch items within 5km radius
          fetchNearbyItems(lat, lng, 5000, filter === 'ALL' ? undefined : filter);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Almaty coordinates
          const defaultLat = 43.238949;
          const defaultLng = 76.889709;
          setUserLocation([defaultLat, defaultLng]);
          fetchNearbyItems(defaultLat, defaultLng, 5000, filter === 'ALL' ? undefined : filter);
        }
      );
    } else {
      // Fallback to default location
      const defaultLat = 43.238949;
      const defaultLng = 76.889709;
      setUserLocation([defaultLat, defaultLng]);
      fetchNearbyItems(defaultLat, defaultLng, 5000, filter === 'ALL' ? undefined : filter);
    }
  }, [filter, fetchNearbyItems]);

  const filteredItems = items.filter(item => filter === 'ALL' || item.type === filter);

  return (
    <>
      <MapContainer 
        center={[43.238949, 76.889709]} // Almaty coordinates fallback
        zoom={13} 
        className="h-dvh w-full z-0 bg-[#f5f5f5]" // Fallback color matching Voyager
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          className="saturate-[1.1]" // Slightly boost saturation for "youthful" vibe
        />
        <ZoomControl position="topright" />

        <UserLocationHandler />
        <LocationSelector />

        {/* Filter Controls - Vertical Left Side */}
        <div className="absolute top-24 left-3 z-[400] flex flex-col gap-2 pointer-events-none">
            <div className="bg-white p-1.5 rounded-2xl shadow-lg pointer-events-auto flex flex-col gap-1 border border-gray-100 w-12 items-center">
                <button 
                    onClick={() => setFilter('ALL')}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${filter === 'ALL' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                    <span className="font-bold text-xs">All</span>
                </button>
                <div className="h-px w-6 bg-gray-100"></div>
                <button 
                    onClick={() => setFilter('TASK')}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${filter === 'TASK' ? 'bg-[#FEF9C3] text-yellow-800 shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                    <span className="text-lg">📦</span>
                </button>
                <button 
                    onClick={() => setFilter('EVENT')}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${filter === 'EVENT' ? 'bg-[#DBEAFE] text-blue-800 shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                    <span className="text-lg">🎉</span>
                </button>
            </div>
        </div>

        {filteredItems.map((item) => (
          <Marker 
            key={item.id} 
            position={item.location}
            icon={item.type === 'TASK' ? taskIcon : eventIcon}
            eventHandlers={{
              click: () => {
                setSelectedItem(item);
              },
            }}
          />
        ))}
      </MapContainer>
      <ItemDrawer />
      <CreateDrawer />
    </>
  );
}