import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./AdminProfile.css";

function AdminProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/admin/login", {
      replace: true,
    });
  };

  const adminName = user?.name || "Administrator";

  const adminInitial =
    adminName.charAt(0)?.toUpperCase() || "A";

  return (
    <div className="admin-profile-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-profile-sidebar">

        {/* BRAND */}

        <div className="admin-profile-brand">

          <div className="admin-profile-brand-logo">
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

        <nav className="admin-profile-nav">

          <div className="admin-profile-section-title">
            ADMIN PORTAL
          </div>

          <button
            type="button"
            className="admin-profile-nav-item"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <span className="admin-profile-nav-icon">
              ▦
            </span>

            Dashboard
          </button>


          <div className="admin-profile-section-title">
            MANAGEMENT
          </div>

          <button
            type="button"
            className="admin-profile-nav-item"
            onClick={() =>
              navigate("/admin/domains")
            }
          >
            <span className="admin-profile-nav-icon">
              ◇
            </span>

            Domains
          </button>

          <button
            type="button"
            className="admin-profile-nav-item"
            onClick={() =>
              navigate("/admin/visit-types")
            }
          >
            <span className="admin-profile-nav-icon">
              ◈
            </span>

            Visit Types
          </button>

          <button
            type="button"
            className="admin-profile-nav-item"
            onClick={() =>
              navigate("/admin/forms")
            }
          >
            <span className="admin-profile-nav-icon">
              ▤
            </span>

            Forms
          </button>

          <button
            type="button"
            className="admin-profile-nav-item"
            onClick={() =>
              navigate("/admin/form-builder")
            }
          >
            <span className="admin-profile-nav-icon">
              ⚙
            </span>

            Form Builder
          </button>


          <div className="admin-profile-section-title">
            USERS & DATA
          </div>

          <button
            type="button"
            className="admin-profile-nav-item"
            onClick={() =>
              navigate("/admin/users")
            }
          >
            <span className="admin-profile-nav-icon">
              ♙
            </span>

            Users
          </button>

          <button
            type="button"
            className="admin-profile-nav-item"
            onClick={() =>
              navigate("/admin/submissions")
            }
          >
            <span className="admin-profile-nav-icon">
              ▣
            </span>

            All Submissions
          </button>


          <div className="admin-profile-section-title">
            SYSTEM
          </div>

          <button
            type="button"
            className="admin-profile-nav-item"
            onClick={() =>
              navigate("/admin/notifications")
            }
          >
            <span className="admin-profile-nav-icon">
              ♢
            </span>

            Notifications
          </button>


          {/* PROFILE */}

          <button
            type="button"
            className="admin-profile-nav-item active"
          >
            <span className="admin-profile-nav-icon">
              ♙
            </span>

            Profile
          </button>

        </nav>


        {/* SIDEBAR FOOTER */}

        <div className="admin-profile-sidebar-footer">

          <div className="admin-profile-mini">

            <div className="admin-profile-mini-avatar">
              {adminInitial}
            </div>

            <div>

              <strong>
                {adminName}
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>


          <button
            type="button"
            className="admin-profile-logout"
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

      <main className="admin-profile-main">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="admin-profile-header">

          <div>

            <div className="admin-profile-page-label">
              ADMIN PORTAL
            </div>

            <h1>
              Profile
            </h1>

            <p>
              View your administrator account information.
            </p>

          </div>


          {/* HEADER USER */}

          <div className="admin-profile-header-user">

            <div className="admin-profile-header-avatar">
              {adminInitial}
            </div>

            <div>

              <strong>
                {adminName}
              </strong>

              <span>
                ADMIN
              </span>

            </div>

          </div>

        </header>


        {/* =================================================
            PROFILE CONTENT
        ================================================= */}

        <section className="admin-profile-content">


          {/* PROFILE HERO */}

          <div className="admin-profile-card admin-profile-hero">

            <div className="admin-profile-large-avatar">
              {adminInitial}
            </div>

            <div className="admin-profile-hero-info">

              <span className="admin-profile-role-badge">
                ADMINISTRATOR
              </span>

              <h2>
                {adminName}
              </h2>

              <p>
                Dynamic Form Builder Administrator
              </p>

            </div>

          </div>


          {/* ACCOUNT INFORMATION */}

          <div className="admin-profile-card">

            <div className="admin-profile-card-header">

              <div>

                <h2>
                  Account Information
                </h2>

                <p>
                  Your registered administrator account details.
                </p>

              </div>

              <div className="admin-profile-card-icon">
                ♙
              </div>

            </div>


            <div className="admin-profile-details-grid">


              {/* NAME */}

              <div className="admin-profile-detail">

                <span>
                  Full Name
                </span>

                <strong>
                  {user?.name || "Not available"}
                </strong>

              </div>


              {/* EMAIL */}

              <div className="admin-profile-detail">

                <span>
                  Email Address
                </span>

                <strong>
                  {user?.email || "Not available"}
                </strong>

              </div>


              {/* ROLE */}

              <div className="admin-profile-detail">

                <span>
                  Role
                </span>

                <strong>
                  {user?.role || "ADMIN"}
                </strong>

              </div>


              {/* DOMAIN */}

              <div className="admin-profile-detail">

                <span>
                  Domain Access
                </span>

                <strong>
                  All Domains
                </strong>

              </div>


              {/* STATUS */}

              <div className="admin-profile-detail">

                <span>
                  Account Status
                </span>

                <strong className="admin-profile-status">
                  <span className="admin-profile-status-dot"></span>
                  Active
                </strong>

              </div>


              {/* ACCESS */}

              <div className="admin-profile-detail">

                <span>
                  Access Level
                </span>

                <strong>
                  Administrator
                </strong>

              </div>


            </div>

          </div>


          {/* ADMIN ACCESS */}

          <div className="admin-profile-card">

            <div className="admin-profile-card-header">

              <div>

                <h2>
                  Administrator Access
                </h2>

                <p>
                  Areas available to your administrator account.
                </p>

              </div>

              <div className="admin-profile-card-icon">
                🔐
              </div>

            </div>


            <div className="admin-profile-access-grid">


              <div className="admin-profile-access-item">

                <div className="admin-profile-access-icon">
                  ◇
                </div>

                <div>

                  <strong>
                    Domain Management
                  </strong>

                  <span>
                    Manage domain availability and configuration.
                  </span>

                </div>

              </div>


              <div className="admin-profile-access-item">

                <div className="admin-profile-access-icon">
                  ◈
                </div>

                <div>

                  <strong>
                    Visit Type Management
                  </strong>

                  <span>
                    Manage available visit types.
                  </span>

                </div>

              </div>


              <div className="admin-profile-access-item">

                <div className="admin-profile-access-icon">
                  ▤
                </div>

                <div>

                  <strong>
                    Form Management
                  </strong>

                  <span>
                    Create and manage dynamic forms.
                  </span>

                </div>

              </div>


              <div className="admin-profile-access-item">

                <div className="admin-profile-access-icon">
                  ♙
                </div>

                <div>

                  <strong>
                    User Management
                  </strong>

                  <span>
                    View and manage registered users.
                  </span>

                </div>

              </div>


              <div className="admin-profile-access-item">

                <div className="admin-profile-access-icon">
                  ▣
                </div>

                <div>

                  <strong>
                    Submission Management
                  </strong>

                  <span>
                    View submitted forms and visit data.
                  </span>

                </div>

              </div>


              <div className="admin-profile-access-item">

                <div className="admin-profile-access-icon">
                  ♢
                </div>

                <div>

                  <strong>
                    Notifications
                  </strong>

                  <span>
                    Review system and user activity notifications.
                  </span>

                </div>

              </div>


            </div>

          </div>


          {/* QUICK ACTIONS */}

          <div className="admin-profile-card">

            <div className="admin-profile-card-header">

              <div>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Quickly access frequently used administrator areas.
                </p>

              </div>

            </div>


            <div className="admin-profile-actions">

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/dashboard")
                }
              >
                <span>
                  ▦
                </span>

                Dashboard
              </button>


              <button
                type="button"
                onClick={() =>
                  navigate("/admin/users")
                }
              >
                <span>
                  ♙
                </span>

                Users
              </button>


              <button
                type="button"
                onClick={() =>
                  navigate("/admin/submissions")
                }
              >
                <span>
                  ▣
                </span>

                Submissions
              </button>


              <button
                type="button"
                onClick={() =>
                  navigate("/admin/notifications")
                }
              >
                <span>
                  ♢
                </span>

                Notifications
              </button>

            </div>

          </div>


        </section>


      </main>

    </div>
  );
}

export default AdminProfile;