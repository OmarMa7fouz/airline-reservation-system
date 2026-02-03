import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/accessibility.css';
import Navbar from './components/layout/Navbar';
import ChatWidget from './components/chat/ChatWidget';

// Lazy load pages for performance optimization
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const PassengersList = lazy(() => import('./pages/booking/PassengersList'));
const FlightsList = lazy(() => import('./pages/booking/FlightsList'));
const ReservationPage = lazy(() => import('./pages/booking/ReservationPage'));
const TripDashboard = lazy(() => import('./pages/user/TripDashboard'));
const HomePage = lazy(() => import('./pages/general/HomePage'));
const AboutPage = lazy(() => import('./pages/general/AboutPage'));
const HotelsPage = lazy(() => import('./pages/general/HotelsPage'));
const CarsPage = lazy(() => import('./pages/general/CarsPage'));
const StopoverPage = lazy(() => import('./pages/general/StopoverPage'));
const CommunityPage = lazy(() => import('./pages/general/CommunityPage'));

const PaymentPage = lazy(() => import('./pages/booking/PaymentPage'));
const ConfirmationPage = lazy(() => import('./pages/booking/ConfirmationPage'));
const AnalyticsDashboard = lazy(() => import('./pages/general/AnalyticsDashboard'));
const LoyaltyDashboard = lazy(() => import('./pages/user/LoyaltyDashboard'));
const PriceAlerts = lazy(() => import('./pages/user/PriceAlerts'));
const TravelPackages = lazy(() => import('./pages/booking/TravelPackages'));
const PackageBooking = lazy(() => import('./pages/booking/PackageBooking'));
const UserPreferences = lazy(() => import('./pages/user/UserPreferences'));

// Loading component
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#4c7cf3' }}>
    <div className="spinner-border" role="status">
      <span className="sr-only">Loading...</span>
    </div>
    <span style={{ marginLeft: '10px', fontSize: '1.2rem', fontWeight: '500' }}>Loading AirGo...</span>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: '1 0 auto' }}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/passengers" element={<PassengersList />} />
              <Route path="/flights" element={<FlightsList />} />
              <Route path="/reserve" element={<ReservationPage />} />
              <Route path="/my-reservations" element={<TripDashboard />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/cars" element={<CarsPage />} />
              <Route path="/stopover" element={<StopoverPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/confirmation/:ticketId" element={<ConfirmationPage />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/loyalty" element={<LoyaltyDashboard />} />
              <Route path="/price-alerts" element={<PriceAlerts />} />
              <Route path="/packages" element={<TravelPackages />} />
              <Route path="/multi-modal/book/:packageId" element={<PackageBooking />} />
              <Route path="/preferences" element={<UserPreferences />} />
              <Route path="/community" element={<CommunityPage />} />

              <Route path="/" element={<HomePage />} />
            </Routes>
          </Suspense>
        </main>
        
        {/* AI Chatbot - Available on all pages */}
        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;