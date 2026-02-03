import React from "react";

const AboutPage = () => {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins, sans-serif",
        color: "#333",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "1.5rem",
            color: "#2563eb",
          }}
        >
          About AirGo
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            lineHeight: "1.8",
            marginBottom: "2rem",
          }}
        >
          Welcome to AirGo, your premier partner in modern air travel. Founded
          with a mission to make flying accessible, comfortable, and efficient,
          we connect people to destinations around the globe with keeping ease
          of use in mind.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            marginTop: "3rem",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              background: "#f8fbff",
              borderRadius: 12,
            }}
          >
            <h3 style={{ color: "#2563eb", marginBottom: "1rem" }}>
              Our Mission
            </h3>
            <p>
              To provide safe, reliable, and affordable air travel to everyone,
              everywhere.
            </p>
          </div>
          <div
            style={{
              padding: "1.5rem",
              background: "#f8fbff",
              borderRadius: 12,
            }}
          >
            <h3 style={{ color: "#2563eb", marginBottom: "1rem" }}>
              Our Fleet
            </h3>
            <p>
              A modern fleet of fuel-efficient aircraft designed for maximum
              passenger comfort.
            </p>
          </div>
          <div
            style={{
              padding: "1.5rem",
              background: "#f8fbff",
              borderRadius: 12,
            }}
          >
            <h3 style={{ color: "#2563eb", marginBottom: "1rem" }}>
              24/7 Support
            </h3>
            <p>
              Our dedicated support team is always available to assist with your
              travel needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
