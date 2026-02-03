# Personalization Engine Feature

## Overview

The Personalization Engine enhances the user experience by delivering tailored flight recommendations, managing detailed travel preferences, tracking travel history, and providing special offers for occasions like birthdays and anniversaries.

## Features Implemented

### 1. **User Preferences System**

- **Seat & Meal Preferences**: Window/Aisle, Vegetarian/Vegan/Halal, etc.
- **Travel Preferences**: Preferred seat location (front/back), travel class (economy/business).
- **Notification Settings**: Toggle Email, SMS, Push notification preferences.
- **Accessibility Needs**: Track wheelchair assistance or special requests.

### 2. **Recommendation Engine**

- **Route-Based Suggestions**: Recommends flights based on frequently traveled routes.
- **Price tracking**: Tracks average spend to suggest relevant flight classes.
- **Smart "Welcome Back"**: Dashboard greeting personalized with stats (bookings made, offers waiting).

### 3. **Special Occasions & Offers**

- **Occasion Tracking**: Users can add birthdays, anniversaries, and holidays.
- **Personalized Offers**: Targeted discounts generated for specific users and valid for limited times.
- **Promo Codes**: Unique codes generated for offers.

### 4. **Database Schema**

#### `user_preferences` Table

Stores permanent user settings:

- Seat type, meal preference, dietary restrictions
- Notification channels (Email/SMS)
- Accessibility requirements

#### `user_travel_history` Table

Tracks booking patterns:

- Origin/Destination pairs
- Frequency of travel on routes
- Average price paid per route

#### `special_occasions` Table

- Occasion type (Birthday/Anniversary)
- Date and custom name
- Reminder settings

#### `personalized_offers` Table

- Offer details (Title, Description, Discount)
- Validity period
- Usage status
- Targeting criteria

### 5. **API Endpoints**

#### User Preferences

- `GET /api/v1/personalization/preferences/:userId` - Get user profile
- `PUT /api/v1/personalization/preferences/:userId` - Update preferences

#### Recommendations

- `GET /api/v1/personalization/recommendations/:userId` - Get smart flight suggestions
- `POST /api/v1/personalization/track-travel` - Update travel history after booking

#### Special Occasions

- `GET /api/v1/personalization/occasions/:userId` - List user occasions
- `POST /api/v1/personalization/occasions` - Add new occasion

#### Offers & Welcome

- `GET /api/v1/personalization/offers/:userId` - Get active offers
- `POST /api/v1/personalization/offers` - Admin create offer
- `GET /api/v1/personalization/welcome/:userId` - Get personalized greeting

### 6. **Frontend Components**

#### UserPreferences Page (`/preferences`)

- **Welcome Banner**: Personalized greeting with stats.
- **Offers Section**: Valid promo codes display.
- **Recommendations Grid**: Smart flight suggestions based on history.
- **Preferences Form**: Comprehensive form for travel settings.
- **Occasions Manager**: Interface to add upcoming events.

## User Flow

1. **Access Preferences**
   - User navigates to `My Trips` > `Travel Preferences`.
2. **Set Preferences**
   - User selects "Window Seat", "Vegetarian", "Front of Plane".
   - Saves settings.
3. **View Recommendations**
   - System analyzes past bookings (if any).
   - Shows "Recommended for You" flights (e.g., "New York → London").
4. **Manage Occasions**
   - User adds "Anniversary - June 15".
   - System (in future expansion) sends promo code 1 week before.

## Technical Implementation

### Backend Controller (`personalizationController.js`)

- **getUserPreferences**: Lazy initialization (creates default if missing).
- **getRecommendations**: Analyzes `user_travel_history` to find top routes.
- **trackTravel**: Updates route frequency and average price stats.
- **getWelcomeMessage**: Aggregates booking counts and offer stats.

### Database Migration

Run the migration to create personalization tables:

```bash
cd backend
node migrations/createPersonalizationTables.js
```

## Future Enhancements

- **Automated Email Triggers**: Send emails when special occasions approach.
- **Dynamic Pricing**: Adjust flight prices based on user's average spend history.
- **Machine Learning**: Use more advanced algorithms for route prediction.
