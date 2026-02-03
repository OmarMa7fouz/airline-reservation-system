import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("book");
  const [tripType, setTripType] = useState("round");
  const [bookWithMiles, setBookWithMiles] = useState(false);
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    departure: "",
    return: "",
    passengers: 1,
    class: "Economy",
  });

  // Autocomplete States
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const airports = [
    {
      code: "JFK",
      city: "New York",
      name: "John F. Kennedy International Airport",
    },
    { code: "LHR", city: "London", name: "Heathrow Airport" },
    { code: "DXB", city: "Dubai", name: "Dubai International Airport" },
    {
      code: "JED",
      city: "Jeddah",
      name: "King Abdulaziz International Airport",
    },
    { code: "RUH", city: "Riyadh", name: "King Khalid International Airport" },
    { code: "CDG", city: "Paris", name: "Charles de Gaulle Airport" },
    { code: "SIN", city: "Singapore", name: "Changi Airport" },
    { code: "HND", city: "Tokyo", name: "Haneda Airport" },
    { code: "CAI", city: "Cairo", name: "Cairo International Airport" },
    { code: "IST", city: "Istanbul", name: "Istanbul Airport" },
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    if (value.length > 0) {
      const filtered = airports.filter(
        (airport) =>
          airport.city.toLowerCase().includes(value.toLowerCase()) ||
          airport.code.toLowerCase().includes(value.toLowerCase()) ||
          airport.name.toLowerCase().includes(value.toLowerCase()),
      );
      if (field === "from") {
        setFromSuggestions(filtered);
        setShowFromSuggestions(true);
      } else {
        setToSuggestions(filtered);
        setShowToSuggestions(true);
      }
    } else {
      if (field === "from") setShowFromSuggestions(false);
      else setShowToSuggestions(false);
    }
  };

  const selectAirport = (field, airport) => {
    setFormData({ ...formData, [field]: `${airport.city} (${airport.code})` });
    if (field === "from") setShowFromSuggestions(false);
    else setShowToSuggestions(false);
  };

  // Animation states
  const [hoveredPlanImg, setHoveredPlanImg] = useState(null);
  const [hoveredLoungeImg, setHoveredLoungeImg] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "book") {
      const searchParams = new URLSearchParams({
        from: formData.from,
        to: formData.to,
        date: formData.departure,
        return: formData.return,
        passengers: formData.passengers,
        class: formData.class,
      }).toString();
      navigate(`/flights?${searchParams}`);
    } else {
      console.log("Submit:", activeTab);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${process.env.PUBLIC_URL}/header.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "80vh",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      ></div>

      {/* Main Booking Widget Container */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "-150px auto 0",
          position: "relative",
          zIndex: 10,
          padding: "0 20px",
        }}
      >
        {/* Top Links Row (Stopover, Hotels, Cars) */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "2rem",
            marginBottom: "1rem",
            color: "#fff",
            fontSize: "0.95rem",
            fontWeight: 500,
          }}
        >
          <Link
            to="/stopover"
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            {t("stopover")} <i className="ri-arrow-right-s-line"></i>
          </Link>
          <Link
            to="/hotels"
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            {t("hotels")} <i className="ri-arrow-right-up-line"></i>
          </Link>
          <Link
            to="/cars"
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            {t("cars")} <i className="ri-arrow-right-up-line"></i>
          </Link>
        </div>

        {/* Widget Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            overflow: "hidden",
            minHeight: "400px",
            transition: "height 0.3s ease",
          }}
        >
          {/* Tabs Header */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #e2e8f0",
              padding: "0 1rem",
              overflowX: "auto",
            }}
          >
            {[
              "book",
              "manage",
              "checkIn",
              "flightStatus",
              "flightSchedule",
            ].map((tabKey) => {
              const isActive =
                activeTab ===
                (tabKey === "checkIn"
                  ? "check-in"
                  : tabKey === "flightStatus"
                  ? "flight status"
                  : tabKey === "flightSchedule"
                  ? "flight schedule"
                  : tabKey);
              // Normalize tab key for state comparison if needed, but for now simplify:
              // The original code used strings like "Book", "Manage".
              // Let's rely on the key for translation and mapping to state.
              // Actually the original state uses lowercase space separated strings: "check-in", "flight status" etc.
              // Let's map the translation key to the expected state value.
              let stateValue = tabKey;
              if (tabKey === "checkIn") stateValue = "check-in";
              if (tabKey === "flightStatus") stateValue = "flight status";
              if (tabKey === "flightSchedule") stateValue = "flight schedule";

              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(stateValue)}
                  style={{
                    padding: "1.5rem 1.5rem",
                    background: "transparent",
                    border: "none",
                    borderBottom:
                      activeTab === stateValue
                        ? "3px solid #006C35"
                        : "3px solid transparent", // Saudia Green Line
                    color: activeTab === stateValue ? "#1e293b" : "#64748b",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t(tabKey)}
                </button>
              );
            })}
          </div>

          {/* Widget Content Area */}
          <div style={{ padding: "2rem" }}>
            {/* BOOK TAB */}
            {activeTab === "book" && (
              <div
                className="tab-content-book"
                style={{ animation: "fadeIn 0.4s ease" }}
              >
                {/* Trip Type & Options Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    {[
                      { key: "roundTrip", value: "round trip" },
                      { key: "oneWay", value: "one way" },
                      { key: "multiCity", value: "multi-city" },
                    ].map((type) => (
                      <label
                        key={type.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          cursor: "pointer",
                          color: "#1e293b",
                          fontWeight: 500,
                        }}
                      >
                        <input
                          type="radio"
                          name="tripType"
                          checked={
                            tripType === type.value ||
                            (tripType === "round" &&
                              type.value === "round trip")
                          }
                          onChange={() => setTripType(type.value)}
                          style={{
                            accentColor: "#006C35",
                            width: "18px",
                            height: "18px",
                          }}
                        />
                        {t(type.key)}
                      </label>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                    }}
                  >
                    <div
                      onClick={() => setBookWithMiles(!bookWithMiles)}
                      style={{
                        width: "40px",
                        height: "22px",
                        background: bookWithMiles ? "#006C35" : "#e2e8f0",
                        borderRadius: "11px",
                        position: "relative",
                        cursor: "pointer",
                        transition: "background 0.3s",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          background: "#fff",
                          borderRadius: "50%",
                          position: "absolute",
                          top: "2px",
                          left: bookWithMiles ? "20px" : "2px",
                          transition: "left 0.3s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      ></div>
                    </div>
                    <span style={{ color: "#006C35", fontWeight: 600 }}>
                      {t("bookWithMiles")}
                    </span>
                  </div>
                </div>

                {/* Inputs Grid */}
                <form onSubmit={handleSubmit}>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginBottom: "1.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* From Box */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: "250px",
                        background: "#f1f5f9",
                        borderRadius: "4px",
                        padding: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid transparent",
                        transition: "border 0.2s",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                        }}
                      >
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {t("from")}
                        </span>
                        <input
                          type="text"
                          value={formData.from}
                          onChange={(e) =>
                            handleInputChange("from", e.target.value)
                          }
                          onBlur={() =>
                            setTimeout(() => setShowFromSuggestions(false), 200)
                          }
                          onFocus={() =>
                            formData.from && setShowFromSuggestions(true)
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "1.2rem",
                            fontWeight: 600,
                            color: "#1e293b",
                            outline: "none",
                            width: "100%",
                          }}
                        />
                        {/* Suggestions Dropdown */}
                        {showFromSuggestions && fromSuggestions.length > 0 && (
                          <ul
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              width: "100%",
                              background: "#fff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "0 0 4px 4px",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              listStyle: "none",
                              margin: 0,
                              padding: 0,
                              zIndex: 100,
                              maxHeight: "200px",
                              overflowY: "auto",
                            }}
                          >
                            {fromSuggestions.map((airport) => (
                              <li
                                key={airport.code}
                                onClick={() => selectAirport("from", airport)}
                                style={{
                                  padding: "10px 15px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #f1f5f9",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#f8fafc")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = "#fff")
                                }
                              >
                                <span
                                  style={{ fontWeight: 600, color: "#1e293b" }}
                                >
                                  {airport.city} ({airport.code})
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#64748b",
                                  }}
                                >
                                  {airport.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <i
                        className="ri-flight-takeoff-line"
                        style={{ fontSize: "1.5rem", color: "#006C35" }}
                      ></i>
                    </div>

                    {/* Swap Icon */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        className="ri-arrow-left-right-line"
                        style={{ fontSize: "1.2rem", color: "#64748b" }}
                      ></i>
                    </div>

                    {/* To Box */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: "250px",
                        background: "#f1f5f9",
                        borderRadius: "4px",
                        padding: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                        }}
                      >
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {t("to")}
                        </span>
                        <input
                          inputMode="text"
                          placeholder={t("selectDest")}
                          value={formData.to}
                          onChange={(e) =>
                            handleInputChange("to", e.target.value)
                          }
                          onBlur={() =>
                            setTimeout(() => setShowToSuggestions(false), 200)
                          }
                          onFocus={() =>
                            formData.to && setShowToSuggestions(true)
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "1.2rem",
                            fontWeight: 600,
                            color: "#1e293b",
                            outline: "none",
                            width: "100%",
                          }}
                        />
                        {/* Suggestions Dropdown */}
                        {showToSuggestions && toSuggestions.length > 0 && (
                          <ul
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              width: "100%",
                              background: "#fff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "0 0 4px 4px",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              listStyle: "none",
                              margin: 0,
                              padding: 0,
                              zIndex: 100,
                              maxHeight: "200px",
                              overflowY: "auto",
                            }}
                          >
                            {toSuggestions.map((airport) => (
                              <li
                                key={airport.code}
                                onClick={() => selectAirport("to", airport)}
                                style={{
                                  padding: "10px 15px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #f1f5f9",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#f8fafc")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = "#fff")
                                }
                              >
                                <span
                                  style={{ fontWeight: 600, color: "#1e293b" }}
                                >
                                  {airport.city} ({airport.code})
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#64748b",
                                  }}
                                >
                                  {airport.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <i
                        className="ri-flight-land-line"
                        style={{ fontSize: "1.5rem", color: "#006C35" }}
                      ></i>
                    </div>
                  </div>

                  {/* Secondary Inputs Row */}
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        gap: "1rem",
                        minWidth: "300px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          padding: "0.8rem",
                        }}
                      >
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.75rem",
                            color: "#64748b",
                          }}
                        >
                          {t("departure")}
                        </label>
                        <input
                          type="date"
                          value={formData.departure}
                          onChange={(e) =>
                            handleInputChange("departure", e.target.value)
                          }
                          min={new Date().toISOString().split("T")[0]}
                          style={{
                            border: "none",
                            outline: "none",
                            width: "100%",
                            fontWeight: 500,
                            fontFamily: "inherit",
                          }}
                        />
                      </div>

                      {tripType !== "one way" && (
                        <div
                          style={{
                            flex: 1,
                            border: "1px solid #e2e8f0",
                            borderRadius: "4px",
                            padding: "0.8rem",
                          }}
                        >
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.75rem",
                              color: "#64748b",
                            }}
                          >
                            {t("return")}
                          </label>
                          <input
                            type="date"
                            value={formData.return}
                            onChange={(e) =>
                              handleInputChange("return", e.target.value)
                            }
                            min={
                              formData.departure ||
                              new Date().toISOString().split("T")[0]
                            }
                            style={{
                              border: "none",
                              outline: "none",
                              width: "100%",
                              fontWeight: 500,
                              fontFamily: "inherit",
                            }}
                          />
                        </div>
                      )}
                      <div
                        style={{
                          flex: 0.8,
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          padding: "0.8rem",
                        }}
                      >
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.75rem",
                            color: "#64748b",
                          }}
                        >
                          {t("passengersClass")}
                        </label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginTop: "5px",
                          }}
                        >
                          <select
                            value={formData.passengers}
                            onChange={(e) =>
                              handleInputChange(
                                "passengers",
                                parseInt(e.target.value),
                              )
                            }
                            style={{
                              border: "none",
                              fontSize: "1rem",
                              fontWeight: 600,
                              color: "#1e293b",
                              background: "transparent",
                              cursor: "pointer",
                              outline: "none",
                            }}
                          >
                            {[1, 2, 3, 4, 5].map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? "Passenger" : "Passengers"}
                              </option>
                            ))}
                          </select>
                          <span
                            style={{ fontSize: "0.9rem", color: "#cbd5e1" }}
                          >
                            |
                          </span>
                          <span
                            style={{ fontSize: "0.9rem", color: "#64748b" }}
                          >
                            Economy
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{
                        background: "#0f172a",
                        color: "#fff",
                        padding: "1rem 3rem",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        height: "60px",
                        flex: "0 0 auto",
                      }}
                    >
                      {t("searchFlights")}
                    </button>
                  </div>
                </form>

                {/* Recent Searches */}
                <div
                  style={{
                    marginTop: "1.5rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    {t("recentSearches")}
                  </span>
                  <div
                    style={{
                      background: "#e6f4ea",
                      color: "#006C35",
                      padding: "0.4rem 1rem",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>Cairo → Riyadh · 24 Jan – 18 Feb</span>
                    <i
                      className="ri-close-circle-fill"
                      style={{ cursor: "pointer" }}
                    ></i>
                  </div>
                </div>
              </div>
            )}

            {/* MANAGE TAB */}
            {activeTab === "manage" && (
              <div
                className="tab-content-manage"
                style={{ animation: "fadeIn 0.4s ease", padding: "1rem 0" }}
              >
                <h3
                  style={{
                    marginBottom: "1.5rem",
                    color: "#1e293b",
                    fontWeight: 700,
                  }}
                >
                  {t("manageBooking")}
                </h3>
                <p style={{ marginBottom: "2rem", color: "#64748b" }}>
                  {t("manageDesc")}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: "300px",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      padding: "0.5rem 1rem",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: 600,
                        marginBottom: "5px",
                      }}
                    >
                      {t("bookingRef")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 6X7Y8Z"
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "100%",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "#1e293b",
                        outline: "none",
                        height: "40px",
                      }}
                    />
                    <i
                      className="ri-ticket-line"
                      style={{
                        position: "absolute",
                        right: "15px",
                        color: "#94a3b8",
                      }}
                    ></i>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: "300px",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      padding: "0.5rem 1rem",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: 600,
                        marginBottom: "5px",
                      }}
                    >
                      {t("lastName")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Al-Saud"
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "100%",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "#1e293b",
                        outline: "none",
                        height: "40px",
                      }}
                    />
                  </div>
                  <button
                    style={{
                      background: "#0f172a",
                      color: "#fff",
                      padding: "0 3rem",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      height: "65px",
                    }}
                  >
                    {t("retrieveBooking")}
                  </button>
                </div>
                <div style={{ marginTop: "1.5rem" }}>
                  <a
                    href="#"
                    style={{
                      color: "#006C35",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      textDecoration: "none",
                    }}
                  >
                    {t("tellMeMoreManage")}{" "}
                    <i className="ri-arrow-right-line"></i>
                  </a>
                </div>
              </div>
            )}

            {/* CHECK-IN TAB */}
            {activeTab === "check-in" && (
              <div
                className="tab-content-checkin"
                style={{ animation: "fadeIn 0.4s ease", padding: "1rem 0" }}
              >
                <h3
                  style={{
                    marginBottom: "1.5rem",
                    color: "#1e293b",
                    fontWeight: 700,
                  }}
                >
                  {t("onlineCheckIn")}
                </h3>
                <p style={{ marginBottom: "2rem", color: "#64748b" }}>
                  {t("checkInDesc")}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: "300px",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      padding: "0.5rem 1rem",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: 600,
                        marginBottom: "5px",
                      }}
                    >
                      {t("bookingRefTicket")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 6X7Y8Z"
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "100%",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "#1e293b",
                        outline: "none",
                        height: "40px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: "300px",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      padding: "0.5rem 1rem",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: 600,
                        marginBottom: "5px",
                      }}
                    >
                      {t("lastName")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Al-Saud"
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "100%",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "#1e293b",
                        outline: "none",
                        height: "40px",
                      }}
                    />
                  </div>
                  <button
                    style={{
                      background: "#006C35",
                      color: "#fff",
                      padding: "0 3rem",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      height: "65px",
                    }}
                  >
                    {t("checkInNow")}
                  </button>
                </div>
              </div>
            )}

            {/* FLIGHT STATUS TAB */}
            {activeTab === "flight status" && (
              <div
                className="tab-content-status"
                style={{ animation: "fadeIn 0.4s ease", padding: "1rem 0" }}
              >
                <div style={{ marginBottom: "2rem" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "2rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#1e293b",
                      }}
                    >
                      <input
                        type="radio"
                        name="searchType"
                        defaultChecked
                        style={{
                          accentColor: "#006C35",
                          width: "18px",
                          height: "18px",
                        }}
                      />
                      Search by Flight Number
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      <input
                        type="radio"
                        name="searchType"
                        style={{
                          accentColor: "#006C35",
                          width: "18px",
                          height: "18px",
                        }}
                      />
                      Search by Route
                    </label>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      alignItems: "flex-end",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        minWidth: "300px",
                        background: "#f8fafc",
                        borderRadius: "6px",
                        padding: "0.5rem 1rem",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.8rem",
                          color: "#64748b",
                          fontWeight: 600,
                          marginBottom: "5px",
                        }}
                      >
                        Flight Number
                      </label>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: 600,
                            color: "#1e293b",
                            marginRight: "5px",
                          }}
                        >
                          SV
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. 102"
                          style={{
                            background: "transparent",
                            border: "none",
                            width: "100%",
                            fontSize: "1.1rem",
                            fontWeight: 600,
                            color: "#1e293b",
                            outline: "none",
                            height: "40px",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        minWidth: "300px",
                        background: "#f8fafc",
                        borderRadius: "6px",
                        padding: "0.5rem 1rem",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.8rem",
                          color: "#64748b",
                          fontWeight: 600,
                          marginBottom: "5px",
                        }}
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        style={{
                          background: "transparent",
                          border: "none",
                          width: "100%",
                          fontSize: "1.05rem",
                          fontWeight: 600,
                          color: "#1e293b",
                          outline: "none",
                          height: "40px",
                        }}
                        defaultValue={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <button
                      style={{
                        background: "#0f172a",
                        color: "#fff",
                        padding: "0 3rem",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        height: "65px",
                      }}
                    >
                      Check Status
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FLIGHT SCHEDULE TAB */}
            {activeTab === "flight schedule" && (
              <div
                className="tab-content-schedule"
                style={{ animation: "fadeIn 0.4s ease", padding: "1rem 0" }}
              >
                <h3
                  style={{
                    marginBottom: "1.5rem",
                    color: "#1e293b",
                    fontWeight: 700,
                  }}
                >
                  Flight Schedule
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  {/* From Box */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: "250px",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      padding: "0.5rem 1rem",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: 600,
                        marginBottom: "5px",
                      }}
                    >
                      From
                    </label>
                    <input
                      type="text"
                      placeholder="Origin"
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "100%",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "#1e293b",
                        outline: "none",
                        height: "35px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="ri-arrow-right-line"
                      style={{ fontSize: "1.2rem", color: "#64748b" }}
                    ></i>
                  </div>
                  {/* To Box */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: "250px",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      padding: "0.5rem 1rem",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: 600,
                        marginBottom: "5px",
                      }}
                    >
                      To
                    </label>
                    <input
                      type="text"
                      placeholder="Destination"
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "100%",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "#1e293b",
                        outline: "none",
                        height: "35px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      padding: "0.5rem 1rem",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: 600,
                        marginBottom: "5px",
                      }}
                    >
                      From Date
                    </label>
                    <input
                      type="date"
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "100%",
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        color: "#1e293b",
                        outline: "none",
                        height: "35px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      padding: "0.5rem 1rem",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontWeight: 600,
                        marginBottom: "5px",
                      }}
                    >
                      To Date
                    </label>
                    <input
                      type="date"
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "100%",
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        color: "#1e293b",
                        outline: "none",
                        height: "35px",
                      }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button
                    style={{
                      background: "#006C35",
                      color: "#fff",
                      padding: "1rem 3rem",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Show Schedule
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Blue Info Bar */}
          <div
            style={{
              background: "#0075bf",
              padding: "1rem 2rem",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <i
                className="ri-information-line"
                style={{ fontSize: "1.5rem" }}
              ></i>
              <span style={{ fontWeight: 500 }}>{t("travelRequirements")}</span>
            </div>
            <div
              style={{
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {t("learnMore")} <i className="ri-arrow-right-s-line"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Styles for animation */}
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Plan Section */}
      <section
        className="section__container plan__container"
        style={{ padding: "8rem 2rem 4rem 2rem" }}
      >
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p
            className="subheader"
            style={{
              color: "#d97706", // Amber
              fontWeight: 600,
              letterSpacing: "0.1em",
              marginBottom: "1rem",
              textTransform: "uppercase",
              fontSize: "0.9rem",
            }}
          >
            {t("travelSupport")}
          </p>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "1rem",
            }}
          >
            {t("planConfidence")}
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "1.1rem",
              marginBottom: 0,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {t("planDesc")}
          </p>
        </div>

        {/* Plan Grid */}
        <div
          className="plan__grid"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4rem",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {/* Left: Content */}
          <div className="plan__content" style={{ flex: 1, minWidth: 320 }}>
            {[
              {
                id: "01",
                title: "reqDubai",
                color: "#3b82f6",
                bg: "#eff6ff",
                desc: "reqDubaiDesc",
              },
              {
                id: "02",
                title: "insurance",
                color: "#f59e0b",
                bg: "#fffbeb",
                desc: "insuranceDesc",
              },
              {
                id: "03",
                title: "reqDest",
                color: "#eab308",
                bg: "#fefce8",
                desc: "reqDestDesc",
              },
            ].map((item, idx) => (
              <div
                key={item.id}
                style={{ marginBottom: "2rem", display: "flex", gap: "1.5rem" }}
              >
                <div
                  style={{
                    minWidth: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: item.bg,
                    color: item.color,
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.id}
                </div>
                <div>
                  <h4
                    style={{
                      margin: "0 0 0.5rem",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "#1e293b",
                    }}
                  >
                    {t(item.title)}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {t(item.desc)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Images */}
          <div
            className="plan__image"
            style={{
              flex: 1,
              height: 500,
              position: "relative",
            }}
          >
            {[
              { src: `${process.env.PUBLIC_URL}/plan-1.jpg`, left: 0, top: 40 },
              {
                src: `${process.env.PUBLIC_URL}/plan-2.jpg`,
                left: 140,
                top: 0,
              },
              {
                src: `${process.env.PUBLIC_URL}/plan-3.jpg`,
                left: 280,
                top: 80,
              },
            ].map((img, i) => {
              const isHovered = hoveredPlanImg === i;
              return (
                <img
                  key={i}
                  src={img.src}
                  onMouseEnter={() => setHoveredPlanImg(i)}
                  onMouseLeave={() => setHoveredPlanImg(null)}
                  style={{
                    position: "absolute",
                    left: img.left,
                    top: isHovered ? img.top - 20 : img.top,
                    width: 220,
                    height: 350,
                    objectFit: "cover",
                    borderRadius: "50px",
                    boxShadow: isHovered
                      ? "0 20px 40px rgba(0,0,0,0.1)"
                      : "0 10px 20px rgba(0,0,0,0.05)",
                    zIndex: isHovered ? 10 : 3 - i,
                    transition: "all 0.3s ease",
                    border: "5px solid #fff",
                  }}
                  alt={`Plan ${i}`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Memories Section */}
      <section style={{ backgroundColor: "#fff", padding: "6rem 2rem" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              color: "#1e293b",
              marginBottom: "3rem",
            }}
          >
            {t("makeMemories")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
            }}
          >
            {[
              {
                icon: "ri-calendar-check-line",
                title: "bookRelax",
                text: "bookRelaxDesc",
              },
              {
                icon: "ri-shield-check-line",
                title: "smartChecklist",
                text: "smartChecklistDesc",
              },
              {
                icon: "ri-bookmark-3-line",
                title: "saveMore",
                text: "saveMoreDesc",
              },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  padding: "2.5rem",
                  background: "#f8fafc",
                  borderRadius: "16px",
                  transition: "transform 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    background: "#d97706",
                    borderRadius: "50%",
                    margin: "0 auto 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "1.5rem",
                  }}
                >
                  <i className={card.icon}></i>
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    marginBottom: "1rem",
                    color: "#1e293b",
                  }}
                >
                  {t(card.title)}
                </h3>
                <p style={{ color: "#64748b", lineHeight: 1.6 }}>
                  {t(card.text)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lounge Section */}
      <section
        style={{ padding: "6rem 2rem", maxWidth: "1200px", margin: "0 auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
          }}
        >
          {/* Left: Images */}
          <div style={{ position: "relative", height: 400 }}>
            <img
              src={`${process.env.PUBLIC_URL}/lounge-1.jpg`}
              style={{
                width: 350,
                height: 250,
                objectFit: "cover",
                borderRadius: "20px",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              }}
              alt="Lounge 1"
            />
            <img
              src={`${process.env.PUBLIC_URL}/lounge-2.jpg`}
              style={{
                width: 350,
                height: 250,
                objectFit: "cover",
                borderRadius: "20px",
                position: "absolute",
                bottom: 0,
                right: 0,
                zIndex: 2,
                border: "8px solid #f8fafc",
              }}
              alt="Lounge 2"
            />
          </div>

          {/* Right: Content */}
          <div>
            <h4
              style={{
                color: "#d97706",
                fontWeight: "700",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "0.5rem",
              }}
            >
              {t("lounge")}
            </h4>
            <h2
              style={{
                fontSize: "2.8rem",
                color: "#1e293b",
                marginBottom: "2rem",
                lineHeight: "1.2",
              }}
            >
              {t("minorLounge")}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
              }}
            >
              {[
                {
                  t: "tranq",
                  d: "tranqDesc",
                },
                {
                  t: "elevate",
                  d: "elevateDesc",
                },
                {
                  t: "welcoming",
                  d: "welcomingDesc",
                },
                {
                  t: "culinary",
                  d: "culinaryDesc",
                },
              ].map((item, i) => (
                <div key={i}>
                  <h4
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {t(item.t)}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "#64748b",
                      lineHeight: 1.5,
                    }}
                  >
                    {t(item.d)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#1e293b",
          color: "#fff",
          padding: "4rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2rem",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "1.5rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ color: "#d97706" }}>
                <i className="ri-plane-fill"></i>
              </span>{" "}
              AirGo
            </h3>
            <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>
              {t("footerDesc")}
            </p>
          </div>
          <div>
            <h4 style={{ color: "#fff", marginBottom: "1.5rem" }}>
              {t("information")}
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                color: "#94a3b8",
                lineHeight: "2.2",
              }}
            >
              <li>{t("home")}</li>
              <li>{t("about")}</li>
              <li>{t("myReservations")}</li>
              <li>{t("flightStatus")}</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#fff", marginBottom: "1.5rem" }}>
              {t("contact")}
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                color: "#94a3b8",
                lineHeight: "2.2",
              }}
            >
              <li>{t("supportCenter")}</li>
              <li>+1 245 456 789</li>
              <li>support@airgo.com</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#fff", marginBottom: "1.5rem" }}>
              {t("subscribe")}
            </h4>
            <div
              style={{
                display: "flex",
                background: "#334155",
                borderRadius: "4px",
                padding: "5px",
              }}
            >
              <input
                type="text"
                placeholder={t("email")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  padding: "0.5rem",
                  outline: "none",
                  width: "100%",
                }}
              />
              <button
                style={{
                  background: "#d97706",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.5rem 1rem",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <i className="ri-send-plane-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
