import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import SeatMap from "../../components/SeatMap";
import PriceAlertModal from "../../components/booking/PriceAlertModal";
import { useLanguage } from "../../context/LanguageContext";

const ReservationPage = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState("");
  const [travelClass, setTravelClass] = useState("Economy");
  const [flightSeats, setFlightSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [price, setPrice] = useState("");
  const [firstName] = useState("");
  const [lastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState({
    base: 0,
    taxes: 0,
    fees: 0,
    extras: 0,
    car: 0,
    total: 0,
  });

  // Price Alert State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalData, setAlertModalData] = useState({});

  // New State for Travel Extras
  const [selectedExtras, setSelectedExtras] = useState({
    baggage: 0, // 0=Included, 1=+1 Bag ($40), 2=+2 Bags ($75)
    priorityBoarding: false, // $15
    loungeAccess: false, // $35
    meal: "standard", // standard=Free, premium=$20
    insurance: false, // $25
    carbonOffset: false, // $12 (Sustainability)
  });

  // TTS Helper
  const speakSummary = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const pCount = parseInt(searchParams.get("passengers") || "1");
    setPassengerCount(pCount);

    const initialPassengers = Array(pCount)
      .fill(null)
      .map((_, index) => ({
        id: index + 1,
        firstName: index === 0 && user ? user.FirstName : "",
        lastName: index === 0 && user ? user.LastName : "",
        ssn: "",
        email: index === 0 && user ? user.Email : "",
        wheelchair: false, // Accessibility
      }));
    setPassengers(initialPassengers);

    if (user) {
      setEmail(user.Email);
    }

    const checkExtras = () => {
      const extras = JSON.parse(localStorage.getItem("tripExtras") || "{}");
      if (extras.car) {
        setSelectedCar(extras.car);
      }
    };

    checkExtras();
    window.addEventListener("storage", checkExtras);
    return () => window.removeEventListener("storage", checkExtras);
  }, [location.state, searchParams]);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const flightsRes = await fetch("http://localhost:5000/api/flights");
        const flightsData = await flightsRes.json();
        if (flightsRes.ok) {
          setFlights(flightsData.flights || []);
          const paramFlightId = searchParams.get("flightId");
          if (paramFlightId) {
            setSelectedFlight(paramFlightId);
          }
        }
      } catch (err) {
        setError("Failed to fetch flights");
      }
    };
    fetchFlights();
  }, [searchParams, location.state]);

  // Price Calculation Effect
  useEffect(() => {
    let currentFlight = null;

    if (location.state && location.state.flightDTO) {
      if (
        String(location.state.flightDTO.FlightId) === String(selectedFlight)
      ) {
        currentFlight = location.state.flightDTO;
      }
    }

    if (!currentFlight && flights.length > 0 && selectedFlight) {
      currentFlight = flights.find(
        (f) => String(f.FlightId) === String(selectedFlight),
      );
    }

    if (!selectedFlight || !currentFlight) return;

    // Base Ticket Price
    let basePrice =
      travelClass === "Economy"
        ? currentFlight.EconomyPrice
        : travelClass === "Business"
        ? currentFlight.BusinessPrice
        : currentFlight.FirstClassPrice;

    const fareType = searchParams.get("fare");
    if (fareType === "flex") basePrice += 50;

    // Calculate Extras Cost (Per Passenger)
    let extrasCost = 0;
    if (selectedExtras.baggage === 1) extrasCost += 40;
    if (selectedExtras.baggage === 2) extrasCost += 75;
    if (selectedExtras.priorityBoarding) extrasCost += 15;
    if (selectedExtras.loungeAccess) extrasCost += 35;
    if (selectedExtras.meal === "premium") extrasCost += 20;
    if (selectedExtras.insurance) extrasCost += 25;
    if (selectedExtras.carbonOffset) extrasCost += 12; // Carbon Offset

    // Split components
    const taxesPerPax = basePrice * 0.12; // 12% Tax
    const serviceFeePerPax = 15; // Fixed Service Fee

    // Totals
    const totalBase = basePrice * passengerCount;
    const totalTaxes = taxesPerPax * passengerCount;
    const totalFees = serviceFeePerPax * passengerCount;
    const totalExtras = extrasCost * passengerCount;
    const carCost = selectedCar ? selectedCar.price : 0;

    const finalPrice =
      totalBase + totalTaxes + totalFees + totalExtras + carCost;

    setPrice(finalPrice);
    setPriceBreakdown({
      base: totalBase,
      taxes: totalTaxes,
      fees: totalFees,
      extras: totalExtras,
      car: carCost,
      total: finalPrice,
    });

    // Fetch Seats logic
    const fetchSeats = async () => {
      if (
        String(selectedFlight).startsWith("syn-") ||
        String(selectedFlight).startsWith("conn-")
      ) {
        const mockSeats = [];
        let startRow =
          travelClass === "FirstClass"
            ? 1
            : travelClass === "Business"
            ? 4
            : 10;
        let rowCount =
          travelClass === "FirstClass"
            ? 3
            : travelClass === "Business"
            ? 6
            : 24;
        let cols =
          travelClass === "FirstClass"
            ? ["A", "C"]
            : travelClass === "Business"
            ? ["A", "B", "C", "D"]
            : ["A", "B", "C", "D", "E", "F"];

        for (let r = startRow; r < startRow + rowCount; r++) {
          for (let c of cols) {
            mockSeats.push({
              SeatId: `mock-${r}-${c}`,
              SeatNumber: `${r}${c}`,
              Class: travelClass,
              IsAvailable: Math.random() > 0.2 ? 1 : 0,
            });
          }
        }
        setFlightSeats(mockSeats);
        return;
      }

      try {
        const seatsRes = await fetch(
          `http://localhost:5000/api/seatAssignments?FlightId=${selectedFlight}`,
        );
        const seatsData = await seatsRes.json();
        if (seatsRes.ok) {
          setFlightSeats(seatsData.seatAssignments || []);
        }
      } catch (err) {
        console.error("Failed to fetch seats", err);
      }
    };
    fetchSeats();
  }, [
    selectedFlight,
    flights,
    travelClass,
    searchParams,
    selectedExtras,
    selectedCar,
    passengerCount,
    location.state,
  ]);

  const handleFlightChange = (e) => {
    setSelectedFlight(e.target.value);
    setSelectedSeats([]);
  };

  const handleTravelClassChange = (e) => {
    setTravelClass(e.target.value);
    setSelectedSeats([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const isValid = passengers.every((p) => p.firstName && p.lastName && p.ssn);
    const seatsSelected = selectedSeats.length === passengerCount;

    if (!selectedFlight) {
      setError("Please select a flight.");
      setLoading(false);
      return;
    }

    if (!seatsSelected) {
      setError(`Please select ${passengerCount} seat(s).`);
      setLoading(false);
      return;
    }

    if (!isValid) {
      setError("Please fill in all passenger details.");
      setLoading(false);
      return;
    }

    let flightObj =
      location.state?.flightDTO &&
      String(location.state.flightDTO.FlightId) === String(selectedFlight)
        ? location.state.flightDTO
        : flights.find((f) => String(f.FlightId) === String(selectedFlight));

    const reservationData = {
      flightId: selectedFlight,
      flight: flightObj,
      seat: selectedSeats.join(", "),
      selectedSeats: selectedSeats,
      price: price, // Includes extras
      travelClass: travelClass,
      passengers: passengers,
      passengerCount: passengerCount,
      passenger: {
        firstName: passengers[0]?.firstName || firstName,
        lastName: passengers[0]?.lastName || lastName,
        email: passengers[0]?.email || email,
      },
      fareType: searchParams.get("fare") || "light",
      extras: selectedExtras, // Pass extras to Payment Page
      priceBreakdown: priceBreakdown, // Pass breakdown to payment
    };

    localStorage.setItem("currentReservation", JSON.stringify(reservationData));
    navigate("/payment");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "8rem 2rem 4rem 2rem",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "3rem",
        }}
      >
        {/* Left Column */}
        <div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "0.5rem",
            }}
          >
            {t("completeBooking")}
          </h2>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>
            {t("fillDetails")}
          </p>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              background: "#fff",
              padding: "2.5rem",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            {/* Passenger Details */}
            <div
              style={{
                marginBottom: "2.5rem",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "2rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#d97706",
                    color: "#fff",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  1
                </span>
                {t("passengerDetails")}
              </h3>
              {passengers.map((p, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 1rem 0",
                      color: "#334155",
                      fontSize: "0.95rem",
                    }}
                  >
                    Passenger {index + 1}
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    {["firstName", "lastName", "ssn"].map((field) => (
                      <div key={field}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                            color: "#64748b",
                            textTransform: "uppercase",
                          }}
                        >
                          {field === "ssn" ? "ID / Passport No" : t(field)}
                        </label>
                        <input
                          type="text"
                          value={p[field] || ""}
                          onChange={(e) => {
                            const newPassengers = [...passengers];
                            newPassengers[index][field] = e.target.value;
                            setPassengers(newPassengers);
                          }}
                          required
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            outline: "none",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {/* Accessibility: Wheelchair & Special Assistance */}
                  <div style={{ marginTop: "0.5rem" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.85rem",
                        color: "#475569",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={p.wheelchair || false}
                        onChange={(e) => {
                          const newPassengers = [...passengers];
                          newPassengers[index].wheelchair = e.target.checked;
                          setPassengers(newPassengers);
                        }}
                      />
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <i className="ri-wheelchair-line"></i> Request
                        Wheelchair Assistance
                      </span>
                    </label>
                  </div>
                </div>
              ))}
              {!localStorage.getItem("user") && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.6rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                  <div>
                    <label>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.6rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Flight & Extras */}
            <div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#d97706",
                    color: "#fff",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  2
                </span>
                {t("flightSelection")}
              </h3>

              <div
                style={{ marginBottom: "1.5rem", display: "grid", gap: "1rem" }}
              >
                {flights.length === 0 && (
                  <div style={{ padding: "1rem", color: "#64748b" }}>
                    Loading flights...
                  </div>
                )}

                {/* Synthetic/Passed Flight Option (if not in main list) */}
                {location.state?.flightDTO &&
                  String(location.state.flightDTO.FlightId) ===
                    String(selectedFlight) &&
                  !flights.find(
                    (f) => String(f.FlightId) === String(selectedFlight),
                  ) && (
                    <div
                      onClick={() =>
                        handleFlightChange({
                          target: { value: location.state.flightDTO.FlightId },
                        })
                      }
                      style={{
                        border: "2px solid #0f172a",
                        background: "#f8fafc",
                        padding: "1rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {location.state.flightDTO.FlightNumber}
                      </div>
                      <div>
                        {location.state.flightDTO.Source} ➝{" "}
                        {location.state.flightDTO.Destination}
                      </div>
                    </div>
                  )}

                {flights.map((f) => {
                  const isSelected =
                    String(f.FlightId) === String(selectedFlight);
                  // Mock Sustainability Data
                  const co2 = 90 + ((f.FlightId * 13) % 60); // Random 90-150 range
                  const isEco = co2 < 110;

                  return (
                    <div
                      key={f.FlightId}
                      onClick={() =>
                        handleFlightChange({ target: { value: f.FlightId } })
                      }
                      style={{
                        border: isSelected
                          ? "2px solid #0f172a"
                          : "1px solid #cbd5e1",
                        background: isSelected ? "#fff" : "#fff",
                        padding: "1rem",
                        borderRadius: "12px",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s",
                        boxShadow: isSelected
                          ? "0 4px 12px rgba(15,23,42,0.1)"
                          : "none",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Green Selection Indicator */}
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: "6px",
                            background: "#0f172a",
                          }}
                        ></div>
                      )}

                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            color: "#1e293b",
                          }}
                        >
                          {f.FlightNumber}{" "}
                          <span
                            style={{
                              fontWeight: 400,
                              fontSize: "0.9rem",
                              color: "#64748b",
                            }}
                          >
                            ({f.Source} ➝ {f.Destination})
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "15px",
                            marginTop: "5px",
                            fontSize: "0.9rem",
                            color: "#475569",
                          }}
                        >
                          <span>
                            <i className="ri-time-line"></i>{" "}
                            {new Date(f.DepartureTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span
                            style={{
                              color: "#16a34a",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <i className="ri-leaf-fill"></i> {co2} kg CO₂
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "1.2rem",
                            color: "#0f172a",
                          }}
                        >
                          ${f.EconomyPrice}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAlertModalData({
                              origin: f.Source,
                              destination: f.Destination,
                              departureDate: f.DepartureTime.split("T")[0],
                            });
                            setIsAlertModalOpen(true);
                          }}
                          style={{
                            background: "none",
                            border: "1px solid #e2e8f0",
                            borderRadius: "20px",
                            padding: "4px 10px",
                            fontSize: "0.8rem",
                            color: "#d97706",
                            fontWeight: 600,
                            cursor: "pointer",
                            marginTop: "5px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            width: "100%",
                            justifyContent: "center",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.background = "#fffaf0")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.background = "none")
                          }
                        >
                          <i className="ri-notification-3-line"></i> Track Price
                        </button>

                        {isEco && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#16a34a",
                              fontWeight: 600,
                              background: "#dcfce7",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              marginTop: "4px",
                            }}
                          >
                            Eco Choice 🌿
                          </div>
                        )}
                        {isEco && isSelected && (
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "#d97706",
                              marginTop: "2px",
                            }}
                          >
                            +50 Green Points
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Class Selection */}
              <div
                style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}
              >
                {["Economy", "Business", "FirstClass"].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() =>
                      handleTravelClassChange({ target: { value: cls } })
                    }
                    style={{
                      flex: 1,
                      padding: "0.8rem",
                      border:
                        cls === travelClass
                          ? "2px solid #d97706"
                          : "1px solid #e2e8f0",
                      background: cls === travelClass ? "#fffaf0" : "#fff",
                      color: cls === travelClass ? "#b45309" : "#64748b",
                      borderRadius: "8px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {t(cls)}
                  </button>
                ))}
              </div>

              {/* Seat Map */}
              <div
                style={{
                  marginTop: "2rem",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "2rem",
                }}
              >
                <label
                  style={{
                    fontWeight: 600,
                    color: "#64748b",
                    display: "block",
                    marginBottom: "1rem",
                  }}
                >
                  SELECT SEAT
                </label>
                {selectedFlight && flightSeats.length > 0 ? (
                  <SeatMap
                    seats={flightSeats}
                    selectedSeats={selectedSeats}
                    onSeatSelect={setSelectedSeats}
                    travelClass={travelClass}
                    maxSeats={passengerCount}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#94a3b8",
                    }}
                  >
                    Select a flight first
                  </div>
                )}
              </div>

              {/* NEW: Travel Extras Section */}
              <div
                style={{
                  marginTop: "3rem",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "2rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: "1.5rem",
                    color: "#1e293b",
                  }}
                >
                  Travel Extras ✈️
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {/* Baggage */}
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      padding: "1rem",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                      Extra Baggage
                    </div>
                    <select
                      value={selectedExtras.baggage}
                      onChange={(e) =>
                        setSelectedExtras({
                          ...selectedExtras,
                          baggage: parseInt(e.target.value),
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      <option value={0}>Included (20kg)</option>
                      <option value={1}>+1 Bag (23kg) - $40</option>
                      <option value={2}>+2 Bags (2×23kg) - $75</option>
                    </select>
                  </div>

                  {/* Priority Boarding */}
                  <label
                    style={{
                      border: selectedExtras.priorityBoarding
                        ? "2px solid #2563eb"
                        : "1px solid #e2e8f0",
                      padding: "1rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Priority Boarding</span>
                      <input
                        type="checkbox"
                        checked={selectedExtras.priorityBoarding}
                        onChange={(e) =>
                          setSelectedExtras({
                            ...selectedExtras,
                            priorityBoarding: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                      Skip the queue
                    </div>
                    <div style={{ fontWeight: 700, color: "#2563eb" }}>
                      +$15
                    </div>
                  </label>

                  {/* Lounge Access */}
                  <label
                    style={{
                      border: selectedExtras.loungeAccess
                        ? "2px solid #2563eb"
                        : "1px solid #e2e8f0",
                      padding: "1rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Lounge Access</span>
                      <input
                        type="checkbox"
                        checked={selectedExtras.loungeAccess}
                        onChange={(e) =>
                          setSelectedExtras({
                            ...selectedExtras,
                            loungeAccess: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                      Relax before flight
                    </div>
                    <div style={{ fontWeight: 700, color: "#2563eb" }}>
                      +$35
                    </div>
                  </label>

                  {/* Meals */}
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      padding: "1rem",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                      Meal Preference
                    </div>
                    <select
                      value={selectedExtras.meal}
                      onChange={(e) =>
                        setSelectedExtras({
                          ...selectedExtras,
                          meal: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      <option value="standard">Standard (Free)</option>
                      <option value="veg">Vegetarian (Free)</option>
                      <option value="vegan">Vegan (Free)</option>
                      <option value="premium">Gourmet Feast (+$20)</option>
                    </select>
                  </div>

                  {/* Insurance */}
                  <label
                    style={{
                      border: selectedExtras.insurance
                        ? "2px solid #2563eb"
                        : "1px solid #e2e8f0",
                      padding: "1rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                      gridColumn: "1 / -1",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Travel Insurance</span>
                      <input
                        type="checkbox"
                        checked={selectedExtras.insurance}
                        onChange={(e) =>
                          setSelectedExtras({
                            ...selectedExtras,
                            insurance: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                      Comprehensive coverage for medical, cancellations, and
                      baggage (+$25)
                    </div>
                  </label>

                  {/* Sustainability: Carbon Offset */}
                  <label
                    style={{
                      border: selectedExtras.carbonOffset
                        ? "2px solid #16a34a"
                        : "1px solid #e2e8f0",
                      padding: "1rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                      gridColumn: "1 / -1",
                      background: selectedExtras.carbonOffset
                        ? "#f0fdf4"
                        : "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <i
                          className="ri-leaf-line"
                          style={{ color: "#16a34a" }}
                        ></i>
                        Offset Carbon Footprint
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedExtras.carbonOffset}
                        onChange={(e) =>
                          setSelectedExtras({
                            ...selectedExtras,
                            carbonOffset: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                      Neutralize the CO₂ emissions from your flight (approx
                      120kg/person). Supports reforestation projects. (+$12)
                    </div>
                  </label>
                </div>
              </div>

              {/* NEW: Multi-Modal Unified Booking (Tier 2 Feature) */}
              <div
                style={{
                  marginTop: "3rem",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "2rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: "1.5rem",
                    color: "#1e293b",
                  }}
                >
                  Complete Your Trip (Unified Booking) 🏨 🚗
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  {/* Hotel Add-on */}
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        background: "#e0f2fe",
                        padding: "10px",
                        borderRadius: "50%",
                      }}
                    >
                      <i
                        className="ri-hotel-line"
                        style={{ color: "#0284c7", fontSize: "1.2rem" }}
                      ></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>Add a Hotel</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        Save up to 15%
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Multi-Modal Modal: Select Hotel")}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        background: "white",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      + Add
                    </button>
                  </div>

                  {/* Car Add-on */}
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        background: "#f0fdf4",
                        padding: "10px",
                        borderRadius: "50%",
                      }}
                    >
                      <i
                        className="ri-car-line"
                        style={{ color: "#16a34a", fontSize: "1.2rem" }}
                      ></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>Rent a Car</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        Save up to 10%
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Multi-Modal Modal: Select Car")}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        background: "white",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "1.2rem",
                  marginTop: "2rem",
                  background: "#0f172a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {loading ? "Processing..." : "Continue to Payment"}
              </button>

              {/* NEW: Hold My Fare (Tier 2 Feature) */}
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm("Hold this price for 24 hours for a $5 fee?")
                  ) {
                    alert("Price Held! Reference sent to your email.");
                  }
                }}
                style={{
                  width: "100%",
                  padding: "1rem",
                  marginTop: "1rem",
                  background: "transparent",
                  color: "#64748b",
                  border: "2px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <i className="ri-time-line"></i> Hold Price for 24h ($5)
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Summary */}
        <div
          style={{ position: "sticky", top: "100px", height: "fit-content" }}
        >
          <div
            style={{
              background: "#0f172a",
              borderRadius: "16px",
              padding: "2rem",
              color: "#fff",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.2)",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {t("tripSummary")}
              <button
                onClick={() =>
                  speakSummary(
                    `Trip Summary. Flight from ${
                      selectedFlight
                        ? location.state?.flightDTO?.Source ||
                          flights.find(
                            (f) =>
                              String(f.FlightId) === String(selectedFlight),
                          )?.Source
                        : "Unknown"
                    } to ${
                      selectedFlight
                        ? location.state?.flightDTO?.Destination ||
                          flights.find(
                            (f) =>
                              String(f.FlightId) === String(selectedFlight),
                          )?.Destination
                        : "Unknown"
                    }. Total price ${price} dollars.`,
                  )
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
                title="Listen to Summary"
              >
                <i className="ri-volume-up-line"></i>
              </button>
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>FLIGHT</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                {selectedFlight
                  ? flights.find(
                      (f) => String(f.FlightId) === String(selectedFlight),
                    )?.FlightNumber || "---"
                  : "---"}
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>PASSENGERS</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                {passengerCount}
              </div>
            </div>

            {/* Extras Summary */}
            <div
              style={{
                borderTop: "1px dashed rgba(255,255,255,0.2)",
                paddingTop: "1rem",
                marginTop: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Extras Added:
              </div>
              {selectedExtras.baggage > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                  }}
                >
                  <span>Baggage</span>
                  <span>+${selectedExtras.baggage === 1 ? 40 : 75}</span>
                </div>
              )}
              {selectedExtras.priorityBoarding && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                  }}
                >
                  <span>Priority</span>
                  <span>+$15</span>
                </div>
              )}
              {selectedExtras.loungeAccess && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                  }}
                >
                  <span>Lounge</span>
                  <span>+$35</span>
                </div>
              )}
              {selectedExtras.meal === "premium" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                  }}
                >
                  <span>Gourmet Meal</span>
                  <span>+$20</span>
                </div>
              )}
              {selectedExtras.insurance && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                  }}
                >
                  <span>Insurance</span>
                  <span>+$25</span>
                </div>
              )}
              {selectedExtras.carbonOffset && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                    color: "#16a34a",
                  }}
                >
                  <span>Carbon Offset</span>
                  <span>+$12</span>
                </div>
              )}
              {Object.values(selectedExtras).every(
                (v) => !v || v === "standard" || v === 0,
              ) && <div style={{ opacity: 0.5, fontSize: "0.9rem" }}>None</div>}
            </div>

            <div
              style={{
                marginTop: "2rem",
                borderTop: "1px solid rgba(255,255,255,0.3)",
                paddingTop: "1rem",
              }}
            >
              <div style={{ opacity: 0.7 }}>TOTAL PRICE</div>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "#d97706",
                }}
              >
                ${price || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        initialData={alertModalData}
      />
    </div>
  );
};

export default ReservationPage;
