# LOCALS - Telegram Mini App

Hyper-local map-based app for connecting neighbors through tasks and events.

## Features

- 🗺️ **Map-First Interface** - Interactive map with location-based tasks and events
- 📦 **Tasks** - Request help from nearby neighbors
- 🎉 **Events (Dvizh)** - Find people to hang out with
- 💬 **Group Chats** - Automatic chat creation for coordination
- 🌍 **Multilingual** - English and Russian support
- 📱 **Telegram Integration** - Native Telegram Web App experience

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Vaul (Drawers), Lucide React (Icons)
- **Maps**: React Leaflet + OpenStreetMap
- **State**: Zustand
- **i18n**: next-intl
- **Animations**: Framer Motion

## Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Telegram Bot Setup

### Creating a Bot

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/newbot` and follow instructions
3. Save your bot token to `.env.local`

### Configuring Web App

1. Send `/newapp` to BotFather
2. Select your bot
3. Provide app details:
   - **Title**: LOCALS
   - **Description**: Hyper-local tasks and events
   - **Photo**: Upload a 640x360px image
   - **Demo GIF**: (optional)
   - **Short name**: `locals` (lowercase, no spaces)
   - **Web App URL**: Your deployed URL (e.g., `https://your-domain.vercel.app`)

### Testing in Telegram

Open your bot and click "Open App" or use:
```
https://t.me/YOUR_BOT_NAME/locals
```

## Telegram Group Chat Integration

### Current Implementation

The app creates **in-app group chats** automatically when users:
- Join an event (Dvizh)
- Accept a task

### Future: Full Telegram Sync (Requires Backend)

To sync messages with real Telegram groups:

1. **Create Groups via Bot**: Use Telegram Bot API to create supergroups
2. **Webhooks**: Set up webhook to receive Telegram messages
3. **Bidirectional Sync**: Store messages in Supabase and sync both ways

```typescript
// Example: Create Telegram group (backend)
const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createChatInviteLink`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: chatId,
    name: title,
    creates_join_request: false
  })
});
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Internationalized routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components (SlideButton, etc.)
│   ├── Map.tsx
│   ├── BottomDock.tsx
│   ├── ItemDrawer.tsx
│   ├── CreateDrawer.tsx
│   ├── ChatListDrawer.tsx
│   └── ...
├── store/                 # Zustand stores
│   ├── useItemsStore.ts
│   ├── useChatStore.ts
│   └── useUserStore.ts
├── i18n/                  # Internationalization
├── messages/              # Translation files
└── types/                 # TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variable: `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN`
4. Deploy

### After Deployment

1. Update BotFather with your production URL
2. Test the app in Telegram

## Features Roadmap

- [x] Map with location detection
- [x] Create tasks and events
- [x] View item details
- [x] Slide-to-respond interaction
- [x] Filter by type (Tasks/Events)
- [x] In-app group chats
- [x] Profile with Telegram data
- [x] Multi-language support
- [ ] Supabase backend integration
- [ ] Real-time Telegram group sync
- [ ] User reputation system
- [ ] Payment integration
- [ ] Push notifications
- [ ] Reviews and ratings

## Contributing

This is a Telegram Mini App built for the LOCALS platform.

## License

Proprietary