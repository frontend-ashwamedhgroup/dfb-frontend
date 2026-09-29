import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

import "./AdminDashboard.css";


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


function AdminDashboard() {

  const navigate = useNavigate();

  const { user, logout } = useAuth();


  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notificationLoading, setNotificationLoading] =
    useState(false);


  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  /*
   * Temporary dashboard data.
   *
   * IMPORTANT:
   * "Active Visit Types" means the number of configured
   * active visit types, NOT user submissions.
   *
   * Current system:
   * AGRO    = 3
   * POULTRY = 7
   * FMCG    = 3
   * TOTAL   = 13
   *
   * User and submission values will be connected
   * to backend APIs later.
   */

  const dashboardData = {

    totalUsers: 4,

    activeVisitTypes: 13,

    activeDomains: 3,

    totalSubmissions: 3,

    domains: [

      {
        id: 1,
        name: "AGRO",
        description: "Agriculture domain",
        icon: "🌿",
        active: true,
        visitTypes: 3,
        users: 1,
        submissions: 3,
      },

      {
        id: 2,
        name: "POULTRY",
        description: "Poultry domain",
        icon: "🐔",
        active: true,
        visitTypes: 7,
        users: 1,
        submissions: 2,
      },

      {
        id: 3,
        name: "FMCG",
        description: "FMCG domain",
        icon: "🛒",
        active: true,
        visitTypes: 3,
        users: 1,
        submissions: 2,
      },

    ],

  };


  const {
    totalUsers,
    activeVisitTypes,
    activeDomains,
    totalSubmissions,
    domains,
  } = dashboardData;


  // =====================================================
  // NOTIFICATION LOADING
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
          "Failed to load admin notifications:",
          error
        );

      } finally {

        setNotificationLoading(false);

      }

    };


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


  // =====================================================
  // MARK ONE NOTIFICATION AS READ
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
        "Failed to mark admin notification as read:",
        error
      );

    }

  };


  // =====================================================
  // MARK ALL AS READ
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
          "Failed to mark all admin notifications as read:",
          error
        );

      }

    };


  // =====================================================
  // VIEW ALL NOTIFICATIONS
  // =====================================================

  const handleViewAllNotifications = () => {

    setShowNotifications(false);

    navigate("/admin/notifications");

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    logout();

    navigate(
      "/admin/login",
      {
        replace: true,
      }
    );

  };


  // =====================================================
  // ACTIVITY BAR
  // =====================================================

  const maxSubmissions = Math.max(

    ...domains.map(
      (domain) => domain.submissions
    ),

    1

  );


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="admin-dashboard-page">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-dashboard-sidebar">


        {/* BRAND */}

        <div className="admin-sidebar-brand">

          <div className="admin-brand-logo">
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

        <nav className="admin-sidebar-nav">


          <div className="admin-nav-section-title">
            ADMIN PORTAL
          </div>


          <button
            type="button"
            className="admin-nav-item active"
          >
            <span className="admin-nav-icon">
              ▦
            </span>

            Dashboard
          </button>


          <div className="admin-nav-section-title">
            MANAGEMENT
          </div>


          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/domains")
            }
          >
            <span className="admin-nav-icon">
              ◇
            </span>

            Domains
          </button>


          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/visit-types")
            }
          >
            <span className="admin-nav-icon">
              ◈
            </span>

            Visit Types
          </button>


          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/forms")
            }
          >
            <span className="admin-nav-icon">
              ▤
            </span>

            Forms
          </button>


          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/form-builder")
            }
          >
            <span className="admin-nav-icon">
              ⚙
            </span>

            Form Builder
          </button>


          <div className="admin-nav-section-title">
            USERS & DATA
          </div>


          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/users")
            }
          >
            <span className="admin-nav-icon">
              ♙
            </span>

            Users
          </button>


          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/submissions")
            }
          >
            <span className="admin-nav-icon">
              ▣
            </span>

            All Submissions
          </button>


          <div className="admin-nav-section-title">
            SYSTEM
          </div>


          {/* NOTIFICATIONS */}

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/notifications")
            }
          >

            <span className="admin-nav-icon">
              ♢
            </span>

            <span>
              Notifications
            </span>

            {unreadCount > 0 && (

              <span className="admin-sidebar-notification-badge">

                {unreadCount > 99
                  ? "99+"
                  : unreadCount}

              </span>

            )}

          </button>


          {/* PROFILE */}

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

        <div className="admin-sidebar-footer">


          <div className="admin-profile-mini">

            <div className="admin-profile-avatar">

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
            className="admin-logout-button"
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
          MAIN CONTENT
      ===================================================== */}

      <main className="admin-dashboard-main">


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header className="admin-dashboard-header">


          <div>

            <div className="admin-page-label">
              ADMIN PORTAL
            </div>

            <h1>
              Dashboard
            </h1>

            <p>
              Overview of user activity and system performance.
            </p>

          </div>


          {/* =================================================
              ADMIN NOTIFICATION BELL
          ================================================= */}

          <div className="admin-header-actions">


            <div className="admin-notification-wrapper">


              <button
                type="button"
                className="admin-notification-button"
                aria-label="Admin notifications"
                onClick={() =>
                  setShowNotifications(
                    (previous) => !previous
                  )
                }
              >

                <span className="admin-notification-bell">
                  🔔
                </span>


                {unreadCount > 0 && (

                  <span className="admin-notification-badge">

                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}

                  </span>

                )}

              </button>


              {/* =================================================
                  DROPDOWN
              ================================================= */}

              {showNotifications && (

                <div className="admin-notification-dropdown">


                  {/* HEADER */}

                  <div className="admin-notification-dropdown-header">

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
                        className="admin-mark-all-button"
                        onClick={
                          handleMarkAllNotificationsAsRead
                        }
                      >
                        Mark all as read
                      </button>

                    )}

                  </div>


                  {/* BODY */}

                  <div className="admin-notification-dropdown-body">


                    {notificationLoading ? (

                      <div className="admin-notification-empty">

                        <div className="admin-notification-spinner"></div>

                        <span>
                          Loading notifications...
                        </span>

                      </div>

                    ) : notifications.length === 0 ? (

                      <div className="admin-notification-empty">

                        <div className="admin-notification-empty-icon">
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
                            className={`admin-notification-item ${
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

                            <div className="admin-notification-item-icon">

                              {getNotificationIcon(
                                notification.type
                              )}

                            </div>


                            <div className="admin-notification-item-content">


                              <div className="admin-notification-title-row">

                                <strong>
                                  {notification.title}
                                </strong>


                                {!notification.read && (

                                  <span className="admin-notification-unread-dot"></span>

                                )}

                              </div>


                              <p>
                                {notification.message}
                              </p>


                              <span className="admin-notification-time">

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

                    <div className="admin-notification-dropdown-footer">

                      <button
                        type="button"
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


            {/* ADMIN HEADER USER */}

            <div className="admin-header-user">

              <div className="admin-header-avatar">

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


          </div>


        </header>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="admin-statistics-grid">


          {/* TOTAL USERS */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon blue">
              ♙
            </div>

            <div className="admin-stat-content">

              <span>
                Total Users
              </span>

              <strong>
                {totalUsers.toLocaleString()}
              </strong>

              <small>
                Registered users
              </small>

            </div>

          </div>


          {/* ACTIVE VISIT TYPES */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon green">
              ◈
            </div>

            <div className="admin-stat-content">

              <span>
                Active Visit Types
              </span>

              <strong>
                {activeVisitTypes}
              </strong>

              <small>
                Available across domains
              </small>

            </div>

          </div>


          {/* ACTIVE DOMAINS */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon orange">
              ◇
            </div>

            <div className="admin-stat-content">

              <span>
                Active Domains
              </span>

              <strong>
                {activeDomains}
              </strong>

              <small>
                Available to users
              </small>

            </div>

          </div>


          {/* TOTAL SUBMISSIONS */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon purple">
              ▤
            </div>

            <div className="admin-stat-content">

              <span>
                Total Submissions
              </span>

              <strong>
                {totalSubmissions.toLocaleString()}
              </strong>

              <small>
                Forms submitted
              </small>

            </div>

          </div>


        </section>


        {/* =================================================
            DOMAIN PERFORMANCE
        ================================================= */}

        <section className="domain-performance-section">


          <div className="section-header">

            <div>

              <h2>
                Domain Performance
              </h2>

              <p>
                User activity and submission performance by domain.
              </p>

            </div>

          </div>


          <div className="domain-performance-list">


            {domains.map((domain) => {


              const activityPercentage =
                Math.round(
                  (domain.submissions / maxSubmissions) * 100
                );


              return (

                <div
                  className="domain-performance-card"
                  key={domain.id}
                >


                  {/* DOMAIN HEADER */}

                  <div className="domain-performance-top">


                    <div className="domain-performance-info">


                      <div
                        className={`domain-performance-icon domain-${domain.id}`}
                      >
                        {domain.icon}
                      </div>


                      <div>

                        <div className="domain-name-line">

                          <h3>
                            {domain.name}
                          </h3>


                          <span
                            className={
                              domain.active
                                ? "domain-active-badge"
                                : "domain-inactive-badge"
                            }
                          >

                            {domain.active
                              ? "Active"
                              : "Inactive"}

                          </span>

                        </div>


                        <p>
                          {domain.description}
                        </p>

                      </div>


                    </div>


                    {/* ACTIVE VISIT TYPES */}

                    <div className="domain-total-visits">

                      <strong>
                        {domain.visitTypes}
                      </strong>

                      <span>
                        Active Visit Types
                      </span>

                    </div>


                  </div>


                  {/* ACTIVITY BAR */}

                  <div className="domain-activity">

                    <div className="domain-activity-track">

                      <div
                        className={`domain-activity-fill fill-${domain.id}`}
                        style={{
                          width: `${activityPercentage}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* DOMAIN STATISTICS */}

                  <div className="domain-performance-stats">


                    <div>

                      <span>
                        Users
                      </span>

                      <strong>
                        {domain.users}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Submissions
                      </span>

                      <strong>
                        {domain.submissions.toLocaleString()}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Active Visit Types
                      </span>

                      <strong>
                        {domain.visitTypes}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Submission Activity
                      </span>

                      <strong>
                        {activityPercentage}%
                      </strong>

                    </div>


                  </div>


                </div>

              );

            })}


          </div>


        </section>


      </main>

    </div>

  );
}


export default AdminDashboard;