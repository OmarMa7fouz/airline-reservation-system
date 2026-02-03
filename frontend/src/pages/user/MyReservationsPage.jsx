import React, { useState, useEffect } from "react";

const MyReservationsPage = () => {
  const [email, setEmail] = useState("");
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckReservations = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setReservations([]);
    setLoading(true);

    if (!email) {
      setError("Please enter your email");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Find the passenger by email
      const passengerRes = await fetch(
        `http://localhost:5000/api/passengers?Email=${encodeURIComponent(
          email,
        )}`,
      );
      const passengerData = await passengerRes.json();
      if (!passengerRes.ok) {
        setError(passengerData.error || "Failed to find passenger");
        setLoading(false);
        return;
      }

      const passenger =
        passengerData.passengers && passengerData.passengers.length > 0
          ? passengerData.passengers[0]
          : null;
      if (!passenger) {
        setError("No passenger found with that email");
        setLoading(false);
        return;
      }

      const userId = passenger.PassengerId;

      // Step 2: Fetch tickets for the passenger
      const ticketsRes = await fetch(
        `http://localhost:5000/api/tickets?UserId=${userId}`,
      );
      const ticketsData = await ticketsRes.json();
      if (!ticketsRes.ok) {
        setError(ticketsData.error || "Failed to fetch reservations");
        setLoading(false);
        return;
      }

      const tickets = ticketsData.tickets || [];
      if (tickets.length === 0) {
        setSuccess("No reservations found for this email");
        setLoading(false);
        return;
      }

      // Step 3: Fetch flight and seat details for each ticket
      const reservationDetails = await Promise.all(
        tickets.map(async (ticket) => {
          const flightRes = await fetch(
            `http://localhost:5000/api/flights/${ticket.FlightId}`,
          );
          const flightData = await flightRes.json();
          const flight = flightData.flight || {};

          const seatRes = await fetch(
            `http://localhost:5000/api/seatAssignments?FlightId=${ticket.FlightId}&SeatNumber=${ticket.SeatNumber}`,
          );
          const seatData = await seatRes.json();
          const seat =
            seatData.seatAssignments && seatData.seatAssignments.length > 0
              ? seatData.seatAssignments[0]
              : {};

          return {
            ...ticket,
            flightNumber: flight.FlightNumber,
            source: flight.Source,
            destination: flight.Destination,
            departureTime: flight.DepartureTime,
            seatClass: seat.Class || ticket.TravelClass,
          };
        }),
      );

      setReservations(reservationDetails);
      setSuccess("Reservations retrieved successfully");
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Poppins, sans-serif",
        backgroundImage: `url('/airplane-flies-over-a-sea.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        border: "3px solid #2563eb",
        boxSizing: "border-box",
      }}
    >
      {/* Main content (z-index: 1) */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 900,
          background: "rgba(255,255,255,0.96)",
          borderRadius: 18,
          boxShadow: "0 8px 32px rgba(76,124,243,0.13)",
          padding: "2.5rem 2rem",
          margin: "4rem auto",
          backdropFilter: "blur(2px)",
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            fontSize: 32,
            margin: 0,
            color: "#22223b",
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          My Reservations
        </h2>
        <div
          style={{
            color: "#2563eb",
            margin: "0.5rem 0 2rem 0",
            fontSize: 17,
            fontWeight: 400,
            textAlign: "center",
          }}
        >
          View all your flight bookings by entering your email address below.
        </div>
        {error && (
          <p style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ color: "green", marginBottom: 10, textAlign: "center" }}>
            {success}
          </p>
        )}
        <form
          onSubmit={handleCheckReservations}
          style={{
            marginBottom: "2.5rem",
            display: "flex",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 2,
              padding: "12px",
              border: "1.5px solid #e0e7ef",
              borderRadius: 8,
              fontSize: 16,
              transition: "border-color 0.2s",
              marginRight: 0,
            }}
            required
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.target.style.borderColor = "#e0e7ef")}
            aria-label="Email Address"
          />
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "12px 0",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(37,99,235,0.10)",
              opacity: loading ? 0.7 : 1,
              transition: "background 0.2s",
            }}
            disabled={loading}
          >
            {loading ? "Searching..." : "Check Reservations"}
          </button>
        </form>

        {reservations.length > 0 && (
          <div
            style={{
              background: "#f8fbff",
              borderRadius: 14,
              boxShadow: "0 2px 8px rgba(76,124,243,0.07)",
              padding: "1.5rem 1rem",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#eaf3fa" }}>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: 600,
                      color: "#2563eb",
                      borderTopLeftRadius: 10,
                    }}
                  >
                    Flight Number
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                  >
                    Source
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                  >
                    Destination
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                  >
                    Departure Time
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                  >
                    Class
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                  >
                    Seat
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                  >
                    Price
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: 600,
                      color: "#2563eb",
                      borderTopRightRadius: 10,
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation, index) => (
                  <tr
                    key={index}
                    style={{
                      background: index % 2 === 0 ? "#fff" : "#f2f7fd",
                      borderRadius: 8,
                    }}
                  >
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {reservation.flightNumber}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {reservation.source}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {reservation.destination}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {reservation.departureTime}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {reservation.seatClass}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {reservation.SeatNumber}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      ${reservation.Price.toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() =>
                          window.open(
                            `http://localhost:5000/api/v1/mobile/wallet/apple/${reservation.TicketNumber}`,
                            "_blank",
                          )
                        }
                        style={{
                          padding: "5px 10px",
                          background: "black",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          margin: "0 auto",
                        }}
                      >
                        <i className="ri-wallet-3-fill"></i> Wallet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservationsPage;
