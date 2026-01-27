import BottomDock from '@/components/BottomDock';
import MapWrapper from '@/components/MapWrapper';
import TelegramInit from '@/components/TelegramInit';
import ProfileDrawer from '@/components/ProfileDrawer';
import ChatListDrawer from '@/components/ChatListDrawer';

export default function HomePage() {
  return (
    <main className="relative w-full h-[100dvh] overflow-hidden">
      <TelegramInit />
      <MapWrapper />
      <BottomDock />
      <ProfileDrawer />
      <ChatListDrawer />
    </main>
  );
}