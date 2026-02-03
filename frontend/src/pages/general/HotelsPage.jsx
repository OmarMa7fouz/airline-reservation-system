import React, { useState } from "react";

const HotelsPage = () => {
  const [activeTab, setActiveTab] = useState("hotels");

  const [destination, setDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Mock Data for Hotels
  const hotelDatabase = [
    "Atlantis The Palm, Dubai",
    "Burj Al Arab, Dubai",
    "The Savoy, London",
    "The Ritz, London",
    "Ritz Paris, Paris",
    "Four Seasons George V, Paris",
    "The Plaza, New York",
    "The Pierre, New York",
    "Marina Bay Sands, Singapore",
    "Raffles, Singapore",
    "Ciragan Palace Kempinski, Istanbul",
    "The Peninsula, Tokyo",
    "Mandarin Oriental, Bangkok",
    "Hotel Adlon Kempinski, Berlin",
    "The Gritti Palace, Venice",
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setDestination(value);

    if (value.length > 0) {
      const filtered = hotelDatabase.filter((hotel) =>
        hotel.toLowerCase().includes(value.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (hotel) => {
    setDestination(hotel);
    setShowSuggestions(false);
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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${process.env.PUBLIC_URL}/hotel-hero.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "60vh",
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
            Find Your Perfect Stay
          </h1>
          <p
            style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}
          >
            Discover thousands of hotels worldwide at the best prices.
          </p>
        </div>
      </div>

      {/* Widget Container */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "-80px auto 0",
          position: "relative",
          zIndex: 10,
          padding: "0 20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            padding: "2.5rem",
          }}
        >
          <h3
            style={{
              marginBottom: "1.5rem",
              color: "#1e293b",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i
              className="ri-hotel-bed-line"
              style={{ color: "#d97706", fontSize: "1.5rem" }}
            ></i>{" "}
            Book a Hotel
          </h3>

          <form
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
              gap: "1rem",
              alignItems: "end",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                position: "relative",
              }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Destination
              </label>
              <input
                type="text"
                placeholder="Where are you going?"
                value={destination}
                onChange={handleSearchChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay hiding to allow click
                onFocus={() => destination && setShowSuggestions(true)}
                style={{
                  padding: "0.9rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
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
                    zIndex: 1000,
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {suggestions.map((hotel, idx) => (
                    <li
                      key={idx}
                      onClick={() => selectSuggestion(hotel)}
                      style={{
                        padding: "0.8rem 1rem",
                        cursor: "pointer",
                        borderBottom:
                          idx === suggestions.length - 1
                            ? "none"
                            : "1px solid #f1f5f9",
                        fontSize: "0.95rem",
                        color: "#334155",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#f8fafc")
                      }
                      onMouseLeave={(e) => (e.target.style.background = "#fff")}
                    >
                      <i
                        className="ri-building-4-line"
                        style={{ marginRight: "8px", color: "#94a3b8" }}
                      ></i>
                      {hotel}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Check-in
              </label>
              <input
                type="date"
                style={{
                  padding: "0.9rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Check-out
              </label>
              <input
                type="date"
                style={{
                  padding: "0.9rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Guests
              </label>
              <select
                style={{
                  padding: "0.9rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "0.95rem",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <option>1 Room, 2 Guests</option>
                <option>1 Room, 1 Guest</option>
                <option>2 Rooms, 4 Guests</option>
              </select>
            </div>

            <button
              style={{
                backgroundColor: "#0f172a",
                color: "#fff",
                border: "none",
                padding: "0 2rem",
                height: "52px",
                borderRadius: "4px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Promo Section */}
      <section
        style={{ padding: "5rem 2rem", maxWidth: "1200px", margin: "0 auto" }}
      >
        <h2
          style={{ color: "#1e293b", fontSize: "2rem", marginBottom: "2rem" }}
        >
          Featured Destinations
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
          }}
        >
          {[
            { city: "Dubai", price: "From $120/night", img: "dubai-card.png" },
            {
              city: "London",
              price: "From $200/night",
              img: "london-card.png",
            },
            { city: "Paris", price: "From $180/night", img: "paris-card.png" },
            {
              city: "New York",
              price: "From $250/night",
              img: "new-york-card.png",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                background: "#fff",
                transition: "transform 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <img
                src={`${process.env.PUBLIC_URL}/${item.img}`}
                alt={item.city}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <div style={{ padding: "1.5rem" }}>
                <h4
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "0.5rem",
                    color: "#1e293b",
                  }}
                >
                  {item.city}
                </h4>
                <p style={{ color: "#d97706", fontWeight: 600 }}>
                  {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HotelsPage;
