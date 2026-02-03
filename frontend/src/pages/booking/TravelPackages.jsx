import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TravelPackages.css";

const TravelPackages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    destination: "",
    minPrice: "",
    maxPrice: "",
    featured: false,
  });

  useEffect(() => {
    fetchPackages();
  }, [filter]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filter.destination)
        queryParams.append("destination", filter.destination);
      if (filter.minPrice) queryParams.append("minPrice", filter.minPrice);
      if (filter.maxPrice) queryParams.append("maxPrice", filter.maxPrice);
      if (filter.featured) queryParams.append("featured", "true");

      const response = await fetch(
        `http://localhost:5000/api/v1/multi-modal/packages?${queryParams}`,
      );
      const data = await response.json();

      if (data.success) {
        setPackages(data.data);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPackage = (pkg) => {
    navigate(`/multi-modal/book/${pkg.id}`, { state: { package: pkg } });
  };

  const calculateSavings = (basePrice, finalPrice) => {
    return (basePrice - finalPrice).toFixed(2);
  };

  return (
    <div className="travel-packages-container">
      {/* Hero Section */}
      <section className="packages-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            <i className="ri-global-line"></i>
            Travel Packages
          </h1>
          <p className="hero-subtitle">
            Book flights, hotels, and cars together and save up to 20%
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="destination">
              <i className="ri-map-pin-line"></i> Destination
            </label>
            <input
              id="destination"
              type="text"
              placeholder="Search destination..."
              value={filter.destination}
              onChange={(e) =>
                setFilter({ ...filter, destination: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <label htmlFor="minPrice">
              <i className="ri-money-dollar-circle-line"></i> Min Price
            </label>
            <input
              id="minPrice"
              type="number"
              placeholder="$0"
              value={filter.minPrice}
              onChange={(e) =>
                setFilter({ ...filter, minPrice: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <label htmlFor="maxPrice">
              <i className="ri-money-dollar-circle-line"></i> Max Price
            </label>
            <input
              id="maxPrice"
              type="number"
              placeholder="$10,000"
              value={filter.maxPrice}
              onChange={(e) =>
                setFilter({ ...filter, maxPrice: e.target.value })
              }
            />
          </div>

          <div className="filter-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={filter.featured}
                onChange={(e) =>
                  setFilter({ ...filter, featured: e.target.checked })
                }
              />
              <span>Featured Only</span>
            </label>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="packages-section">
        <div className="packages-grid">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading amazing packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="empty-state">
              <i className="ri-inbox-line"></i>
              <h3>No packages found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg.id} className="package-card">
                {pkg.featured === 1 && (
                  <div className="featured-badge">
                    <i className="ri-star-fill"></i> Featured
                  </div>
                )}

                <div className="package-image">
                  {pkg.image_url ? (
                    <img
                      src={pkg.image_url}
                      alt={pkg.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="image-placeholder"
                    style={{ display: pkg.image_url ? "none" : "flex" }}
                  >
                    <i className="ri-image-line"></i>
                  </div>
                  <div className="discount-badge">
                    Save {pkg.discount_percentage}%
                  </div>
                </div>

                <div className="package-content">
                  <h3 className="package-name">{pkg.name}</h3>
                  <p className="package-description">{pkg.description}</p>

                  <div className="package-details">
                    <div className="detail-item">
                      <i className="ri-map-pin-2-fill"></i>
                      <span>
                        {pkg.origin} → {pkg.destination}
                      </span>
                    </div>
                    <div className="detail-item">
                      <i className="ri-calendar-line"></i>
                      <span>{pkg.duration_days} days</span>
                    </div>
                  </div>

                  <div className="package-includes">
                    <h4>Includes:</h4>
                    <div className="includes-list">
                      {pkg.includes_flight === 1 && (
                        <span className="include-badge">
                          <i className="ri-flight-takeoff-line"></i> Flight
                        </span>
                      )}
                      {pkg.includes_hotel === 1 && (
                        <span className="include-badge">
                          <i className="ri-hotel-line"></i> Hotel
                        </span>
                      )}
                      {pkg.includes_car === 1 && (
                        <span className="include-badge">
                          <i className="ri-car-line"></i> Car
                        </span>
                      )}
                    </div>
                  </div>

                  {pkg.hotel_name && (
                    <div className="hotel-info">
                      <i className="ri-hotel-fill"></i>
                      <span>{pkg.hotel_name}</span>
                      <div className="hotel-rating">
                        {[...Array(pkg.hotel_rating)].map((_, i) => (
                          <i key={i} className="ri-star-fill"></i>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="package-pricing">
                    <div className="price-details">
                      <span className="original-price">
                        ${pkg.base_price.toFixed(2)}
                      </span>
                      <span className="final-price">
                        ${pkg.final_price.toFixed(2)}
                      </span>
                      <span className="savings">
                        Save $
                        {calculateSavings(pkg.base_price, pkg.final_price)}
                      </span>
                    </div>
                    <button
                      className="book-button"
                      onClick={() => handleBookPackage(pkg)}
                    >
                      <i className="ri-shopping-cart-line"></i>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>Why Book a Package?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="ri-price-tag-3-line"></i>
            </div>
            <h3>Save Money</h3>
            <p>Get up to 20% off when you bundle flights, hotels, and cars</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="ri-time-line"></i>
            </div>
            <h3>Save Time</h3>
            <p>Book everything in one place with a single transaction</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="ri-shield-check-line"></i>
            </div>
            <h3>Peace of Mind</h3>
            <p>All components are coordinated and guaranteed</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="ri-customer-service-2-line"></i>
            </div>
            <h3>24/7 Support</h3>
            <p>Dedicated support for your entire journey</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TravelPackages;
