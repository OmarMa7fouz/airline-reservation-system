import React, { useState } from "react";

const PriceAlertModal = ({ isOpen, onClose, initialData = {} }) => {
  const [formData, setFormData] = useState({
    origin: initialData.origin || "",
    destination: initialData.destination || "",
    departureDate: initialData.departureDate || "",
    returnDate: "",
    maxPrice: "",
    email: localStorage.getItem("userEmail") || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const userId = JSON.parse(localStorage.getItem("user"))?.id || 1; // Default to 1 for demo if not logged in

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/price-alerts/alerts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            ...formData,
            maxPrice: parseFloat(formData.maxPrice),
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        setError(data.error || "Failed to create alert");
      }
    } catch (err) {
      console.error("Error creating price alert:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "2rem",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          position: "relative",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
            }}
          >
            <i
              className="ri-notification-3-line"
              style={{ color: "#d97706", marginRight: "10px" }}
            ></i>
            Track Flight Price
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <i className="ri-close-line" style={{ fontSize: "1.5rem" }}></i>
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div
              style={{
                fontSize: "3rem",
                color: "#22c55e",
                marginBottom: "1rem",
              }}
            >
              <i className="ri-checkbox-circle-fill"></i>
            </div>
            <h3
              style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b" }}
            >
              Alert Created!
            </h3>
            <p style={{ color: "#64748b" }}>
              We'll email you when the price drops.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "0.5rem",
                  }}
                >
                  From
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  readOnly={!!initialData.origin}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: initialData.origin ? "#f1f5f9" : "white",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "0.5rem",
                  }}
                >
                  To
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  readOnly={!!initialData.destination}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: initialData.destination ? "#f1f5f9" : "white",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "0.5rem",
                }}
              >
                Alert me if price drops below ($)
              </label>
              <input
                type="number"
                name="maxPrice"
                value={formData.maxPrice}
                onChange={handleChange}
                placeholder="e.g. 500"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "0.5rem",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  color: "#dc2626",
                  background: "#fee2e2",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#d97706",
                  color: "white",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Creating..." : "Create Alert"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PriceAlertModal;
