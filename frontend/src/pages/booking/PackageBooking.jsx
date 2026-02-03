import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./PackageBooking.css";

const PackageBooking = () => {
  const { packageId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(
    location.state?.package || null,
  );
  const [loading, setLoading] = useState(!packageData);
  const [user] = useState(JSON.parse(localStorage.getItem("user")));

  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: "",
    checkOutDate: "",
    roomType: "Standard",
    carPickupDate: "",
    carReturnDate: "",
    passengers: 1,
    specialRequests: "",
  });

  useEffect(() => {
    if (!packageData) {
      fetchPackageDetails();
    }
  }, [packageId]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/v1/multi-modal/packages/${packageId}`,
      );
      const data = await response.json();

      if (data.success) {
        setPackageData(data.data);
      }
    } catch (error) {
      console.error("Error fetching package:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!packageData) return 0;
    const basePrice = packageData.final_price;
    const passengerMultiplier = bookingDetails.passengers;
    return (basePrice * passengerMultiplier).toFixed(2);
  };

  const handleBooking = async () => {
    if (!user) {
      alert("Please login to book a package");
      navigate("/login");
      return;
    }

    try {
      const bookingPayload = {
        userId: user.id,
        packageId: packageData.id,
        hotelName: packageData.hotel_name,
        hotelCheckIn: bookingDetails.checkInDate,
        hotelCheckOut: bookingDetails.checkOutDate,
        hotelRoomType: bookingDetails.roomType,
        hotelPrice: packageData.final_price * 0.4, // 40% of package price
        carType: packageData.car_type,
        carPickupDate: bookingDetails.carPickupDate,
        carReturnDate: bookingDetails.carReturnDate,
        carPrice: packageData.includes_car ? packageData.final_price * 0.2 : 0, // 20% if included
        totalPrice: calculateTotalPrice(),
        discountApplied:
          (packageData.base_price - packageData.final_price) *
          bookingDetails.passengers,
      };

      const response = await fetch(
        "http://localhost:5000/api/v1/multi-modal/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingPayload),
        },
      );

      const data = await response.json();

      if (data.success) {
        navigate("/booking-confirmation", {
          state: {
            bookingReference: data.data.bookingReference,
            packageName: packageData.name,
            totalPrice: data.data.finalPrice,
          },
        });
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="package-booking-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="package-booking-container">
        <div className="error-state">
          <i className="ri-error-warning-line"></i>
          <h2>Package not found</h2>
          <button onClick={() => navigate("/packages")}>Browse Packages</button>
        </div>
      </div>
    );
  }

  return (
    <div className="package-booking-container">
      <div className="booking-header">
        <button className="back-button" onClick={() => navigate("/packages")}>
          <i className="ri-arrow-left-line"></i> Back to Packages
        </button>
        <h1>Complete Your Booking</h1>
      </div>

      <div className="booking-content">
        {/* Package Summary */}
        <div className="package-summary-card">
          <div className="summary-header">
            <h2>{packageData.name}</h2>
            {packageData.featured === 1 && (
              <span className="featured-badge">
                <i className="ri-star-fill"></i> Featured
              </span>
            )}
          </div>

          <p className="summary-description">{packageData.description}</p>

          <div className="summary-details">
            <div className="detail-row">
              <i className="ri-map-pin-2-fill"></i>
              <span>
                <strong>Route:</strong> {packageData.origin} →{" "}
                {packageData.destination}
              </span>
            </div>
            <div className="detail-row">
              <i className="ri-calendar-line"></i>
              <span>
                <strong>Duration:</strong> {packageData.duration_days} days
              </span>
            </div>
            {packageData.hotel_name && (
              <div className="detail-row">
                <i className="ri-hotel-fill"></i>
                <span>
                  <strong>Hotel:</strong> {packageData.hotel_name}
                </span>
                <div className="hotel-rating">
                  {[...Array(packageData.hotel_rating)].map((_, i) => (
                    <i key={i} className="ri-star-fill"></i>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="package-includes">
            <h3>Package Includes:</h3>
            <div className="includes-grid">
              {packageData.includes_flight === 1 && (
                <div className="include-item">
                  <i className="ri-flight-takeoff-line"></i>
                  <span>Round-trip Flight</span>
                </div>
              )}
              {packageData.includes_hotel === 1 && (
                <div className="include-item">
                  <i className="ri-hotel-line"></i>
                  <span>Hotel Accommodation</span>
                </div>
              )}
              {packageData.includes_car === 1 && (
                <div className="include-item">
                  <i className="ri-car-line"></i>
                  <span>Car Rental ({packageData.car_type})</span>
                </div>
              )}
            </div>
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Base Price (per person):</span>
              <span className="original-price">
                ${packageData.base_price.toFixed(2)}
              </span>
            </div>
            <div className="price-row discount">
              <span>Discount ({packageData.discount_percentage}%):</span>
              <span>
                -$
                {(packageData.base_price - packageData.final_price).toFixed(2)}
              </span>
            </div>
            <div className="price-row">
              <span>Price per person:</span>
              <span className="discounted-price">
                ${packageData.final_price.toFixed(2)}
              </span>
            </div>
            <div className="price-row total">
              <span>
                Total ({bookingDetails.passengers} passenger
                {bookingDetails.passengers > 1 ? "s" : ""}):
              </span>
              <span className="total-price">${calculateTotalPrice()}</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="booking-form-card">
          <h2>Booking Details</h2>

          <div className="form-section">
            <h3>
              <i className="ri-user-line"></i> Travelers
            </h3>
            <div className="form-group">
              <label htmlFor="passengers">Number of Passengers</label>
              <input
                id="passengers"
                type="number"
                min="1"
                max="10"
                value={bookingDetails.passengers}
                onChange={(e) =>
                  setBookingDetails({
                    ...bookingDetails,
                    passengers: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {packageData.includes_hotel === 1 && (
            <div className="form-section">
              <h3>
                <i className="ri-hotel-line"></i> Hotel Details
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkIn">Check-in Date</label>
                  <input
                    id="checkIn"
                    type="date"
                    value={bookingDetails.checkInDate}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        checkInDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkOut">Check-out Date</label>
                  <input
                    id="checkOut"
                    type="date"
                    value={bookingDetails.checkOutDate}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        checkOutDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="roomType">Room Type</label>
                <select
                  id="roomType"
                  value={bookingDetails.roomType}
                  onChange={(e) =>
                    setBookingDetails({
                      ...bookingDetails,
                      roomType: e.target.value,
                    })
                  }
                >
                  <option value="Standard">Standard Room</option>
                  <option value="Deluxe">Deluxe Room (+$50/night)</option>
                  <option value="Suite">Suite (+$150/night)</option>
                </select>
              </div>
            </div>
          )}

          {packageData.includes_car === 1 && (
            <div className="form-section">
              <h3>
                <i className="ri-car-line"></i> Car Rental
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="carPickup">Pickup Date</label>
                  <input
                    id="carPickup"
                    type="date"
                    value={bookingDetails.carPickupDate}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        carPickupDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="carReturn">Return Date</label>
                  <input
                    id="carReturn"
                    type="date"
                    value={bookingDetails.carReturnDate}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        carReturnDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <h3>
              <i className="ri-message-3-line"></i> Special Requests
            </h3>
            <div className="form-group">
              <textarea
                id="specialRequests"
                placeholder="Any special requests or requirements..."
                value={bookingDetails.specialRequests}
                onChange={(e) =>
                  setBookingDetails({
                    ...bookingDetails,
                    specialRequests: e.target.value,
                  })
                }
                rows="4"
              />
            </div>
          </div>

          <button className="book-now-button" onClick={handleBooking}>
            <i className="ri-check-line"></i>
            Complete Booking - ${calculateTotalPrice()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageBooking;
