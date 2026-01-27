import BottomDock from '@/components/BottomDock';
import MapWrapper from '@/components/MapWrapper';
import TelegramInit from '@/components/TelegramInit';
import ProfileDrawer from '@/components/ProfileDrawer';

export default function HomePage() {
  return (
    <main className="relative w-full h-[100dvh] overflow-hidden">
      <TelegramInit />
      <MapWrapper />
      <BottomDock />
      <ProfileDrawer />
    </main>
  );
}