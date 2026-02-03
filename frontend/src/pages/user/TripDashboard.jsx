import React, { useState, useEffect } from "react";
import "./TripDashboard.css";

const TripDashboard = () => {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  // Fetch user and trips
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Get User ID by Email
      const userRes = await fetch(
        `http://localhost:5000/api/passengers?Email=${encodeURIComponent(
          email,
        )}`,
      );
      const userData = await userRes.json();

      if (!userData.passengers || userData.passengers.length === 0) {
        throw new Error("User not found. Please check your email.");
      }

      const currentUser = userData.passengers[0];
      const userId = currentUser.PassengerId;
      setUser(currentUser);

      // 2. Fetch Package Bookings
      const packagesRes = await fetch(
        `http://localhost:5000/api/v1/multi-modal/bookings/user/${userId}`,
      );
      const packagesData = await packagesRes.json();
      const packageBookings = packagesData.data || [];

      // 3. Fetch Flight Tickets
      const ticketsRes = await fetch(
        `http://localhost:5000/api/tickets?UserId=${userId}`,
      );
      const ticketsData = await ticketsRes.json();
      const rawTickets = ticketsData.tickets || [];

      // Enrich Flight Tickets with Details
      const enrichedTickets = await Promise.all(
        rawTickets.map(async (ticket) => {
          const flightRes = await fetch(
            `http://localhost:5000/api/flights/${ticket.FlightId}`,
          );
          const flightData = await flightRes.json();
          const flight = flightData.flight || {};
          return {
            ...ticket,
            type: "flight",
            id: `FLT-${ticket.TicketId}`,
            title: `Flight to ${flight.Destination}`,
            destination: flight.Destination,
            origin: flight.Source,
            image_url: null, // Could add generic
            startDate: new Date(flight.DepartureTime),
            details: {
              flightNumber: flight.FlightNumber,
              seat: ticket.SeatNumber,
              class: ticket.TravelClass,
            },
          };
        }),
      );

      // Normalize Package Bookings
      const normalizedPackages = packageBookings.map((pkg) => ({
        ticketId: pkg.booking_reference,
        type: "package",
        id: `PKG-${pkg.id}`,
        title: pkg.package_name || "Travel Package",
        destination: pkg.package_destination || pkg.destination, // fallback
        origin: pkg.flight_source || "Unknown",
        image_url: pkg.image_url,
        startDate: new Date(
          pkg.hotel_check_in ||
            pkg.car_pickup_date ||
            pkg.flight_date ||
            pkg.created_at,
        ),
        details: {
          reference: pkg.booking_reference,
          includes: [
            pkg.flight_id ? "Flight" : null,
            pkg.hotel_name ? "Hotel" : null,
            pkg.car_type ? "Car" : null,
          ]
            .filter(Boolean)
            .join(", "),
          price: pkg.final_price,
        },
      }));

      // Merge and Sort
      const allTrips = [...enrichedTickets, ...normalizedPackages].sort(
        (a, b) => b.startDate - a.startDate,
      );
      setTrips(allTrips);
    } catch (err) {
      setError(err.message || "Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  // Filter Trips
  const now = new Date();
  const upcomingTrips = trips
    .filter((trip) => trip.startDate >= now)
    .sort((a, b) => a.startDate - b.startDate); // Ascending for upcoming
  const pastTrips = trips
    .filter((trip) => trip.startDate < now)
    .sort((a, b) => b.startDate - a.startDate); // Descending for past

  const displayTrips = activeTab === "upcoming" ? upcomingTrips : pastTrips;

  // Helpers
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const addToCalendar = (trip) => {
    const start = trip.startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(trip.startDate.getTime() + 2 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, ""); // Assume 2 hours
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      trip.title,
    )}&dates=${start}/${end}&details=Trip to ${trip.destination}&location=${
      trip.destination
    }`;
    window.open(url, "_blank");
  };

  const downloadDocs = () => {
    alert("Downloading all travel documents (PDF)...");
  };

  const shareTrip = (trip) => {
    if (navigator.share) {
      navigator
        .share({
          title: trip.title,
          text: `I'm going to ${trip.destination}!`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      alert(`Copied trip details: ${trip.title} to ${trip.destination}`);
    }
  };

  if (!user) {
    return (
      <div className="trip-dashboard login-mode">
        <div className="email-lookup-container">
          <h2
            style={{ fontSize: "2rem", marginBottom: "1rem", color: "#1e293b" }}
          >
            My Trips
          </h2>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>
            Enter your email to view your itinerary, history, and documents.
          </p>

          {error && (
            <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
          )}

          <form
            onSubmit={handleLogin}
            style={{ display: "flex", gap: "10px", flexDirection: "column" }}
          >
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "1rem",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading ? "Searching..." : "Find My Trips"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-dashboard">
      <div className="dashboard-header">
        <h1>Trip Management</h1>
        <div className="dashboard-subtitle">
          Welcome back, {user.FirstName}! Here are your journeys.
        </div>
      </div>

      <div className="trip-tabs">
        <button
          className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming ({upcomingTrips.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Past History ({pastTrips.length})
        </button>
      </div>

      {displayTrips.length === 0 ? (
        <div className="empty-state">
          <i className="ri-plane-line"></i>
          <h3>No {activeTab} trips found</h3>
          <p>Time to book your next adventure!</p>
        </div>
      ) : (
        <div className="trips-grid">
          {displayTrips.map((trip) => (
            <div key={trip.id} className="trip-card">
              <div
                className="trip-image"
                style={{
                  backgroundImage: `url(${
                    trip.image_url || "/images/default-flight.jpg"
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "#cbd5e1",
                }}
              />
              <div className="trip-content">
                <span className={`trip-status status-${activeTab}`}>
                  {activeTab === "upcoming" ? "Confirmed" : "Completed"}
                </span>
                <h3 className="trip-destination">{trip.title}</h3>
                <div className="trip-date">
                  <i className="ri-calendar-event-line"></i>
                  {formatDate(trip.startDate)}
                </div>
                <div className="trip-details">
                  <div className="detail-item">
                    <span className="detail-label">Reference</span>
                    <span className="detail-value">
                      {trip.details.reference || trip.id}
                    </span>
                  </div>
                  {trip.type === "package" && (
                    <div className="detail-item">
                      <span className="detail-label">Includes</span>
                      <span className="detail-value">
                        {trip.details.includes}
                      </span>
                    </div>
                  )}
                  {trip.type === "flight" && (
                    <div className="detail-item">
                      <span className="detail-label">Flight</span>
                      <span className="detail-value">
                        {trip.details.flightNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="trip-actions">
                <button
                  className="action-btn"
                  onClick={downloadDocs}
                  title="Download Documents"
                >
                  <i className="ri-file-download-line"></i> Docs
                </button>
                <button
                  className="action-btn"
                  onClick={() => shareTrip(trip)}
                  title="Share"
                >
                  <i className="ri-share-line"></i> Share
                </button>
                <button
                  className="action-btn"
                  onClick={() => addToCalendar(trip)}
                  title="Add to Calendar"
                >
                  <i className="ri-calendar-plus-line"></i> Add
                </button>
                <button
                  className="action-btn"
                  onClick={() => window.print()}
                  title="Print Itinerary"
                >
                  <i className="ri-printer-line"></i> Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripDashboard;
