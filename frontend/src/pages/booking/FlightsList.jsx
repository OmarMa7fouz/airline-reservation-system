import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const FlightsList = () => {
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const translateCity = (city) => {
    if (!city) return "";
    const key = `city_${city.replace(/ /g, "_")}`;
    const translated = t(key);
    return translated !== key ? translated : city;
  };

  const [selectedClass, setSelectedClass] = useState("Economy");

  // Dynamic fares based on selected class
  const getFares = () => [
    {
      id: "light",
      name: `${t(selectedClass)} ${t("light")}`,
      priceOffset: 0,
      features: [t("bag23kg"), t("nonRefundable"), t("standardSeat")],
      color: "#64748b",
    },
    {
      id: "flex",
      name: `${t(selectedClass)} ${t("flex")}`,
      priceOffset: 50,
      features: [t("bag2x23kg"), t("refundable"), t("frontSeat")],
      color: "#d97706",
    },
  ];

  const [expandedFlightId, setExpandedFlightId] = useState(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/flights");
        const data = await res.json();
        if (res.ok) {
          // Logic to find flights: Direct -> Connected -> Synthetic
          let finalFlights = [];

          const from = searchParams.get("from");
          const to = searchParams.get("to");

          if (from && to) {
            const normalizedFrom = from.trim().toLowerCase();
            const normalizedTo = to.trim().toLowerCase();

            // 1. Direct Flights
            const directMatches = (data.flights || []).filter(
              (f) =>
                f.Source.toLowerCase() === normalizedFrom &&
                f.Destination.toLowerCase() === normalizedTo,
            );
            finalFlights = [...directMatches];

            // 2. Connecting Flights (1 Stop)
            // Only search if we need more options or just to enrich
            if (finalFlights.length < 5) {
              const startLegs = (data.flights || []).filter(
                (f) => f.Source.toLowerCase() === normalizedFrom,
              );
              const endLegs = (data.flights || []).filter(
                (f) => f.Destination.toLowerCase() === normalizedTo,
              );

              for (let leg1 of startLegs) {
                const match = endLegs.find(
                  (leg2) =>
                    leg2.Source.toLowerCase() ===
                      leg1.Destination.toLowerCase() &&
                    // Simple time check: leg2 departs after leg1 arrives (simulated for demo if times are close/same day)
                    leg2.DepartureTime > leg1.ArrivalTime,
                );

                if (match) {
                  // Create composite flight
                  finalFlights.push({
                    FlightId: `conn-${leg1.FlightId}-${match.FlightId}`,
                    FlightNumber: `${leg1.FlightNumber} + ${match.FlightNumber}`,
                    Source: leg1.Source,
                    Destination: match.Destination,
                    DepartureTime: leg1.DepartureTime,
                    ArrivalTime: match.ArrivalTime,
                    EconomyPrice: leg1.EconomyPrice + match.EconomyPrice,
                    BusinessPrice: leg1.BusinessPrice + match.BusinessPrice,
                    FirstClassPrice:
                      leg1.FirstClassPrice + match.FirstClassPrice,
                    isConnection: true,
                    StopCity: leg1.Destination, // Info for UI
                  });
                }
              }
            }

            // 3. Synthetic/Probabilistic Generation
            // If we still have few flights, generate logical options to satisfy "probabilistic routing"
            // The user wants to see options even if DB is empty for route.
            if (finalFlights.length < 5) {
              const missingCount = 5 - finalFlights.length;
              for (let i = 0; i < missingCount; i++) {
                // Randomize time logic
                // Slots: Morning, Afternoon, Evening, Night
                const slots = [6, 11, 15, 19, 23];
                const baseHourIdx = i % slots.length;
                const baseHour = slots[baseHourIdx];

                // Add random offset to base hour (0-3 hours)
                const randHour = baseHour + Math.floor(Math.random() * 3);
                const randMin = Math.floor(Math.random() * 60);
                const durationHours = 2 + Math.floor(Math.random() * 4); // 2-5 hours flight

                // Format logic
                const depH = randHour % 24;
                const arrH = (depH + durationHours) % 24;

                const depTimeStr = `2025-05-20T${
                  depH < 10 ? "0" + depH : depH
                }:${randMin < 10 ? "0" + randMin : randMin}:00`;
                const arrTimeStr = `2025-05-20T${
                  arrH < 10 ? "0" + arrH : arrH
                }:${randMin < 10 ? "0" + randMin : randMin}:00`;

                // Price Jitter
                const priceJitter = Math.floor(Math.random() * 100) - 50; // +/- 50

                // Create a flight that mimics a real one
                finalFlights.push({
                  FlightId: `syn-${from}-${to}-${Date.now()}-${i}-${Math.floor(
                    Math.random() * 1000,
                  )}`,
                  FlightNumber: `AG${Math.floor(100 + Math.random() * 900)}`,
                  Source: from,
                  Destination: to,
                  DepartureTime: depTimeStr,
                  ArrivalTime: arrTimeStr,
                  EconomyPrice: Math.max(200, 450 + i * 20 + priceJitter),
                  BusinessPrice: Math.max(500, 1200 + i * 50 + priceJitter),
                  FirstClassPrice: Math.max(1000, 2000 + i * 100 + priceJitter),
                  isSynthetic: true,
                });
              }
            }
          } else {
            // Show all if no search params (default behavior)
            finalFlights = data.flights || [];
          }

          setFlights(finalFlights);
        } else {
          // Safeguard: Ensure error is a string to prevent React crash
          const errorMessage =
            typeof data.error === "object"
              ? JSON.stringify(data.error)
              : data.error || "Failed to fetch flights";
          setError(errorMessage);
        }
      } catch (err) {
        setError("Server error");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [searchParams]);

  const handleSelectFare = (flightId, fareType) => {
    // Navigate to reservation with params
    const flight = flights.find((f) => String(f.FlightId) === String(flightId));
    const passengers = searchParams.get("passengers") || "1";
    navigate(
      `/reserve?flightId=${flightId}&fare=${fareType}&passengers=${passengers}`,
      {
        state: { flightDTO: flight },
      },
    );
  };

  const getBasePrice = (flight) => {
    switch (selectedClass) {
      case "Business":
        return flight.BusinessPrice;
      case "FirstClass":
        return flight.FirstClassPrice;
      default:
        return flight.EconomyPrice;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "8rem 2rem",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#1e293b",
            marginBottom: "2rem",
          }}
        >
          {t("selectFlight")}
        </h2>

        {/* Fare Class Dashboard */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            background: "#fff",
            padding: "0.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            width: "fit-content",
          }}
        >
          {["Economy", "Business", "FirstClass"].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              style={{
                padding: "0.8rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                background: selectedClass === cls ? "#0f172a" : "transparent",
                color: selectedClass === cls ? "#fff" : "#64748b",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t(cls)}
            </button>
          ))}
        </div>

        {loading && <p>Loading flights...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {flights.map((flight) => (
            <div
              key={flight.FlightId}
              style={{
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
                border:
                  expandedFlightId === flight.FlightId
                    ? "2px solid #d97706"
                    : "1px solid #e2e8f0",
                transition: "all 0.3s ease",
              }}
            >
              {/* Main Flight Card Info */}
              <div
                style={{
                  padding: "1.5rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1fr",
                  alignItems: "center",
                  gap: "1rem",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setExpandedFlightId(
                    flight.FlightId === expandedFlightId
                      ? null
                      : flight.FlightId,
                  )
                }
              >
                {/* Airline / Flight Num */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#d97706",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <i className="ri-plane-fill"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e293b" }}>
                      AirGo
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      {flight.FlightNumber}
                    </div>
                  </div>
                </div>

                {/* Route Visual */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1rem",
                    flexDirection: "column",
                  }}
                >
                  {/* Animation Styles */}
                  <style>
                    {`
                      @keyframes flyMove {
                        0% { left: 0; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { left: 100%; opacity: 0; }
                      }
                    `}
                  </style>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.5rem",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        {flight.DepartureTime.split("T")[1]?.substring(0, 5) ||
                          "10:00"}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                        {translateCity(flight.Source)}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                        maxWidth: "150px",
                        position: "relative",
                        justifyContent: "center",
                        height: "40px",
                      }}
                    >
                      {flight.isConnection && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-15px",
                            fontSize: "0.7rem",
                            color: "#dc2626",
                            fontWeight: "bold",
                          }}
                        >
                          1 Stop
                        </div>
                      )}

                      {/* Red Wavy Line */}
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 100 30"
                        preserveAspectRatio="none"
                        style={{ overflow: "visible" }}
                      >
                        <path
                          d="M0,15 Q25,0 50,15 T100,15"
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray="6,4"
                        />
                      </svg>

                      {/* Connection Dot */}
                      {flight.isConnection && (
                        <div
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "8px",
                            height: "8px",
                            background: "#dc2626",
                            borderRadius: "50%",
                            zIndex: 2,
                            border: "2px solid #fff",
                          }}
                        ></div>
                      )}

                      {/* Static Plane Icon */}
                      <i
                        className="ri-plane-fill"
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%) rotate(45deg)",
                          background: "#fff",
                          padding: "2px",
                          borderRadius: "50%",
                          color: "#dc2626",
                          zIndex: 3,
                          fontSize: "1.4rem",
                        }}
                      ></i>
                    </div>

                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        {flight.ArrivalTime?.split("T")[1]?.substring(0, 5) ||
                          "14:30"}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                        {translateCity(flight.Destination)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price & Expand */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {t("perPerson")}
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#d97706",
                    }}
                  >
                    ${getBasePrice(flight)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#d97706",
                      marginTop: "5px",
                    }}
                  >
                    {expandedFlightId === flight.FlightId
                      ? t("hideFares")
                      : t("viewFares")}{" "}
                    <i
                      className={`ri-arrow-${
                        expandedFlightId === flight.FlightId ? "up" : "down"
                      }-s-line`}
                    ></i>
                  </div>
                </div>
              </div>

              {/* Expanded Fare Options */}
              {expandedFlightId === flight.FlightId && (
                <div
                  style={{
                    background: "#f1f5f9",
                    padding: "1.5rem",
                    borderTop: "1px solid #e2e8f0",
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "1rem",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Select your fare:
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1.5rem",
                    }}
                  >
                    {getFares().map((fare) => (
                      <div
                        key={fare.id}
                        style={{
                          background: "#fff",
                          padding: "1.5rem",
                          borderRadius: "8px",
                          border: `1px solid ${fare.color}`,
                          position: "relative",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "translateY(-2px)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "translateY(0)")
                        }
                        onClick={() =>
                          handleSelectFare(flight.FlightId, fare.id)
                        }
                      >
                        <h4
                          style={{
                            color: fare.color,
                            fontSize: "1.2rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {fare.name}
                        </h4>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            marginBottom: "1rem",
                            color: "#1e293b",
                          }}
                        >
                          ${getBasePrice(flight) + fare.priceOffset}
                        </div>
                        <ul
                          style={{ listStyle: "none", padding: 0, margin: 0 }}
                        >
                          {fare.features.map((feat, idx) => (
                            <li
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "8px",
                                fontSize: "0.9rem",
                                color: "#475569",
                              }}
                            >
                              <i
                                className="ri-check-line"
                                style={{ color: fare.color }}
                              ></i>{" "}
                              {feat}
                            </li>
                          ))}
                        </ul>
                        <button
                          style={{
                            marginTop: "1.5rem",
                            width: "100%",
                            padding: "0.8rem",
                            background: fare.color,
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {t("selectFare")}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlightsList;
