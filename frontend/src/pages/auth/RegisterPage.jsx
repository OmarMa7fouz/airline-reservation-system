import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const RegisterPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    Username: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
    FirstName: "",
    LastName: "",
    SSN: "",
    DateOfBirth: "",
    Gender: "",
    City: "",
    State: "",
    PhoneNumber: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.Password !== form.ConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/v1/passengers/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Username: form.Username,
            Email: form.Email,
            Password: form.Password,
            FirstName: form.FirstName,
            LastName: form.LastName,
            SSN: form.SSN,
            DateOfBirth: form.DateOfBirth,
            Gender: form.Gender,
            City: form.City,
            State: form.State,
            PhoneNumber: form.PhoneNumber,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        const errorMsg = data.error || data.message || "Registration failed";
        setError(
          typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg),
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errMsg = err.message || "Server error";
      setError(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
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
        {/* Right: Register Form */}
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
          <div style={{ width: "100%", maxWidth: 400 }}>
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
                {t("createAccount")}
              </h2>
              <p style={{ color: "#7b7b7b", fontSize: 16, marginBottom: 0 }}>
                {t("signUpForAirGo")}
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <input
                type="text"
                name="Username"
                placeholder={t("username")}
                value={form.Username}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
              <input
                type="email"
                name="Email"
                placeholder={t("email")}
                value={form.Email}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
              <input
                type="password"
                name="Password"
                placeholder={t("password")}
                value={form.Password}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
              <input
                type="password"
                name="ConfirmPassword"
                placeholder={t("confirmPassword")}
                value={form.ConfirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
              <input
                type="text"
                name="FirstName"
                placeholder={t("firstName")}
                value={form.FirstName}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
              <input
                type="text"
                name="LastName"
                placeholder={t("lastName")}
                value={form.LastName}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
              <input
                type="text"
                name="SSN"
                placeholder={t("ssn")}
                value={form.SSN}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
              <input
                type="date"
                name="DateOfBirth"
                placeholder={t("dob")}
                value={form.DateOfBirth}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
              <select
                name="Gender"
                value={form.Gender}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              >
                <option value="">{t("selectGender")}</option>
                <option value="Male">{t("male")}</option>
                <option value="Female">{t("female")}</option>
                <option value="Other">{t("other") || "Other"}</option>
              </select>
              <input
                type="text"
                name="City"
                placeholder={t("city")}
                value={form.City}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
              <input
                type="text"
                name="State"
                placeholder={t("state")}
                value={form.State}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
              <input
                type="text"
                name="PhoneNumber"
                placeholder={t("phoneNumber")}
                value={form.PhoneNumber}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px 0",
                  background: "#4c7cf3",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  marginTop: 8,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                {t("register")}
              </button>
            </form>
            {error && (
              <p
                style={{ color: "red", marginTop: "1rem", textAlign: "center" }}
              >
                {error}
              </p>
            )}
            {success && (
              <p
                style={{
                  color: "green",
                  marginTop: "1rem",
                  textAlign: "center",
                }}
              >
                {success}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
