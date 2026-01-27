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
import { Check } from 'lucide-react';

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
      {/* Center Target Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none -mt-8 flex flex-col items-center justify-center">
         <div className={`relative transition-all duration-300 ${isMoving ? 'scale-110 opacity-80' : 'scale-100 opacity-100'}`}>
            <div className="w-4 h-4 bg-black rounded-full shadow-lg border-2 border-white z-10 relative"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/10 rounded-full animate-pulse"></div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-1 h-8 bg-gradient-to-b from-black to-transparent opacity-30"></div>
         </div>
         <div className="mt-4 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg transition-opacity duration-200" style={{ opacity: isMoving ? 0 : 1 }}>
            Перемещай карту
         </div>
      </div>

      {/* Confirm Button */}
      <div className="absolute bottom-36 left-0 right-0 z-[400] flex justify-center pointer-events-none px-4">
         <button 
           onClick={handleConfirm}
           className="group pointer-events-auto bg-black text-white px-6 py-4 rounded-[2rem] font-bold shadow-2xl flex items-center gap-3 active:scale-95 transition-all duration-300 hover:shadow-black/20 w-full max-w-[280px] justify-center"
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
  const { items, setSelectedItem } = useItemsStore();

  return (
    <>
      <MapContainer 
        center={[43.238949, 76.889709]} // Almaty coordinates
        zoom={13} 
        className="h-[100dvh] w-full z-0 bg-[#f5f5f5]" // Fallback color matching Voyager
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          className="saturate-[1.1]" // Slightly boost saturation for "youthful" vibe
        />
        <ZoomControl position="topright" />

        <LocationSelector />

        {items.map((item) => (
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