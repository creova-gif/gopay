# GOPAY — Product Requirements Document (PRD)
**Version:** 1.0  
**Date:** June 2026  
**Product:** GOPAY Super App  
**Market:** Tanzania  
**Owner:** GOPAY Product Team  

---

## 1. Executive Summary

GOPAY is Tanzania's first all-in-one fintech super app. It consolidates digital payments, mobile money, bill settlements, travel bookings, government services, and financial tools into a single Swahili-first mobile experience. The platform targets the 60%+ of Tanzanians who are unbanked or underserved by traditional financial institutions, and the growing smartphone-enabled population that currently juggles multiple USSD menus and fragmented apps.

**Mission:** Make every Tanzanian financially empowered — regardless of bank status — through one trusted, beautiful, and accessible app.

---

## 2. Problem Statement

| Problem | Impact |
|---|---|
| Fragmented mobile money apps (M-Pesa, Airtel, Tigo, Halopesa each separate) | Users lose time, pay multiple fees, can't see a unified balance |
| No single place for bills + travel + government services | High friction for everyday financial life |
| Low financial literacy and no AI guidance in Swahili | Poor budgeting, no savings discipline, debt traps |
| Unbanked population locked out of credit | Small entrepreneurs can't grow |
| Paper-based government transactions | Corruption risk, slow processing, travel required |

---

## 3. Target Users

### Primary Personas

**Amina — The Urban Millennial (25–35)**
- Lives in Dar es Salaam, uses smartphone daily
- Earns TZS 800K–2M/month
- Currently switches between M-Pesa, Airtel Money, and a bank app
- Wants: one place for everything, rewards for loyalty, clean UI

**Juma — The Small Business Owner (30–50)**
- Runs a duka (shop) in Mwanza
- Needs: QR merchant payments, invoice-free sales, quick cash-in/out
- Currently uses USSD heavily; tired of transaction limits and delays

**Fatuma — The Rural User (18–45)**
- Semi-urban, feature-phone transitioning to smartphone
- Primary use: receive money, pay bills, buy airtime
- Needs: Swahili-first, simple flows, offline resilience

**David — The Frequent Traveler (28–45)**
- Books SGR trains, domestic flights, ferries regularly
- Needs: one-stop booking, e-tickets, reward points on travel

---

## 4. Goals & Success Metrics

### Launch Goals (0–6 months)
| Goal | KPI | Target |
|---|---|---|
| User acquisition | Registered users | 50,000 |
| Activation | Users completing first transaction | 70% |
| Retention | Monthly active users (MAU) | 60% of registered |
| Revenue | Transaction fee revenue | TZS 50M/month |
| NPS | Net Promoter Score | > 45 |

### Growth Goals (6–18 months)
| Goal | KPI | Target |
|---|---|---|
| Scale | Registered users | 500,000 |
| Merchant network | Onboarded merchants | 10,000 |
| Loan disbursements | Micro-loans issued | TZS 2B total |
| Travel | Monthly travel bookings | 20,000 |

---

## 5. Feature Modules

---

### MODULE 1 — Digital Wallet (Pochi ya Dijitali)

**Description:** The core balance and money management hub. Aggregates all mobile money networks and shows a unified TZS balance.

**Features:**
- Unified balance display (M-Pesa + Airtel + Tigo + Halopesa + GOPAY balance)
- Deposit (top-up from any network)
- Withdraw to mobile money or bank
- Transaction history with filters (date, type, amount)
- Real-time balance refresh
- Balance locking / spend limits
- Virtual GOPAY card (display-only, for online payments)
- Multi-currency sub-wallet (USD, KES, EUR, GBP)

**Acceptance Criteria:**
- Balance updates within 5 seconds of confirmed transaction
- History loads last 90 days with pagination
- Failed transactions clearly surfaced with retry option

---

### MODULE 2 — Send & Receive Money (Tuma / Pokea)

**Description:** P2P money transfer across all Tanzanian networks.

**Features:**
- Send by phone number, GOPAY username, or QR scan
- Transfer to any network (M-Pesa, Airtel, Tigo, Halopesa, bank account)
- Receive via QR code or shared payment link
- Scheduled / recurring transfers
- Contact favourites for quick send
- Transfer limits per BoT regulation (daily/monthly caps)
- Beneficiary nicknames

**Acceptance Criteria:**
- Same-network transfer completes in < 10 seconds
- Cross-network transfer completes in < 60 seconds
- User notified via push + SMS on send AND receive

---

### MODULE 3 — Payments & Bill Pay (Malipo / Bili)

**Description:** One-stop bill payments for utilities, government, and services.

**Sub-features:**

| Bill Type | Provider |
|---|---|
| Electricity | TANESCO |
| Water | DAWASCO |
| Internet | Various ISPs |
| TV subscription | DSTV, Azam TV |
| Tax payments | TRA |
| Traffic fines | TARURA / Police |
| School fees | Selected institutions |
| Airtime & data | Vodacom, Airtel, Tigo, Halotel |

**Acceptance Criteria:**
- Bill reference number validated before payment
- Confirmation receipt generated and downloadable as PDF
- Scheduled bills with reminder notifications

---

### MODULE 4 — Merchant Payments (Lipa kwa QR)

**Description:** QR-based payments for shops, restaurants, and service providers.

**Features:**
- Scan merchant QR to pay
- Display personal QR code to receive from customer
- NFC tap-to-pay (Android devices)
- Merchant search & directory
- Payment history per merchant
- Split bill feature (split total with contacts)
- 10-minute payment countdown timer for security

**Acceptance Criteria:**
- QR scan to payment confirmation in < 8 seconds
- NFC payment works offline (queued for sync)
- Merchants receive instant push notification on receipt

---

### MODULE 5 — Travel Hub (Safari)

**Description:** Complete end-to-end travel booking for all major Tanzanian transport modes.

#### 5a. Flights
- Search domestic + regional routes (JNIA, MIA, ZNZ, etc.)
- List results with price, duration, airline
- Seat map selection
- Extras (luggage, meals)
- Digital boarding pass / e-ticket (QR code)
- Flight status push alerts

#### 5b. SGR Trains (TAZARA / Tanzania Railways)
- Route selection (Dar – Dodoma – Mwanza corridor)
- Schedule and class selection (Economy, Business, First)
- Seat picker
- QR e-ticket

#### 5c. Ferries
- Zanzibar ferry routes (Azam Marine, Kilimanjaro)
- Schedule, deck/seat class, passenger details
- QR e-ticket + offline access

#### 5d. Buses
- National bus operators (Dar Express, Kilimanjaro, Scandinavia)
- Route search, operator comparison
- Seat map
- Digital ticket

#### 5e. Hotels
- Search by city, dates, guests
- Room types, amenities, photos
- Booking confirmation + cancellation policy

#### 5f. National Parks
- Browse TANAPA parks (Serengeti, Ngorongoro, Kilimanjaro, etc.)
- Package selection (day visit, camping, full safari)
- Visitor details entry
- Digital park permit (QR code)

**Acceptance Criteria:**
- All e-tickets accessible offline
- Booking confirmation within 30 seconds
- Push notification 24h before departure

---

### MODULE 6 — Government Services (Huduma za Serikali)

**Features:**
- NIDA national ID verification / lookup
- Birth certificate application
- Driving licence renewal
- Passport application status
- Business registration (BRELA)
- TRA tax returns / TIN lookup
- Traffic fine payment and clearance
- Land title search (MLHHSD)

**Acceptance Criteria:**
- Government API responses surfaced within 10 seconds
- Failure states show actionable error messages in Swahili
- Receipts downloadable as PDF

---

### MODULE 7 — GOrewards (Zawadi)

**Description:** Loyalty programme that rewards every GOPAY transaction with points.

**Tiers:**
| Tier | Name | Points Required | Benefits |
|---|---|---|---|
| 1 | Mwanzo (Starter) | 0 | 1x earn rate |
| 2 | Fedha (Silver) | 5,000 | 1.5x earn rate, free transfers |
| 3 | Dhahabu (Gold) | 20,000 | 2x earn, priority support |
| 4 | Almasi (Diamond) | 50,000 | 3x earn, concierge, lounge access |

**Features:**
- Points earned on every payment, transfer, bill, and travel booking
- Points redemption: discounts, airtime, travel upgrades
- Tier progress ring (visual)
- Holographic digital membership card
- Bonus point events (flash challenges, referrals)
- Points history and expiry tracking

---

### MODULE 8 — Financial Insights (Uchunguzi wa Fedha)

**Features:**
- Monthly spending summary by category (food, transport, bills, etc.)
- Bar / line chart toggle
- AI spending tip (Swahili)
- Comparison vs previous month
- Biggest expense highlight
- Savings rate tracker

---

### MODULE 9 — Budget Tracker (Bajeti)

**Features:**
- Set monthly budget per category
- Visual SVG spending ring (used vs. remaining)
- Color-coded thresholds (green < 70%, amber 70–90%, red > 90%)
- AI budget tip of the week
- Overspend alerts (push notification)
- Add custom categories

---

### MODULE 10 — Micro-Loans (Mikopo)

**Description:** Accessible credit for individuals and small businesses, underwritten by transaction history.

**Features:**
- Credit score calculation (based on GOPAY transaction history)
- Loan eligibility check (instant)
- Loan products: Emergency, Business, Education, Agriculture
- Application flow (amount, term, purpose)
- Repayment schedule
- Active loan tracker with progress bar
- Early repayment option

**Lending partners:** Integration-ready for CRDB, NMB, and microfinance institutions.

**Acceptance Criteria:**
- Credit score updates monthly
- Loan decision returned in < 60 seconds
- Repayment deducted automatically from wallet on due date

---

### MODULE 11 — Group Money Pools (Vikoba)

**Description:** Digital chama — collaborative savings groups (Tanzanian tradition).

**Features:**
- Create group with name, target amount, deadline
- Invite members by phone/username
- Each member sets contribution amount and frequency
- Group wallet (pooled balance)
- Contribution history per member
- Payout trigger (admin or vote-based)
- Group chat / announcements

---

### MODULE 12 — Multi-Currency Wallet

**Features:**
- Sub-wallets in USD, KES, EUR, GBP, ZAR
- Live exchange rates (ticker strip)
- FX conversion flow (FROM / TO with live rate preview)
- Rate alerts (notify when rate hits a target)
- SVG sparklines per currency (7-day trend)
- Transaction history per currency

---

### MODULE 13 — AI Travel Assistant

**Features:**
- Conversational Swahili-first chatbot
- Suggests travel routes, prices, and times
- Books directly from chat (intent → booking flow)
- Remembers past trips for context
- Travel tips per destination

---

### MODULE 14 — Security & KYC

**Features:**
- Biometric login (Face ID / fingerprint)
- PIN-based fallback
- NIDA-based identity verification (KYC Level 1, 2, 3)
- Device management (view / revoke active sessions)
- Transaction PIN (separate from login PIN)
- Fraud alerts (unusual spend patterns)
- 2-factor authentication (SMS OTP)

---

### MODULE 15 — Merchant Dashboard

**Features:**
- Business onboarding flow
- Daily / weekly / monthly revenue summary
- Transaction list with customer reference
- QR code generator and printing
- Refund initiation
- Settlement to bank / mobile money
- Staff accounts (admin / cashier roles)

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | App loads in < 3 seconds on 4G; core screens load in < 1.5 seconds |
| Offline | QR payments, ticket viewing, and balance display available offline |
| Security | AES-256 data encryption; TLS 1.3 for all API calls |
| Compliance | Bank of Tanzania (BoT) PSSP licensing; NIDA KYC integration |
| Accessibility | WCAG 2.1 AA; Swahili language first; support for low-literacy icon-led UI |
| Scalability | Backend handles 100,000 concurrent users at launch |
| Uptime | 99.9% monthly SLA |
| Data residency | All data stored in Tanzania / East Africa region |

---

## 7. Technical Architecture Summary

| Layer | Technology |
|---|---|
| Mobile app | React Native + Expo ~52 |
| Web PWA | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 (web), StyleSheet + Reanimated (mobile) |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Payments | ClickPesa gateway (M-Pesa, Airtel, Tigo, Halopesa, Visa/MC) |
| AI | Supabase Edge Functions + LLM API |
| Push | Expo Notifications / Firebase Cloud Messaging |
| Analytics | Custom event tracking via Supabase |

---

## 8. Regulatory & Compliance

- **Bank of Tanzania (BoT):** PSP / PSSP licence required before live money movement
- **NIDA Integration:** KYC identity verification via government API
- **AML/KYC tiers:**
  - Level 1 (phone only): TZS 200,000/day limit
  - Level 2 (NIDA verified): TZS 5,000,000/day limit
  - Level 3 (full business KYC): unlimited
- **Data Protection:** Tanzania's Electronic and Postal Communications Act (EPOCA) compliance
- **TRA:** Tax reporting obligations on merchant settlements

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| BoT licensing delay | Medium | High | Launch in sandbox mode; partner with licensed PSP |
| Mobile money API instability | High | High | Fallback aggregator (Selcom / Pesapal); retry logic |
| Low smartphone penetration in rural areas | Medium | Medium | PWA + USSD fallback for core features |
| Cybersecurity breach | Low | Critical | Penetration testing, bug bounty, 2FA mandatory for high-value txns |
| Competition from M-Pesa Super App | High | Medium | Differentiate via travel, rewards, AI, and government services |

---

## 10. Roadmap

### Phase 1 — Core Wallet (Q3 2026)
- Auth, KYC, wallet, send/receive, bill payments, GOrewards basics

### Phase 2 — Travel & Commerce (Q4 2026)
- Full travel hub (flights, SGR, ferries, buses), merchant QR, government services

### Phase 3 — Intelligence & Credit (Q1 2027)
- AI assistant, micro-loans, budget tracker, insights, multi-currency

### Phase 4 — Community & Scale (Q2 2027)
- Group pools (Vikoba), merchant dashboard, B2B APIs, national park permits

---

## 11. User Stories

### Authentication & Onboarding

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-001 | New user | Sign up with my phone number and email | I can create a GOPAY account |
| US-002 | New user | Verify my identity using my NIDA number | My account is trusted for higher limits |
| US-003 | Returning user | Log in using my fingerprint or Face ID | I don't have to type a password every time |
| US-004 | Returning user | Reset my PIN via SMS OTP | I can recover access if I forget it |
| US-005 | User | Set a separate transaction PIN | My payments are extra secure |

### Wallet & Money Management

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-010 | User | See my total wallet balance on the home screen | I know how much I have at a glance |
| US-011 | User | Top up my GOPAY wallet from M-Pesa | I can add money easily |
| US-012 | User | Withdraw from GOPAY to Airtel Money | I can access cash when needed |
| US-013 | User | View my full transaction history with date filters | I can track my spending |
| US-014 | User | Hold USD and KES in sub-wallets | I can manage foreign currency without a bank |
| US-015 | User | Convert TZS to USD at the live rate | I can lock in a rate before travelling |

### Send & Receive

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-020 | User | Send money to a contact's phone number | I can pay anyone instantly |
| US-021 | User | Show my QR code to receive payment | Anyone can pay me without knowing my number |
| US-022 | User | Scan a QR code to pay a merchant | I can pay at shops without cash |
| US-023 | User | Schedule a recurring transfer to my sister | I don't have to remember to send every month |
| US-024 | User | Split a restaurant bill with 3 friends | We each pay our share in one flow |

### Bill Payments

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-030 | User | Pay my TANESCO electricity bill with my meter number | I can top up power without going to a kiosk |
| US-031 | User | Buy Vodacom data bundles | I can get online immediately |
| US-032 | User | Pay a traffic fine using the fine reference number | I can clear my record without visiting the office |
| US-033 | User | Schedule my DAWASCO water bill for the 1st of each month | It's paid automatically every month |
| US-034 | User | Download a payment receipt as PDF | I have proof of payment for records |

### Travel

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-040 | Traveler | Search available flights from DAR to ZNZ | I can compare prices and times |
| US-041 | Traveler | Select a specific seat on the seat map | I get the window seat I prefer |
| US-042 | Traveler | Receive a QR e-ticket after booking | I can board without printing anything |
| US-043 | Traveler | Book an SGR train from Dar to Dodoma | I can travel by train without visiting the station |
| US-044 | Traveler | Book a Zanzibar ferry for 2 adults | I can plan a family trip in the app |
| US-045 | Traveler | Buy a Serengeti National Park day permit | I can visit without queueing at the gate |
| US-046 | Traveler | Ask the AI for the cheapest way to get to Arusha | I get a personalised travel recommendation in Swahili |

### Government Services

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-050 | Citizen | Verify my NIDA national ID number | I can confirm my identity is correct |
| US-051 | Citizen | Pay my TRA annual tax filing fee | I meet my legal obligation without queuing |
| US-052 | Business owner | Check my TIN (Tax ID) status | I know my registration is current |
| US-053 | Driver | Renew my driving licence online | I avoid the long TRA/SUMATRA queue |

### GOrewards

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-060 | User | Earn points on every payment | I'm rewarded for using GOPAY regularly |
| US-061 | User | See my tier progress on the rewards screen | I know how close I am to the next level |
| US-062 | User | Redeem points for airtime | I get a tangible benefit from my loyalty |
| US-063 | User | View my points history | I can verify all earned and redeemed points |
| US-064 | Gold user | Access priority customer support | My issue is resolved faster than standard users |

### Financial Intelligence

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-070 | User | See a monthly spending chart by category | I understand where my money goes |
| US-071 | User | Set a monthly budget for food | I don't overspend in a category |
| US-072 | User | Receive an alert when I hit 80% of my budget | I can adjust spending before running out |
| US-073 | User | Read an AI spending tip in Swahili | I get practical advice I can act on today |
| US-074 | User | Compare this month vs last month | I can see if my financial habits are improving |

### Micro-Loans

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-080 | User | Check my credit score in the app | I know my current borrowing eligibility |
| US-081 | User | Apply for a TZS 200,000 emergency loan | I can cover an unexpected expense immediately |
| US-082 | User | See my repayment schedule before accepting a loan | I know exactly what I'll owe each week |
| US-083 | Business owner | Apply for a business growth loan | I can buy more stock without external borrowing |
| US-084 | User | Make an early loan repayment | I clear my debt faster and save on interest |

### Group Pools (Vikoba)

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-090 | User | Create a savings group and invite friends | We can save together towards a shared goal |
| US-091 | Group member | Contribute TZS 50,000 to my chama every month | My contribution is tracked automatically |
| US-092 | Group admin | Trigger a payout to the designated member | The winner receives the pool for this cycle |
| US-093 | Group member | See each member's contribution history | There is full transparency in the group |

### Merchant

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-100 | Merchant | Onboard my shop to GOPAY in under 10 minutes | I can start accepting QR payments today |
| US-101 | Merchant | View today's revenue summary | I know how much I've earned |
| US-102 | Merchant | Print my QR code for the counter | Customers can scan and pay without a terminal |
| US-103 | Merchant | Settle funds to my bank account | I can access my earnings outside GOPAY |
| US-104 | Merchant | Issue a refund to a customer | I can correct a payment error professionally |

---

## 12. Acceptance Criteria Summary

All features must meet these baseline standards before release:

1. **Swahili-first** — all user-facing strings available in Swahili; English as secondary
2. **Error handling** — every API failure shows a human-readable Swahili error + retry option
3. **Offline resilience** — balance, tickets, and QR display work without internet
4. **Accessibility** — minimum tap target 44×44pt; colour contrast ≥ 4.5:1
5. **Performance** — no screen takes > 2 seconds to reach interactive state on 4G
6. **Security** — no PII stored in client-side logs; all tokens stored in secure storage
7. **Compliance** — transaction limits enforced per BoT tier rules
8. **Analytics** — every key action (tap, payment, booking) emits a trackable event
