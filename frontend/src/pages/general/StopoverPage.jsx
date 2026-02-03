import React from "react";

const StopoverPage = () => {
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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${process.env.PUBLIC_URL}/stopover-hero.png)`,
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
              fontSize: "3.5rem",
              fontWeight: "700",
              marginBottom: "1rem",
            }}
          >
            Explore More with a Stopover
          </h1>
          <p
            style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}
          >
            Turn one holiday into two by adding a stopover in our hub city.
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
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <h3
            style={{ marginBottom: "2rem", color: "#1e293b", fontWeight: 700 }}
          >
            Already have a booking? Add a stopover now.
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <input
              type="text"
              placeholder="Booking Reference (PNR)"
              style={{
                padding: "1rem",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                fontSize: "1rem",
                flex: 1,
              }}
            />
            <input
              type="text"
              placeholder="Last Name"
              style={{
                padding: "1rem",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                fontSize: "1rem",
                flex: 1,
              }}
            />
            <button
              style={{
                backgroundColor: "#006C35",
                color: "#fff",
                border: "none",
                padding: "0 2rem",
                borderRadius: "4px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Manage
            </button>
          </div>

          <div
            style={{
              marginTop: "2rem",
              borderTop: "1px solid #e2e8f0",
              paddingTop: "2rem",
            }}
          >
            <p style={{ color: "#64748b" }}>
              Don't have a booking yet? Select "Multi-city" or "Stopover" in the
              main flight search.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <section
        style={{ padding: "6rem 2rem", maxWidth: "1000px", margin: "0 auto" }}
      >
        <h2
          style={{
            color: "#1e293b",
            fontSize: "2.5rem",
            marginBottom: "3rem",
            textAlign: "center",
          }}
        >
          How it works
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "2rem",
          }}
        >
          {[
            {
              step: "01",
              title: "Book Your Flight",
              desc: "Choose your destination and dates.",
            },
            {
              step: "02",
              title: "Select Stopover",
              desc: "Add a stopover of up to 4 days during booking.",
            },
            {
              step: "03",
              title: "Get Visa & Hotel",
              desc: "Secure your transit visa and complimentary hotel stay.",
            },
            {
              step: "04",
              title: "Explore",
              desc: "Enjoy the sights before continuing your journey.",
            },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "#eff6ff",
                  color: "#3b82f6",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  margin: "0 auto 1.5rem",
                }}
              >
                {item.step}
              </div>
              <h4
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "0.5rem",
                  color: "#1e293b",
                }}
              >
                {item.title}
              </h4>
              <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StopoverPage;
