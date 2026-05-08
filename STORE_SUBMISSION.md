# goPay — App Store & Google Play Submission Guide

## Project Details

| Field | Value |
|---|---|
| App Name | goPay |
| Bundle / Package ID | `com.gopay.app` |
| Version | `1.0.0` |
| Min Android | API 24 (Android 7.0+) |
| Min iOS | 14.0+ |

---

# PART 1 — APPLE APP STORE (iOS)

## Step 1 — Get the project onto your Mac

Download or clone this Replit project to your Mac:
```bash
# In Terminal on your Mac:
git clone <your-replit-git-url>
cd gopay
npm install
npm run build
npx cap sync
```

## Step 2 — Install CocoaPods and pod dependencies

```bash
# Install CocoaPods if you haven't already
sudo gem install cocoapods

# Install iOS native dependencies
cd ios/App
pod install
cd ../..
```

## Step 3 — Open in Xcode

```bash
npx cap open ios
# This opens ios/App/App.xcworkspace in Xcode
# IMPORTANT: Always open the .xcworkspace file, NOT .xcodeproj
```

## Step 4 — Configure Signing

1. In Xcode, click the **App** project in the left sidebar
2. Select the **App** target → **Signing & Capabilities** tab
3. Check **Automatically manage signing**
4. Set **Team** → your Apple Developer account
5. Confirm **Bundle Identifier** is `com.gopay.app`

## Step 5 — Add App Icons

You need a **1024×1024 PNG** logo (no transparency, no rounded corners):

1. Go to **appicon.co** → upload your 1024px goPay icon → download iOS pack
2. In Xcode, click **Assets.xcassets** → **AppIcon**
3. Drag the downloaded icons into each slot

## Step 6 — Test on a real iPhone

1. Plug in your iPhone
2. Select your device from the top device toolbar
3. Press **▶ Run** — confirm the app launches correctly

## Step 7 — Archive for App Store

1. In the device menu, select **Any iOS Device (arm64)** (not your plugged-in phone)
2. Menu: **Product → Archive**
3. Wait a few minutes — the **Organizer** window opens when done

## Step 8 — Upload to App Store Connect

In the Organizer window:
1. Select the archive → **Distribute App**
2. Choose **App Store Connect** → **Upload**
3. Leave all defaults, click through → **Upload**
4. Xcode uploads the binary (takes 2–5 minutes)

## Step 9 — Submit on App Store Connect

1. Go to **appstoreconnect.apple.com**
2. **My Apps → + → New App**
3. Fill in:
   - Name: `goPay`
   - Bundle ID: `com.gopay.app`
   - SKU: `gopay-tz-001`
   - Primary Language: English
4. Under **1.0 Prepare for Submission**:
   - Add screenshots (6.7" iPhone required: 1290×2796 px)
   - Paste the app description below
   - Under **Build** — select the build you just uploaded
   - Age Rating: **4+**
   - Category: **Finance**
5. Click **Submit for Review** — approval takes 1–3 days

---

# PART 2 — GOOGLE PLAY STORE (Android)

## Step 1 — Install Android Studio on your Mac

Download free from: **developer.android.com/studio**

## Step 2 — Open the Android project

1. Open Android Studio
2. **Open** → navigate to your project → select the **android/** folder
3. Wait for Gradle sync to finish

## Step 3 — Generate a Signing Keystore (one-time only)

In Terminal:
```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore ~/gopay-release-key.keystore \
  -alias gopay \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```
You'll be asked to set a password. **Save this password permanently — losing it means you can never update the app on the store.**

## Step 4 — Configure Signing Credentials

Create `android/local.properties` and add these lines (this file is gitignored):
```properties
MYAPP_UPLOAD_STORE_FILE=/Users/yourname/gopay-release-key.keystore
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
MYAPP_UPLOAD_KEY_ALIAS=gopay
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

## Step 5 — Add App Icons

In Android Studio:
1. Right-click `app/src/main/res` → **New → Image Asset**
2. Icon Type: **Launcher Icons (Adaptive and Legacy)**
3. Upload your goPay logo PNG → **Next → Finish**

## Step 6 — Build Signed Release AAB

In Android Studio:
1. **Build → Generate Signed Bundle / APK**
2. Select **Android App Bundle** → **Next**
3. Browse to your keystore file, enter all passwords and alias
4. Select **release** build variant → **Finish**

Output file:
```
android/app/release/app-release.aab
```

## Step 7 — Upload to Google Play Console

1. Go to **play.google.com/console**
2. **Create app** → Name: `goPay`, Language: Swahili, Type: App
3. Complete the dashboard checklist:
   - App access: all features accessible (or add demo login credentials)
   - Content rating questionnaire
   - Target audience: **18+**
   - Category: **Finance**
   - Data safety form: declare financial data, location
4. **Production → Releases → Create new release**
5. Upload your `app-release.aab`
6. Add release notes (Swahili + English)
7. **Start rollout to Production** — approval takes 1–7 days for new apps

---

# Store Listing Content (ready to copy-paste)

## App Description (English + Swahili)

```
goPay — Tanzania's Digital Wallet

goPay ni programu ya dijitali ya fedha iliyoundwa kwa ajili ya Watanzania.

HUDUMA ZETU / OUR SERVICES:
• Pochi ya Dijitali — Hifadhi na tuma pesa kwa urahisi
• Malipo ya Simu — M-Pesa, Airtel Money, Tigo Pesa, Halopesa
• Malipo ya Bili — TANESCO, DAWASCO, huduma za serikali
• Safari — Tiketi za ndege, basi, feri, na SGR
• Mikopo — Omba mkopo mdogo haraka bila foleni
• GOrewards — Pata pointi kila unapotumia goPay
• Multi-Currency — Dola, Pauni, Euro na zaidi

USALAMA / SECURITY:
• Usimbaji fiche 256-bit AES
• Biometrics (Face ID / fingerprint)
• Inafuata sheria za Benki Kuu ya Tanzania (BoT)

Pakua goPay leo!
---
Send money, pay bills, book travel, apply for micro-loans,
and earn rewards — all in one secure Tanzanian fintech app.
Regulated and compliant with Bank of Tanzania (BoT) guidelines.
```

## Short Description (Android, max 80 chars)
```
Pochi ya dijitali ya Tanzania — Tuma, Lipa, Hifadhi kwa urahisi
```

## Keywords (iOS, max 100 chars)
```
pesa,wallet,mpesa,airtel,tigo,malipo,safari,mikopo,tanzania,fintech
```

---

# Icon & Screenshot Requirements

## Icons
| Platform | Size | Format | Notes |
|---|---|---|---|
| iOS App Store | 1024×1024 | PNG | No alpha channel, no rounded corners |
| Android Play Store | 512×512 | PNG | High-res icon |
| Android Feature Graphic | 1024×500 | PNG/JPG | Required banner image |

Use **appicon.co** — upload one 1024×1024 PNG, it generates all required sizes for both platforms.

## Screenshots (minimum required)

| Platform | Size | Count |
|---|---|---|
| iPhone 6.7" | 1290×2796 | At least 1 (max 10) |
| iPhone 6.5" | 1242×2688 | At least 1 |
| Android Phone | 1080×1920 | At least 2 |

**Tip**: Take screenshots on a real device using Xcode (iOS) or the Android emulator.

---

# Every Future Update

Whenever you change the app:

```bash
# 1. Make your code changes in Replit
npm run build        # rebuild web app
npx cap sync         # push to native projects

# 2. Download updated project to Mac

# 3. iOS: Open Xcode → increment Build Number → Product → Archive → Distribute
# 4. Android: Increment versionCode in android/app/build.gradle → Generate Signed Bundle

# IMPORTANT: versionCode must increase by at least 1 for every Play Store upload
# IMPORTANT: Build Number must increase by at least 1 for every App Store upload
```

---

# Troubleshooting

| Issue | Fix |
|---|---|
| `pod install` fails | Run `sudo gem update cocoapods` then retry |
| Xcode signing error | Team not selected — go to Signing & Capabilities tab |
| Blank white screen on device | Run `npx cap sync` then rebuild |
| Gradle sync fails | Check Android Studio SDK is installed (Tools → SDK Manager) |
| `JAVA_HOME not set` | Install JDK 17, run `export JAVA_HOME=$(/usr/libexec/java_home)` |
| App rejected by Apple | Most common reason: missing privacy policy URL |
| Play Store policy violation | Finance apps need a working login or demo credentials for reviewer |
