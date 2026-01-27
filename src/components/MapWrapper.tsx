'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => <div className="h-[100dvh] w-full bg-gray-100 flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default function MapWrapper() {
  return <Map />;
}