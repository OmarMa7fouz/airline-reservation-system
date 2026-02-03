import React from "react";
import { useLocation, Link, useParams } from "react-router-dom";

const ConfirmationPage = () => {
  const { state } = useLocation();
  const { ticketId } = useParams();

  // If accessed directly without state, we might show a generic lookup or error
  // For this flow, we assume state exists or we handle it gracefully
  const reservation = state?.reservation;

  if (!reservation) {
    return (
      <div
        style={{
          padding: "4rem",
          textAlign: "center",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <h2>Booking Confirmed!</h2>
        <p>Reference ID: {ticketId}</p>
        <p>Please check your email for the ticket details.</p>
        <Link to="/" style={{ color: "#006C35", fontWeight: 600 }}>
          Return Home
        </Link>
      </div>
    );
  }

  // Random Gate
  const gate = "G" + Math.floor(Math.random() * 20 + 1);

  // Derived Flight Data Logic (Fallback if flight object is missing)
  let displaySourceCode = reservation.flight?.SourceCode || "DMM";
  let displaySource = reservation.flight?.Source || "Dammam";
  let displayDestCode = reservation.flight?.DestinationCode || "LHR";
  let displayDest = reservation.flight?.Destination || "London";
  let displayFlightNum =
    reservation.flight?.FlightNumber || `SV${reservation.flightId}`;

  // Attempt to parse synthetic flight ID: syn-Cairo (CAI)-Dubai (DXB)-...
  if (
    (!reservation.flight || !reservation.flight.SourceCode) &&
    String(reservation.flightId).startsWith("syn-")
  ) {
    try {
      const parts = reservation.flightId.split("-");
      // Format: syn - Origin - Destination - Timestamp - ...
      if (parts.length >= 3) {
        const rawOrigin = parts[1]; // e.g., "Cairo (CAI)"
        const rawDest = parts[2]; // e.g., "Dubai (DXB)"

        displaySource = rawOrigin;
        displayDest = rawDest;

        // Extract Code if present in parens
        const originMatch = rawOrigin.match(/\((.*?)\)/);
        const destMatch = rawDest.match(/\((.*?)\)/);

        if (originMatch) displaySourceCode = originMatch[1];
        else displaySourceCode = rawOrigin.substring(0, 3).toUpperCase();

        if (destMatch) displayDestCode = destMatch[1];
        else displayDestCode = rawDest.substring(0, 3).toUpperCase();

        // Clean up display names (remove code from name if duplication desired, or keep as is)
        // Usually name is "Cairo", code is "CAI". "Cairo (CAI)" contains both.
        // Let's try to keeping name clean.
        displaySource = rawOrigin.replace(/\(.*?\)/, "").trim();
        displayDest = rawDest.replace(/\(.*?\)/, "").trim();

        // Fix Flight Number display (don't show big ID)
        displayFlightNum = "AG" + Math.floor(100 + Math.random() * 900); // Generate temp if missing
      }
    } catch (e) {
      console.error("Failed to parse flight ID", e);
    }
  } else if (
    !reservation.flight &&
    !String(reservation.flightId).startsWith("syn-")
  ) {
    // Normal flight but missing object?
    // Keep DMM default or try to do better?
    // Ideally we shouldn't hit this if ReservationPage logic works.
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "6rem 2rem",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: "#2563eb",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
            }}
          >
            <i
              className="ri-check-line"
              style={{ fontSize: "3rem", color: "#fff" }}
            ></i>
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1e293b" }}>
            You're All Set!
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#64748b" }}>
            Your flight has been successfully booked.
          </p>
        </div>

        {/* Boarding Pass Ticket */}
        <div
          style={{
            background: "#fff",
            borderRadius: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
            overflow: "hidden",
            margin: "0 auto 3rem",
            maxWidth: "700px",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#0f172a",
              padding: "1.5rem 2.5rem",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <i
                className="ri-plane-fill"
                style={{ fontSize: "1.5rem", color: "#d97706" }}
              ></i>
              <span
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  letterSpacing: "1px",
                }}
              >
                AirGo
              </span>
            </div>
            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              Booking Ref:{" "}
              <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                {ticketId}
              </span>
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              padding: "2.5rem",
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "2rem",
            }}
          >
            {/* Main Info */}
            <div
              style={{
                borderRight: "2px dashed #e2e8f0",
                paddingRight: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "2rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Passenger
                  </div>
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {reservation.passenger.firstName}{" "}
                    {reservation.passenger.lastName}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Flight
                  </div>
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {displayFlightNum}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {displaySourceCode}
                  </div>
                  <div style={{ color: "#64748b" }}>{displaySource}</div>
                </div>
                <i
                  className="ri-flight-takeoff-line"
                  style={{ fontSize: "2rem", color: "#d97706" }}
                ></i>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {displayDestCode}
                  </div>
                  <div style={{ color: "#64748b" }}>{displayDest}</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "2rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    Date
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    Boarding
                  </div>
                  <div style={{ fontWeight: 600 }}>10:30 AM</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    Gate
                  </div>
                  <div style={{ fontWeight: 600, color: "#d97706" }}>
                    {gate}
                  </div>
                </div>
              </div>
            </div>

            {/* Side Info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      Class
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {reservation.travelClass}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      Seat
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#2563eb",
                      }}
                    >
                      {reservation.seat}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    background: "#f8fafc",
                    padding: "0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  Bag: {reservation.fareType === "flex" ? "2x 23kg" : "1x 23kg"}{" "}
                  <br />
                </div>
              </div>

              {/* Barcode */}
              <div>
                <div
                  style={{
                    height: "45px",
                    background:
                      "repeating-linear-gradient(90deg, #1e293b, #1e293b 2px, transparent 2px, transparent 4px, #1e293b 4px, #1e293b 8px, transparent 8px, transparent 9px)",
                    borderRadius: "2px",
                  }}
                  aria-hidden="true"
                ></div>
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "0.7rem",
                    marginTop: "5px",
                    letterSpacing: "2px",
                    fontFamily: "monospace",
                  }}
                >
                  {ticketId}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#d97706", height: "8px" }}></div>
        </div>

        {/* Mobile Wallet Integration */}
        <div
          style={{
            marginBottom: "2.5rem",
            padding: "1.5rem",
            background: "white",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              marginBottom: "1rem",
              color: "#1e293b",
            }}
          >
            <i
              className="ri-smartphone-line"
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            ></i>
            Save to Mobile Wallet
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {/* Apple Wallet Button */}
            <button
              onClick={() =>
                window.open(
                  `http://localhost:5000/api/v1/mobile/wallet/apple/${ticketId}`,
                  "_blank",
                )
              }
              style={{
                background: "#000",
                color: "#fff",
                border: "1px solid #000",
                borderRadius: "10px",
                padding: "10px 24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
            >
              <i className="ri-apple-fill" style={{ fontSize: "32px" }}></i>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    opacity: 0.9,
                    letterSpacing: "0.5px",
                  }}
                >
                  Add to
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    lineHeight: "1",
                    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Apple Wallet
                </div>
              </div>
            </button>

            {/* Google Pay Button */}
            <button
              onClick={async () => {
                try {
                  const res = await fetch(
                    `http://localhost:5000/api/v1/mobile/wallet/google/${ticketId}`,
                  );
                  const data = await res.json();
                  if (data.success && data.url) window.open(data.url, "_blank");
                } catch (e) {
                  console.error(e);
                }
              }}
              style={{
                background: "#fff",
                color: "#3c4043",
                border: "1px solid #dadce0",
                borderRadius: "24px",
                padding: "10px 24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 1px 3px rgba(60,64,67,0.3)",
                minHeight: "54px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(60,64,67,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(60,64,67,0.3)";
              }}
            >
              <i
                className="ri-google-play-fill"
                style={{ fontSize: "28px", color: "#3c4043" }}
              ></i>
              <div
                style={{
                  height: "24px",
                  borderLeft: "1px solid #dadce0",
                  margin: "0 4px",
                }}
              ></div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
                }}
              >
                Save to Phone
              </div>
            </button>
          </div>

          {/* Push Notification Opt-in */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px dashed #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>
                  Get Flight Updates?
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  Receive push notifications for gate changes and delays.
                </div>
              </div>
              <button
                onClick={() =>
                  alert(
                    "Simulated: You would now be prompted to allow notifications by your browser.",
                  )
                }
                style={{
                  background: "#e0f2fe",
                  color: "#0284c7",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Allow Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Social Share */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              color: "#334155",
              marginBottom: "1rem",
            }}
          >
            Start the hype! Share your trip ✈️
          </h3>
          <div
            style={{ display: "flex", gap: "15px", justifyContent: "center" }}
          >
            <button
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=So excited! I'm flying to ${displayDest} with AirGo! ✈️`,
                  "_blank",
                )
              }
              style={{
                background: "#000",
                color: "white",
                border: "none",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              <i className="ri-twitter-x-fill"></i>
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=https://airgo.com`,
                  "_blank",
                )
              }
              style={{
                background: "#1877F2",
                color: "white",
                border: "none",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              <i className="ri-facebook-fill"></i>
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=I'm going to ${displayDest}!`,
                  "_blank",
                )
              }
              style={{
                background: "#25D366",
                color: "white",
                border: "none",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              <i className="ri-whatsapp-fill"></i>
            </button>
            <button
              onClick={() =>
                navigator.clipboard
                  .writeText(`I'm going to ${displayDest}!`)
                  .then(() => alert("Copied to clipboard!"))
              }
              style={{
                background: "#475569",
                color: "white",
                border: "none",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              <i className="ri-file-copy-line"></i>
            </button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <button
            style={{
              padding: "0.8rem 2rem",
              borderRadius: "8px",
              border: "2px solid #0f172a",
              color: "#0f172a",
              background: "transparent",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => window.print()}
          >
            <i className="ri-printer-line" style={{ marginRight: "5px" }}></i>{" "}
            Print Ticket
          </button>
          <Link
            to="/"
            style={{
              padding: "0.8rem 2rem",
              borderRadius: "8px",
              background: "#0f172a",
              color: "#fff",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Book Another Trip
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
