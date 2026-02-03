import React, { useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";

const SeatMap = ({
  seats = [],
  selectedSeats = [],
  onSeatSelect,
  travelClass,
  maxSeats = 1,
}) => {
  const { t } = useLanguage();
  // Helpers
  const getRowAndCol = (seatNum) => {
    const match = seatNum.match(/(\d+)([A-Za-z]+)/);
    if (!match) return { row: 0, col: "" };
    return { row: parseInt(match[1]), col: match[2] };
  };

  const rows = useMemo(() => {
    const grouped = {};
    seats.forEach((seat) => {
      const { row } = getRowAndCol(seat.SeatNumber);
      if (!grouped[row]) grouped[row] = [];
      grouped[row].push(seat);
    });
    return Object.keys(grouped)
      .sort((a, b) => a - b)
      .map((num) => ({
        rowNum: num,
        seats: grouped[num].sort((a, b) =>
          a.SeatNumber.localeCompare(b.SeatNumber),
        ),
      }));
  }, [seats]);

  const layoutType = useMemo(() => {
    let maxCols = 0;
    rows.forEach((r) => (maxCols = Math.max(maxCols, r.seats.length)));
    if (maxCols > 6) return "large";
    if (maxCols > 4) return "medium";
    return "small";
  }, [rows]);

  // Insert facilities in the middle for large planes or if many rows
  const { frontRows, backRows, hasMiddleSection } = useMemo(() => {
    if (rows.length > 10) {
      const mid = Math.ceil(rows.length / 2);
      return {
        frontRows: rows.slice(0, mid),
        backRows: rows.slice(mid),
        hasMiddleSection: true,
      };
    }
    return { frontRows: rows, backRows: [], hasMiddleSection: false };
  }, [rows]);

  const handleSeatClick = (seat) => {
    if (seat.IsAvailable === 0 || seat.Class !== travelClass) return;

    const isSelected = selectedSeats.includes(seat.SeatNumber);
    let newSelection = [...selectedSeats];

    if (isSelected) {
      // Deselect
      newSelection = newSelection.filter((s) => s !== seat.SeatNumber);
    } else {
      // Select
      if (newSelection.length < maxSeats) {
        newSelection.push(seat.SeatNumber);
      } else {
        // Option: Replace the last one? Or strict limit?
        // User friendly: If limit is 1, just swap. If > 1, maybe strict or replace first?
        // Let's standard: If max is 1, swap. If max > 1, prevent or swap last?
        // Let's try: If full, remove first and add new (FIFO) or just block.
        // For smoother UX with multi, maybe block/warn. But for single, swap.
        if (maxSeats === 1) {
          newSelection = [seat.SeatNumber];
        } else {
          // If full, do nothing or user alerts?
          // Let's simple swap logic: remove first selected?
          // newSelection.shift();
          // newSelection.push(seat.SeatNumber);
          // Actually, best is usually "You can only select N seats".
          if (newSelection.length >= maxSeats) return;
          newSelection.push(seat.SeatNumber);
        }
      }
    }
    onSeatSelect(newSelection);
  };

  const handleKeyDown = (e, seat) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSeatClick(seat);
    }
  };

  const renderSeat = (seat) => {
    const isSelected = selectedSeats.includes(seat.SeatNumber);
    const isClassMatch = seat.Class === travelClass;
    const isBooked = seat.IsAvailable === 0;
    // Updated to use project's Primary Navy color instead of Saudia Green
    const brandColor = "#0f172a";
    const brandAccent = "#d97706"; // Amber

    // Determine seat attributes
    const isWindow = ["A", "K", "F", "A"].includes(seat.SeatNumber.slice(-1)); // Simple logic
    const { row } = getRowAndCol(seat.SeatNumber);
    const isExitRow = [10, 11, 25].includes(row);
    const isExtraLegroom = isExitRow || row === 1;

    let tooltip = `${seat.SeatNumber} (${seat.Class})`;
    if (isWindow) tooltip += " • Window View";
    if (isExtraLegroom) tooltip += " • Extra Legroom";
    if (isExitRow) tooltip += " • Exit Row";

    // Accessibility Label
    const ariaLabel = `Seat ${seat.SeatNumber}, ${seat.Class}. Price $${
      isExtraLegroom ? "Extra" : "Standard"
    }. ${isWindow ? "Window seat." : "Aisle seat."} ${
      isBooked ? "Occupied" : isSelected ? "Selected" : "Available"
    }.`;

    let seatStyle = {
      width: "42px",
      height: isExtraLegroom ? "60px" : "52px", // Visual legroom
      borderRadius: "8px 8px 4px 4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: isBooked ? "not-allowed" : "pointer",
      fontSize: "0.8rem",
      fontWeight: "bold",
      transition: "all 0.2s",
      position: "relative",
      margin: isExtraLegroom ? "10px 2px" : "0 2px",
      backgroundColor: "#fff",
      border: `2px solid ${brandColor}`,
      color: brandColor,
    };

    if (isBooked) {
      seatStyle = {
        ...seatStyle,
        backgroundColor: "#e5e7eb", // Darker gray
        border: "1px solid #9ca3af",
        color: "#6b7280",
        boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
      };
    } else if (isClassMatch) {
      if (isSelected) {
        seatStyle = {
          ...seatStyle,
          backgroundColor: brandColor,
          border: `2px solid ${brandColor}`,
          color: "#fff",
          boxShadow: "0 4px 10px rgba(15, 23, 42, 0.4)",
          transform: "scale(1.1)",
          zIndex: 10,
        };
      } else if (isExtraLegroom) {
        seatStyle = {
          ...seatStyle,
          backgroundColor: "#fff",
          border: `2px solid #22c55e`, // Green for legroom
          color: "#15803d",
        };
      }
    } else {
      // Wrong class
      seatStyle = {
        ...seatStyle,
        backgroundColor: "#f8fafc",
        border: "1px dashed #cbd5e1",
        color: "#cbd5e1",
        cursor: "not-allowed",
      };
    }

    return (
      <div
        key={seat.SeatId}
        onClick={() => handleSeatClick(seat)}
        onKeyDown={(e) => !isBooked && handleKeyDown(e, seat)}
        style={seatStyle}
        title={tooltip}
        className="seat-item"
        role="button"
        tabIndex={isBooked ? -1 : 0}
        aria-label={ariaLabel}
        aria-disabled={isBooked}
        aria-pressed={isSelected}
      >
        {isBooked ? (
          // Block Sign / X
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M18 6L6 18"
              stroke="#9ca3af"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="#9ca3af"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span aria-hidden="true">{seat.SeatNumber}</span>
            {isWindow && (
              <span
                style={{
                  fontSize: "0.6rem",
                  color: isSelected ? "#fbbf24" : "#3b82f6",
                }}
                aria-hidden="true"
              >
                Win
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAisle = (rowNum) => (
    <div
      style={{
        width: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
        fontSize: "0.8rem",
      }}
    >
      {rowNum}
    </div>
  );

  const renderRowChunk = (row) => {
    let chunks = [];
    if (layoutType === "large") {
      const left = row.seats.filter((s) =>
        ["A", "B", "C"].includes(s.SeatNumber.slice(-1)),
      );
      const middle = row.seats.filter((s) =>
        ["D", "E", "F", "G"].includes(s.SeatNumber.slice(-1)),
      );
      const right = row.seats.filter((s) =>
        ["H", "J", "K"].includes(s.SeatNumber.slice(-1)),
      );
      chunks = [left, middle, right];
    } else if (layoutType === "medium") {
      const left = row.seats.filter((s) =>
        ["A", "B", "C"].includes(s.SeatNumber.slice(-1)),
      );
      const right = row.seats.filter((s) =>
        ["D", "E", "F"].includes(s.SeatNumber.slice(-1)),
      );
      chunks = [left, right];
    } else {
      const left = row.seats.filter((s) =>
        ["A", "B"].includes(s.SeatNumber.slice(-1)),
      );
      const right = row.seats.filter((s) =>
        ["C", "D"].includes(s.SeatNumber.slice(-1)),
      );
      chunks = [left, right];
    }

    return (
      <div
        key={row.rowNum}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {chunks.map((chunk, idx) => (
          <React.Fragment key={idx}>
            <div style={{ display: "flex", gap: "6px" }}>
              {chunk.map(renderSeat)}
            </div>
            {idx < chunks.length - 1 &&
              renderAisle(idx === 0 || chunks.length === 2 ? row.rowNum : "")}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const isFamilyFriendly = useMemo(() => {
    if (selectedSeats.length < 2) return false;
    // Check if same row + adjacent
    const rows = selectedSeats.map((s) => getRowAndCol(s).row);
    const allSameRow = rows.every((r) => r === rows[0]);
    // This is a naive check; real logic would check column adjacency.
    // For now, if same row, assume likely adjacent or close enough.
    return allSameRow;
  }, [selectedSeats]);

  return (
    <div
      style={{
        position: "relative",
        background: "#e2e8f0",
        padding: "4rem 1rem",
        borderRadius: "8px",
        marginTop: "1rem",
        overflowX: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid #0f172a",
              borderRadius: 4,
            }}
          ></div>
          <span style={{ fontSize: "0.8rem" }}>Standard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid #22c55e",
              borderRadius: 4,
            }}
          ></div>
          <span style={{ fontSize: "0.8rem" }}>Extra Legroom</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: 20,
              height: 20,
              background: "#0f172a",
              borderRadius: 4,
            }}
          ></div>
          <span style={{ fontSize: "0.8rem", color: "white" }}>Selected</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: 20,
              height: 20,
              background: "#e5e7eb",
              borderRadius: 4,
            }}
          ></div>
          <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Occupied</span>
        </div>
      </div>

      {isFamilyFriendly && (
        <div
          style={{
            background: "#ecfdf5",
            color: "#059669",
            padding: "8px 16px",
            borderRadius: "20px",
            marginBottom: "20px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <i className="ri-team-line"></i> Great! You are sitting together.
        </div>
      )}

      {/* Plane Body */}
      <div
        style={{
          background: "#fff",
          borderRadius: "80px 80px 40px 40px",
          border: "1px solid #cbd5e1",
          padding: "80px 2rem 4rem 2rem",
          position: "relative",
          minWidth: "340px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Wings - Neutral Grey/White gradient */}
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "-120px",
            width: "120px",
            height: "500px",
            background: "linear-gradient(90deg, #cbd5e1 0%, #fff 100%)",
            clipPath: "polygon(100% 0, 0 30%, 0 80%, 100% 100%)",
            zIndex: 0,
            opacity: 0.6,
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "25%",
            right: "-120px",
            width: "120px",
            height: "500px",
            background: "linear-gradient(-90deg, #cbd5e1 0%, #fff 100%)",
            clipPath: "polygon(0 0, 100% 30%, 100% 80%, 0 100%)",
            zIndex: 0,
            opacity: 0.6,
          }}
        ></div>

        {/* Exit Markers (Front) */}
        <div
          style={{
            position: "absolute",
            top: "180px",
            left: "-14px",
            background: "#dc2626",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.6rem",
            transform: "rotate(-90deg)",
            fontWeight: "bold",
          }}
        >
          {t("exit")}
        </div>
        <div
          style={{
            position: "absolute",
            top: "180px",
            right: "-14px",
            background: "#dc2626",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.6rem",
            transform: "rotate(90deg)",
            fontWeight: "bold",
          }}
        >
          {t("exit")}
        </div>

        {/* Cockpit / Gallery Area */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginBottom: "1rem",
            gap: "3rem",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "40px",
              background: "#f1f5f9",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e2e8f0",
              color: "#64748b",
            }}
          >
            👨‍✈️
          </div>
          <div
            style={{
              width: "50px",
              height: "40px",
              background: "#f1f5f9",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e2e8f0",
              color: "#64748b",
            }}
          >
            🍽️
          </div>
        </div>

        {/* Front Rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
          }}
        >
          {frontRows.map(renderRowChunk)}
        </div>

        {/* Middle Section (Exits + Bathrooms) */}
        {hasMiddleSection && (
          <div
            style={{
              width: "120%",
              height: "80px",
              margin: "20px 0",
              background: "#f8fafc",
              borderTop: "1px dashed #cbd5e1",
              borderBottom: "1px dashed #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              position: "relative",
              left: "-10%", // Pull slightly wider
            }}
          >
            {/* Left Exit */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                }}
              >
                {t("exit")}
              </div>
              <div
                style={{
                  width: "20px",
                  height: "40px",
                  background: "#e2e8f0",
                  borderRight: "2px solid #94a3b8",
                }}
              ></div>
            </div>

            {/* Center Facilities (Bathrooms) */}
            <div style={{ display: "flex", gap: "3rem" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                🚻
              </div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                🚻
              </div>
            </div>

            {/* Right Exit */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                }}
              >
                {t("exit")}
              </div>
              <div
                style={{
                  width: "20px",
                  height: "40px",
                  background: "#e2e8f0",
                  borderLeft: "2px solid #94a3b8",
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Back Rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
          }}
        >
          {backRows.map(renderRowChunk)}
        </div>

        {/* Rear Facilities */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: "3rem",
            gap: "2rem",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              background: "#f1f5f9",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            🚻
          </div>
          <div
            style={{
              width: "50px",
              height: "50px",
              background: "#f1f5f9",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            🚻
          </div>
        </div>

        {/* Rear Exit Signs */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "-14px",
            background: "#dc2626",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.6rem",
            transform: "rotate(-90deg)",
            fontWeight: "bold",
          }}
        >
          {t("exit")}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "-14px",
            background: "#dc2626",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.6rem",
            transform: "rotate(90deg)",
            fontWeight: "bold",
          }}
        >
          {t("exit")}
        </div>
      </div>

      {/* Selected Seat Preview Card */}
      {selectedSeats.length > 0 && (
        <div
          style={{
            marginTop: "3rem",
            background: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <h4
            style={{
              margin: "0 0 1rem 0",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Selected Seats</span>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              {selectedSeats.length} / {maxSeats}
            </span>
          </h4>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {selectedSeats.map((seatNum) => {
              const isWindow = ["A", "K", "F", "A"].includes(seatNum.slice(-1));
              const { row } = getRowAndCol(seatNum);
              const isExtraLegroom = [1, 10, 11, 25].includes(row);

              return (
                <div
                  key={seatNum}
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    background: "#f8fafc",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      color: "#0f172a",
                    }}
                  >
                    {seatNum}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      margin: "5px 0",
                    }}
                  >
                    {isWindow ? "Window View 🌤️" : "Aisle Access 🚶"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Legroom:</span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: isExtraLegroom ? "#16a34a" : "inherit",
                        }}
                      >
                        {isExtraLegroom ? '36" (Extra)' : '31" (Standard)'}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Recline:</span>
                      <span style={{ fontWeight: 600 }}>
                        {isExtraLegroom ? '5"' : '3"'}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Power:</span>
                      <span style={{ fontWeight: 600 }}>Yes (USB-C)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMap;
