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
import { Check, Navigation, Layers } from 'lucide-react';

// Custom Marker Icons - CSS Pulse
const createCustomIcon = (emoji: string, color: string, glowColor: string) => {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="position: relative; width: 50px; height: 50px;">
        <div style="
          position: absolute;
          inset: 0;
          background-color: ${glowColor};
          opacity: 0.4;
          border-radius: 50%;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          background-color: ${color};
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          border: 4px solid white;
          box-shadow: 0 10px 25px -5px ${glowColor};
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        ">
          ${emoji}
        </div>
      </div>
      <style>
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .custom-pin-marker:hover > div > div:nth-child(2) {
           transform: scale(1.15) translateY(-5px);
        }
      </style>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });
};

const taskIcon = createCustomIcon('📦', '#FFD700', 'rgba(255, 215, 0, 0.6)'); // Vibrant Yellow
const eventIcon = createCustomIcon('🎉', '#5D5FEF', 'rgba(93, 95, 239, 0.6)'); // Vibrant Blue/Purple

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
                    html: `<div class="w-5 h-5 bg-black rounded-full border-[3px] border-white shadow-xl relative z-20">
                              <div class="absolute -inset-8 bg-blue-500/20 rounded-full animate-pulse z-0"></div>
                           </div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })}
             />
         )}
         <button 
            onClick={goToMyLocation}
            className="absolute top-24 right-4 z-[400] w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all border border-gray-100/50 backdrop-blur-md"
         >
            <Navigation className="w-6 h-6 text-black fill-current" />
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
      {/* Dynamic Pin Animation */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none -mt-8 flex flex-col items-center justify-center">
          <div className={`transition-all duration-300 ease-out ${isMoving ? '-translate-y-4 scale-110' : 'translate-y-0 scale-100 bounce-land'}`}>
             <div className="w-12 h-12 bg-black rounded-full border-[4px] border-white shadow-2xl flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
             </div>
             {/* Pin Leg */}
             <div className="w-1 h-6 bg-black mx-auto -mt-1 rounded-b-full"></div>
          </div>
          
          {/* Shadow */}
          <div className={`w-8 h-2 bg-black/20 rounded-full blur-sm transition-all duration-300 mt-1 ${isMoving ? 'scale-75 opacity-30' : 'scale-100 opacity-60'}`}></div>
      </div>

      {/* Instruction Bubble */}
      <div className="absolute top-28 left-0 right-0 z-[400] flex justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/50 animate-in fade-in slide-in-from-top-4 duration-500">
             <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                👋 {t('set_location_instruction')}
             </span>
          </div>
      </div>

      {/* Confirm Button */}
      <div className="absolute bottom-32 left-0 right-0 z-[400] flex justify-center pointer-events-none px-6">
         <button 
           onClick={handleConfirm}
           className="group pointer-events-auto bg-black text-white w-full max-w-sm py-5 rounded-[32px] font-black text-xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all duration-300 hover:shadow-black/25"
         >
           <span>{t('confirm_location')}</span>
           <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Check className="w-5 h-5 stroke-[3]" />
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

  useEffect(() => {
    // Initial fetch fallback
    fetchNearbyItems(43.238949, 76.889709, 10000, filter === 'ALL' ? undefined : filter);
  }, [filter]);

  const filteredItems = items.filter(item => filter === 'ALL' || item.type === filter);

  return (
    <>
      <MapContainer 
        center={[43.238949, 76.889709]} 
        zoom={13} 
        className="h-dvh w-full z-0 bg-[#f0f0f0]" 
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Super clean minimal map
        />
        <ZoomControl position="topright" />

        <UserLocationHandler />
        <LocationSelector />

        {/* Filter Pills - Top Left */}
        <div className="absolute top-14 left-4 z-[400] flex flex-col gap-3 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-2">
                <button 
                    onClick={() => setFilter('ALL')}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg backdrop-blur-md border border-white/20 ${filter === 'ALL' ? 'bg-black text-white scale-110' : 'bg-white/90 text-gray-400 hover:bg-white'}`}
                >
                    <Layers className="w-6 h-6" />
                </button>
                <button 
                    onClick={() => setFilter('TASK')}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg backdrop-blur-md border border-white/20 ${filter === 'TASK' ? 'bg-[#FFD700] text-black scale-110' : 'bg-white/90 text-gray-400 hover:bg-white'}`}
                >
                    <span className="text-2xl">📦</span>
                </button>
                <button 
                    onClick={() => setFilter('EVENT')}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg backdrop-blur-md border border-white/20 ${filter === 'EVENT' ? 'bg-[#5D5FEF] text-white scale-110' : 'bg-white/90 text-gray-400 hover:bg-white'}`}
                >
                    <span className="text-2xl">🎉</span>
                </button>
            </div>
        </div>

        {filteredItems.map((item) => {
          const position: [number, number] = [
            item.latitude || 43.238949,
            item.longitude || 76.889709
          ];
          
          return (
            <Marker 
              key={item.id} 
              position={position}
              icon={item.type === 'TASK' ? taskIcon : eventIcon}
              eventHandlers={{
                click: () => {
                  setSelectedItem(item);
                },
              }}
            />
          );
        })}
      </MapContainer>
      <ItemDrawer />
      <CreateDrawer />
    </>
  );
}