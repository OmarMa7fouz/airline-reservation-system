import React, { useState, useEffect } from "react";
import "./LoyaltyDashboard.css";

const LoyaltyDashboard = () => {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemPoints, setRedeemPoints] = useState("");
  const [redeemMessage, setRedeemMessage] = useState("");
  const [mobileDeals, setMobileDeals] = useState([]);

  // Mock Data for New Tier 1 Features
  const [badges] = useState([
    {
      id: 1,
      name: "Globetrotter",
      icon: "🌍",
      desc: "Visited 5+ countries",
      unlocked: true,
    },
    {
      id: 2,
      name: "Mile High Club",
      icon: "✈️",
      desc: "Flew 50,000 miles",
      unlocked: true,
    },
    {
      id: 3,
      name: "Early Bird",
      icon: "🌅",
      desc: "Booked 3 months ahead",
      unlocked: false,
    },
    {
      id: 4,
      name: "Luxury Traveler",
      icon: "🥂",
      desc: "Flew First Class 3x",
      unlocked: false,
    },
  ]);

  // Mock Data for Tier 3 Features (Social & Gamification)
  const [referralCode] = useState(
    `REF-${Math.floor(Math.random() * 10000)}-2026`,
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [streak] = useState(12); // Mock streak
  const [leaderboard] = useState([
    { rank: 1, name: "Alice W.", points: 152000, avatar: "👩" },
    { rank: 2, name: "Bob M.", points: 148500, avatar: "👨" },
    { rank: 3, name: "Charlie D.", points: 139000, avatar: "🧑" },
    // User is here
    { rank: 42, name: "You", points: 0, avatar: "👤" }, // Points will be updated from loyaltyData
  ]);

  const [familyPool] = useState({
    name: "Smith Family Pool",
    balance: 45000,
    members: [
      { name: "You", role: "Admin", contrib: 12500 },
      { name: "Sarah", role: "Member", contrib: 32500 },
    ],
  });

  // Get user ID from session/localStorage
  const userId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId") || 1;

  useEffect(() => {
    fetchLoyaltyData();
    fetchLoyaltyData();
    fetchTransactions();
    fetchMobileDeals();
  }, []);

  const fetchMobileDeals = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/mobile/deals");
      const data = await res.json();
      if (data.success) setMobileDeals(data.deals);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLoyaltyData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/loyalty/points/${userId}`,
      );
      const data = await response.json();
      if (data.success) {
        setLoyaltyData(data.data);
      }
    } catch (error) {
      console.error("Error fetching loyalty data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/loyalty/history/${userId}`,
      );
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    const points = parseInt(redeemPoints);

    if (points < 100) {
      setRedeemMessage("Minimum 100 points required");
      return;
    }

    if (points > loyaltyData.points) {
      setRedeemMessage("Insufficient points");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, points }),
      });

      const data = await response.json();
      if (data.success) {
        setRedeemMessage(
          `✅ Redeemed ${points} points for $${data.discountAmount.toFixed(
            2,
          )} discount!`,
        );
        setRedeemPoints("");
        fetchLoyaltyData();
        fetchTransactions();
      } else {
        setRedeemMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setRedeemMessage("❌ Error redeeming points");
    }
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    alert(`Invite sent to ${inviteEmail}!`);
    setInviteEmail("");
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    alert("Referral code copied!");
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case "Platinum":
        return "#E5E4E2";
      case "Gold":
        return "#FFD700";
      case "Silver":
        return "#C0C0C0";
      default:
        return "#999";
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case "Platinum":
        return "💎";
      case "Gold":
        return "👑";
      case "Silver":
        return "⭐";
      default:
        return "🎯";
    }
  };

  if (loading) {
    return (
      <div className="loyalty-dashboard">
        <div className="loading">Loading your rewards...</div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="loyalty-dashboard">
        <div className="error">Unable to load loyalty data</div>
      </div>
    );
  }

  return (
    <div
      className="loyalty-dashboard with-airplane-bg"
      style={{
        backgroundImage: `
          linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.92) 100%),
          url(${process.env.PUBLIC_URL}/airplane-bg.png)
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="loyalty-header">
        <h1>AirGo Rewards</h1>
        <p>Your loyalty, our gratitude</p>
      </div>

      {/* Tier Badge */}
      <div
        className="tier-card"
        style={{ borderColor: getTierColor(loyaltyData.tier) }}
      >
        <div className="tier-icon">{getTierIcon(loyaltyData.tier)}</div>
        <div className="tier-info">
          <h2>{loyaltyData.tier} Member</h2>
          <p>{loyaltyData.lifetime_points.toLocaleString()} lifetime points</p>
        </div>

        {/* Streak Counter */}
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "rgba(255,255,255,0.2)",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🔥</span>
          <span style={{ fontWeight: "bold" }}>{streak} Day Streak</span>
        </div>

        {loyaltyData.nextTier && loyaltyData.nextTier.nextTier && (
          <div className="tier-progress">
            <p>
              {loyaltyData.nextTier.pointsNeeded.toLocaleString()} points to{" "}
              {loyaltyData.nextTier.nextTier}
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    ((loyaltyData.lifetime_points % 5000) / 5000) * 100
                  }%`,
                  backgroundColor: getTierColor(loyaltyData.nextTier.nextTier),
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Points Balance */}
      <div className="points-card">
        <div className="points-balance">
          <h3>Available Points</h3>
          <div className="points-number">
            {loyaltyData.points.toLocaleString()}
          </div>
          <p className="points-value">
            Worth ${(loyaltyData.points / 100).toFixed(2)}
          </p>
        </div>

        {/* Redeem Form */}
        <div className="redeem-section">
          <h4>Redeem Points</h4>
          <form onSubmit={handleRedeem}>
            <input
              type="number"
              placeholder="Enter points (min 100)"
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(e.target.value)}
              min="100"
              step="100"
            />
            <button type="submit" className="redeem-btn">
              Redeem for $
              {redeemPoints ? (redeemPoints / 100).toFixed(2) : "0.00"}
            </button>
          </form>
          {redeemMessage && <p className="redeem-message">{redeemMessage}</p>}
        </div>
      </div>

      {/* NEW: Family Pooling (Tier 1 Feature) */}
      <div
        className="family-pool-card"
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="ri-team-line" style={{ color: "#d97706" }}></i>{" "}
              Family Pooling
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Combine points with family to reach rewards faster.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}
            >
              {familyPool.balance.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Pool Balance
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          {familyPool.members.map((member, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#f8fafc",
                padding: "8px 12px",
                borderRadius: "50px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  background: "#cbd5e1",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                }}
              >
                {member.name.charAt(0)}
              </div>
              <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                {member.name}
              </span>
            </div>
          ))}
          <button
            style={{
              border: "1px dashed #cbd5e1",
              background: "none",
              borderRadius: "50px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "0.9rem",
              color: "#64748b",
            }}
            onClick={() => alert("Invite sent!")}
          >
            + Invite
          </button>
        </div>
      </div>

      {/* NEW: Gamification Badges (Tier 1 Feature) */}
      <div className="gamification-card" style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            color: "white",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            marginBottom: "1rem",
          }}
        >
          Achievements & Badges
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
          }}
        >
          {badges.map((badge) => (
            <div
              key={badge.id}
              style={{
                background: badge.unlocked ? "white" : "rgba(255,255,255,0.8)",
                borderRadius: "12px",
                padding: "1rem",
                textAlign: "center",
                opacity: badge.unlocked ? 1 : 0.6,
                filter: badge.unlocked ? "none" : "grayscale(100%)",
                border: badge.unlocked ? "2px solid #fbbf24" : "none",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                {badge.icon}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  marginBottom: "4px",
                  color: "#0f172a",
                }}
              >
                {badge.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                {badge.desc}
              </div>
              {badge.unlocked && (
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#d97706",
                    fontWeight: 600,
                    marginTop: "8px",
                  }}
                >
                  UNLOCKED
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* NEW: Referral Program */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
          }}
        >
          <h3
            style={{
              color: "#0f172a",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="ri-gift-line" style={{ color: "#d97706" }}></i> Refer
            & Earn
          </h3>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
            Give $50, Get $50! Share your love for travel.
          </p>

          <div
            style={{
              background: "#f1f5f9",
              padding: "1rem",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "1.2rem",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              {referralCode}
            </span>
            <button
              onClick={copyReferral}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Copy
            </button>
          </div>

          <form
            onSubmit={handleInvite}
            style={{ display: "flex", gap: "10px" }}
          >
            <input
              type="email"
              placeholder="Friend's email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{
                flex: 1,
                padding: "0.8rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#0f172a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0 1.5rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>

        {/* NEW: Leaderboard */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
          }}
        >
          <h3
            style={{
              color: "#0f172a",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="ri-trophy-line" style={{ color: "#d97706" }}></i> Top
            Travelers
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {leaderboard.map((user, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom:
                    index < leaderboard.length - 1
                      ? "1px solid #f1f5f9"
                      : "none",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "24px",
                      textAlign: "center",
                      fontWeight: 700,
                      color: index < 3 ? "#d97706" : "#64748b",
                    }}
                  >
                    #{user.rank}
                  </div>
                  <div style={{ fontSize: "1.5rem" }}>{user.avatar}</div>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>
                    {user.name}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: "#64748b" }}>
                  {user.points > 0
                    ? user.points.toLocaleString()
                    : loyaltyData.points.toLocaleString()}{" "}
                  pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="benefits-card">
        <h3>Your {loyaltyData.tier} Benefits</h3>
        <ul className="benefits-list">
          {loyaltyData.benefits.map((benefit, index) => (
            <li key={index}>
              <span className="benefit-icon">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* How to Earn */}
      <div className="earn-card">
        <h3>How to Earn Points</h3>
        <div className="earn-grid">
          <div className="earn-item">
            <div className="earn-icon">✈️</div>
            <h4>Book Flights</h4>
            <p>Earn 1 point per $1 spent</p>
          </div>
          <div className="earn-item">
            <div className="earn-icon">🎁</div>
            <h4>Referrals</h4>
            <p>500 bonus points per friend</p>
          </div>
          <div className="earn-item">
            <div className="earn-icon">🎂</div>
            <h4>Birthday Bonus</h4>
            <p>1000 points on your birthday</p>
          </div>
        </div>
      </div>

      {/* Mobile Exclusive Deals */}
      <div
        className="mobile-deals-card"
        style={{
          marginBottom: "2rem",
          background: "linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)",
          padding: "1.5rem",
          borderRadius: "16px",
          color: "white",
        }}
      >
        <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <i className="ri-smartphone-line" style={{ fontSize: "1.5rem" }}></i>
          Mobile Exclusive Deals
        </h3>

        <MobileDealsList deals={mobileDeals} />
      </div>

      {/* Transaction History */}
      <div className="history-card">
        <h3>Points History</h3>
        {transactions.length > 0 ? (
          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <p className="transaction-desc">{transaction.description}</p>
                  <p className="transaction-date">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div
                  className={`transaction-points ${
                    transaction.type === "EARN" ? "positive" : "negative"
                  }`}
                >
                  {transaction.type === "EARN" ? "+" : ""}
                  {transaction.points.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-transactions">
            No transactions yet. Start booking to earn points!
          </p>
        )}
      </div>
    </div>
  );
};

// Sub-component for Mobile Deals
const MobileDealsList = ({ deals }) => {
  if (!deals || deals.length === 0)
    return <p>No exclusive deals available right now.</p>;

  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        marginTop: "1rem",
      }}
    >
      {deals.map((deal, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,0.2)",
            padding: "1rem",
            borderRadius: "12px",
            backdropFilter: "blur(5px)",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
            {deal.title}
          </div>
          <div style={{ fontSize: "0.9rem", margin: "0.5rem 0" }}>
            {deal.description}
          </div>
          <div
            style={{
              background: "white",
              color: "#EE5253",
              padding: "0.3rem 0.8rem",
              borderRadius: "20px",
              display: "inline-block",
              fontWeight: "bold",
              fontSize: "0.9rem",
            }}
          >
            {deal.discount_percentage}% OFF
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoyaltyDashboard;
