import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";

const PassengersList = () => {
  const [passengers, setPassengers] = useState([]);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/passengers");
        const data = await res.json();
        console.log("API Response:", { status: res.status, data }); // Debug log
        if (res.ok) {
          setPassengers(data.passengers || []);
        } else {
          setError(
            data.error || `Failed to fetch passengers (Status: ${res.status})`,
          );
        }
      } catch (err) {
        setError("Server error");
        console.error("Fetch Error:", err); // Detailed error log
      }
    };
    fetchPassengers();
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "2rem" }}>
      <h2>{t("passengersList")}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {passengers.length === 0 && !error && <p>{t("noPassengers")}</p>}
      {passengers.length > 0 && (
        <ul>
          {passengers.map((passenger) => (
            <li key={passenger.PassengerId}>
              {passenger.FirstName} {passenger.LastName} ({passenger.Email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PassengersList;
