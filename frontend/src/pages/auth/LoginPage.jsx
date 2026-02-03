import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const LoginPage = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ Username: "", Password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/v1/passengers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Save user and token
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("token", data.token);
          // Also append token to user object for easier access if needed
          const userWithToken = { ...data.user, token: data.token };
          localStorage.setItem("user", JSON.stringify(userWithToken));
        }
        // Dispatch a custom event to notify Navbar
        window.dispatchEvent(new Event("storage"));
        navigate("/");
      } else {
        const errorMsg = data.error || data.message || "Invalid credentials";
        setError(
          typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg),
        );
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f8fbff 0%, #eaf3fa 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          minHeight: 600,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 8px 32px rgba(76,124,243,0.10)",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Left: Image and overlay */}
        <div
          style={{
            flex: 1.2,
            background: `url('/pexels-wanderer-731217.jpg') center center/cover no-repeat`,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "0 0 48px 48px",
            minWidth: 0,
          }}
          className="hidden md:flex"
        >
          {/* Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(30, 41, 59, 0.45)",
              zIndex: 1,
              borderTopLeftRadius: 24,
              borderBottomLeftRadius: 24,
            }}
          />
          {/* Text and icons */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              color: "#fff",
              maxWidth: 400,
            }}
          >
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: 700,
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            >
              Get better
              <br />
              Travel Experience
              <br />
              With us!
            </h2>
            <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
              <span style={{ fontSize: 28 }}>
                <i className="ri-flight-takeoff-line"></i>
              </span>
              <span style={{ fontSize: 28 }}>
                <i className="ri-hotel-bed-line"></i>
              </span>
              <span style={{ fontSize: 28 }}>
                <i className="ri-taxi-line"></i>
              </span>
              <span style={{ fontSize: 28 }}>
                <i className="ri-gamepad-line"></i>
              </span>
              <span style={{ fontSize: 28 }}>
                <i className="ri-map-pin-line"></i>
              </span>
            </div>
          </div>
        </div>
        {/* Right: Login Form */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
            minWidth: 0,
            padding: "48px 32px",
          }}
        >
          <div style={{ width: "100%", maxWidth: 370 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span
                style={{
                  fontSize: 48,
                  color: "#4c7cf3",
                  display: "inline-block",
                  marginBottom: 12,
                }}
              >
                <i className="ri-flight-takeoff-line"></i>
              </span>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#22223b",
                  marginBottom: 8,
                }}
              >
                {t("welcomeBack")}
              </h2>
              <p style={{ color: "#7b7b7b", fontSize: 16, marginBottom: 0 }}>
                {t("signInToAccount")}
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <div>
                <label
                  htmlFor="Username"
                  style={{
                    display: "block",
                    fontWeight: 500,
                    marginBottom: 6,
                    color: "#22223b",
                  }}
                >
                  {t("username")}
                </label>
                <input
                  type="text"
                  id="Username"
                  name="Username"
                  value={form.Username}
                  onChange={handleChange}
                  required
                  placeholder={t("username")}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    fontSize: 16,
                    outline: "none",
                    marginBottom: 0,
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="Password"
                  style={{
                    display: "block",
                    fontWeight: 500,
                    marginBottom: 6,
                    color: "#22223b",
                  }}
                >
                  {t("password")}
                </label>
                <input
                  type="password"
                  id="Password"
                  name="Password"
                  value={form.Password}
                  onChange={handleChange}
                  required
                  placeholder={t("password")}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    fontSize: 16,
                    outline: "none",
                    marginBottom: 0,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                }}
              >
                <label
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    style={{ accentColor: "#4c7cf3" }}
                  />
                  {t("rememberMe")}
                </label>
                <a
                  href="/forgot-password"
                  style={{ color: "#4c7cf3", textDecoration: "none" }}
                >
                  {t("forgotPassword")}
                </a>
              </div>
              {error && (
                <div
                  style={{
                    background: "#ffeaea",
                    color: "#d32f2f",
                    padding: "10px 0",
                    borderRadius: 6,
                    textAlign: "center",
                    fontSize: 14,
                  }}
                >
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  background: "#4c7cf3",
                  color: "#fff",
                  padding: "12px 0",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  marginTop: 8,
                  transition: "background 0.2s",
                }}
              >
                {isLoading ? t("signingIn") : t("signIn")}
              </button>
              <div style={{ textAlign: "center", marginTop: 16, fontSize: 15 }}>
                {t("noAccount")}{" "}
                <span
                  style={{
                    color: "#4c7cf3",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                  onClick={() => navigate("/register")}
                >
                  {t("signUpNow")}
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
