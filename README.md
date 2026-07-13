# goPay 🟢

**A mobile-first financial super app built for East Africa — payments, government services, travel, and rewards in one place, Swahili-first from day one.**

[![Status](https://img.shields.io/badge/status-active_development-yellow)]()
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)]()
[![License](https://img.shields.io/badge/license-proprietary-red)]()

---

## What this is

goPay is a fintech super app designed around how money actually moves in East African markets — not a Western banking app translated into Swahili. It combines everyday payments, bill and government-service payments, travel booking, and a loyalty layer (**GoRewards**) into a single native mobile experience, with an offline USSD fallback path for users without reliable data access.

Positioning is closest to Revolut, WeChat Pay, and Selcom, but built specifically around Tanzanian payment rails and regulatory expectations from the ground up rather than adapted after the fact.

**Current status:** active development, pre-launch. App Store / Google Play submission groundwork is in progress (see `STORE_SUBMISSION.md`).

---

## Core Features

- **Payments** — peer-to-peer transfers, merchant payments, bill pay
- **Government services** — planned integration path for public-sector payments
- **Travel** — in-app booking flows
- **GoRewards** — loyalty and cashback layer across all transaction types
- **Merchant tools** — a business-facing side for accepting payments
- **Offline fallback** — USSD path for low-connectivity users
- **Swahili-first UI** — localization built in from the start, not bolted on

> Regulatory positioning note: goPay is being built with Tanzanian financial regulatory requirements in mind. Formal compliance status (Bank of Tanzania or equivalent) should be confirmed by legal/compliance review before this is stated as fact in any investor-facing material — this README intentionally doesn't assert compliance that hasn't been formally verified.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React + Vite |
| UI components | Radix UI |
| Mobile shell | Capacitor (iOS + Android from one codebase) |
| Backend / data | Supabase |
| Native builds | Android via Gradle, iOS via CocoaPods/Xcode |

---

## Getting Started (Local Dev)

### Prerequisites
- Node.js 18+
- npm
- For mobile builds: Xcode (iOS) and/or Android Studio (Android)

### Installation

```bash
git clone https://github.com/creova-gif/gopay.git
cd gopay
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your own Supabase project values:

| Variable | Required | Notes |
|---|---|---|
| `VITE_SUPABASE_PROJECT_ID` | Yes | Your Supabase project ID |
| `VITE_SUPABASE_ANON_KEY` | Yes | Public anon key only — never the service role key |

### Running locally

```bash
npm run dev
```

### Building for mobile

```bash
npm run build
npx cap sync
npx cap open ios      # requires macOS + Xcode
npx cap open android  # requires Android Studio
```

Full app store submission steps (bundle IDs, signing, store listing requirements) are documented in `STORE_SUBMISSION.md`.

---

## Project Structure

```
Gopay/
├── android/          # Native Android project (Capacitor)
├── ios/              # Native iOS project (Capacitor)
├── src/              # React application source
├── .env.example      # Environment variable template
└── STORE_SUBMISSION.md
```

---

## Roadmap / Status

- [x] Core UI and navigation
- [x] Mobile shell (iOS + Android via Capacitor)
- [ ] Government services integration
- [ ] Formal regulatory compliance review and sign-off
- [ ] App store submission

---

## Contributing

This is a private, proprietary CREOVA product. External contributions are not accepted at this time.

## License

Proprietary — All Rights Reserved. See `LICENSE`.

## Credits

Built by CREOVA. Product lead: Justin Mafie.


## Related Products

This is one of three connected CREOVA products forming a single East African fintech / creator-economy thesis: the consumer-facing app where earnings, payments, and everyday financial life happen. See [Sauti-Os](https://github.com/creova-gif/Sauti-Os), [Kultr-Hub](https://github.com/creova-gif/Kultr-Hub), and the full [East Africa Fintech Thesis](https://github.com/creova-gif/CREOVA/blob/main/EAST-AFRICA-FINTECH-THESIS.md) for how they connect.

---

## Ecosystem context

This repo is one of three pieces of a broader East Africa fintech and creator-economy thesis, alongside `Gopay`, `Sauti-Os`, and `Kultr-Hub`. See [`EAST-AFRICA-FINTECH-THESIS.md`](https://github.com/creova-gif/CREOVA/blob/main/EAST-AFRICA-FINTECH-THESIS.md) in the CREOVA repo for how these connect — and an honest accounting of what's actually integrated today versus what's still conceptual.
