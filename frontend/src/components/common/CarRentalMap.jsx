import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet marker icons in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Internal component to handle click/drag events
const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
  const markerRef = useRef(null);

  const map = useMapEvents({
    click(e) {
      // Allow clicking on map to move marker
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      if (onLocationSelect) onLocationSelect(e.latlng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          if (onLocationSelect) onLocationSelect(newPos);
        }
      },
    }),
    [setPosition, onLocationSelect],
  );

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    >
      <Popup>Pick-up Location</Popup>
    </Marker>
  );
};

const CarRentalMap = ({ onLocationSelect, initialPosition }) => {
  // Default to Dubai or user's location
  const [position, setPosition] = useState(
    initialPosition || { lat: 25.2048, lng: 55.2708 },
  );

  const handleLocateMe = (e) => {
    e.preventDefault(); // Prevent form submission if inside a form
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPos = { lat: latitude, lng: longitude };
          setPosition(newPos);
          if (onLocationSelect) onLocationSelect(newPos);
        },
        (err) => {
          console.error("Error getting location:", err);
          alert(
            "Could not access your location. Please ensure location services are enabled.",
          );
        },
      );
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
      }}
    >
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "400px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={position}
          setPosition={setPosition}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>

      {/* Locate Me custom button */}
      <button
        onClick={handleLocateMe}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          background: "#fff",
          border: "none",
          padding: "10px 15px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          cursor: "pointer",
          fontWeight: "600",
          color: "#4c7cf3",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <i className="ri-gps-fill"></i> Use My Location
      </button>
    </div>
  );
};

export default CarRentalMap;
