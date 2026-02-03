import React, { useState } from "react";
import CarRentalMap from "../../components/common/CarRentalMap";

const CarsPage = () => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMapSelection = (latlng) => {
    setPinnedLocation(latlng);
    setPickupLocation(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
  };

  const mockCars = [
    {
      id: "c1",
      name: "Tesla Model 3",
      category: "Electric",
      price: 85,
      image: "/assets/cars/tesla.png",
      features: ["Autopilot", "GP", "300mi Range"],
      passengers: 5,
    },
    {
      id: "c2",
      name: "Mercedes C-Class",
      category: "Luxury",
      price: 120,
      image: "/assets/cars/mercedes.png",
      features: ["Leather Seats", "Sunroof", "Premium Sound"],
      passengers: 4,
    },
    {
      id: "c3",
      name: "Range Rover Sport",
      category: "SUV",
      price: 150,
      image: "/assets/cars/rangerover.png",
      features: ["All-Wheel Drive", "Spacious", "Off-road"],
      passengers: 5,
    },
    {
      id: "c4",
      name: "Toyota Camry",
      category: "Economy",
      price: 45,
      image: "/assets/cars/camry.png",
      features: ["Fuel Efficient", "Bluetooth", "Reliable"],
      passengers: 5,
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 1500);
  };

  const handleAddVehicle = (car) => {
    const tripExtras = JSON.parse(localStorage.getItem("tripExtras") || "{}");
    tripExtras.car = car;
    localStorage.setItem("tripExtras", JSON.stringify(tripExtras));
    alert(
      `Added ${car.name} to your trip! Close this tab and finish your booking.`,
    );
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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${process.env.PUBLIC_URL}/cars-hero.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "40vh", // Reduced height to bring map up
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "700",
              marginBottom: "1rem",
            }}
          >
            Drive Your Way
          </h1>
          <p
            style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}
          >
            Rent a car and explore your destination at your own pace.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "-60px auto 0",
          position: "relative",
          zIndex: 10,
          padding: "0 20px",
          marginBottom: "5rem",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            padding: "2rem",
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr", // Split layout: Form | Map
            gap: "2rem",
            alignItems: "stretch",
          }}
        >
          {/* Left Column: Search Form */}
          <div>
            <h3
              style={{
                marginBottom: "1.5rem",
                color: "#1e293b",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "1.5rem",
              }}
            >
              <i
                className="ri-car-fill"
                style={{ color: "#d97706", fontSize: "1.8rem" }}
              ></i>{" "}
              Find Your Car
            </h3>

            <p
              style={{
                marginBottom: "1.5rem",
                color: "#64748b",
                fontSize: "0.95rem",
              }}
            >
              Search by city, airport, or{" "}
              <strong>pin your exact location</strong> on the map.
            </p>

            <form
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
              }}
              onSubmit={handleSearch}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  Pick-up Location
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Search or pin on map"
                    style={{
                      padding: "0.9rem 0.9rem 0.9rem 2.5rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      width: "100%",
                      boxSizing: "border-box",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                  />
                  <i
                    className="ri-map-pin-line"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#d97706",
                      fontSize: "1.1rem",
                    }}
                  ></i>
                </div>
                {pinnedLocation && (
                  <small
                    style={{
                      color: "#006C35",
                      marginTop: "5px",
                      display: "block",
                    }}
                  >
                    <i className="ri-check-line"></i> Pinned coordinates:{" "}
                    {pinnedLocation.lat.toFixed(4)},{" "}
                    {pinnedLocation.lng.toFixed(4)}
                  </small>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: "5px",
                      display: "block",
                    }}
                  >
                    Pick-up Date
                  </label>
                  <input
                    type="date"
                    style={{
                      padding: "0.9rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      width: "100%",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: "5px",
                      display: "block",
                    }}
                  >
                    Drop-off Date
                  </label>
                  <input
                    type="date"
                    style={{
                      padding: "0.9rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      width: "100%",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  Driver Age
                </label>
                <select
                  style={{
                    padding: "0.9rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#fff",
                  }}
                >
                  <option>25+</option>
                  <option>18-24</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: "#0f172a",
                  color: "#fff",
                  border: "none",
                  padding: "1rem",
                  marginTop: "0.5rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: loading ? "wait" : "pointer",
                  fontSize: "1.1rem",
                  transition: "background 0.2s",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  opacity: loading ? 0.8 : 1,
                }}
                disabled={loading}
                onMouseEnter={(e) =>
                  !loading && (e.target.style.backgroundColor = "#1e293b")
                }
                onMouseLeave={(e) =>
                  !loading && (e.target.style.backgroundColor = "#0f172a")
                }
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line ri-spin"></i> Searching...
                  </>
                ) : (
                  <>
                    <i className="ri-search-line"></i> Find Vehicle
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Map */}
          <div style={{ minHeight: "450px", height: "100%" }}>
            <CarRentalMap onLocationSelect={handleMapSelection} />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <section
          style={{
            padding: "0 2rem 5rem 2rem",
            maxWidth: "1200px",
            margin: "0 auto",
            animation: "fadeIn 0.5s ease-out",
          }}
        >
          <h2
            style={{
              color: "#1e293b",
              fontSize: "2rem",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            Available Vehicles
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {mockCars.map((car) => (
              <div
                key={car.id}
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "default",
                  border: "1px solid #f1f5f9",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(0,0,0,0.08)";
                }}
              >
                {/* Image Area */}
                <div
                  style={{
                    height: "200px",
                    backgroundImage: `url(${car.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      background: "rgba(255,255,255,0.9)",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#0f172a",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    {car.category}
                  </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: "1.5rem", flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.4rem",
                        color: "#1e293b",
                        fontWeight: 700,
                      }}
                    >
                      {car.name}
                    </h3>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: "1.5rem",
                          fontWeight: 700,
                          color: "#d97706",
                        }}
                      >
                        ${car.price}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#64748b",
                        }}
                      >
                        / day
                      </span>
                    </div>
                  </div>

                  {/* Passenger Info */}
                  <div
                    style={{
                      marginBottom: "1rem",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <i
                      className="ri-user-line"
                      style={{ fontSize: "1.1rem" }}
                    ></i>
                    <span>{car.passengers} Passengers</span>
                  </div>

                  {/* Features */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginBottom: "1.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {car.features.map((feature, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "0.8rem",
                          padding: "0.25rem 0.5rem",
                          background: "#f1f5f9",
                          color: "#64748b",
                          borderRadius: "4px",
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddVehicle(car)}
                    style={{
                      width: "100%",
                      padding: "0.9rem",
                      background: "#0f172a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "1rem",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "#d97706")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "#0f172a")
                    }
                  >
                    Add to Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories (Only show if no results yet) */}
      {!showResults && (
        <section
          style={{
            padding: "0 2rem 5rem 2rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              color: "#1e293b",
              fontSize: "2rem",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            Vehicle Categories
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
            }}
          >
            {["Economy", "SUV", "Luxury", "Van"].map((type, i) => (
              <div
                key={i}
                style={{
                  padding: "2rem",
                  background: "#fff",
                  borderRadius: "12px",
                  textAlign: "center",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  border: "1px solid #f1f5f9",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
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
                    fontSize: "3.5rem",
                    color: "#94a3b8",
                    marginBottom: "1rem",
                  }}
                >
                  <i className="ri-roadster-fill"></i>
                </div>
                <h4
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "0.5rem",
                    color: "#1e293b",
                  }}
                >
                  {type}
                </h4>
                <p style={{ color: "#64748b" }}>
                  Perfect for city trips and short journeys.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CarsPage;
