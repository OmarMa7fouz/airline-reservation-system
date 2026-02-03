# Mobile Wallet & Integration Feature

## Overview

This feature integrates the airline reservation system with mobile ecosystems, providing travelers with convenient access to their boarding passes, real-time updates via push notifications, and exclusive mobile-only perks.

## Components

### 1. Digital Boarding Passes

- **Apple Wallet (.pkpass)**:
  - Generates a standard PKPass bundle containing flight details, QR code, and styling.
  - _Note: Requires valid Apple Developer Certificates for final signing. We will implement the bundle generation structure._
- **Google Wallet**:
  - Generates a signed JWT link for "Save to Google Pay".
  - Uses Google Wallet API objects (FlightObject, FlightClass).

### 2. Push Notifications

- Uses **Web Push API** (VAPID) to send notifications to browsers (Chrome, Firefox, Safari, Edge).
- Triggers:
  - **Gate Changes**: Alerts user if the gate is updated.
  - **Flight Status**: Delays or cancellations.
  - **Check-in Open**: 24h before flight.

### 3. Offline Access

- **PWA (Progressive Web App)**: Service Worker caches critical assets.
- **Offline Ticket**: A downloadable high-res image or PDF version of the ticket stored in local storage.

### 4. Mobile-Exclusive Deals

- targeted offers that only appear when `isMobile` is detected.

## Database Schema

### `push_subscriptions` Table

Stores the endpoint and keys needed to send web push notifications to a user's device.

- `id`: PK
- `user_id`: FK to users
- `endpoint`: URL from the browser push service
- `p256dh`: Public key
- `auth`: Auth secret
- `user_agent`: Device info string

### `mobile_exclusive_offers` Table

- `id`: PK
- `title`: "Last Minute Mobile Deal"
- `discount`: 25%
- `platform`: 'ios' | 'android' | 'any'

## API Endpoints

### Wallet

- `GET /api/v1/mobile/wallet/apple/:ticketId` - Download .pkpass
- `GET /api/v1/mobile/wallet/google/:ticketId` - Get Google Pay JWT link

### Notifications

- `POST /api/v1/mobile/push/subscribe` - Register a device for notifications
- `POST /api/v1/mobile/push/test` - Send a test notification (Dev only)

### Deals

- `GET /api/v1/mobile/deals` - Get mobile-specific offers

## Technical Dependencies

- `web-push`: For generating VAPID headers and sending notifications.
- `passkit-generator` (or similar logic): For structuring Apple Passes.
- `jsonwebtoken`: For Google Wallet objects.

## User Flow

1. **User Books Flight** -> Lands on Confirmation Page.
2. **Mobile Detection**: If on mobile, show "Add to Apple Wallet" / "Google Pay" buttons prominently.
3. **Opt-in**: "Get Flight Updates?" prompt appears. User clicks "Allow".
4. **Backend**: Saves subscription to DB.
5. **Event**: Admin changes Gate in backend.
6. **Notification**: User receives push notification "Gate Changed to A4".
