'use client';

import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useItemsStore } from '@/store/useItemsStore';
import { useCreateStore } from '@/store/useCreateStore';
import { useTranslations } from 'next-intl';
import ItemDrawer from './ItemDrawer';
import CreateDrawer from './CreateDrawer';

// Custom Marker Icons
const createCustomIcon = (emoji: string, color: string) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      background-color: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    ">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const taskIcon = createCustomIcon('📦', '#FCD34D'); // Yellow for Tasks
const eventIcon = createCustomIcon('🎉', '#60A5FA'); // Blue for Events

function LocationSelector() {
  const map = useMap();
  const { step, setStep, setLocation, setIsOpen } = useCreateStore();
  const t = useTranslations('CreateFlow');

  if (step !== 2) return null;

  const handleConfirm = () => {
    const center = map.getCenter();
    setLocation([center.lat, center.lng]);
    setStep(3);
    setIsOpen(true);
  };

  return (
    <>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[400] -mt-10 pointer-events-none">
         <div className="text-4xl filter drop-shadow-lg">📍</div>
      </div>
      <div className="absolute bottom-32 left-0 right-0 z-[400] flex justify-center pointer-events-none">
         <button 
           onClick={handleConfirm}
           className="bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-xl pointer-events-auto active:scale-95 transition-transform"
         >
           {t('confirm_location')}
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
        className="h-[100dvh] w-full z-0" 
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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