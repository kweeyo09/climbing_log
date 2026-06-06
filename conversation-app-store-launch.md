# App Store Launch Conversation

---

**User:** what's the next step if i need to launch this app

**Assistant:** This is an **Expo (React Native)** app. To launch it, just run:

```powershell
npx expo start
```

or the shortcut:

```powershell
npm start
```

After it starts, you'll get a QR code and options to open in:
- **Android emulator** — press `a` (requires Android Studio + emulator set up)
- **iOS simulator** — press `i` (Mac only)
- **Expo Go on your phone** — scan the QR code with the Expo Go app

Since you're on Windows, the **Android emulator** or **Expo Go on your phone** are your two practical options. If you don't have an emulator set up yet, Expo Go on your phone is the fastest path — install it from the Play Store or App Store, then scan the QR code.

---

**User:** as in launching it as an app on the app store

**Assistant:** You have the app config ready (`app.json` looks good) but no `eas.json` yet. Here's the full path to get on the App Store / Play Store using **EAS** (Expo's build service):

**Step 1 — Set up EAS**
```powershell
npm install -g eas-cli
eas login          # uses your Expo account
eas build:configure   # generates eas.json
```

**Step 2 — Create store accounts**
- **Apple App Store**: enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
- **Google Play Store**: register on [Google Play Console](https://play.google.com/console) ($25 one-time)

**Step 3 — Build**
```powershell
eas build --platform ios      # for App Store
eas build --platform android  # for Play Store
```
EAS handles signing certificates and provisioning profiles automatically if you let it.

**Step 4 — Submit**
```powershell
eas submit --platform ios
eas submit --platform android
```
This uploads directly to App Store Connect / Google Play Console. Then you go through Apple/Google's review process (Apple takes 1–3 days, Google is usually faster).

**What you already have set up:**
- Bundle identifier: `com.kweeyo09.ascenta` ✓
- Android package name ✓
- Permissions declared ✓
- Icons and splash ✓

The main blockers before you can build are: an **Expo account**, an **Apple Developer account** (for iOS), and optionally a **Google Play account** (for Android).

---

**User:** i want to launch it so people can try it out as a demo on appstore first, is that the same step

**Assistant:** No, that's easier — you want **TestFlight** (Apple's beta testing platform). It skips the full App Store review and lets people install it directly via a link.

**The TestFlight path:**

**Step 1 — You still need these:**
- Apple Developer account ($99/year — no way around this)
- Expo account (free) → `eas login`

**Step 2 — Configure EAS**
```powershell
npm install -g eas-cli
eas build:configure
```

**Step 3 — Build for iOS**
```powershell
eas build --platform ios
```

**Step 4 — Submit to TestFlight**
```powershell
eas submit --platform ios
```
This pushes the build to App Store Connect. Then in App Store Connect you add testers by email, or generate a **public link** anyone can use to install via TestFlight.

**What testers need:** Just the free **TestFlight app** on their iPhone — then they tap your link and install.

**Review time:** Apple still does a brief review for TestFlight (~1 day usually, sometimes a few hours).

So the $99/year Apple Developer account is the main gate. Do you already have one?
