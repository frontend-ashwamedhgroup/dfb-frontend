import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

import { useAuth } from "../../context/AuthContext";

import "./Notifications.css";

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

const getNotificationTypeLabel = (type) => {
  if (!type) {
    return "Notification";
  }

  if (type === "USER_ACTIVATED") {
    return "Account";
  }

  if (type === "USER_DEACTIVATED") {
    return "Account";
  }

  if (type.includes("FORM_FIELD")) {
    return "Form Field";
  }

  if (type.includes("VISIT_TYPE")) {
    return "Visit Type";
  }

  if (type === "FORM_SUBMISSION") {
    return "Submission";
  }

  if (type.includes("FORM")) {
    return "Form";
  }

  return "System";
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

function Notifications() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

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

      setError(
        error.response?.data?.message ||
        "Unable to load notifications."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    loadNotifications();
  }, [user]);

  // =====================================================
  // MARK ONE AS READ
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
  // MARK ALL AS READ
  // =====================================================

  const handleMarkAllAsRead = async () => {

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
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  // =====================================================
  // DOMAIN
  // =====================================================

  const domainConfig = {
    1: {
      name: "AGRO",
      icon: "🌿",
      accent: "#0b8f55",
      light: "#eaf7f0",
    },

    2: {
      name: "POULTRY",
      icon: "🐔",
      accent: "#e67e22",
      light: "#fff3e6",
    },

    3: {
      name: "FMCG",
      icon: "🛒",
      accent: "#6d4aff",
      light: "#f1edff",
    },
  };

  const domain =
    domainConfig[user?.domainId] ||
    domainConfig[1];

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      className="notifications-page"
      style={{
        "--domain-accent": domain.accent,
        "--domain-light": domain.light,
      }}
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="notifications-sidebar">

        <div>

          {/* BRAND */}

          <div className="notifications-sidebar-brand">

            <div className="notifications-brand-icon">
              🌿
            </div>

            <div>
              <h1>DFB</h1>

              <span>
                Dynamic Form Builder
              </span>
            </div>

          </div>

          {/* DOMAIN */}

          <div className="notifications-sidebar-domain">

            <div className="notifications-domain-icon">
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

          {/* NAVIGATION */}

          <nav className="notifications-navigation">

            <button
              type="button"
              className="notifications-nav-item"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <span>
                ⌂
              </span>

              Dashboard
            </button>

            <button
              type="button"
              className="notifications-nav-item"
              onClick={() =>
                navigate("/my-submissions")
              }
            >
              <span>
                ▣
              </span>

              My Submissions
            </button>

            <button
              type="button"
              className="notifications-nav-item"
              onClick={() =>
                navigate("/profile")
              }
            >
              <span>
                ♙
              </span>

              Profile
            </button>

            <button
              type="button"
              className="notifications-nav-item active"
            >
              <span>
                🔔
              </span>

              Notifications

              {unreadCount > 0 && (
                <span className="notifications-nav-badge">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

          </nav>

        </div>

        {/* SIDEBAR BOTTOM */}

        <div className="notifications-sidebar-bottom">

          <div className="notifications-quote">
            <span>
              {domain.icon}
            </span>

            <p>
              "Collect Better Data.
              <br />
              Grow a Better Tomorrow."
            </p>
          </div>

          <button
            type="button"
            className="notifications-logout"
            onClick={handleLogout}
          >
            <span>
              ↪
            </span>

            Logout
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="notifications-main">

        {/* HEADER */}

        <header className="notifications-header">

          <div>
            <span className="notifications-header-label">
              USER PORTAL
            </span>

            <h2>
              Notifications
            </h2>
          </div>

          <div className="notifications-header-user">

            <div className="notifications-header-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>
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

        <section className="notifications-content">

          {/* PAGE INTRO */}

          <div className="notifications-page-intro">

            <div>

              <span className="notifications-page-label">
                {domain.icon} {domain.name}
              </span>

              <h3>
                Your Notifications
              </h3>

              <p>
                Stay updated with changes and
                activities related to your account,
                forms and visit types.
              </p>

            </div>

            <div className="notifications-summary">

              <div className="notifications-summary-icon">
                🔔
              </div>

              <div>
                <strong>
                  {unreadCount}
                </strong>

                <span>
                  Unread
                </span>
              </div>

            </div>

          </div>

          {/* TOOLBAR */}

          <div className="notifications-toolbar">

            <div>

              <strong>
                All Notifications
              </strong>

              <span>
                {notifications.length} total
              </span>

            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="notifications-mark-all"
                onClick={handleMarkAllAsRead}
              >
                ✓ Mark all as read
              </button>
            )}

          </div>

          {/* ERROR */}

          {error && (
            <div className="notifications-error">
              {error}
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="notifications-loading">

              <div className="notifications-spinner"></div>

              <span>
                Loading notifications...
              </span>

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            notifications.length === 0 && (

              <div className="notifications-empty">

                <div className="notifications-empty-icon">
                  🔔
                </div>

                <h3>
                  No notifications yet
                </h3>

                <p>
                  You're all caught up.
                  New notifications will appear here.
                </p>

              </div>
            )}

          {/* NOTIFICATION LIST */}

          {!loading &&
            !error &&
            notifications.length > 0 && (

              <div className="notifications-list">

                {notifications.map(
                  (notification) => (

                    <button
                      type="button"
                      key={notification.id}
                      className={`notifications-card ${
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

                      {/* ICON */}

                      <div className="notifications-card-icon">
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      {/* CONTENT */}

                      <div className="notifications-card-content">

                        <div className="notifications-card-top">

                          <div className="notifications-card-title">

                            <strong>
                              {notification.title}
                            </strong>

                            {!notification.read && (
                              <span className="notifications-card-dot"></span>
                            )}

                          </div>

                          <span className="notifications-card-type">
                            {getNotificationTypeLabel(
                              notification.type
                            )}
                          </span>

                        </div>

                        <p>
                          {notification.message}
                        </p>

                        <div className="notifications-card-meta">

                          <span>
                            {formatNotificationTime(
                              notification.createdAt
                            )}
                          </span>

                          {notification.actorName && (
                            <span>
                              By {notification.actorName}
                            </span>
                          )}

                        </div>

                      </div>

                    </button>

                  )
                )}

              </div>
            )}

        </section>

        {/* FOOTER */}

        <footer className="notifications-footer">

          <span>
            🌿 <strong>DFB</strong> |
            Dynamic Form Builder
          </span>

          <span>
            One Domain. Smarter Data. Greater Impact.
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Notifications;