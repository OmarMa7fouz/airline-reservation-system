import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

// Add slideDown animation for dropdown menus
const style = document.createElement("style");
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;
if (!document.head.querySelector("[data-navbar-animations]")) {
  style.setAttribute("data-navbar-animations", "true");
  document.head.appendChild(style);
}

const Navbar = () => {
  const { language, switchLanguage, t } = useLanguage();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [notifications, setNotifications] = useState([]);

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showAccessMenu, setShowAccessMenu] = useState(false); // Accessibility
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const fetchNotifs = () => {
      const userId = user?.id || user?.PassengerId || 1; // Default to 1 for demo
      fetch(`http://localhost:5000/api/v1/notifications?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setNotifications(data.notifications);
        })
        .catch((err) => console.log("Notif fetch error (simulated/demo)", err));
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // 30s
    return () => clearInterval(interval);
  }, [user]);

  const simulateAlert = async () => {
    const userId = user?.id || user?.PassengerId || 1;
    const types = ["delay", "gate_change", "boarding", "baggage", "weather"];
    const type = types[Math.floor(Math.random() * types.length)];
    try {
      await fetch("http://localhost:5000/api/v1/notifications/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type }),
      });
      const res = await fetch(
        `http://localhost:5000/api/v1/notifications?userId=${userId}`,
      );
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
      if (window.innerWidth >= 1000) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Streamlined navigation - consolidated for better spacing and UX
  const navLinks = [
    {
      label: t("home"),
      path: "/",
      icon: "ri-home-4-line",
    },
    {
      label: "Book",
      path: "/reserve",
      icon: "ri-flight-takeoff-line",
      dropdown: [
        {
          label: "Travel Packages",
          path: "/packages",
          icon: "ri-gift-2-line",
          description: "Save with bundled deals",
        },
        {
          label: "Flights",
          path: "/reserve",
          icon: "ri-flight-takeoff-line",
          description: "Search and book flights",
        },
        {
          label: "Hotels",
          path: "/hotels",
          icon: "ri-hotel-line",
          description: "Find your perfect stay",
        },
        {
          label: "Cars",
          path: "/cars",
          icon: "ri-car-line",
          description: "Rent a car for your trip",
        },
        {
          label: "Stopover",
          path: "/stopover",
          icon: "ri-map-pin-line",
          description: "Explore stopover destinations",
        },
      ],
    },
    {
      label: "My Trips",
      path: "/my-reservations",
      icon: "ri-suitcase-line",
      dropdown: [
        {
          label: "My Reservations",
          path: "/my-reservations",
          icon: "ri-ticket-2-line",
          description: "View and manage bookings",
        },
        {
          label: "Travel Preferences",
          path: "/preferences",
          icon: "ri-user-settings-line",
          description: "Personalize your journey",
        },
        {
          label: "Price Alerts",
          path: "/price-alerts",
          icon: "ri-notification-3-line",
          description: "Track flight prices",
        },
        {
          label: "Flight Status",
          path: "/my-reservations",
          icon: "ri-time-line",
          description: "Check flight updates",
        },
      ],
    },
    {
      label: "Rewards",
      path: "/loyalty",
      icon: "ri-gift-line",
      dropdown: [
        {
          label: "Dashboard",
          path: "/loyalty",
          icon: "ri-dashboard-line",
          description: "View your points & status",
        },
        {
          label: "Earn Points",
          path: "/loyalty#earn",
          icon: "ri-coin-line",
          description: "Ways to earn rewards",
        },
        {
          label: "Redeem",
          path: "/loyalty#redeem",
          icon: "ri-gift-line",
          description: "Use your points",
        },
      ],
    },
  ];

  const [activeDropdown, setActiveDropdown] = useState(null);

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.5rem 3rem",
        backgroundColor: "#0f172a",
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 1000,
        boxSizing: "border-box",
        transition: "all 0.3s ease",
        fontFamily: "'Poppins', sans-serif",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          gap: "1rem",
        }}
      >
        {/* Left: Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: "0 0 auto",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#fff",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: "#d97706" }}>
              <i className="ri-plane-fill"></i>
            </span>
            <span style={{ letterSpacing: "1px" }}>{t("brand")}</span>
          </Link>
        </div>

        {/* Hamburger Menu Button - Mobile Only */}
        {isMobile && (
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "1.8rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem",
              marginLeft: "auto",
              width: "44px",
              height: "44px",
              transition: "all 0.2s ease",
            }}
            aria-label="Toggle menu"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(217, 119, 6, 0.2)";
              e.currentTarget.style.borderColor = "#d97706";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
          >
            <i
              className={showMobileMenu ? "ri-close-line" : "ri-menu-line"}
            ></i>
          </button>
        )}

        {/* Center: Main Links - Desktop */}
        {!isMobile && (
          <div
            style={{
              flex: "1 1 auto",
              display: "flex",
              justifyContent: "center",
              minWidth: 0,
              overflow: "visible",
            }}
          >
            <ul
              style={{
                listStyle: "none",
                gap: "3rem",
                margin: 0,
                padding: 0,
                display: "flex",
                alignItems: "center",
                flexWrap: "nowrap",
              }}
            >
              {navLinks.map((item, index) => (
                <li
                  key={item.label}
                  style={{ display: "flex", position: "relative" }}
                  onMouseEnter={() => item.dropdown && setActiveDropdown(index)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.path}
                    style={{
                      color: "#e2e8f0",
                      textDecoration: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1rem",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#d97706";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#e2e8f0";
                    }}
                  >
                    {item.icon && <i className={item.icon}></i>}
                    {item.label}
                    {item.dropdown && (
                      <i
                        className="ri-arrow-down-s-line"
                        style={{
                          fontSize: "1.1rem",
                          transition: "transform 0.3s ease",
                          transform:
                            activeDropdown === index
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                        }}
                      ></i>
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.dropdown && activeDropdown === index && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        marginTop: "0.5rem",
                        background: "#ffffff",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                        padding: "1.25rem",
                        minWidth: "280px",
                        zIndex: 1000,
                        animation: "slideDown 0.3s ease",
                      }}
                    >
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.label}
                          to={subItem.path}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "1rem",
                            padding: "1rem",
                            color: "#1e293b",
                            textDecoration: "none",
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                            marginBottom: "0.5rem",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#fff7ed";
                            e.currentTarget.style.transform = "translateX(4px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.transform = "translateX(0)";
                          }}
                        >
                          <i
                            className={subItem.icon}
                            style={{
                              fontSize: "1.5rem",
                              color: "#d97706",
                              marginTop: "0.25rem",
                            }}
                          ></i>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                color: "#1e293b",
                                marginBottom: subItem.description
                                  ? "0.25rem"
                                  : "0",
                              }}
                            >
                              {subItem.label}
                            </div>
                            {subItem.description && (
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#64748b",
                                  lineHeight: "1.4",
                                }}
                              >
                                {subItem.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Right: Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flex: "0 0 auto",
          }}
        >
          {/* About Link - Subtle */}
          {!isMobile && (
            <Link
              to="/about"
              style={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#d97706";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              About
            </Link>
          )}

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                color: "#fff",
                fontSize: "1.2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <i className="ri-notification-3-line"></i>
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "#ef4444",
                    color: "white",
                    fontSize: "0.65rem",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    border: "2px solid #0f172a",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "120%",
                  right: "-40px",
                  width: "320px",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                  padding: "1rem",
                  zIndex: 1000,
                  color: "#1e293b",
                  maxHeight: "400px",
                  overflowY: "auto",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: "1rem" }}>Notifications</h4>
                  <button
                    onClick={simulateAlert}
                    style={{
                      fontSize: "0.8rem",
                      color: "#d97706",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Simulate Alert 🔄
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      padding: "1rem",
                    }}
                  >
                    No notifications
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "10px",
                          background: n.is_read ? "#f8fafc" : "#fff7ed",
                          borderRadius: "8px",
                          borderLeft: n.is_read
                            ? "3px solid transparent"
                            : "3px solid #d97706",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            marginBottom: "4px",
                          }}
                        >
                          {n.title}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          {n.message}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                            marginTop: "5px",
                          }}
                        >
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Accessibility Menu */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowAccessMenu(!showAccessMenu)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "1.4rem",
                cursor: "pointer",
                marginRight: "10px",
              }}
              title="Accessibility Options"
            >
              <i className="ri-accessibility-line"></i>
            </button>
            {showAccessMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "120%",
                  right: 0,
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  padding: "1rem",
                  minWidth: "200px",
                  color: "#1e293b",
                  zIndex: 1000,
                }}
              >
                <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9rem" }}>
                  Accessibility
                </h4>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      document.body.classList.toggle("high-contrast")
                    }
                  />
                  <span>High Contrast Mode</span>
                </label>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  <i className="ri-information-line"></i> Screen Reader
                  Optimized
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "20px",
                padding: "5px 12px",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>🌐</span>{" "}
              {language.toUpperCase()}
            </button>
            {showLangMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "120%",
                  right: 0,
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "0.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  minWidth: "150px",
                  color: "#1e293b",
                  maxHeight: "400px",
                  overflowY: "auto",
                  zIndex: 2000,
                }}
              >
                {[
                  { code: "en", label: "English" },
                  { code: "ar", label: "العربية" },
                  { code: "fr", label: "Français" },
                  { code: "hi", label: "हिंदी" },
                  { code: "es", label: "Español" },
                  { code: "zh", label: "中文" },
                  { code: "ja", label: "日本語" },
                  { code: "de", label: "Deutsch" },
                  { code: "ru", label: "Русский" },
                  { code: "pt", label: "Português" },
                  { code: "it", label: "Italiano" },
                  { code: "ko", label: "한국어" },
                  { code: "tr", label: "Türkçe" },
                  { code: "nl", label: "Nederlands" },
                  { code: "sv", label: "Svenska" },
                  { code: "pl", label: "Polski" },
                  { code: "ms", label: "Bahasa Melayu" },
                  { code: "id", label: "Bahasa Indonesia" },
                  { code: "vi", label: "Tiếng Việt" },
                  { code: "th", label: "ไทย" },
                  { code: "el", label: "Ελληνικά" },
                  { code: "cs", label: "Čeština" },
                  { code: "da", label: "Dansk" },
                  { code: "fi", label: "Suomi" },
                  { code: "no", label: "Norsk" },
                  { code: "hu", label: "Magyar" },
                  { code: "ro", label: "Română" },
                  { code: "he", label: "עברית" },
                  { code: "uk", label: "Українська" },
                  { code: "bn", label: "বাংলা" },
                  { code: "pa", label: "ਪੰਜਾਬੀ" },
                  { code: "ta", label: "தமிழ்" },
                  { code: "te", label: "తెలుగు" },
                  { code: "mr", label: "मराठी" },
                  { code: "ur", label: "اردو" },
                  { code: "fa", label: "فارسی" },
                  { code: "sw", label: "Swahili" },
                  { code: "am", label: "አማርኛ" },
                  { code: "so", label: "Soomaali" },
                  { code: "zu", label: "IsiZulu" },
                  { code: "yo", label: "Yorùbá" },
                  { code: "ig", label: "Igbo" },
                  { code: "ha", label: "Hausa" },
                  { code: "fil", label: "Filipino" },
                  { code: "ca", label: "Català" },
                  { code: "eu", label: "Euskara" },
                  { code: "gl", label: "Galego" },
                  { code: "cy", label: "Cymraeg" },
                  { code: "ga", label: "Gaeilge" },
                  { code: "gd", label: "Gàidhlig" },
                  { code: "is", label: "Íslenska" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      switchLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    style={{
                      background:
                        language === lang.code ? "#f1f5f9" : "transparent",
                      border: "none",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      textAlign: language === "ar" ? "right" : "left",
                      fontWeight: 600,
                      color: language === lang.code ? "#d97706" : "#1e293b",
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Login */}
          {user ? (
            <button
              onClick={() => {
                localStorage.removeItem("user");
                window.dispatchEvent(new Event("storage"));
                window.location.href = "/login";
              }}
              className="btn"
              style={{
                padding: "0.6rem 1.5rem",
                fontSize: "0.95rem",
                color: "#fff",
                backgroundColor: "#d97706", // Amber
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {t("logout")}
            </button>
          ) : (
            <Link
              to="/login"
              style={{
                padding: "0.6rem 1.8rem",
                fontSize: "0.95rem",
                color: "#fff",
                backgroundColor: "#d97706", // Changed from Green to Amber to match theme
                border: "none",
                borderRadius: "4px",
                textDecoration: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {t("login")}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobile && showMobileMenu && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            borderTop: "3px solid #d97706",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            zIndex: 999,
            animation: "slideDown 0.3s ease",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "1rem 0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {navLinks.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  style={{
                    color: "#1e293b",
                    textDecoration: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1rem 2rem",
                    transition: "all 0.2s ease",
                    borderLeft: "4px solid transparent",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff7ed";
                    e.currentTarget.style.borderLeftColor = "#d97706";
                    e.currentTarget.style.color = "#d97706";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderLeftColor = "transparent";
                    e.currentTarget.style.color = "#1e293b";
                  }}
                >
                  {item.icon && <i className={item.icon}></i>} {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
