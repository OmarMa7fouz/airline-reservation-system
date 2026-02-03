import React, { useState, useEffect } from "react";
import "./UserPreferences.css";

const UserPreferences = () => {
  const [user] = useState(JSON.parse(localStorage.getItem("user")));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Welcome back, Traveler!",
  );
  const [recommendations, setRecommendations] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  // Mock Travel Stats
  const [travelStats] = useState({
    countries: 5,
    miles: 12450,
    nextTrip: "Paris in 14 days",
  });

  const [preferences, setPreferences] = useState({
    preferred_seat_type: "window",
    preferred_seat_location: "front",
    meal_preference: "standard",
    dietary_restrictions: "",
    preferred_class: "economy",
    preferred_airlines: "",
    preferred_departure_time: "morning",
    email_notifications: 1,
    sms_notifications: 0,
    push_notifications: 1,
    wheelchair_assistance: 0,
    special_assistance: "",
  });

  const [occasions, setOccasions] = useState([]);
  const [newOccasion, setNewOccasion] = useState({
    occasion_type: "birthday",
    occasion_date: "",
    occasion_name: "",
    reminder_days_before: 7,
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [prefsRes, welcomeRes, recsRes, offersRes, occasionsRes] =
        await Promise.all([
          fetch(
            `http://localhost:5000/api/v1/personalization/preferences/${user.id}`,
          ),
          fetch(
            `http://localhost:5000/api/v1/personalization/welcome/${user.id}`,
          ),
          fetch(
            `http://localhost:5000/api/v1/personalization/recommendations/${user.id}`,
          ),
          fetch(
            `http://localhost:5000/api/v1/personalization/offers/${user.id}`,
          ),
          fetch(
            `http://localhost:5000/api/v1/personalization/occasions/${user.id}`,
          ),
        ]);

      const [prefsData, welcomeData, recsData, offersData, occasionsData] =
        await Promise.all([
          prefsRes.json(),
          welcomeRes.json(),
          recsRes.json(),
          offersRes.json(),
          occasionsRes.json(),
        ]);

      if (prefsData.success) {
        setPreferences(prefsData.data);
      }

      if (welcomeData.success) {
        setWelcomeMessage(welcomeData.data.message);
      }

      if (recsData.success) {
        setRecommendations(recsData.data.recommendations || []);
      }

      if (offersData.success) {
        setActiveOffers(offersData.data || []);
      }

      if (occasionsData.success) {
        setOccasions(occasionsData.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        `http://localhost:5000/api/v1/personalization/preferences/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preferences),
        },
      );

      const data = await response.json();
      if (data.success) {
        alert("Preferences saved successfully!");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleAddOccasion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/personalization/occasions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newOccasion, userId: user.id }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setOccasions([...occasions, { ...newOccasion, id: data.data.id }]);
        setNewOccasion({
          occasion_type: "birthday",
          occasion_date: "",
          occasion_name: "",
          reminder_days_before: 7,
        });
        alert("Special occasion added!");
      }
    } catch (error) {
      console.error("Error adding occasion:", error);
      alert("Failed to add occasion");
    }
  };

  if (!user) {
    return (
      <div className="preferences-container">
        <div className="login-prompt">
          <i className="ri-lock-line"></i>
          <h2>Please log in to view your preferences</h2>
          <a href="/login" className="login-button">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="preferences-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preferences-container">
      {/* Welcome Banner */}
      {welcomeMessage && (
        <div className="welcome-banner">
          <div className="welcome-content">
            <i className="ri-user-smile-line"></i>
            <div>
              <h2 style={{ marginBottom: "0.5rem" }}>{welcomeMessage}</h2>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  fontSize: "0.9rem",
                  opacity: 0.9,
                }}
              >
                <span>✈️ {travelStats.miles.toLocaleString()} Miles Flown</span>
                <span>🌍 {travelStats.countries} Countries</span>
                <span>🔜 {travelStats.nextTrip}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Offers */}
      {activeOffers.length > 0 && (
        <section className="offers-section">
          <h2>
            <i className="ri-gift-line"></i> Your Special Offers
          </h2>
          <div className="offers-grid">
            {activeOffers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-badge">
                  {offer.discount_percentage > 0
                    ? `${offer.discount_percentage}% OFF`
                    : `$${offer.discount_amount} OFF`}
                </div>
                <h3>{offer.offer_title}</h3>
                <p>{offer.offer_description}</p>
                <div className="promo-code">
                  <span>Code:</span>
                  <code>{offer.promo_code}</code>
                </div>
                <div className="offer-validity">
                  Valid until {new Date(offer.valid_until).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="recommendations-section">
          <h2>
            <i className="ri-flight-takeoff-line"></i> Recommended for You
          </h2>
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <div className="rec-header">
                  <h3>{rec.route}</h3>
                  <span className="frequency-badge">{rec.reason}</span>
                </div>
                <div className="flights-list">
                  {rec.flights.slice(0, 2).map((flight) => (
                    <div key={flight.id} className="flight-item">
                      <div className="flight-info">
                        <span className="flight-number">
                          {flight.flight_number}
                        </span>
                        <span className="flight-time">
                          {new Date(flight.departure_time).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                      <span className="flight-price">${flight.price}</span>
                    </div>
                  ))}
                </div>
                <button className="view-flights-btn">View All Flights</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Preferences Form */}
      <section className="preferences-section">
        <h2>
          <i className="ri-settings-3-line"></i> Travel Preferences
        </h2>

        <div className="preferences-grid">
          {/* Seat Preferences */}
          <div className="pref-card">
            <h3>
              <i className="ri-layout-grid-line"></i> Seat Preferences
            </h3>
            <div className="form-group">
              <label>Preferred Seat Type</label>
              <select
                value={preferences.preferred_seat_type}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    preferred_seat_type: e.target.value,
                  })
                }
              >
                <option value="window">Window</option>
                <option value="aisle">Aisle</option>
                <option value="middle">Middle</option>
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Location</label>
              <select
                value={preferences.preferred_seat_location}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    preferred_seat_location: e.target.value,
                  })
                }
              >
                <option value="front">Front</option>
                <option value="middle">Middle</option>
                <option value="back">Back</option>
              </select>
            </div>
          </div>

          {/* Meal Preferences */}
          <div className="pref-card">
            <h3>
              <i className="ri-restaurant-line"></i> Meal Preferences
            </h3>
            <div className="form-group">
              <label>Meal Preference</label>
              <select
                value={preferences.meal_preference}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    meal_preference: e.target.value,
                  })
                }
              >
                <option value="standard">Standard</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="halal">Halal</option>
                <option value="kosher">Kosher</option>
                <option value="gluten-free">Gluten-Free</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dietary Restrictions</label>
              <input
                type="text"
                placeholder="e.g., nut allergy, lactose intolerant"
                value={preferences.dietary_restrictions || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    dietary_restrictions: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="pref-card">
            <h3>
              <i className="ri-plane-line"></i> Travel Preferences
            </h3>
            <div className="form-group">
              <label>Preferred Class</label>
              <select
                value={preferences.preferred_class}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    preferred_class: e.target.value,
                  })
                }
              >
                <option value="economy">Economy</option>
                <option value="premium-economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Departure Time</label>
              <select
                value={preferences.preferred_departure_time}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    preferred_departure_time: e.target.value,
                  })
                }
              >
                <option value="early-morning">Early Morning (6am-9am)</option>
                <option value="morning">Morning (9am-12pm)</option>
                <option value="afternoon">Afternoon (12pm-5pm)</option>
                <option value="evening">Evening (5pm-9pm)</option>
                <option value="night">Night (9pm-6am)</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="pref-card">
            <h3>
              <i className="ri-notification-3-line"></i> Notifications
            </h3>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.email_notifications === 1}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      email_notifications: e.target.checked ? 1 : 0,
                    })
                  }
                />
                <span>Email Notifications</span>
              </label>
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.sms_notifications === 1}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      sms_notifications: e.target.checked ? 1 : 0,
                    })
                  }
                />
                <span>SMS Notifications</span>
              </label>
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.push_notifications === 1}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      push_notifications: e.target.checked ? 1 : 0,
                    })
                  }
                />
                <span>Push Notifications</span>
              </label>
            </div>
          </div>

          {/* Accessibility */}
          <div className="pref-card">
            <h3>
              <i className="ri-wheelchair-line"></i> Accessibility
            </h3>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.wheelchair_assistance === 1}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      wheelchair_assistance: e.target.checked ? 1 : 0,
                    })
                  }
                />
                <span>Wheelchair Assistance</span>
              </label>
            </div>
            <div className="form-group">
              <label>Special Assistance Needs</label>
              <textarea
                placeholder="Describe any special assistance you may need..."
                value={preferences.special_assistance || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    special_assistance: e.target.value,
                  })
                }
                rows="3"
              />
            </div>
          </div>
        </div>

        <button
          className="save-button"
          onClick={handleSavePreferences}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </section>

      {/* Special Occasions */}
      <section className="occasions-section">
        <h2>
          <i className="ri-calendar-event-line"></i> Special Occasions
        </h2>

        <form className="add-occasion-form" onSubmit={handleAddOccasion}>
          <div className="form-row">
            <div className="form-group">
              <label>Occasion Type</label>
              <select
                value={newOccasion.occasion_type}
                onChange={(e) =>
                  setNewOccasion({
                    ...newOccasion,
                    occasion_type: e.target.value,
                  })
                }
                required
              >
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="holiday">Holiday</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={newOccasion.occasion_date}
                onChange={(e) =>
                  setNewOccasion({
                    ...newOccasion,
                    occasion_date: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Mom's Birthday"
                value={newOccasion.occasion_name}
                onChange={(e) =>
                  setNewOccasion({
                    ...newOccasion,
                    occasion_name: e.target.value,
                  })
                }
              />
            </div>
            <button type="submit" className="add-occasion-btn">
              <i className="ri-add-line"></i> Add
            </button>
          </div>
        </form>

        {occasions.length > 0 && (
          <div className="occasions-list">
            {occasions.map((occasion) => (
              <div key={occasion.id} className="occasion-item">
                <div className="occasion-icon">
                  <i
                    className={
                      occasion.occasion_type === "birthday"
                        ? "ri-cake-3-line"
                        : occasion.occasion_type === "anniversary"
                        ? "ri-heart-line"
                        : "ri-calendar-line"
                    }
                  ></i>
                </div>
                <div className="occasion-details">
                  <h4>{occasion.occasion_name || occasion.occasion_type}</h4>
                  <p>{new Date(occasion.occasion_date).toLocaleDateString()}</p>
                </div>
                {!occasion.offer_sent && (
                  <span className="pending-badge">Offer Pending</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserPreferences;
