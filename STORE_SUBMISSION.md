# goPay — Mobile App Store Submission Guide

## What Was Set Up

Your existing React/Vite web app has been wrapped with **Capacitor**, which produces
native Android (APK/AAB) and iOS (IPA) binaries ready for store submission.
All your existing code stays exactly the same — Capacitor just adds a thin native shell around it.

---

## Project Details

| Field | Value |
|---|---|
| App Name | goPay |
| Package / Bundle ID | `com.gopay.app` |
| Web build directory | `build/` |
| Min Android SDK | 24 (Android 7.0+) |
| Min iOS | 14.0+ |

---

## Step 1 — Clone & Build on Your Machine

```bash
git clone <your-repo-url>
cd gopay
npm install
npm run build          # builds the React app into build/
npx cap sync           # copies build/ into android/ and ios/
```

---

## Step 2 — Google Play Store (Android APK/AAB)

### Requirements
- **Android Studio** (free) — https://developer.android.com/studio
- **Java 17+**
- A Google Play Developer account ($25 one-time fee)

### Build the APK / AAB

```bash
# Open in Android Studio:
npx cap open android

# OR build release APK from command line:
cd android
./gradlew assembleRelease        # produces APK
./gradlew bundleRelease          # produces AAB (recommended for Play Store)
```

The signed AAB will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

### Sign the App (required for store)

1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Create a new keystore (keep this file safe — you need it for all future updates)
3. Fill in your key details, generate the signed AAB
4. Upload the AAB to Google Play Console

### Play Store Listing Requirements
- **Screenshots**: Minimum 2 phone screenshots (1080×1920 px)
- **Feature Graphic**: 1024×500 px banner
- **App Icon**: 512×512 px (already in `public/icons/icon-512x512.png`)
- **Short description**: ≤ 80 characters
- **Full description**: ≤ 4000 characters
- **Category**: Finance → Mobile Wallet
- **Content Rating**: Complete IARC questionnaire (Finance apps are typically rated Everyone)
- **Privacy Policy URL**: Required (must be a publicly accessible URL)
- **Data Safety Form**: Declare what data the app collects (financial data, location)

---

## Step 3 — Apple App Store (iOS IPA)

### Requirements
- **macOS** computer (required — cannot build iOS on Windows/Linux)
- **Xcode 15+** (free from Mac App Store)
- **Apple Developer Account** ($99/year) — https://developer.apple.com
- CocoaPods: `sudo gem install cocoapods`

### Build the IPA

```bash
# Install iOS dependencies first (on Mac):
cd ios/App
pod install
cd ../..

# Open in Xcode:
npx cap open ios

# In Xcode:
# 1. Select your Team (Apple Developer account)
# 2. Set Bundle Identifier: com.gopay.app
# 3. Product → Archive
# 4. Distribute App → App Store Connect
```

### App Store Listing Requirements
- **Screenshots**: iPhone 6.7" (1290×2796 px) and 6.5" (1242×2688 px) — at least 1 each
- **App Preview Video**: Optional but recommended
- **App Icon**: 1024×1024 px (no alpha channel, no rounded corners — Apple adds them)
- **Privacy Policy URL**: Required
- **Age Rating**: 4+ (Finance category)
- **Keywords**: malipo, pesa, Tanzania, wallet, mobile money, safari
- **Category**: Finance
- **Subtitle**: "Pochi ya Dijitali Tanzania" (30 chars max)

---

## Step 4 — Update App Icons (Important!)

The current icons in `public/icons/` need to be replaced with proper goPay-branded icons.

### Required Sizes
| Platform | Sizes |
|---|---|
| Android | 48×48, 72×72, 96×96, 144×144, 192×192, 512×512 |
| iOS | 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024 px |

### Easy Way — Use a Tool
1. Create a 1024×1024 px goPay icon (green `#16a34a` background, white wallet icon)
2. Go to **https://www.appicon.co** or **https://capacitor-assets.netlify.app**
3. Upload your icon → download the generated asset pack
4. Replace files in:
   - `android/app/src/main/res/mipmap-*/`
   - `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

---

## Workflow for Updates

Every time you make code changes:

```bash
npm run build       # rebuild web app
npx cap sync        # push changes to native projects
# Then rebuild APK/IPA as above
```

Or use the shortcut scripts:
```bash
npm run cap:sync           # build + sync in one command
npm run cap:android        # build + sync + open Android Studio
npm run cap:ios            # build + sync + open Xcode
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `JAVA_HOME not set` | Install JDK 17, set `export JAVA_HOME=$(/usr/libexec/java_home)` |
| `pod install failed` | Run `sudo gem install cocoapods` then `pod install` in `ios/App/` |
| `Manifest merger failed` | Check `android/app/src/main/AndroidManifest.xml` for conflicts |
| App crashes on launch | Check `adb logcat` for WebView errors |
| Blank white screen | Run `npx cap sync` to push latest build files |
| Keyboard covers inputs | Already handled — Capacitor Keyboard plugin is configured |

---

## Environment Variables for Production

Before building for store release, make sure your Supabase keys are baked in:

The app reads from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at build time.
These are already embedded in the `build/` output after `npm run build`.

For production releases, set these in your CI/CD pipeline or `.env.production` file.
