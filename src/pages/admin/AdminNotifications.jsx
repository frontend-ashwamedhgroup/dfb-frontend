import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

import "./AdminNotifications.css";


/* =========================================================
   NOTIFICATION ICON
========================================================= */

const getNotificationIcon = (type) => {
  if (!type) return "🔔";

  if (type === "FORM_SUBMISSION") {
    return "📨";
  }

  if (type.includes("FORM_FIELD")) {
    return "📝";
  }

  if (type.includes("VISIT_TYPE")) {
    return "📋";
  }

  if (type.includes("FORM")) {
    return "📄";
  }

  if (type.includes("USER")) {
    return "👤";
  }

  return "🔔";
};


/* =========================================================
   NOTIFICATION TYPE LABEL
========================================================= */

const getNotificationTypeLabel = (type) => {
  if (!type) {
    return "Notification";
  }

  if (type === "FORM_SUBMISSION") {
    return "Form Submission";
  }

  if (type.includes("FORM_FIELD")) {
    return "Form Field";
  }

  if (type.includes("VISIT_TYPE")) {
    return "Visit Type";
  }

  if (type.includes("FORM")) {
    return "Form";
  }

  if (type.includes("USER")) {
    return "User";
  }

  return "System";
};


/* =========================================================
   DATE FORMAT
========================================================= */

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


/* =========================================================
   ADMIN NOTIFICATIONS
========================================================= */

function AdminNotifications() {

  const navigate = useNavigate();

  const { user, logout } = useAuth();


  /* =====================================================
     STATE
  ===================================================== */

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [processingId, setProcessingId] = useState(null);

  const [markingAll, setMarkingAll] = useState(false);


  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

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
        "Failed to load admin notifications:",
        error
      );

      setError(
        "Unable to load notifications. Please try again."
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


    // Refresh every 30 seconds

    const interval = setInterval(
      loadNotifications,
      30000
    );


    return () => {
      clearInterval(interval);
    };

  }, [user]);


  /* =====================================================
     MARK ONE AS READ
  ===================================================== */

  const handleMarkAsRead = async (notification) => {

    if (notification.read) {
      return;
    }


    try {

      setProcessingId(notification.id);


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

    } finally {

      setProcessingId(null);

    }

  };


  /* =====================================================
     MARK ALL AS READ
  ===================================================== */

  const handleMarkAllAsRead = async () => {

    if (unreadCount === 0) {
      return;
    }


    try {

      setMarkingAll(true);


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

    } finally {

      setMarkingAll(false);

    }

  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    logout();

    navigate(
      "/admin/login",
      {
        replace: true,
      }
    );

  };


  /* =====================================================
     FILTER
  ===================================================== */

  const filteredNotifications =
    notifications.filter((notification) => {

      if (filter === "UNREAD") {
        return !notification.read;
      }

      if (filter === "READ") {
        return notification.read;
      }

      return true;

    });


  /* =====================================================
     COUNTS
  ===================================================== */

  const totalCount = notifications.length;

  const readCount =
    totalCount - unreadCount;


  /* =====================================================
     PAGE
  ===================================================== */

  return (

    <div className="admin-notifications-page">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-notifications-sidebar">


        {/* BRAND */}

        <div className="admin-notifications-brand">

          <div className="admin-notifications-brand-logo">
            D
          </div>

          <div>

            <strong>
              Dynamic Form
            </strong>

            <span>
              Builder
            </span>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="admin-notifications-nav">


          <div className="admin-notifications-section-title">
            ADMIN PORTAL
          </div>


          <button
            type="button"
            className="admin-notifications-nav-item"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <span className="admin-notifications-nav-icon">
              ▦
            </span>

            Dashboard
          </button>


          <div className="admin-notifications-section-title">
            MANAGEMENT
          </div>


          <button
            type="button"
            className="admin-notifications-nav-item"
            onClick={() =>
              navigate("/admin/domains")
            }
          >
            <span className="admin-notifications-nav-icon">
              ◇
            </span>

            Domains
          </button>


          <button
            type="button"
            className="admin-notifications-nav-item"
            onClick={() =>
              navigate("/admin/visit-types")
            }
          >
            <span className="admin-notifications-nav-icon">
              ◈
            </span>

            Visit Types
          </button>


          <button
            type="button"
            className="admin-notifications-nav-item"
            onClick={() =>
              navigate("/admin/forms")
            }
          >
            <span className="admin-notifications-nav-icon">
              ▤
            </span>

            Forms
          </button>


          <button
            type="button"
            className="admin-notifications-nav-item"
            onClick={() =>
              navigate("/admin/form-builder")
            }
          >
            <span className="admin-notifications-nav-icon">
              ⚙
            </span>

            Form Builder
          </button>


          <div className="admin-notifications-section-title">
            USERS & DATA
          </div>


          <button
            type="button"
            className="admin-notifications-nav-item"
            onClick={() =>
              navigate("/admin/users")
            }
          >
            <span className="admin-notifications-nav-icon">
              ♙
            </span>

            Users
          </button>


          <button
            type="button"
            className="admin-notifications-nav-item"
            onClick={() =>
              navigate("/admin/submissions")
            }
          >
            <span className="admin-notifications-nav-icon">
              ▣
            </span>

            All Submissions
          </button>


          <div className="admin-notifications-section-title">
            SYSTEM
          </div>


          {/* ACTIVE NOTIFICATIONS */}

          <button
            type="button"
            className="admin-notifications-nav-item active"
          >

            <span className="admin-notifications-nav-icon">
              ♢
            </span>

            <span>
              Notifications
            </span>


            {unreadCount > 0 && (

              <span className="admin-notifications-sidebar-badge">

                {unreadCount > 99
                  ? "99+"
                  : unreadCount}

              </span>

            )}

          </button>


           <button
  type="button"
  className="admin-nav-item"
  onClick={() => navigate("/admin/profile")}
>
  <span className="admin-nav-icon">♙</span>
  Profile
</button>


        </nav>


        {/* SIDEBAR FOOTER */}

        <div className="admin-notifications-sidebar-footer">


          <div className="admin-notifications-profile">

            <div className="admin-notifications-avatar">

              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "A"}

            </div>


            <div>

              <strong>
                {user?.name || "Administrator"}
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>


          <button
            type="button"
            className="admin-notifications-logout"
            onClick={handleLogout}
          >

            ↪

            <span>
              Logout
            </span>

          </button>


        </div>


      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-notifications-main">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="admin-notifications-header">


          <div>

            <div className="admin-notifications-page-label">
              SYSTEM
            </div>

            <h1>
              Notifications
            </h1>

            <p>
              Stay updated with activity and changes across
              the Dynamic Form Builder.
            </p>

          </div>


          {/* HEADER USER */}

          <div className="admin-notifications-header-user">

            <div className="admin-notifications-header-avatar">

              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "A"}

            </div>


            <div>

              <strong>
                {user?.name || "Administrator"}
              </strong>

              <span>
                ADMIN
              </span>

            </div>

          </div>


        </header>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="admin-notifications-summary">


          <div className="admin-notification-summary-card">

            <div className="admin-notification-summary-icon blue">
              🔔
            </div>

            <div>

              <span>
                Total Notifications
              </span>

              <strong>
                {totalCount}
              </strong>

            </div>

          </div>


          <div className="admin-notification-summary-card">

            <div className="admin-notification-summary-icon red">
              ●
            </div>

            <div>

              <span>
                Unread
              </span>

              <strong>
                {unreadCount}
              </strong>

            </div>

          </div>


          <div className="admin-notification-summary-card">

            <div className="admin-notification-summary-icon green">
              ✓
            </div>

            <div>

              <span>
                Read
              </span>

              <strong>
                {Math.max(readCount, 0)}
              </strong>

            </div>

          </div>


        </section>


        {/* =================================================
            NOTIFICATION PANEL
        ================================================= */}

        <section className="admin-notifications-panel">


          {/* PANEL HEADER */}

          <div className="admin-notifications-panel-header">


            <div>

              <h2>
                All Notifications
              </h2>

              <p>
                Review recent system activity and user submissions.
              </p>

            </div>


            {unreadCount > 0 && (

              <button
                type="button"
                className="admin-notifications-mark-all"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
              >

                {markingAll
                  ? "Marking..."
                  : "Mark all as read"}

              </button>

            )}

          </div>


          {/* FILTER BAR */}

          <div className="admin-notifications-filter-bar">


            <div className="admin-notifications-filter-tabs">


              <button
                type="button"
                className={
                  filter === "ALL"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("ALL")
                }
              >
                All
                <span>
                  {totalCount}
                </span>
              </button>


              <button
                type="button"
                className={
                  filter === "UNREAD"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("UNREAD")
                }
              >
                Unread
                <span>
                  {unreadCount}
                </span>
              </button>


              <button
                type="button"
                className={
                  filter === "READ"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("READ")
                }
              >
                Read
                <span>
                  {Math.max(readCount, 0)}
                </span>
              </button>


            </div>


            <button
              type="button"
              className="admin-notifications-refresh"
              onClick={loadNotifications}
              disabled={loading}
            >
              ↻ Refresh
            </button>


          </div>


          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="admin-notifications-list">


            {/* LOADING */}

            {loading ? (

              <div className="admin-notifications-state">

                <div className="admin-notifications-spinner"></div>

                <strong>
                  Loading notifications...
                </strong>

                <span>
                  Please wait while we fetch your notifications.
                </span>

              </div>

            ) : error ? (

              /* ERROR */

              <div className="admin-notifications-state error">

                <div className="admin-notifications-state-icon">
                  ⚠
                </div>

                <strong>
                  Unable to load notifications
                </strong>

                <span>
                  {error}
                </span>

                <button
                  type="button"
                  onClick={loadNotifications}
                >
                  Try again
                </button>

              </div>

            ) : filteredNotifications.length === 0 ? (

              /* EMPTY */

              <div className="admin-notifications-state">

                <div className="admin-notifications-state-icon">
                  🔔
                </div>

                <strong>
                  {filter === "UNREAD"
                    ? "No unread notifications"
                    : filter === "READ"
                    ? "No read notifications"
                    : "No notifications"}
                </strong>

                <span>
                  {filter === "UNREAD"
                    ? "You're all caught up."
                    : "There are no notifications to display."}
                </span>

              </div>

            ) : (

              /* NOTIFICATIONS */

              filteredNotifications.map(
                (notification) => (

                  <div
                    key={notification.id}
                    className={`admin-notification-row ${
                      notification.read
                        ? "read"
                        : "unread"
                    }`}
                  >


                    {/* ICON */}

                    <div className="admin-notification-row-icon">

                      {getNotificationIcon(
                        notification.type
                      )}

                    </div>


                    {/* CONTENT */}

                    <div className="admin-notification-row-content">


                      <div className="admin-notification-row-top">


                        <div className="admin-notification-row-title">

                          <h3>
                            {notification.title}
                          </h3>


                          {!notification.read && (

                            <span className="admin-notification-new-badge">
                              NEW
                            </span>

                          )}

                        </div>


                        <span className="admin-notification-type">

                          {getNotificationTypeLabel(
                            notification.type
                          )}

                        </span>


                      </div>


                      <p>
                        {notification.message}
                      </p>


                      <div className="admin-notification-row-meta">


                        <span>
                          {notification.actorName
                            ? `By ${notification.actorName}`
                            : "System"}
                        </span>


                        <span>
                          •
                        </span>


                        <span>
                          {formatNotificationTime(
                            notification.createdAt
                          )}
                        </span>


                        {notification.entityType && (

                          <>
                            <span>
                              •
                            </span>

                            <span>
                              {notification.entityType}
                              {notification.entityId
                                ? ` #${notification.entityId}`
                                : ""}
                            </span>
                          </>

                        )}

                      </div>


                    </div>


                    {/* ACTION */}

                    <div className="admin-notification-row-action">

                      {!notification.read ? (

                        <button
                          type="button"
                          onClick={() =>
                            handleMarkAsRead(
                              notification
                            )
                          }
                          disabled={
                            processingId ===
                            notification.id
                          }
                        >

                          {processingId ===
                          notification.id
                            ? "..."
                            : "Mark as read"}

                        </button>

                      ) : (

                        <span className="admin-notification-read-label">
                          ✓ Read
                        </span>

                      )}

                    </div>


                  </div>

                )

              )

            )}

          </div>


          {/* PANEL FOOTER */}

          {!loading &&
            !error &&
            filteredNotifications.length > 0 && (

              <div className="admin-notifications-panel-footer">

                <span>
                  Showing {filteredNotifications.length} of{" "}
                  {totalCount} notifications
                </span>

              </div>

            )}


        </section>


      </main>

    </div>

  );
}


export default AdminNotifications;