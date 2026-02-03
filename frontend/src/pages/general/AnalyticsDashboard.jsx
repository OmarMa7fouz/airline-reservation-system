import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AnalyticsDashboard.css";

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("7days");

  const [bookingData, setBookingData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);

  // Calculate date range
  const getDateRange = (range) => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case "24hours":
        start.setHours(start.getHours() - 24);
        break;
      case "7days":
        start.setDate(start.getDate() - 7);
        break;
      case "30days":
        start.setDate(start.getDate() - 30);
        break;
      case "90days":
        start.setDate(start.getDate() - 90);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { startDate, endDate } = getDateRange(dateRange);
        const params = new URLSearchParams({
          startDate,
          endDate,
          period: "daily",
        });

        const [bookings, customers, routes, funnel, realtime] =
          await Promise.all([
            fetch(
              `http://localhost:5000/api/v1/analytics/bookings?${params}`,
            ).then((r) => r.json()),
            fetch(
              `http://localhost:5000/api/v1/analytics/customers?${params}`,
            ).then((r) => r.json()),
            fetch(
              `http://localhost:5000/api/v1/analytics/routes/profitability?${params}`,
            ).then((r) => r.json()),
            fetch(
              `http://localhost:5000/api/v1/analytics/funnel?${params}`,
            ).then((r) => r.json()),
            fetch(`http://localhost:5000/api/v1/analytics/realtime`).then((r) =>
              r.json(),
            ),
          ]);

        if (bookings.success) setBookingData(bookings.data);
        if (customers.success) setCustomerData(customers.data);
        if (routes.success) setRouteData(routes.data);
        if (funnel.success) setFunnelData(funnel.data);
        if (realtime.success) setRealTimeData(realtime.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    // Refresh real-time data every 30 seconds
    const interval = setInterval(() => {
      fetch("http://localhost:5000/api/v1/analytics/realtime")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setRealTimeData(data.data);
        })
        .catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, [dateRange]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num || 0);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <header className="analytics-header">
        <div className="analytics-header-content">
          <div className="analytics-title">
            <h1>📊 Analytics Dashboard</h1>
            <p className="analytics-subtitle">
              Real-time insights and performance metrics
            </p>
          </div>

          <div className="analytics-header-actions">
            <select
              className="date-range-selector"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>

            <button
              className="export-btn"
              onClick={() =>
                window.open(
                  `http://localhost:5000/api/v1/analytics/export?type=bookings&${new URLSearchParams(
                    getDateRange(dateRange),
                  )}`,
                  "_blank",
                )
              }
            >
              <span className="export-icon">📥</span>
              Export Data
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="analytics-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            Bookings
          </button>
          <button
            className={`tab-btn ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            Customers
          </button>
          <button
            className={`tab-btn ${activeTab === "routes" ? "active" : ""}`}
            onClick={() => setActiveTab("routes")}
          >
            Routes
          </button>
          <button
            className={`tab-btn ${activeTab === "funnel" ? "active" : ""}`}
            onClick={() => setActiveTab("funnel")}
          >
            Conversion
          </button>
        </nav>
      </header>

      <main className="analytics-content">
        {/* Real-Time Metrics Bar */}
        <section className="realtime-metrics">
          <div className="metric-card realtime">
            <div className="metric-icon live-pulse">🔴</div>
            <div className="metric-info">
              <span className="metric-label">Active Users</span>
              <span className="metric-value">
                {formatNumber(realTimeData?.activeUsers)}
              </span>
            </div>
          </div>
          <div className="metric-card realtime">
            <div className="metric-icon">📅</div>
            <div className="metric-info">
              <span className="metric-label">Today's Bookings</span>
              <span className="metric-value">
                {formatNumber(realTimeData?.todayBookings)}
              </span>
            </div>
          </div>
          <div className="metric-card realtime">
            <div className="metric-icon">💰</div>
            <div className="metric-info">
              <span className="metric-label">Today's Revenue</span>
              <span className="metric-value">
                {formatCurrency(realTimeData?.todayRevenue)}
              </span>
            </div>
          </div>
          <div className="metric-card realtime">
            <div className="metric-icon">⏳</div>
            <div className="metric-info">
              <span className="metric-label">Pending Payments</span>
              <span className="metric-value">
                {formatNumber(realTimeData?.pendingPayments)}
              </span>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* KPI Cards */}
            <section className="kpi-section">
              <div className="kpi-card">
                <div className="kpi-header">
                  <h3>Total Bookings</h3>
                  <span className="kpi-icon">🎫</span>
                </div>
                <div className="kpi-value">
                  {formatNumber(bookingData?.overview?.totalBookings)}
                </div>
                <div className="kpi-trend positive">+12.5% vs last period</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <h3>Total Revenue</h3>
                  <span className="kpi-icon">💵</span>
                </div>
                <div className="kpi-value">
                  {formatCurrency(bookingData?.overview?.totalRevenue)}
                </div>
                <div className="kpi-trend positive">+18.2% vs last period</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <h3>Avg Booking Value</h3>
                  <span className="kpi-icon">📈</span>
                </div>
                <div className="kpi-value">
                  {formatCurrency(bookingData?.overview?.avgBookingValue)}
                </div>
                <div className="kpi-trend positive">+5.1% vs last period</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <h3>Conversion Rate</h3>
                  <span className="kpi-icon">🎯</span>
                </div>
                <div className="kpi-value">
                  {funnelData?.overallConversionRate}%
                </div>
                <div className="kpi-trend negative">-2.3% vs last period</div>
              </div>
            </section>

            {/* Charts Section */}
            <div className="charts-grid">
              {/* Booking Trend Chart */}
              <div className="chart-card">
                <h3>Booking Trend</h3>
                <div className="mini-chart">
                  {bookingData?.bookingsTrend?.length > 0 ? (
                    <div className="bar-chart">
                      {bookingData.bookingsTrend.map((item, idx) => {
                        const maxBookings = Math.max(
                          ...bookingData.bookingsTrend.map((b) => b.bookings),
                        );
                        const height = (item.bookings / maxBookings) * 100;
                        return (
                          <div key={idx} className="bar-wrapper">
                            <div
                              className="bar"
                              style={{ height: `${height}%` }}
                              title={`${item.period}: ${item.bookings} bookings`}
                            ></div>
                            <span className="bar-label">
                              {item.period?.split("-").pop()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="no-data">No data available</p>
                  )}
                </div>
              </div>

              {/* Top Routes */}
              <div className="chart-card">
                <h3>Top Routes by Bookings</h3>
                <div className="routes-list">
                  {bookingData?.topRoutes?.slice(0, 5).map((route, idx) => (
                    <div key={idx} className="route-item">
                      <div className="route-rank">#{idx + 1}</div>
                      <div className="route-info">
                        <div className="route-path">
                          {route.origin} → {route.destination}
                        </div>
                        <div className="route-stats">
                          {formatNumber(route.bookings)} bookings ·{" "}
                          {formatCurrency(route.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "bookings" && (
          <section className="bookings-analytics">
            <div className="chart-card full-width">
              <h3>Booking & Revenue Trend</h3>
              <div className="dual-axis-chart">
                {bookingData?.bookingsTrend?.map((item, idx) => {
                  const maxRevenue = Math.max(
                    ...bookingData.bookingsTrend.map((b) => b.revenue || 0),
                  );
                  const height = ((item.revenue || 0) / maxRevenue) * 100;
                  return (
                    <div key={idx} className="chart-bar-group">
                      <div
                        className="revenue-bar"
                        style={{ height: `${height}%` }}
                        title={`${item.period}: ${formatCurrency(
                          item.revenue,
                        )}`}
                      >
                        <span className="bar-value">{item.bookings}</span>
                      </div>
                      <span className="axis-label">{item.period}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {activeTab === "customers" && (
          <section className="customer-analytics">
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Customer Overview</h3>
                <div className="customer-stats">
                  <div className="stat-row">
                    <span className="stat-label">Total Customers</span>
                    <span className="stat-value">
                      {formatNumber(customerData?.totalCustomers)}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Repeat Customers</span>
                    <span className="stat-value">
                      {formatNumber(customerData?.repeatCustomers)}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Retention Rate</span>
                    <span className="stat-value highlight">
                      {customerData?.retentionRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <h3>Customer Segments</h3>
                <div className="segments-chart">
                  {customerData?.segments?.map((segment, idx) => {
                    const total = customerData.segments.reduce(
                      (sum, s) => sum + s.customers,
                      0,
                    );
                    const percentage = (
                      (segment.customers / total) *
                      100
                    ).toFixed(1);
                    return (
                      <div key={idx} className="segment-bar">
                        <div className="segment-label">
                          <span>{segment.segment}</span>
                          <span className="segment-count">
                            {formatNumber(segment.customers)}
                          </span>
                        </div>
                        <div className="segment-progress">
                          <div
                            className={`segment-fill segment-${segment.segment.toLowerCase()}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="segment-percentage">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "routes" && (
          <section className="routes-analytics">
            <div className="chart-card full-width">
              <h3>Route Profitability Analysis</h3>
              <div className="routes-table">
                <div className="table-header">
                  <div className="th">Route</div>
                  <div className="th">Flights</div>
                  <div className="th">Bookings</div>
                  <div className="th">Avg/Flight</div>
                  <div className="th">Revenue</div>
                  <div className="th">Avg Price</div>
                </div>
                <div className="table-body">
                  {routeData?.slice(0, 10).map((route, idx) => (
                    <div key={idx} className="table-row">
                      <div className="td route-name">
                        {route.origin} → {route.destination}
                      </div>
                      <div className="td">
                        {formatNumber(route.total_flights)}
                      </div>
                      <div className="td">
                        {formatNumber(route.total_bookings)}
                      </div>
                      <div className="td">
                        {route.avg_bookings_per_flight?.toFixed(1) || 0}
                      </div>
                      <div className="td revenue">
                        {formatCurrency(route.total_revenue)}
                      </div>
                      <div className="td">
                        {formatCurrency(route.avg_ticket_price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "funnel" && (
          <section className="funnel-analytics">
            <div className="chart-card full-width">
              <h3>Conversion Funnel</h3>
              <div className="conversion-funnel">
                {funnelData?.funnel?.map((stage, idx) => {
                  const width = stage.percentage;
                  return (
                    <div key={idx} className="funnel-stage">
                      <div className="funnel-bar-container">
                        <div
                          className={`funnel-bar stage-${idx}`}
                          style={{ width: `${width}%` }}
                        >
                          <span className="funnel-stage-name">
                            {stage.stage}
                          </span>
                          <span className="funnel-metrics">
                            {formatNumber(stage.count)} ({stage.percentage}%)
                          </span>
                        </div>
                      </div>
                      {idx < funnelData.funnel.length - 1 && (
                        <div className="funnel-dropoff">
                          ↓{" "}
                          {(
                            funnelData.funnel[idx].percentage -
                            funnelData.funnel[idx + 1].percentage
                          ).toFixed(1)}
                          % drop-off
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="funnel-summary">
                <p>
                  Overall Conversion Rate:{" "}
                  <strong>{funnelData?.overallConversionRate}%</strong>
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
