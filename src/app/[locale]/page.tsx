import BottomDock from '@/components/BottomDock';
import MapWrapper from '@/components/MapWrapper';

export default function HomePage() {
  return (
    <main className="relative w-full h-[100dvh] overflow-hidden">
      <MapWrapper />
      <BottomDock />
    </main>
  );
}