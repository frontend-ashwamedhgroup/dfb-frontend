import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getVisitTypesByDomain } from "../../services/visitTypeService";
import { getDomainById } from "../../services/domainService";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

import { useAuth } from "../../context/AuthContext";

import "./Dashboard.css";

const domainConfig = {
  1: {
    name: "AGRO",
    icon: "🌿",
    accent: "#0b8f55",
    light: "#eaf7f0",
    message: "Better Visits, Brighter Agriculture",
    description: "Here are your available visit types for AGRO.",
  },

  2: {
    name: "POULTRY",
    icon: "🐔",
    accent: "#e67e22",
    light: "#fff3e6",
    message: "Healthy Poultry, Better Growth",
    description: "Here are your available visit types for POULTRY.",
  },

  3: {
    name: "FMCG",
    icon: "🛒",
    accent: "#6d4aff",
    light: "#f1edff",
    message: "Better Reach, Smarter Business",
    description: "Here are your available visit types for FMCG.",
  },
};

const getVisitIcon = (visitName) => {
  const name = visitName.toLowerCase();

  if (name.includes("dealer")) return "🏪";
  if (name.includes("farmer")) return "👨‍🌾";
  if (name.includes("nursery")) return "🌱";
  if (name.includes("doctor")) return "🩺";
  if (name.includes("branch person")) return "👤";
  if (name.includes("branch")) return "🏢";
  if (name.includes("corporate office person")) return "👤";
  if (name.includes("corporate office")) return "🏢";
  if (name.includes("corporate person")) return "👤";
  if (name.includes("corporate")) return "🏢";

  return "📋";
};

const getNotificationIcon = (type) => {
  if (!type) return "🔔";

  if (type.includes("USER")) {
    return "👤";
  }

  if (type.includes("FORM_FIELD")) {
    return "📝";
  }

  if (type.includes("VISIT_TYPE")) {
    return "📋";
  }

  if (type === "FORM_SUBMISSION") {
    return "📨";
  }

  if (type.includes("FORM")) {
    return "📄";
  }

  return "🔔";
};

const formatNotificationTime = (createdAt) => {
  if (!createdAt) {
    return "";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Dashboard() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [visitTypes, setVisitTypes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Real domain status from backend
  const [domainActive, setDomainActive] = useState(true);

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const domain = domainConfig[user?.domainId];

  // =====================================================
  // LOAD DOMAIN STATUS + VISIT TYPES
  // =====================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.domainId) {
        setError("No domain assigned to this user.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // -------------------------------------------------
        // 1. Get latest domain status from backend
        // -------------------------------------------------

        const domainData = await getDomainById(user.domainId);

        const isActive = Boolean(domainData.active);

        setDomainActive(isActive);

        // -------------------------------------------------
        // 2. Load visit types only if domain is active
        // -------------------------------------------------

        if (!isActive) {
          setVisitTypes([]);
          return;
        }

        const data = await getVisitTypesByDomain(
          user.domainId
        );

        setVisitTypes(data);

      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );

        if (error.response?.status === 403) {
          setError(
            "You do not have access to this domain."
          );
        } else {
          setError(
            "Unable to load domain information."
          );
        }

      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.domainId]);

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadNotifications = async () => {
      try {
        setNotificationLoading(true);

        const [
          notificationData,
          unreadData,
        ] = await Promise.all([
          getNotifications(),
          getUnreadNotificationCount(),
        ]);

        setNotifications(
          Array.isArray(notificationData)
            ? notificationData
            : []
        );

        setUnreadCount(
          Number(unreadData) || 0
        );

      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );
      } finally {
        setNotificationLoading(false);
      }
    };

    loadNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(
      loadNotifications,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // =====================================================
  // NOTIFICATION - MARK ONE AS READ
  // =====================================================

  const handleNotificationClick = async (
    notification
  ) => {
    if (notification.read) {
      return;
    }

    try {
      await markNotificationAsRead(
        notification.id
      );

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );

      setUnreadCount((previous) =>
        Math.max(previous - 1, 0)
      );

    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  // =====================================================
  // NOTIFICATION - MARK ALL AS READ
  // =====================================================

  const handleMarkAllNotificationsAsRead =
    async () => {

      if (unreadCount === 0) {
        return;
      }

      try {
        await markAllNotificationsAsRead();

        setNotifications((previous) =>
          previous.map((notification) => ({
            ...notification,
            read: true,
          }))
        );

        setUnreadCount(0);

      } catch (error) {
        console.error(
          "Failed to mark all notifications as read:",
          error
        );
      }
    };

  // =====================================================
  // OPEN ALL NOTIFICATIONS
  // =====================================================

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    navigate("/notifications");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  // =====================================================
  // OPEN VISIT FORM
  // =====================================================

  const handleVisitClick = (visitType) => {
    // Prevent inactive domains from opening forms
    if (!domainActive) {
      return;
    }

    navigate(`/form/${visitType.id}`);
  };

  // =====================================================
  // DOMAIN ERROR
  // =====================================================

  if (!domain) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error-page">
          <h2>
            Domain information unavailable
          </h2>

          <p>
            Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      className="dashboard-page"
      style={{
        "--domain-accent": domain.accent,
        "--domain-light": domain.light,
      }}
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-top">

          {/* BRAND */}

          <div className="sidebar-brand">

            <div className="sidebar-brand-icon">
              🌿
            </div>

            <div>
              <h1>
                DFB
              </h1>

              <span>
                Dynamic Form Builder
              </span>
            </div>

          </div>

          {/* DOMAIN */}

          <div className="sidebar-domain">

            <div className="domain-main-icon">
              {domain.icon}
            </div>

            <div>
              <strong>
                {domain.name}
              </strong>

              <span>
                User Portal
              </span>
            </div>

          </div>

          {/* DOMAIN STATUS */}

          <div
            style={{
              margin: "10px 20px",
              padding: "8px 12px",
              borderRadius: "8px",
              background: domainActive
                ? "#eaf7f0"
                : "#fff1f1",
              color: domainActive
                ? "#0b8f55"
                : "#d93025",
              fontSize: "13px",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: domainActive
                  ? "#0b8f55"
                  : "#d93025",
                marginRight: "7px",
              }}
            />

            {domainActive
              ? "Domain Active"
              : "Domain Inactive"}
          </div>

          {/* NAVIGATION */}

          <nav className="sidebar-navigation">

            {/* DASHBOARD */}

            <button
              type="button"
              className="sidebar-item active"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <span className="sidebar-item-icon">
                ⌂
              </span>

              <span>
                Dashboard
              </span>
            </button>

            {/* MY FORMS */}

            <button
              type="button"
              className="sidebar-item"
              disabled={!domainActive}
            >
              <span className="sidebar-item-icon">
                ▤
              </span>

              <span>
                My Forms
              </span>
            </button>

            {/* MY SUBMISSIONS */}

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                navigate("/my-submissions")
              }
            >
              <span className="sidebar-item-icon">
                ▣
              </span>

              <span>
                My Submissions
              </span>
            </button>

            {/* PROFILE */}

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                navigate("/profile")
              }
            >
              <span className="sidebar-item-icon">
                ♙
              </span>

              <span>
                Profile
              </span>
            </button>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                navigate("/notifications")
              }
            >
              <span className="sidebar-item-icon">
                ♢
              </span>

              <span>
                Notifications
              </span>

              {unreadCount > 0 && (
                <span className="sidebar-notification-badge">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

          </nav>

        </div>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <div className="sidebar-quote">

            <div className="quote-icon">
              {domain.icon}
            </div>

            <p>
              "Collect Better Data.
              <br />
              Grow a Better Tomorrow."
            </p>

          </div>

          <button
            type="button"
            className="sidebar-item logout-item"
            onClick={handleLogout}
          >
            <span className="sidebar-item-icon">
              ↪
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div className="header-title">
            <span>
              One Domain. Smarter Data. Greater Impact.
            </span>
          </div>

          <div className="header-user">

            {/* =================================================
                NOTIFICATION BELL
            ================================================= */}

            <div className="notification-wrapper">

              <button
                type="button"
                className="notification-button"
                aria-label="Notifications"
                onClick={() =>
                  setShowNotifications(
                    (previous) => !previous
                  )
                }
              >

                <span className="notification-bell-icon">
                  🔔
                </span>

                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}

              </button>

              {/* =================================================
                  NOTIFICATION DROPDOWN
              ================================================= */}

              {showNotifications && (

                <div className="notification-dropdown">

                  {/* HEADER */}

                  <div className="notification-dropdown-header">

                    <div>
                      <h3>
                        Notifications
                      </h3>

                      <span>
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : "All caught up"}
                      </span>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="mark-all-read-button"
                        onClick={
                          handleMarkAllNotificationsAsRead
                        }
                      >
                        Mark all as read
                      </button>
                    )}

                  </div>

                  {/* BODY */}

                  <div className="notification-dropdown-body">

                    {notificationLoading ? (

                      <div className="notification-empty">
                        <div className="notification-loading-spinner"></div>

                        <span>
                          Loading notifications...
                        </span>
                      </div>

                    ) : notifications.length === 0 ? (

                      <div className="notification-empty">

                        <div className="notification-empty-icon">
                          🔔
                        </div>

                        <strong>
                          No notifications
                        </strong>

                        <span>
                          You're all caught up.
                        </span>

                      </div>

                    ) : (

                      notifications.map(
                        (notification) => (

                          <button
                            type="button"
                            key={notification.id}
                            className={`notification-item ${
                              notification.read
                                ? "read"
                                : "unread"
                            }`}
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                          >

                            <div className="notification-item-icon">

                              {getNotificationIcon(
                                notification.type
                              )}

                            </div>

                            <div className="notification-item-content">

                              <div className="notification-item-title-row">

                                <strong>
                                  {notification.title}
                                </strong>

                                {!notification.read && (
                                  <span className="notification-unread-dot"></span>
                                )}

                              </div>

                              <p>
                                {notification.message}
                              </p>

                              <span className="notification-time">
                                {formatNotificationTime(
                                  notification.createdAt
                                )}
                              </span>

                            </div>

                          </button>

                        )
                      )

                    )}

                  </div>

                  {/* FOOTER */}

                  {notifications.length > 0 && (
                    <div className="notification-dropdown-footer">
                      <button
                        type="button"
                        className="notification-view-all-button"
                        onClick={
                          handleViewAllNotifications
                        }
                      >
                        View all notifications →
                      </button>
                    </div>
                  )}

                </div>

              )}

            </div>

            {/* USER */}

            <div className="header-user-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div className="header-user-info">

              <strong>
                {user?.name}
              </strong>

              <span>
                USER
              </span>

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <main className="dashboard-content">

          {/* =================================================
              INACTIVE DOMAIN BANNER
          ================================================= */}

          {!domainActive && (
            <section
              style={{
                marginBottom: "20px",
                padding: "16px 20px",
                borderRadius: "12px",
                background: "#fff4e5",
                border: "1px solid #f5c27a",
                color: "#8a5700",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                }}
              >
                ⚠
              </span>

              <div>
                <strong>
                  {domain.name} domain is currently inactive.
                </strong>

                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "14px",
                  }}
                >
                  You can view your existing information,
                  but new visits and form submissions are
                  currently unavailable.
                </p>
              </div>
            </section>
          )}

          {/* WELCOME */}

          <section className="welcome-banner">

            <div className="welcome-text">

              <span className="welcome-label">
                WELCOME BACK
              </span>

              <h2>
                Hello, {user?.name}! 👋
              </h2>

              <p>
                {domain.description}
              </p>

              <div className="welcome-message">
                "{domain.message}"
              </div>

            </div>

            <div className="welcome-illustration">

              <div className="illustration-circle">
                {domain.icon}
              </div>

              <div className="illustration-leaf leaf-one">
                🌿
              </div>

              <div className="illustration-leaf leaf-two">
                🌱
              </div>

            </div>

          </section>

          {/* VISITS */}

          <section className="visits-section">

            <div className="section-heading">

              <div>

                <div className="section-title-row">

                  <span className="section-domain-icon">
                    {domain.icon}
                  </span>

                  <h3>
                    {domain.name} Visits
                  </h3>

                  {!domainActive && (
                    <span
                      style={{
                        marginLeft: "10px",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        background: "#fff1f1",
                        color: "#d93025",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      INACTIVE
                    </span>
                  )}

                </div>

                <p>
                  {domainActive
                    ? "Select a visit type to start a new form."
                    : "New visits are temporarily unavailable."}
                </p>

              </div>

            </div>

            {/* LOADING */}

            {loading && (

              <div className="dashboard-message">

                <div className="loading-spinner"></div>

                <span>
                  Loading domain information...
                </span>

              </div>

            )}

            {/* ERROR */}

            {error && (

              <div className="dashboard-error">
                {error}
              </div>

            )}

            {/* INACTIVE DOMAIN */}

            {!loading &&
              !error &&
              !domainActive && (

                <div className="dashboard-message">

                  <div
                    style={{
                      fontSize: "36px",
                      marginBottom: "10px",
                    }}
                  >
                    🔒
                  </div>

                  <strong>
                    Domain currently inactive
                  </strong>

                  <p>
                    New forms and visit submissions
                    are disabled until the administrator
                    activates this domain.
                  </p>

                </div>

              )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              domainActive &&
              visitTypes.length === 0 && (

                <div className="dashboard-message">
                  No active visit types are available.
                </div>

              )}

            {/* VISIT CARDS */}

            {!loading &&
              !error &&
              domainActive &&
              visitTypes.length > 0 && (

                <div className="visit-grid">

                  {visitTypes.map(
                    (visitType) => (

                      <button
                        key={visitType.id}
                        type="button"
                        className="visit-card"
                        onClick={() =>
                          handleVisitClick(
                            visitType
                          )
                        }
                      >

                        <div className="visit-icon-wrapper">

                          <span>
                            {getVisitIcon(
                              visitType.name
                            )}
                          </span>

                        </div>

                        <h4>
                          {visitType.name}
                        </h4>

                        <p>
                          Start{" "}
                          {visitType.name.toLowerCase()}.
                        </p>

                        <div className="visit-arrow">
                          →
                        </div>

                      </button>

                    )
                  )}

                </div>

              )}

          </section>

          {/* INFORMATION BANNER */}

          <section className="dashboard-info-banner">

            <div className="info-banner-icon">
              {domain.icon}
            </div>

            <div>

              <h3>
                Dynamic Form Builder
              </h3>

              <p>
                Simplify data collection.
                Empower better decisions.
              </p>

            </div>

            <div className="info-decoration">
              ✦
            </div>

          </section>

        </main>

        {/* FOOTER */}

        <footer className="dashboard-footer">

          <span>
            🌿 <strong>DFB</strong> |
            Dynamic Form Builder
          </span>

          <span>
            One Domain. Smarter Data.
            Greater Impact.
          </span>

        </footer>

      </div>

    </div>
  );
}

export default Dashboard;