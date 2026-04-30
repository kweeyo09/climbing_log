# ClimbingLog 🧗

A React Native (Expo) mobile app to track climbing sessions — where you went, how long, what routes you climbed, and reflections.

## Stack

| Layer       | Tool                    | What it does                                      |
|-------------|-------------------------|---------------------------------------------------|
| Mobile app  | **Expo** (React Native) | iOS + Android from one TypeScript codebase        |
| Navigation  | **Expo Router**         | File-based screen routing (like Next.js for apps) |
| Local DB    | **expo-sqlite**         | SQLite on device — works offline                  |
| Cloud DB    | **Supabase**            | Postgres + Auth + auto REST API                   |
| State       | **Zustand**             | Lightweight global state management               |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**
4. Go to **Settings → API** and copy your URL and anon key

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install the Expo Go app on your phone

- iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
- Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 5. Run the dev server

```bash
npx expo start
```

Scan the QR code in your terminal with your phone's camera (iOS) or the Expo Go app (Android). The app will load live on your device and hot-reload as you save files.

---

## Project Structure

```
climbing-log/
├── app/
│   ├── _layout.tsx          # Root layout, loads sessions on start
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab bar configuration
│   │   ├── index.tsx        # Calendar view
│   │   ├── log.tsx          # Log new session form
│   │   ├── history.tsx      # All sessions list
│   │   └── stats.tsx        # Stats & charts
│   └── session/
│       └── [id].tsx         # Session detail modal
├── components/
│   ├── SessionCard.tsx      # Reusable session card
│   └── RouteEntry.tsx       # Route row in log form
├── constants/
│   ├── grades.ts            # French & V-scale grade arrays
│   └── theme.ts             # Colors, spacing, radii
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── db.ts                # SQLite helpers
├── store/
│   └── sessions.ts          # Zustand store (state + actions)
├── types/
│   └── index.ts             # TypeScript interfaces
└── supabase/
    └── schema.sql           # Run this in Supabase SQL Editor
```

---

## Building for real devices

You need the EAS CLI (Expo Application Services — Expo's cloud build tool):

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Then build:

```bash
# iOS — produces a .ipa file you upload to TestFlight
eas build --platform ios

# Android — produces an .aab file you upload to Google Play
eas build --platform android
```

### TestFlight (iOS beta testing)
1. Build with `eas build --platform ios`
2. Download the `.ipa`
3. Upload via [Transporter](https://apps.apple.com/app/transporter/id1450874784) or Xcode
4. In App Store Connect → TestFlight → add testers

### Google Play Internal Testing (Android)
1. Build with `eas build --platform android`
2. Go to Google Play Console → Internal Testing → create release → upload `.aab`

---

## Notes

- Data is saved locally on device first (SQLite) and synced to Supabase when online
- The `●` indicator on session cards means the session hasn't synced to the cloud yet
- You can use the app without Supabase — just leave the `.env` values empty and everything still works offline
