# Scoutica — Complete MVP Specification

> **Version:** 1.0 · **Date:** 2026-03-30
> **Stack:** Next.js 16 (App Router, Turbopack) · Prisma · PostgreSQL · NextAuth v5 · Stripe · next-intl (IT/EN) · Tailwind CSS · shadcn/ui

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Authentication & Onboarding](#3-authentication--onboarding)
4. [Data Models (Complete Schema)](#4-data-models-complete-schema)
5. [Model Dashboard](#5-model-dashboard)
6. [Scout Dashboard](#6-scout-dashboard)
7. [Studio Dashboard](#7-studio-dashboard)
8. [Admin Dashboard](#8-admin-dashboard)
9. [Marketing / Public Pages](#9-marketing--public-pages)
10. [Messaging System](#10-messaging-system)
11. [Notifications](#11-notifications)
12. [Subscriptions & Payments (Stripe)](#12-subscriptions--payments-stripe)
13. [Trust & Safety](#13-trust--safety)
14. [Internationalization (i18n)](#14-internationalization-i18n)
15. [Search & Discovery](#15-search--discovery)
16. [File Upload & Media](#16-file-upload--media)
17. [API Routes](#17-api-routes)
18. [Server Actions Catalog](#18-server-actions-catalog)
19. [UI Component Library](#19-ui-component-library)
20. [Routing & Navigation](#20-routing--navigation)
21. [Google Stitch Adaptation](#21-google-stitch-adaptation)

---

## 1. Product Overview

**Scoutica** is an Italian professional model scouting platform connecting three actor types:

| Actor | Purpose |
|-------|---------|
| **Models** | Build a portfolio, get discovered, apply to castings & jobs |
| **Scouts** (Agencies, Brands) | Discover talent, organize shortlists, post castings & jobs, send contact requests |
| **Studios** | List photography/event spaces for rent, manage bookings |

**Core value prop:** A vertically integrated marketplace for the Italian fashion industry — think "LinkedIn meets Casting Networks" localized for Italy.

**Locales:** Italian (default `it`) and English (`en`).
**Currency:** EUR (€).
**Region focus:** All 20 Italian regions with cities pre-seeded.

---

## 2. User Roles & Permissions

### 2.1 Role Enum

```
UserRole = MODEL | SCOUT | STUDIO | ADMIN
```

### 2.2 Role-Based Access Matrix

| Feature | MODEL | SCOUT | STUDIO | ADMIN |
|---------|:-----:|:-----:|:------:|:-----:|
| Create/edit own profile | ✓ | ✓ | ✓ | — |
| Portfolio upload | ✓ | — | — | — |
| Apply to castings/jobs | ✓ | — | — | — |
| Receive contact requests | ✓ | — | — | — |
| Send contact requests | — | ✓ | — | — |
| Create castings | — | ✓ | — | — |
| Create jobs (lavori) | — | ✓ | — | — |
| Shortlist boards | — | ✓ | — | — |
| Saved searches | — | ✓ (PRO) | — | — |
| Discover models | ✓ | ✓ | — | — |
| List studios | — | — | ✓ | — |
| Manage bookings | — | — | ✓ | — |
| Admin panel | — | — | — | ✓ |
| Approve/reject verifications | — | — | — | ✓ |
| Suspend users | — | — | — | ✓ |
| Resolve reports | — | — | — | ✓ |
| Toggle scout gate | — | — | — | ✓ |
| Messaging (conversations) | ✓ | ✓ | ✓ | — |
| Browse studios (public) | ✓ | ✓ | ✓ | — |

### 2.3 Scout Subtypes

```
ScoutSubtype = SCOUT | AGENCY | BRAND
```

Each subtype registers the same way but `ScoutProfile.subtype` tracks their business classification.

### 2.4 Scout Gate

A global toggle (`SiteSetting key: "scoutGateOpen"`) controls whether new scouts can proceed to verification. When closed, new scouts are set to `WAITLISTED` status. When reopened, all `WAITLISTED` scouts transition to `VERIFICATION_REQUIRED`.

### 2.5 Middleware Route Protection

- Dashboard routes (`/model/*`, `/scout/*`, `/studio/*`, `/admin/*`) require authentication + email verification.
- Role mismatches redirect to `/dashboard` (which itself role-redirects).
- Auth pages (`/login`, `/register`) redirect authenticated users to `/dashboard`.
- `/verify-email` and `/waitlist` are accessible regardless of auth state.

---

## 3. Authentication & Onboarding

### 3.1 Auth Provider

NextAuth v5 with:
- **Credentials provider** (email + bcrypt-hashed password)
- **Google OAuth provider**
- Session strategy: JWT (edge-compatible)
- Custom pages: `/login`, `/dashboard` (new user), `/login` (error)

### 3.2 Registration Flows

#### Model Registration
1. User fills: name, email, password (minLength 8)
2. Server creates `User` (role=MODEL) + `Subscription` (plan=FREE) + `ModelProfile` (status=INCOMPLETE, auto-generated slug)
3. Verification email sent with hashed token (HMAC-SHA256)
4. Redirect to `/verify-email?email=...`

#### Scout Registration
1. User fills: name, email, password, subtype (SCOUT/AGENCY/BRAND), businessName, city, purposeOfUse
2. Server creates `User` (role=SCOUT) + `ScoutProfile` (verificationStatus depends on scout gate: PENDING → WAITLISTED or VERIFICATION_REQUIRED) + `Subscription` (plan=FREE)
3. Verification email sent
4. Redirect to `/verify-email?email=...`

#### Studio Registration
1. User fills: name, email, password, businessName
2. Server creates `User` (role=STUDIO) + `StudioProfile` + `Subscription` (plan=FREE)
3. Verification email sent

### 3.3 Email Verification
- Token hashed with HMAC-SHA256, stored in `VerificationToken` table
- 24-hour expiry
- Rate-limited resend (1 per minute)
- On success: sets `user.emailVerified`, deletes token
- Rendered via React Email (`emails/verification-email.tsx`)

### 3.4 Password Reset
- `requestPasswordReset(email)` — generates token, logs it (MVP: no email yet), returns success regardless (prevents email enumeration)

### 3.5 Post-Auth Redirect Chain
```
Login → /dashboard → role check →
  MODEL  → /model/home
  SCOUT  → /scout/profile
  STUDIO → /studio/studios
  ADMIN  → /admin
```

---

## 4. Data Models (Complete Schema)

### 4.1 Enums (Full List)

| Enum | Values |
|------|--------|
| `UserRole` | MODEL, SCOUT, STUDIO, ADMIN |
| `ScoutSubtype` | SCOUT, AGENCY, BRAND |
| `Gender` | MALE, FEMALE, NON_BINARY, OTHER |
| `EyeColor` | BROWN, BLUE, GREEN, HAZEL, GRAY, AMBER, OTHER |
| `HairColor` | BLACK, BROWN, BLONDE, RED, AUBURN, GRAY, WHITE, OTHER |
| `Ethnicity` | CAUCASIAN, AFRICAN, ASIAN, LATINO, MIDDLE_EASTERN, MIXED, OTHER |
| `ModelCategory` | COMMERCIAL, EDITORIAL, RUNWAY, BEAUTY, FITTING, SHOWROOM, PLUS_SIZE, PETITE, FITNESS, LINGERIE, SWIMWEAR, OTHER |
| `ProfessionalStatus` | NEW_FACE, EXPERIENCED, AGENCY_REPRESENTED, FREELANCE |
| `ProfileVisibility` | PUBLIC, VERIFIED_SCOUTS_ONLY, PRIVATE |
| `ModelProfileStatus` | INCOMPLETE, ACTIVE |
| `VerificationStatus` | PENDING, WAITLISTED, VERIFICATION_REQUIRED, VERIFICATION_SUBMITTED, APPROVED, REJECTED |
| `ContactRequestStatus` | PENDING, ACCEPTED, REJECTED, EXPIRED |
| `ContactReason` | SCOUTING, CASTING, JOB_OPPORTUNITY, EDITORIAL, OTHER |
| `CastingStatus` | DRAFT, PUBLISHED, CLOSED, ARCHIVED |
| `ApplicationStatus` | PENDING, ACCEPTED, REJECTED, WITHDRAWN |
| `JobType` | SHOOTING, ECOMMERCE, CAMPAIGN, RUNWAY, FITTING, SHOWROOM, SOCIAL_COLLAB, EVENT, HOSTESS, OTHER |
| `CastingType` | PHYSICAL, ONLINE |
| `JobStatus` | DRAFT, PUBLISHED, CLOSED, ARCHIVED |
| `PipelineStage` | SAVED, CONTACTED, REPLIED, SHORTLISTED, BOOKED |
| `PlanTier` | FREE, MODEL_PRO, STARTER, PRO |
| `SubscriptionStatus` | ACTIVE, PAST_DUE, CANCELED, TRIALING, INCOMPLETE |
| `ReportReason` | HARASSMENT, INAPPROPRIATE_CONTENT, FAKE_PROFILE, SPAM, OTHER |
| `ReportStatus` | PENDING, REVIEWED, RESOLVED, DISMISSED |
| `ReportedContentType` | USER, PROFILE, IMAGE, CASTING, MESSAGE |
| `NotificationType` | CONTACT_REQUEST_RECEIVED/ACCEPTED/REJECTED, NEW_MESSAGE, APPLICATION_SUBMITTED/ACCEPTED/REJECTED, JOB_APPLICATION_SUBMITTED/ACCEPTED/REJECTED, VERIFICATION_APPROVED/REJECTED, BOOST_ACTIVATED/EXPIRED, STUDIO_INQUIRY_RECEIVED, BOOKING_RECEIVED/CONFIRMED/CANCELLED, SYSTEM |
| `StudioType` | PHOTO_STUDIO, SHOWROOM, REHEARSAL_SPACE, EVENT_SPACE, COWORKING, OTHER |
| `StudioStatus` | DRAFT, PUBLISHED, PAUSED, ARCHIVED |
| `StudioInquiryStatus` | PENDING, REPLIED, CLOSED |
| `BookingStatus` | PENDING, CONFIRMED, CANCELLED, COMPLETED |

### 4.2 Core Models

#### User
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| name | String? | Display name |
| email | String | Unique |
| emailVerified | DateTime? | Set on email verification |
| hashedPassword | String? | bcrypt hash (null for OAuth) |
| image | String? | Avatar URL |
| role | UserRole | Default: MODEL |
| locale | String | Default: "it" |
| isSuspended | Boolean | Default: false |
| suspendedReason | String? | Admin-provided reason |
| termsAcceptedAt | DateTime? | ToS acceptance timestamp |
| lastActiveAt | DateTime? | Activity tracking |
| createdAt/updatedAt | DateTime | Auto-managed |

**Relations:** accounts[], sessions[], modelProfile?, scoutProfile?, studioProfile?, subscription?, conversationParticipants[], notifications[], blocksGiven[], blocksReceived[], reportsFiled[], profileViews[], profileLikes[], waitlistEntry?, studioInquiries[], studioBookings[]

#### ModelProfile
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | Unique FK → User |
| slug | String | Unique, auto-generated from name |
| fullName | String? | |
| bio | String? (Text) | |
| dateOfBirth | DateTime? | Age gating: must be 18+ to publish |
| gender | Gender? | |
| city | String? | Indexed for search |
| region | String? | Indexed for search |
| height | Int? | In cm |
| bust | Int? | In cm |
| waist | Int? | In cm |
| hips | Int? | In cm |
| shoeSize | Float? | |
| dressSize | String? | |
| eyeColor | EyeColor? | |
| hairColor | HairColor? | |
| ethnicity | Ethnicity? | |
| categories | ModelCategory[] | Array of categories |
| professionalStatus | ProfessionalStatus? | |
| spokenLanguages | String[] | |
| travelAvailability | Boolean | Default: false |
| instagramUrl | String? | Auto-prefixed with https:// |
| tiktokUrl | String? | |
| youtubeUrl | String? | |
| xUrl | String? | |
| websiteUrl | String? | |
| followerCount | Int? | Social media followers |
| videoUrl | String? | Pro plan only |
| bookPdfUrl | String? | Pro plan only |
| status | ModelProfileStatus | INCOMPLETE → ACTIVE |
| visibility | ProfileVisibility | Default: PUBLIC |
| isPublished | Boolean | Default: false |
| publishedAt | DateTime? | |
| completenessScore | Int | 0–100, auto-calculated |
| viewCount | Int | Indexed, incremented on view |
| likeCount | Int | Indexed, incremented on like |

**Indexes:** isPublished+visibility, city, region, completenessScore, viewCount, likeCount

#### PortfolioImage
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| modelProfileId | String | FK → ModelProfile |
| url | String | Public URL |
| key | String | Storage object key |
| width/height | Int? | Image dimensions |
| sizeBytes | Int? | File size |
| order | Int | Sort order (default 0) |
| isCover | Boolean | Only one per profile |

#### ScoutProfile
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | Unique FK → User |
| subtype | ScoutSubtype | SCOUT, AGENCY, or BRAND |
| businessName | String? | |
| roleTitle | String? | |
| bio | String? (Text) | |
| city | String? | |
| country | String | Default: "IT" |
| professionalEmail | String? | |
| websiteUrl | String? | |
| socialProfileUrl | String? | |
| vatNumber | String? | Italian P.IVA |
| purposeOfUse | String? (Text) | Why they need access |
| verificationStatus | VerificationStatus | Lifecycle: PENDING → WAITLISTED → VERIFICATION_REQUIRED → VERIFICATION_SUBMITTED → APPROVED/REJECTED |
| verificationNotes | String? | Admin notes |
| verifiedAt | DateTime? | |

**Relations:** contactsSent[], castings[], jobs[], shortlistBoards[], savedSearches[], privateNotes[]

#### ContactRequest
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| scoutProfileId | String | FK → ScoutProfile |
| modelProfileId | String | FK → ModelProfile |
| subject | String | |
| message | String (Text) | |
| reason | ContactReason | |
| status | ContactRequestStatus | Default: PENDING |
| respondedAt | DateTime? | |
| conversationId | String? | Unique FK → Conversation (created on accept) |

**Constraint:** Unique per scout-model pair.

#### Casting
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| scoutProfileId | String | FK → ScoutProfile |
| title | String | Required for publish |
| description | String (Text) | Required for publish |
| city | String? | |
| region | String? | |
| castingDate | DateTime? | |
| deadline | DateTime? | |
| requirements | String? (Text) | |
| compensation | String? | |
| isPaid | Boolean | Default: false |
| spots | Int? | Number of open spots |
| notes | String? (Text) | |
| castingType | CastingType? | PHYSICAL or ONLINE |
| time | String? | |
| address | String? | |
| instructions | String? (Text) | |
| materialsRequired | String? (Text) | |
| status | CastingStatus | DRAFT → PUBLISHED → CLOSED → ARCHIVED |

#### CastingApplication
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| castingId | String | FK → Casting |
| modelProfileId | String | FK → ModelProfile |
| introMessage | String? (Text) | |
| status | ApplicationStatus | PENDING → ACCEPTED/REJECTED/WITHDRAWN |

**Constraint:** Unique per casting-model pair.

#### Job
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| scoutProfileId | String | FK → ScoutProfile |
| title | String | |
| description | String (Text) | |
| jobType | JobType | 10 types |
| brand | String? | |
| city | String? | |
| region | String? | |
| location | String? | Detailed location |
| jobDates | String? | |
| compensation | String? | |
| isPaid | Boolean | Default: false |
| modelRequirements | String? (Text) | |
| spotsNeeded | Int? | |
| deadline | DateTime? | |
| notes | String? (Text) | |
| referenceImages | String[] | Image URLs |
| status | JobStatus | DRAFT → PUBLISHED → CLOSED → ARCHIVED |

#### JobApplication
Same structure as CastingApplication, FK → Job instead.

#### Conversation / Message / ConversationParticipant
| Model | Key Fields |
|-------|------------|
| Conversation | id, lastMessageAt |
| ConversationParticipant | conversationId, userId, lastReadAt (unique per conversation+user) |
| Message | conversationId, senderId, body (1–5000 chars), createdAt |

#### ShortlistBoard / ShortlistItem
| Model | Key Fields |
|-------|------------|
| ShortlistBoard | scoutProfileId, name, description |
| ShortlistItem | boardId, modelProfileId, pipelineStage (SAVED→CONTACTED→REPLIED→SHORTLISTED→BOOKED), note |

#### PrivateNote
Scout-specific private notes on model profiles. Unique per scout-model pair.

#### SavedSearch
Stores filter JSON for scout saved searches (PRO plan only).

#### Subscription
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | Unique FK → User |
| stripeCustomerId | String? | Unique |
| stripeSubscriptionId | String? | Unique |
| stripePriceId | String? | |
| plan | PlanTier | FREE, MODEL_PRO, STARTER, PRO |
| status | SubscriptionStatus | ACTIVE, PAST_DUE, CANCELED, TRIALING, INCOMPLETE |
| currentPeriodStart/End | DateTime? | |
| cancelAtPeriodEnd | Boolean | Default: false |

#### Boost
7-day paid profile visibility boost for models.
| Field | Type |
|-------|------|
| modelProfileId | String FK |
| stripePaymentId | String? |
| startsAt / endsAt | DateTime |

#### Notification
| Field | Type |
|-------|------|
| userId | String FK |
| type | NotificationType |
| title | String |
| body | String |
| link | String? |
| isRead | Boolean |
| metadata | Json? |

#### Block
Bidirectional user blocking. Unique per blocker-blocked pair.

#### Report
| Field | Type |
|-------|------|
| reporterId | String FK |
| reportedUserId | String? |
| reportedContentType | ReportedContentType |
| reportedContentId | String? |
| reason | ReportReason |
| details | String? (Text) |
| status | ReportStatus |
| adminNotes | String? (Text) |

#### StudioProfile
| Field | Type |
|-------|------|
| userId | String Unique FK |
| businessName | String? |
| bio | String? (Text) |
| city / region | String? |
| country | String Default: "IT" |
| vatNumber | String? |
| websiteUrl | String? |
| phoneNumber | String? |

#### Studio
| Field | Type | Notes |
|-------|------|-------|
| studioProfileId | String FK | |
| slug | String Unique | Auto-generated |
| name | String | |
| description | String? (Text) | |
| studioType | StudioType | 6 types |
| address | String? | |
| city / region / zipCode | String? | |
| latitude / longitude | Float? | |
| sizeSqm | Int? | Square meters |
| maxCapacity | Int? | |
| amenities | String[] | |
| hourlyRate / dailyRate / weeklyRate | Float? | EUR |
| minHours | Int? | |
| availabilityNotes | String? (Text) | |
| contactEmail / contactPhone | String? | |
| status | StudioStatus | DRAFT → PUBLISHED → PAUSED → ARCHIVED |
| isPublished | Boolean | |

**Relations:** images[], inquiries[], bookings[], blockedDates[]

#### StudioImage
Same pattern as PortfolioImage (url, key, order, isCover).

#### StudioInquiry
| Field | Type |
|-------|------|
| studioId | String FK |
| userId | String? FK |
| name / email / phone | String |
| message | String (Text) |
| preferredDates / durationHours | String? / Int? |
| status | StudioInquiryStatus |

#### StudioBooking
| Field | Type |
|-------|------|
| studioId | String FK |
| userId | String FK |
| date | DateTime |
| startTime / endTime | String |
| totalPrice | Float? |
| notes | String? (Text) |
| status | BookingStatus |

#### StudioBlockedDate
Owner-defined unavailable dates per studio.

#### ProfileView
Daily-deduplicated view tracking (viewerUserId + modelProfileId + date).

#### ProfileLike
Toggle-based likes (unique per user + modelProfile).

#### WaitlistEntry
Collects optional info (fullName, businessName, city, professionalLink, talentTypesNeeded) from scouts during gate closure.

#### SiteSetting
Key-value store for global settings (e.g., `"scoutGateOpen" → "true"`).

---

## 5. Model Dashboard

### 5.1 Home (`/model/home`)
- **Greeting** with first name
- **Profile status alerts**: INCOMPLETE → "Complete your profile", not published → "Publish your profile"
- **Completeness progress bar** (shown if < 100%)
- **Metrics row** (4 cards):
  - Views this week (with trend % vs previous week)
  - Total likes
  - Pending contacts (links to /model/contacts)
  - Active applications (links to /model/applications)
- **Opportunities panel** (2-col span): Latest published castings + jobs the model hasn't applied to, with badges (casting vs job, paid)
- **Recent activity sidebar**: Latest notifications with read/unread dots, time-ago formatting
- **Quick actions**: Update Portfolio, Browse Opportunities buttons

### 5.2 Profile Editor (`/model/profile`)
Multi-section form editing all ModelProfile fields:
- Personal info: fullName, bio, dateOfBirth, gender
- Physical: height, bust, waist, hips, shoeSize, dressSize, eyeColor, hairColor, ethnicity
- Professional: categories (multi-select), professionalStatus, spokenLanguages, travelAvailability
- Social: instagramUrl, tiktokUrl, youtubeUrl, xUrl, websiteUrl, followerCount
- Media: videoUrl (PRO), bookPdfUrl (PRO)
- Visibility settings: PUBLIC / VERIFIED_SCOUTS_ONLY / PRIVATE

**Completeness calculation** (weighted scoring):
- fullName (15), bio (10), dateOfBirth (10), gender (5), city (10)
- height (8), 1+ measurement (7), eyeColor (3), hairColor (3), ethnicity (3)
- 1+ category (8), professionalStatus (5)
- 3+ photos (13)
- **Total: 100 points**

**Activation requirements** (INCOMPLETE → ACTIVE): fullName, dateOfBirth, city, gender, 1+ category, height
**Publish requirements** (ACTIVE → Published): age ≥ 18, fullName, ≥ 3 images, cover image set

### 5.3 Portfolio (`/model/portfolio`)
- Grid gallery of uploaded images with drag-to-reorder
- Upload button (plan-limited: FREE=6, MODEL_PRO=9)
- Set cover image (click action)
- Delete image (with confirmation)
- Plan upgrade prompt when at limit
- Accepted formats: PNG, JPEG, WebP — max 10 MB per file
- Images stored locally at `/public/uploads/portfolio/`

### 5.4 Castings (`/model/castings`)
- Browse all PUBLISHED castings
- Filter by city, region, casting type, paid/unpaid
- Casting detail page (`/model/castings/[id]`): full info + "Apply" button
- Apply: requires published profile, sends introMessage, creates CastingApplication

### 5.5 Jobs (Lavori) (`/model/lavori`)
- Same pattern as castings but for Job model
- Filter by jobType, city, region, paid/unpaid
- Detail page + apply flow

### 5.6 Applications (`/model/applications`)
- List of all casting + job applications
- Status badges: PENDING (yellow), ACCEPTED (green), REJECTED (red), WITHDRAWN (gray)
- Grouped or tabbed by casting vs job

### 5.7 Contacts (`/model/contacts`)
- List of incoming contact requests from scouts
- Each shows: scout name, subject, reason, message preview, timestamp
- Actions: Accept (creates conversation) or Reject
- Accepted contacts link to messaging

### 5.8 Messages (`/model/messages`)
- Conversation list with last message preview, timestamp, unread indicator
- Thread view (`/model/messages/[conversationId]`): chronological message bubbles, input field
- See §10 for full messaging spec

### 5.9 Discover (`/model/discover`)
- Browse other published model profiles
- Like/save functionality
- Model cards with cover image, name, city, categories

### 5.10 Notifications (`/model/notifications`)
- Chronological notification list with read/unread state
- Mark individual or all as read
- Deep-link to relevant page

### 5.11 Settings (`/model/settings`)
- Account: name, locale (IT/EN)
- Billing (`/model/settings/billing`): current plan, upgrade to MODEL_PRO, manage via Stripe portal, payment history
- Settings changes via PATCH `/api/settings`

---

## 6. Scout Dashboard

### 6.1 Profile (`/scout/profile`)
- Edit scout profile: businessName, roleTitle, bio, city, professionalEmail, websiteUrl, socialProfileUrl, vatNumber, purposeOfUse
- Verification status badge displayed prominently
- Link to verification page if needed

### 6.2 Verification (`/scout/verification`)
- Status-dependent view:
  - `PENDING` / `WAITLISTED`: informational waiting screen
  - `VERIFICATION_REQUIRED`: submit verification form (professionalEmail, websiteUrl, socialProfileUrl, vatNumber, purposeOfUse)
  - `VERIFICATION_SUBMITTED`: waiting for admin approval
  - `APPROVED`: ✓ badge, full access unlocked
  - `REJECTED`: show rejection notes, allow resubmission

### 6.3 Discover (`/scout/discover`)
- **Advanced model search** with 20+ filter criteria:
  - Location: city, region
  - Demographics: gender, ethnicity, age range
  - Physical: height range, eye color, hair color
  - Professional: categories, professional status, travel availability
  - Social: minimum follower count (PRO plan only)
  - Sort: newest, most viewed, most liked
- **Grid density selector**: comfortable / compact / dense
- **Pagination**: page-based with configurable page size
- **Model cards**: cover image, name, city, categories, like button, contact button
- Saved searches (PRO plan): save current filter set, recall later
- Like status shown per card (batch-loaded)

### 6.4 Shortlist Boards (`/scout/boards`)
- Create boards (plan-limited: STARTER=3, PRO=unlimited)
- Board list view with model count
- Board detail (`/scout/boards/[boardId]`):
  - Model cards organized by pipeline stage (kanban-style)
  - Pipeline: SAVED → CONTACTED → REPLIED → SHORTLISTED → BOOKED
  - Per-item notes
  - Add/remove models
  - Item limit per board: STARTER=50, PRO=unlimited

### 6.5 Castings (`/scout/castings`)
- List of scout's own castings with status badges
- Create new casting (`/scout/castings/new`): full form with all Casting fields
- Draft → Publish → Close lifecycle
- View applications (`/scout/castings/[id]/applications`):
  - List of applicants with model summary
  - Accept / reject each application (sends notification)

### 6.6 Jobs (Lavori) (`/scout/lavori`)
- Same lifecycle as castings for Job model
- Create job (`/scout/lavori/new`)
- View applications (`/scout/lavori/[id]/applications`)

### 6.7 Contacts (`/scout/contacts`)
- List of outbound contact requests
- Status tracking: PENDING, ACCEPTED, REJECTED, EXPIRED
- Plan-enforced limits:
  - STARTER: 20/month, 5/day
  - PRO: 100/month, 25/day
  - FREE: 0 (no contact sending)

### 6.8 Messages, Notifications, Settings
- Same patterns as model dashboard
- Billing: upgrade STARTER → PRO via Stripe

---

## 7. Studio Dashboard

### 7.1 Studios List (`/studio/studios`)
- Grid of owned studios with status badges
- Create new studio (`/studio/studios/new`): name, description, studioType, address, city, region, zipCode, sizeSqm, maxCapacity, amenities, rates (hourly/daily/weekly), minHours, contact info

### 7.2 Studio Editor (`/studio/studios/[id]`)
- Edit all studio fields
- **Photo management**: upload up to 10 images per studio (PNG/JPEG/WebP, max 10 MB), set cover, delete
- **Publish bar**: DRAFT → PUBLISHED publish action; PUBLISHED → PAUSED pause action
- **Availability management**: blocked dates calendar, view booked dates

### 7.3 Bookings (`/studio/bookings`)
- List of booking requests for all owned studios
- Status flow: PENDING → CONFIRMED → COMPLETED or CANCELLED
- Actions: confirm, cancel, complete
- Each booking shows: studio name, requester, date, time slot, total price, notes

### 7.4 Inquiries (`/studio/inquiries`)
- List of inquiries received for studios
- Status: PENDING → REPLIED → CLOSED
- Each shows: studio name, sender name/email/phone, message, preferred dates, duration
- Action: update status (reply/close)

### 7.5 Messages, Notifications, Settings
- Same patterns as other roles

---

## 8. Admin Dashboard

### 8.1 Overview (`/admin`)
- Stat cards: total users, models, scouts, studios, active castings, pending reports
- Quick links to admin sub-pages

### 8.2 Users (`/admin/users`)
- Full user list with filters: role, status (active/suspended), search by email/name
- User detail: role, email verification status, created date, suspension status
- Actions: suspend (with reason), unsuspend

### 8.3 Verifications (`/admin/verifications`)
- List of scouts with VERIFICATION_SUBMITTED status
- Each shows: scout info, businessName, websiteUrl, socialProfileUrl, vatNumber, purposeOfUse
- Actions: approve (sets APPROVED, creates notification) or reject (with notes, creates notification)

### 8.4 Reports (`/admin/reports`)
- List of pending reports
- Each shows: reporter, reported content type/ID, reason, details, timestamp
- Actions: resolve (with admin notes), dismiss (with admin notes)

### 8.5 Subscriptions (`/admin/subscriptions`)
- View all subscriptions across platform
- Filter by plan tier, status

### 8.6 Castings (`/admin/castings`)
- View all castings across platform with full details

### 8.7 Settings (`/admin/settings`)
- **Scout Gate Toggle**: open/close new talent buyer verification pipeline
- When toggled open: all WAITLISTED scouts transition to VERIFICATION_REQUIRED

---

## 9. Marketing / Public Pages

### 9.1 Landing Page (`/`)
- Hero section with value proposition
- **Featured models carousel**: profiles with active `Boost` (startsAt ≤ now ≤ endsAt)
- **Popular models grid**: top profiles by viewCount + likeCount (excludes boosted)
- CTA buttons for registration

### 9.2 Pricing (`/pricing`)
- Three plan cards side-by-side:
  - **Free** (Model): 6 photos, basic profile
  - **Model Pro** (€14.99/mo): 9 photos, video, PDF book, Pro badge, priority support
  - **Starter** (Scout, €39/mo): 20 contacts/mo, 3 boards, 50 items/board
  - **Pro** (Scout, €99/mo, "Popular" badge): 100 contacts/mo, unlimited boards, advanced filters, saved searches, priority support
- Bilingual feature lists (IT/EN)
- CTA buttons per plan

### 9.3 About (`/about`)
- Company information page

### 9.4 Studios Browse (`/studios`)
- Public search: filter by city, region, studioType, price range
- Paginated results with studio cards
- Studio detail (`/studios/[slug]`): full info, image gallery, booking form, inquiry form

### 9.5 Public Profile (`/profile/[slug]`)
- Public model profile view (only if isPublished=true)
- Cover image + portfolio gallery (clickable lightbox)
- All physical/professional stats
- Social links
- Like button (authenticated users)
- Contact button (scouts only, creates contact request)
- View recording (fire-and-forget, daily-deduplicated)
- Back link contextual: scouts → /scout/discover, others → /

### 9.6 Short URL (`/m/[slug]`)
- Redirects to `/profile/[slug]` (locale-aware redirect)
- Used as shareable model profile URL

---

## 10. Messaging System

### 10.1 Conversation Creation
- Conversations are created when a model **accepts** a contact request
- Both parties (scout + model) added as `ConversationParticipant`
- `ContactRequest.conversationId` links to the conversation

### 10.2 Message Flow
- `sendMessage(conversationId, body)`: 1–5000 chars, updates `conversation.lastMessageAt`
- `markConversationRead(conversationId)`: sets participant's `lastReadAt` to now
- Messages rendered chronologically in thread view

### 10.3 Conversation List
- Shows all conversations for current user
- Displays: other participant name, last message preview, timestamp
- Unread indicator based on `lastReadAt` vs `lastMessageAt`

### 10.4 Access Control
- Only participants can view/send in a conversation
- Participant verification on every message read/send

---

## 11. Notifications

### 11.1 Notification Types
- Contact: request received, accepted, rejected
- Messages: new message
- Applications: submitted, accepted, rejected (for both castings and jobs)
- Verification: approved, rejected
- Boosts: activated, expired
- Studios: inquiry received, booking received/confirmed/cancelled
- System: generic

### 11.2 Notification Delivery
- Created server-side via `createNotification()` in relevant action
- Fetched client-side via `getNotifications(limit=50)` + `getUnreadCount()`
- Mark read: individual or bulk
- Each notification has optional `link` for deep navigation
- `metadata` (JSON) available for structured data

### 11.3 UI
- Bell icon in header with unread count badge
- Full notification page at `/[role]/notifications`
- Read/unread dot indicator per item

---

## 12. Subscriptions & Payments (Stripe)

### 12.1 Plan Tiers & Limits

| Feature | FREE (Model) | MODEL_PRO (€14.99/mo) | STARTER (Scout, €39/mo) | PRO (Scout, €99/mo) |
|---------|:---:|:---:|:---:|:---:|
| Max portfolio photos | 6 | 9 | 3 | 3 |
| Video upload | ✗ | ✓ | ✗ | ✗ |
| PDF book upload | ✗ | ✓ | ✗ | ✗ |
| Contact requests/month | 0 | 0 | 20 | 100 |
| Contact requests/day | 0 | 0 | 5 | 25 |
| Shortlist boards | 0 | 0 | 3 | ∞ |
| Items per board | 0 | 0 | 50 | ∞ |
| Advanced filters | ✗ | ✗ | ✗ | ✓ |
| Saved searches | ✗ | ✗ | ✗ | ✓ |
| Priority support | ✗ | ✓ | ✗ | ✓ |

### 12.2 Stripe Integration

- **Checkout**: `createCheckoutSession(planKey)` → Stripe Checkout with `mode: "subscription"`
- **Portal**: `createPortalSession()` → Stripe Billing Portal for plan management
- **Boost**: `createBoostCheckout()` → One-time payment (€ TBD), creates 7-day Boost record

### 12.3 Webhook Events Handled
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create/update Subscription or Boost |
| `customer.subscription.updated` | Sync plan tier, status, period dates |
| `customer.subscription.deleted` | Reset to FREE plan, set CANCELED status |
| `invoice.payment_failed` | Set PAST_DUE status |

### 12.4 Plan Enforcement
- Photo uploads checked against `PLAN_LIMITS[plan].maxPhotos`
- Contact requests checked against monthly/daily limits
- Board creation checked against `maxShortlistBoards`
- Board items checked against `maxItemsPerBoard`
- Video/PDF fields gated by `videoUpload` / `pdfBookUpload` flags

---

## 13. Trust & Safety

### 13.1 User Blocking
- Any user can block another via `Block` model
- Unique constraint: one block per blocker→blocked direction
- Blocked users hidden from search results (implementation-level)

### 13.2 Content Reporting
- Report types: USER, PROFILE, IMAGE, CASTING, MESSAGE
- Reasons: HARASSMENT, INAPPROPRIATE_CONTENT, FAKE_PROFILE, SPAM, OTHER
- Lifecycle: PENDING → REVIEWED → RESOLVED / DISMISSED
- Admin resolves with notes

### 13.3 User Suspension
- Admin can suspend with reason (sets `isSuspended=true`)
- Suspended users cannot access dashboard features
- Admin can restore access

### 13.4 Scout Verification Pipeline
- Prevents unverified scouts from accessing talent data
- Multi-step: registration → (waitlist if gate closed) → verification required → submit docs → admin review → approved/rejected

---

## 14. Internationalization (i18n)

### 14.1 Setup
- **Library**: next-intl
- **Locales**: `it` (default), `en`
- **Routing**: `/it/...` and `/en/...` prefix-based (locale in URL)
- **Message files**: `src/messages/en.json`, `src/messages/it.json`
- **Server**: `getTranslations()` — RSC-compatible
- **Client**: `useTranslations()` hook

### 14.2 Coverage
- All UI strings, labels, error messages, notification text
- Enum display labels (bilingual: `{ it: "...", en: "..." }`)
- Regions and cities (Italian names used universally)
- Plan feature descriptions
- Email templates

### 14.3 Locale Persistence
- `User.locale` field stores preference
- Middleware reads locale from URL path
- Language switcher updates URL + user preference

---

## 15. Search & Discovery

### 15.1 Model Search (`searchModelProfiles`)
**Filters available:**
| Filter | Type | Plan Req |
|--------|------|----------|
| city | String | — |
| region | String | — |
| gender | Gender | — |
| ethnicity | Ethnicity | — |
| ageMin / ageMax | Int | — |
| heightMin / heightMax | Int | — |
| eyeColor | EyeColor | — |
| hairColor | HairColor | — |
| categories | ModelCategory[] | — |
| professionalStatus | ProfessionalStatus | — |
| travelAvailability | Boolean | — |
| minFollowerCount | Int | PRO |
| sort | newest / views / likes | — |
| page / pageSize | Int | — |

**Query logic:**
- Only `isPublished=true` profiles
- Visibility filter: PUBLIC profiles always visible; VERIFIED_SCOUTS_ONLY visible only to APPROVED scouts
- `boostedFirst` flag: boosted profiles sorted to top
- Returns: profiles with cover image, slug, name, city, categories, viewCount, likeCount

### 15.2 Studio Search (`searchStudios`)
- Filters: city, region, studioType, maxHourlyRate, maxDailyRate
- Only `isPublished=true` studios
- Result: slug, name, type, city, hourlyRate, dailyRate, coverImage

### 15.3 Grid Density
Three display modes for search results:
- **Comfortable**: larger cards with more info
- **Compact**: medium cards
- **Dense**: small cards, more per row

---

## 16. File Upload & Media

### 16.1 Portfolio Images
- **Endpoint**: `POST /api/portfolio/upload`
- **Accepts**: FormData with `file` field
- **Formats**: PNG, JPEG, WebP
- **Max size**: 10 MB
- **Storage**: Local filesystem at `/public/uploads/portfolio/{profileId}-{timestamp}-{random}.{ext}`
- **Plan limit check**: enforced at upload time
- **Side effects**: creates PortfolioImage record, sets as cover if first image, recalculates completeness

### 16.2 Studio Images
- **Endpoint**: `POST /api/studio/upload`
- **Accepts**: FormData with `file` + `studioId` fields
- **Max images**: 10 per studio
- **Storage**: Local filesystem at `/public/uploads/studios/{studioId}-{timestamp}-{random}.{ext}`

### 16.3 Cover Image Management
- Portfolio: `POST /api/portfolio/cover` with `{ imageId }`
- Studio: action `setStudioCoverImage(imageId)`
- On delete: auto-promotes next image as cover

### 16.4 Image Deletion
- Portfolio: `POST /api/portfolio/delete` with `{ imageId }`
- Deletes file from disk + DB record
- Recalculates completeness score
- Auto-promotes cover if deleted image was cover

---

## 17. API Routes

| Method | Path | Auth | Purpose |
|--------|------|:----:|---------|
| GET/POST | `/api/auth/[...nextauth]` | — | NextAuth handler |
| PATCH | `/api/settings` | ✓ | Update user name/locale |
| POST | `/api/portfolio/upload` | MODEL | Upload portfolio image |
| POST | `/api/portfolio/cover` | MODEL | Set cover image |
| POST | `/api/portfolio/delete` | MODEL | Delete portfolio image |
| POST | `/api/studio/upload` | STUDIO | Upload studio image |
| POST | `/api/webhooks/stripe` | — | Stripe webhook (signature verified) |

---

## 18. Server Actions Catalog

### 18.1 Auth Actions
| Action | Description |
|--------|-------------|
| `registerModel` | Create model user + profile + subscription + send verification |
| `registerScout` | Create scout user + profile + subscription + send verification |
| `registerStudio` | Create studio user + profile + subscription + send verification |
| `requestPasswordReset` | Generate reset token (MVP: logged, not emailed) |

### 18.2 Email Verification
| Action | Description |
|--------|-------------|
| `sendVerificationEmail` | HMAC-SHA256 token, 24h expiry |
| `verifyEmail` | Validate token, set emailVerified |
| `resendVerificationEmail` | 1-minute rate limit |

### 18.3 Profile Actions
| Action | Description |
|--------|-------------|
| `updateModelProfile` | Update fields, auto-slug, auto-URL fix, recalculate completeness |
| `publishModelProfile` | Validate requirements, set isPublished=true |
| `unpublishModelProfile` | Set isPublished=false |
| `updateScoutProfile` | Update scout profile fields |
| `submitVerification` | Submit scout verification documents |

### 18.4 Portfolio Actions
| Action | Description |
|--------|-------------|
| `addPortfolioImage` | Add image with plan limit check |
| `deletePortfolioImage` | Delete + auto-promote cover |
| `setCoverImage` | Set specific image as cover |
| `reorderImages` | Reorder by ID array |

### 18.5 Engagement Actions
| Action | Description |
|--------|-------------|
| `recordProfileView` | Daily-deduplicated view tracking |
| `toggleProfileLike` | Like/unlike toggle |
| `getProfileLikeStatus` | Get like state + count |
| `getBatchLikeStatuses` | Batch check for grid views |

### 18.6 Contact & Communication
| Action | Description |
|--------|-------------|
| `sendContactRequest` | Scout→Model contact (plan limits enforced) |
| `respondToContactRequest` | Accept (creates conversation) or reject |
| `sendMessage` | Send in conversation (1-5000 chars) |
| `markConversationRead` | Update lastReadAt |
| `getConversations` | List user's conversations |
| `getConversationMessages` | Get thread messages |

### 18.7 Castings & Jobs
| Action | Description |
|--------|-------------|
| `createCasting` / `createJob` | Scout creates draft |
| `updateCasting` / `updateJob` | Edit draft/published |
| `publishCasting` / `publishJob` | Make visible to models |
| `closeCasting` / `closeJob` | Stop accepting applications |
| `applyToCasting` / `applyToJob` | Model applies (requires published profile) |
| `reviewApplication` / `reviewJobApplication` | Scout accepts/rejects |

### 18.8 Shortlist Actions
| Action | Description |
|--------|-------------|
| `createBoard` | Create board (plan-limited) |
| `deleteBoard` | Delete board + items |
| `addToBoard` / `removeFromBoard` | Manage board items (item-limited) |
| `updatePipelineStage` | Move item through pipeline |
| `updateItemNote` | Edit item note |

### 18.9 Studio Actions
| Action | Description |
|--------|-------------|
| `createStudio` | Create with auto-slug |
| `updateStudio` | Edit details |
| `publishStudio` / `pauseStudio` | Visibility toggle |
| `deleteStudio` | Delete studio |
| `deleteStudioImage` / `setStudioCoverImage` | Image management |
| `sendStudioInquiry` | Public inquiry form |
| `updateInquiryStatus` | Owner updates status |

### 18.10 Booking Actions
| Action | Description |
|--------|-------------|
| `createStudioBooking` | Book with overlap/blocked-date checks |
| `confirmBooking` / `cancelBooking` / `completeBooking` | Lifecycle management |
| `addBlockedDates` / `removeBlockedDate` | Availability management |

### 18.11 Stripe Actions
| Action | Description |
|--------|-------------|
| `createCheckoutSession` | Subscription checkout |
| `createPortalSession` | Billing portal |
| `createBoostCheckout` | One-time boost payment |

### 18.12 Admin Actions
| Action | Description |
|--------|-------------|
| `approveVerification` / `rejectVerification` | Scout verification review |
| `suspendUser` / `unsuspendUser` | User account suspension |
| `resolveReport` / `dismissReport` | Report moderation |
| `toggleScoutGate` | Open/close scout registration |

### 18.13 Notification & Waitlist
| Action | Description |
|--------|-------------|
| `createNotification` | Create for user |
| `getNotifications` / `getUnreadCount` | Fetch notifications |
| `markNotificationRead` / `markAllNotificationsRead` | Read state |
| `saveWaitlistInfo` | Upsert waitlist entry |

---

## 19. UI Component Library

### 19.1 Base Components (shadcn/ui)
Button, Card (CardHeader, CardTitle, CardContent, CardDescription, CardFooter), Badge, Progress, Input, Textarea, Select, Dialog, Separator, Avatar, Label, Tabs, Switch, Calendar, Popover, Toast/Sonner

### 19.2 Custom Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ClickableCover` | ui/ | Clickable cover image with lightbox |
| `ClickableGallery` | ui/ | Multi-image gallery with lightbox |
| `SearchFilters` | discover/ | Advanced search filter panel |
| `ModelCard` | discover/ | Profile card for search results |
| `GridDensitySelector` | discover/ | Comfortable/compact/dense toggle |
| `Pagination` | discover/ | Page-based navigation |
| `CastingForm` | forms/ | Full casting creation/edit form |
| `CastingApplyButton` | castings/ | Apply-to-casting action button |
| `ApplicationActions` | castings/ | Accept/reject application buttons |
| `ContactRequestList` | contacts/ | Contact request list with actions |
| `PublicProfileContactButton` | profile/ | Contact button on public profiles |
| `LikeButton` | profile/ | Heart toggle button |
| `BackLink` | shared/ | Contextual back navigation |
| `ScoutGateToggle` | admin/ | Admin gate toggle switch |
| `VerificationActions` | admin/ | Approve/reject verification buttons |
| `ReportActions` | admin/ | Resolve/dismiss report buttons |
| `NotificationBell` | layout/ | Header notification icon + count |
| `LanguageSwitcher` | layout/ | IT/EN locale toggle |
| `MobileBottomNav` | layout/ | Mobile navigation bar |
| `Sidebar` | layout/ | Desktop sidebar navigation |

### 19.3 Layout Components
- **Marketing layout**: Navbar + footer
- **Dashboard layout**: Sidebar (desktop) + Header + Mobile bottom nav
- **Auth layout**: Two-column (form left, decorative right)

---

## 20. Routing & Navigation

### 20.1 Complete Route Map

```
/ ─── [locale] ─┬─ (auth) ─┬─ /login
                │           ├─ /register
                │           ├─ /register/model
                │           ├─ /register/scout
                │           ├─ /register/studio
                │           ├─ /forgot-password
                │           ├─ /verify-email
                │           └─ /waitlist
                │
                ├─ (marketing) ─┬─ / (landing)
                │               ├─ /pricing
                │               ├─ /about
                │               ├─ /studios
                │               └─ /studios/[slug]
                │
                ├─ (dashboard) ─┬─ /dashboard (role redirect)
                │               ├─ /profile/[slug] (public model profile)
                │               │
                │               ├─ /model ─┬─ /home
                │               │          ├─ /profile
                │               │          ├─ /portfolio
                │               │          ├─ /castings
                │               │          ├─ /castings/[id]
                │               │          ├─ /lavori
                │               │          ├─ /lavori/[id]
                │               │          ├─ /applications
                │               │          ├─ /contacts
                │               │          ├─ /discover
                │               │          ├─ /messages
                │               │          ├─ /messages/[conversationId]
                │               │          ├─ /notifications
                │               │          ├─ /settings
                │               │          └─ /settings/billing
                │               │
                │               ├─ /scout ─┬─ /profile
                │               │          ├─ /verification
                │               │          ├─ /discover
                │               │          ├─ /boards
                │               │          ├─ /boards/[boardId]
                │               │          ├─ /castings
                │               │          ├─ /castings/new
                │               │          ├─ /castings/[id]/applications
                │               │          ├─ /lavori
                │               │          ├─ /lavori/new
                │               │          ├─ /lavori/[id]/applications
                │               │          ├─ /contacts
                │               │          ├─ /messages
                │               │          ├─ /messages/[conversationId]
                │               │          ├─ /notifications
                │               │          ├─ /settings
                │               │          └─ /settings/billing
                │               │
                │               ├─ /studio ─┬─ /studios
                │               │           ├─ /studios/new
                │               │           ├─ /studios/[id]
                │               │           ├─ /bookings
                │               │           ├─ /inquiries
                │               │           ├─ /messages
                │               │           ├─ /notifications
                │               │           └─ /settings
                │               │
                │               └─ /admin ─┬─ / (overview)
                │                          ├─ /users
                │                          ├─ /verifications
                │                          ├─ /reports
                │                          ├─ /subscriptions
                │                          ├─ /castings
                │                          └─ /settings
                │
                └─ /m/[slug] (short URL redirect → /profile/[slug])
```

### 20.2 Navigation Items

**Model sidebar:**
Dashboard, Discover, Portfolio, Castings, Lavori, Applications, Contacts, Messages, Notifications, Browse Studios, Settings

**Scout sidebar:**
Dashboard, Discover, Boards, Castings, Lavori, Contacts, Messages, Notifications, Browse Studios, Settings

**Studio sidebar:**
Studios, Bookings, Inquiries, Messages, Notifications, Settings

### 20.3 Mobile
- Bottom navigation bar with 4–5 primary items
- Hamburger menu for secondary items

---

## 21. Google Stitch Adaptation

> **Google Stitch** — "Transforms natural language into high-fidelity designs. Create, iterate, and collaborate in one seamless flow." (labs.google/stitch)

Stitch is an AI-powered design tool that generates high-fidelity UI from natural language prompts. It produces **visual prototypes**, not production code. The adaptation below translates every section of this MVP into structured prompts and a screen-by-screen prototyping plan optimized for Stitch's capabilities.

### 21.1 Stitch Project Structure

Organize the Stitch project as a **screen library** matching the route map. Each screen is generated via a dedicated prompt. Group screens into collections:

| Collection | Screens |
|------------|---------|
| **Auth** | Login, Register (type selector), Register Model, Register Scout, Register Studio, Verify Email, Forgot Password, Waitlist |
| **Marketing** | Landing Page, Pricing, About, Studios Browse, Studio Detail |
| **Model Dashboard** | Home, Profile Editor, Portfolio, Castings List, Casting Detail, Jobs List, Job Detail, Applications, Contacts, Discover, Messages List, Message Thread, Notifications, Settings, Billing |
| **Scout Dashboard** | Profile, Verification, Discover, Board List, Board Detail, Castings List, New Casting, Casting Applications, Jobs List, New Job, Job Applications, Contacts, Messages List, Message Thread, Notifications, Settings, Billing |
| **Studio Dashboard** | Studios List, New Studio, Studio Editor, Bookings, Inquiries, Messages, Notifications, Settings |
| **Admin** | Overview, Users, Verifications, Reports, Subscriptions, Castings, Settings |
| **Public** | Model Profile, Short URL (redirect — N/A for design) |
| **Shared** | Dashboard Layout (sidebar + header), Mobile Bottom Nav, Auth Layout |

### 21.2 Design System Prompt (Run First)

Use this as the **initial Stitch prompt** to establish the design system:

```
Design a design system for "Scoutica" — an Italian professional model scouting
platform. The brand is elegant, modern, and fashion-forward.

Color palette:
- Primary gold accent: #C9A96E (used for CTAs, badges, highlights)
- Background: white (#FFFFFF) with light gray surfaces (#F9FAFB)
- Dark mode support with slate grays
- Text: near-black (#0F172A) primary, muted gray (#64748B) secondary
- Status colors: green (success/accepted), red (error/rejected), amber (warning/pending)

Typography:
- Headings: "font-heading" — clean, semi-bold sans-serif
- Body: system sans-serif stack
- Sizes: 3xl for page titles, lg for section titles, sm for labels, xs for metadata

Components needed:
- Card with header, title, content, footer sections
- Button variants: default, outline, ghost, gold (primary CTA)
- Badge variants: default, secondary, gold, destructive
- Progress bar (horizontal, 2px height)
- Avatar (circular, with fallback initials)
- Input, Textarea, Select with labels
- Dialog/Modal
- Sidebar navigation with icons
- Mobile bottom navigation bar (5 items)
- Notification bell with unread count badge

Spacing: 8px grid system. Border radius: rounded-lg (8px) for cards, rounded-sm for inputs.
```

### 21.3 Screen-by-Screen Prompts

Below are optimized Stitch prompts for every screen. Each prompt contains the exact layout, data, and component requirements.

---

#### AUTH SCREENS

**Login:**
```
Design a login page with a two-column layout. Left column (60%): centered form
with Scoutica logo, "Sign in to your account" heading, email input, password
input with show/hide toggle, "Forgot password?" link, gold "Sign In" button,
divider with "or", "Sign in with Google" outline button, "Don't have an account?
Register" link. Right column (40%): decorative fashion photography background
with gold gradient overlay. Mobile: single column, form only.
```

**Register (Type Selector):**
```
Design a registration type selector page. Two-column layout, left side: heading
"Join Scoutica", subheading "Choose your account type". Three large cards
stacked vertically:
1. "Model" — camera icon, "Build your portfolio and get discovered"
2. "Scout / Agency / Brand" — search icon, "Find and connect with talent"
3. "Studio" — building icon, "List your space for rent"
Each card has an arrow-right icon and links to the respective registration form.
Right column: same decorative background as login. Footer: "Already have an
account? Sign in" link.
```

**Register Model / Scout / Studio:**
```
Design a model registration form. Two-column layout. Left: Scoutica logo,
"Create your model account" heading, form fields: Full Name, Email, Password
(min 8 chars), Confirm Password, Terms checkbox, gold "Create Account" button.
"Already have an account?" link. Right: decorative background.

[For Scout: add fields — Radio group for subtype (Scout/Agency/Brand), Business
Name, City dropdown, "How will you use Scoutica?" textarea]

[For Studio: add field — Business Name]
```

**Verify Email:**
```
Design an email verification page. Centered card on light background. Mail icon
at top. Title "Verify your email". Body text "We sent a verification link to
{email}". Input field for verification code. Gold "Verify" button. "Didn't
receive the email? Resend" link (disabled state with timer). "Back to login" link.
```

**Forgot Password:**
```
Design a forgot password page. Centered card. Key icon. Title "Reset your
password". Email input. Gold "Send Reset Link" button. "Back to login" link.
Success state: green checkmark, "Check your email for the reset link" message.
```

**Waitlist:**
```
Design a waitlist page. Centered card. Clock icon. Title "You're on the waitlist".
Body: "We're carefully reviewing new talent buyer applications." Optional info
fields: Full Name, Business Name, City, Professional Link, Talent Types Needed
(textarea). Gold "Save Info" button. Note: "We'll notify you when access opens."
```

---

#### MARKETING SCREENS

**Landing Page:**
```
Design a landing page for Scoutica model scouting platform. Full-width layout:

1. Navigation bar: Scoutica logo left, links (Pricing, Studios, About) center,
   Language toggle (IT/EN) and "Sign In" / "Get Started" buttons right.

2. Hero section: full-width with fashion photography background, overlay gradient.
   Large heading "La piattaforma italiana per lo scouting professionale" with
   English subtitle. Two CTA buttons: "I'm a Model" (gold) and "I'm a Scout"
   (outline white).

3. Featured Models carousel: horizontal scrollable row of model cards. Each card:
   portrait cover photo, name, city, gold "BOOSTED" badge. Title "Featured Talent".

4. Popular Models grid: 4-column grid of model cards. Each: cover photo, name,
   city, category badges, view count, like count with heart icon. Title "Popular
   Profiles".

5. Footer: Scoutica logo, links (About, Pricing, Studios), social icons
   (Instagram), copyright, language selector.
```

**Pricing:**
```
Design a pricing page with navigation bar. Title "Simple, transparent pricing".
Four cards in a row:

1. "Free" — €0/month, for Models. Features: "6 portfolio photos", "Basic
   profile", "Apply to castings". Outline "Current Plan" button.

2. "Model Pro" — €14.99/month, for Models. Features: "9 portfolio photos",
   "Video upload", "PDF book upload", "Pro badge", "Priority support". Gold
   "Upgrade" button.

3. "Starter" — €39/month, for Scouts. Features: "20 contacts/month", "5/day",
   "3 shortlist boards", "50 profiles/board", "Basic filters". Outline
   "Get Started" button.

4. "Pro" — €99/month, for Scouts. "POPULAR" badge. Features: "100 contacts/month",
   "25/day", "Unlimited boards", "Unlimited profiles/board", "Advanced filters",
   "Saved searches", "Priority support". Gold "Get Started" button.
```

**Studios Browse:**
```
Design a studio browse page. Nav bar at top. Title "Find the perfect studio".
Filter bar: City dropdown, Region dropdown, Studio Type dropdown (Photo Studio,
Showroom, etc.), Price range slider. Results: 3-column grid of studio cards.
Each card: cover photo, studio name, type badge, city, "From €XX/hour" price,
star rating placeholder. Pagination at bottom.
```

**Studio Detail:**
```
Design a studio detail page. Breadcrumb nav. Hero: full-width image gallery
(main image + thumbnails). Below: two-column layout.

Left (2/3): Studio name (h1), type badge, city/region, description text,
amenities grid (icons + labels: WiFi, Parking, Changing Room, etc.), size and
capacity info.

Right (1/3): sticky booking card — "From €XX/hour" price, date picker calendar,
time slot selector (start/end), duration summary, total price, gold "Book Now"
button. Below: inquiry form — name, email, message, "Send Inquiry" outline button.
```

---

#### MODEL DASHBOARD SCREENS

**Dashboard Layout (shared):**
```
Design a dashboard layout with: Left sidebar (240px, collapsible): Scoutica logo
at top, navigation links with icons — Dashboard, Discover, Portfolio, Castings,
Jobs, Applications, Contacts, Messages (with unread badge), Notifications (with
count badge), Browse Studios, Settings. User avatar + name at bottom with logout.

Top header bar: page title left, notification bell with red dot right, language
toggle, user avatar dropdown. Content area: right of sidebar, scrollable.

Mobile: sidebar hidden, bottom navigation bar with 5 icons (Home, Discover,
Portfolio, Messages, Menu). Menu opens full drawer with all nav items.
```

**Model Home:**
```
Design a model dashboard home page. Inside dashboard layout.

Row 1: Greeting "Ciao, {name}" with amber alert if profile incomplete
("Complete your profile to get discovered" with CTA button). If published: two
buttons — "View Profile" (outline with user icon) and "Edit Profile" (ghost).

Row 2 (if score < 100): Profile completeness progress bar — horizontal bar
showing 73%, label "Profile completeness".

Row 3: Four metric cards in a grid:
- "Views this week" — eye icon, number "142", green trending-up "+12%"
- "Total likes" — heart icon, number "38"
- "Pending contacts" — mail icon, number "3", clickable
- "Active applications" — send icon, number "5", clickable

Row 4: Two-column layout.
Left (2/3): "Opportunities" card — list of casting/job items. Each item: badge
(Casting blue, Job gray), "PAID" gold badge if paid, title, "Posted by X · Milano
· Deadline: Apr 15". Arrow-right icon. Empty state: briefcase icon, "No
opportunities yet".

Right (1/3): "Recent Activity" card — notification items with read/unread dots
(gold for unread), title, body preview, time ago (5m, 2h, 3d). Below: "Quick
Actions" card — "Update Portfolio" button (camera icon), "Browse Opportunities"
button (briefcase icon).
```

**Model Profile Editor:**
```
Design a model profile editor page. Full-width form with sections separated by
headings and dividers:

Section 1 "Personal Info": Full Name input, Bio textarea (with char count),
Date of Birth date picker, Gender select (Male/Female/Non-binary/Other).

Section 2 "Location": City select (Italian cities), Region auto-filled.

Section 3 "Physical Attributes": Height (cm) number input, Bust/Waist/Hips (cm),
Shoe Size, Dress Size, Eye Color select, Hair Color select, Ethnicity select.

Section 4 "Professional": Categories multi-select chips (Commercial, Editorial,
Runway, Beauty, etc.), Professional Status select, Spoken Languages multi-select,
Travel Availability toggle switch.

Section 5 "Social Media": Instagram URL, TikTok URL, YouTube URL, X URL,
Website URL, Follower Count number input.

Section 6 "Visibility": Radio group — Public, Verified Scouts Only, Private.

Sticky bottom bar: "Save Changes" gold button, "Publish Profile" button
(or "Unpublish" if published). Publish validation messages shown as amber alerts.
```

**Model Portfolio:**
```
Design a portfolio management page. Header: "Portfolio" title with photo count
"4 / 6 photos" and plan indicator. Upload button (gold, camera-plus icon).

Grid of portfolio images: 3-column masonry-style grid. Each image: photo with
hover overlay showing "Set as Cover" button and "Delete" trash icon. Cover image
has gold "COVER" badge. Drag handles for reorder.

When at plan limit: amber banner "You've reached your photo limit. Upgrade to
Model Pro for up to 9 photos" with "Upgrade" button.

Empty state: dashed border upload zone with "Upload your first photo" text and
upload icon.
```

**Casting Detail:**
```
Design a casting detail page. Back arrow. Card layout:

Header: Title "Summer Campaign Casting", badges — "CASTING" blue, "PAID" gold.
Status badge: "PUBLISHED" green.

Body: Description text. Info grid (2 columns):
- City: Milano
- Type: Physical
- Date: April 15, 2026
- Time: 10:00
- Address: Via Montenapoleone 8
- Spots: 5
- Compensation: €500/day
- Deadline: April 10, 2026

Requirements section. Materials required section. Special instructions section.

Footer: Gold "Apply to Casting" button. If already applied: disabled button
"Already Applied" with green check.
```

**Model Applications:**
```
Design an applications list page. Tabs: "Castings" and "Jobs". Each tab shows a
list of application cards:

Each card: casting/job title, posted by (scout name), applied date, status badge
— PENDING (amber), ACCEPTED (green), REJECTED (red), WITHDRAWN (gray).
Clicking opens the casting/job detail.

Empty state: file icon, "No applications yet. Browse castings to get started."
```

**Model Contacts:**
```
Design a contacts page showing incoming contact requests. List of cards:

Each card: Scout avatar + name + business badge, subject line bold, reason badge
(Scouting, Casting, Job Opportunity, Editorial, Other), message preview (2 lines
truncated), timestamp "2 hours ago". Two action buttons: green "Accept" checkmark,
red "Decline" X.

Accepted contacts show "Accepted" green badge and link icon to open conversation.
```

**Messages List:**
```
Design a messaging page. Left panel (1/3): conversation list. Each row:
participant avatar, name, last message preview (truncated), timestamp, unread
dot (gold) if unread. Selected conversation highlighted.

Right panel (2/3): message thread. Header: participant name + avatar. Message
bubbles: sent (right-aligned, gold background) and received (left-aligned, gray
background) with timestamps. Input bar at bottom: text input, send button.

Mobile: full-screen list, tap opens full-screen thread with back arrow.
```

**Notifications:**
```
Design a notifications page. Header: "Notifications" with "Mark all read" button.
List of notification items:

Each: gold dot (unread) or gray dot (read), icon matching type (mail for
contact, check for application, bell for system), title text, body text (gray,
smaller), timestamp. Clickable items link to relevant page. Dividers between items.
```

**Settings:**
```
Design a settings page with two tabs: "Account" and "Billing".

Account tab: Display Name input, Language select (Italiano/English), "Save"
button.

Billing tab: Current plan card — "Free Plan" with features list. "Upgrade to
Model Pro" gold CTA. If subscribed: plan name, status badge, renewal date,
"Manage Subscription" button (opens Stripe portal).
```

---

#### SCOUT DASHBOARD SCREENS

**Scout Discover:**
```
Design a model discovery page for scouts. Inside dashboard layout.

Top: Search filter bar — expandable panel with:
Row 1: City dropdown, Region dropdown, Gender select, Age range (min/max inputs)
Row 2: Height range (min/max cm), Eye Color, Hair Color, Ethnicity
Row 3: Categories multi-select, Professional Status, Travel Available toggle
Row 4: Sort dropdown (Newest, Most Viewed, Most Liked), Grid density toggle
(3 icons: comfortable/compact/dense)

Results grid: model cards. Each card: cover photo (3:4 ratio), model name, city,
category badges (max 3 shown), view count (eye icon), like count (heart icon).
Hover: "View Profile" and "Contact" quick action buttons.

Bottom: pagination — "Page 1 of 12" with prev/next buttons and page numbers.
```

**Shortlist Board Detail:**
```
Design a shortlist board page. Header: board name, description, model count.

Kanban-style columns (horizontal scroll on mobile):
- SAVED (gray header)
- CONTACTED (blue header)
- REPLIED (amber header)
- SHORTLISTED (green header)
- BOOKED (gold header)

Each column contains model cards: cover thumbnail, name, city. Each card has a
note icon (click to edit note) and X to remove. Cards are draggable between
columns. Add model button at column bottom.
```

**New Casting Form:**
```
Design a create casting form. Full-width form:

Section 1 "Basic Info": Title input, Description textarea (rich), Type radio
(Physical/Online), Is Paid toggle.

Section 2 "Details": City, Region, Casting Date picker, Time input, Address
input, Spots number input, Compensation text input, Deadline date picker.

Section 3 "Requirements": Requirements textarea, Materials Required textarea,
Special Instructions textarea.

Bottom bar: "Save as Draft" outline button, "Publish" gold button.
```

**Casting Applications:**
```
Design a casting applications review page. Header: casting title, status badge,
applicant count.

List of applicant cards: model cover thumbnail, name, city, categories badges,
intro message preview. Two action buttons: green "Accept" and red "Reject".
Accepted/rejected states shown with status badges.
```

---

#### STUDIO DASHBOARD SCREENS

**Studio Editor:**
```
Design a studio editor page. Top bar: studio name, status badge (DRAFT/PUBLISHED
/PAUSED), "Publish" gold button or "Pause" amber button.

Photo gallery: horizontal scroll of studio images with + upload button. Cover
image has gold "COVER" badge. X delete button on hover.

Form sections: Name, Description textarea, Type select, Address, City, Region,
ZIP, Size (sqm) number, Max Capacity number. Amenities: checkbox grid (WiFi,
Parking, Kitchen, Changing Room, Natural Light, Blackout, etc.). Rates: Hourly
€ input, Daily € input, Weekly € input, Min Hours. Contact: Email, Phone.
Availability notes textarea.
```

**Bookings:**
```
Design a bookings management page. Filter tabs: All, Pending, Confirmed,
Completed, Cancelled.

Booking cards: studio name, requester name, date, time slot (10:00–14:00),
total price "€200", notes preview, status badge. Action buttons per status:
- PENDING: "Confirm" green, "Cancel" red
- CONFIRMED: "Complete" blue, "Cancel" red
```

---

#### ADMIN SCREENS

**Admin Overview:**
```
Design an admin dashboard. Grid of stat cards (3 columns):
- Total Users: number with user icon
- Models: number with camera icon
- Scouts: number with search icon
- Studios: number with building icon
- Active Castings: number with megaphone icon
- Pending Reports: number with alert icon (red if > 0)

Below: quick-access cards linking to Verifications (pending count), Reports
(pending count), Users management.
```

**Admin Verifications:**
```
Design a verification review page. List of pending verification cards:

Each: scout name, subtype badge (Scout/Agency/Brand), business name, city,
submitted date. Expandable detail: professional email, website URL, social
profile URL, VAT number, purpose of use text.

Action buttons: "Approve" green button, "Reject" red button (opens dialog for
rejection notes textarea).
```

**Admin Settings:**
```
Design an admin settings page. Card: "Scout Gate" — description "Control whether
new scouts can register and request verification", toggle switch with current
state label (Open/Closed). Warning text when changing: "Opening the gate will
transition all waitlisted scouts to verification required."
```

---

#### PUBLIC PROFILE

**Model Public Profile:**
```
Design a public model profile page. Back arrow link.

Hero: two-column. Left (1/3): cover image (3:4 portrait, clickable to open
gallery lightbox). Right (2/3): name (h1), city with map pin icon, age,
categories as badges, professional status badge.

Action bar: heart/like button with count, "Contact" gold button (for scouts).

Stats grid: compact rows — Height 178cm, Bust 84cm, Waist 62cm, Hips 90cm,
Shoes 39, Dress S. Eye color, Hair color, Ethnicity with icons.

Bio section: paragraph text.

Social links: Instagram, TikTok, YouTube, X, Website as icon buttons.

Languages and travel availability.

Portfolio gallery: masonry grid of all portfolio images, clickable to lightbox.
```

### 21.4 Stitch Iteration Tips

1. **Start with the Design System prompt** to establish consistent styling across all screens.
2. **Generate layout shells first** (Dashboard Layout, Auth Layout, Marketing Layout) before individual pages.
3. **Use follow-up prompts** to refine: "Make the sidebar collapsible", "Add dark mode toggle", "Make the model cards smaller for dense mode".
4. **Use Italian labels** in a second pass: duplicate each screen with `"Use Italian UI labels: Accedi, Registrati, Bacheca, Casting, Lavori, Contatti, Messaggi, Impostazioni, Salva, Pubblica"`.
5. **Link screens together** using Stitch's collaboration flow to create clickable prototype navigation.
6. **Responsive variants**: Generate each key screen in both desktop (1440px) and mobile (390px) widths.
7. **State variations**: For interactive elements, generate separate screens for states — empty, loading, filled, error, success.

### 21.5 What Stitch Cannot Do (Requires Code)

| Capability | Stitch | Production Code |
|------------|:------:|:---------------:|
| Visual design / high-fidelity mockups | ✓ | — |
| Interactive prototype navigation | ✓ | — |
| Responsive layout preview | ✓ | — |
| Database / Prisma schema | ✗ | ✓ |
| Authentication (NextAuth) | ✗ | ✓ |
| Server actions / API routes | ✗ | ✓ |
| Stripe integration | ✗ | ✓ |
| File uploads | ✗ | ✓ |
| Real-time messaging | ✗ | ✓ |
| i18n message loading | ✗ | ✓ |
| Search/filter query logic | ✗ | ✓ |
| Email sending | ✗ | ✓ |
| Webhook handling | ✗ | ✓ |

### 21.6 Stitch-to-Production Workflow

1. **Design in Stitch** → generate all screens using prompts above
2. **Validate with stakeholders** → iterate on visual design
3. **Export assets** → extract color values, spacing, component patterns
4. **Build in Next.js** → use this spec as the complete implementation blueprint
5. **Map Stitch screens → routes** → 1:1 correspondence with §20 route map

---

*End of specification.*
