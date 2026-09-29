import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import {
  getAllUsers,
  activateUser,
  deactivateUser,
} from "../../services/userService";

import "./Users.css";

function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const [confirmation, setConfirmation] = useState({
    open: false,
    user: null,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllUsers();

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EXPORT USERS TO EXCEL
  // =====================================================

  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      return;
    }

    const exportData = filteredUsers.map((user) => ({
      "User ID": user.id,
      Name: user.name,
      Email: user.email,
      Phone: user.phoneNumber || "Not Provided",
      Domain: user.domainName || "Not Assigned",
      Role: user.role || "USER",
      Status: user.active ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 24 },
      { wch: 32 },
      { wch: 16 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Users"
    );

    const date = new Date()
      .toISOString()
      .split("T")[0];

    XLSX.writeFile(
      workbook,
      `DFB_Users_${date}.xlsx`
    );
  };

  // =====================================================
  // OPEN CONFIRMATION
  // =====================================================

  const openConfirmation = (user) => {
    setConfirmation({
      open: true,
      user,
    });
  };

  // =====================================================
  // CLOSE CONFIRMATION
  // =====================================================

  const closeConfirmation = () => {
    if (updatingUserId !== null) {
      return;
    }

    setConfirmation({
      open: false,
      user: null,
    });
  };

  // =====================================================
  // ACTIVATE / DEACTIVATE USER
  // =====================================================

  const handleToggleStatus = async () => {
    const user = confirmation.user;

    if (!user) {
      return;
    }

    try {
      setUpdatingUserId(user.id);
      setError("");

      const updatedUser = user.active
        ? await deactivateUser(user.id)
        : await activateUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id
            ? updatedUser
            : currentUser
        )
      );

      setConfirmation({
        open: false,
        user: null,
      });
    } catch (err) {
      console.error(
        "Failed to update user status:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to update user status. Please try again."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // =====================================================
  // DOMAINS
  // =====================================================

  const domains = useMemo(() => {
    const uniqueDomains = [
      ...new Set(
        users
          .map((user) => user.domainName)
          .filter(Boolean)
      ),
    ];

    return uniqueDomains.sort();
  }, [users]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.active
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.active
  ).length;

  const totalDomains = domains.length;

  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !searchValue ||
        user.name
          ?.toLowerCase()
          .includes(searchValue) ||
        user.email
          ?.toLowerCase()
          .includes(searchValue) ||
        user.phoneNumber?.includes(searchValue);

      const matchesDomain =
        domainFilter === "ALL" ||
        user.domainName === domainFilter;

      return (
        matchesSearch &&
        matchesDomain
      );
    });
  }, [users, search, domainFilter]);

  return (
    <div className="admin-users-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="users-page-header">

        <div className="users-page-title">

          <span className="users-eyebrow">
            ADMIN PORTAL
          </span>

          <h1>
            Users
          </h1>

          <p>
            View registered users and manage
            their account status.
          </p>

        </div>


        <div className="users-header-actions">

          {/* DASHBOARD */}

          <button
            type="button"
            className="users-dashboard-button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <span className="users-button-icon">
              ←
            </span>

            Dashboard
          </button>


          {/* EXPORT EXCEL */}

          <button
            type="button"
            className="users-export-button"
            onClick={handleExportExcel}
            disabled={
              loading ||
              filteredUsers.length === 0
            }
          >
            <span className="users-button-icon">
              ↓
            </span>

            Export Excel
          </button>


          {/* REFRESH */}

          <button
            type="button"
            className="users-refresh-button"
            onClick={loadUsers}
            disabled={loading}
          >
            <span className="users-button-icon">
              ↻
            </span>

            Refresh
          </button>

        </div>

      </header>


      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section className="users-stats-grid">

        {/* TOTAL USERS */}

        <div className="users-stat-card">

          <div className="users-stat-content">

            <span className="users-stat-label">
              TOTAL USERS
            </span>

            <strong className="users-stat-value">
              {totalUsers}
            </strong>

          </div>

          <div className="users-stat-icon users-stat-icon-total">
            👥
          </div>

        </div>


        {/* ACTIVE USERS */}

        <div className="users-stat-card">

          <div className="users-stat-content">

            <span className="users-stat-label">
              ACTIVE USERS
            </span>

            <strong className="users-stat-value">
              {activeUsers}
            </strong>

          </div>

          <div className="users-stat-icon users-stat-icon-active">
            ✓
          </div>

        </div>


        {/* INACTIVE USERS */}

        <div className="users-stat-card">

          <div className="users-stat-content">

            <span className="users-stat-label">
              INACTIVE USERS
            </span>

            <strong className="users-stat-value">
              {inactiveUsers}
            </strong>

          </div>

          <div className="users-stat-icon users-stat-icon-inactive">
            −
          </div>

        </div>


        {/* TOTAL DOMAINS */}

        <div className="users-stat-card">

          <div className="users-stat-content">

            <span className="users-stat-label">
              TOTAL DOMAINS
            </span>

            <strong className="users-stat-value">
              {totalDomains}
            </strong>

          </div>

          <div className="users-stat-icon users-stat-icon-domain">
            ◈
          </div>

        </div>

      </section>


      {/* =====================================================
          FILTERS
      ====================================================== */}

      <section className="users-filter-card">

        <div className="users-search-wrapper">

          <span className="users-search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="users-search-input"
          />

        </div>


        <div className="users-filter-group">

          <label htmlFor="domain-filter">
            Domain
          </label>

          <select
            id="domain-filter"
            value={domainFilter}
            onChange={(event) =>
              setDomainFilter(event.target.value)
            }
            className="users-domain-select"
          >

            <option value="ALL">
              All Domains
            </option>

            {domains.map((domain) => (

              <option
                key={domain}
                value={domain}
              >
                {domain}
              </option>

            ))}

          </select>

        </div>


        {(search ||
          domainFilter !== "ALL") && (

          <button
            type="button"
            className="users-clear-filter"
            onClick={() => {
              setSearch("");
              setDomainFilter("ALL");
            }}
          >
            Clear
          </button>

        )}

      </section>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="users-error">

          <span>
            !
          </span>

          <div>

            <strong>
              Unable to complete request
            </strong>

            <p>
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={loadUsers}
          >
            Retry
          </button>

        </div>

      )}


      {/* =====================================================
          TABLE
      ====================================================== */}

      <section className="users-table-card">

        <div className="users-table-header">

          <div>

            <h2>
              User Directory
            </h2>

            <p>
              {loading
                ? "Loading users..."
                : `${filteredUsers.length} user${
                    filteredUsers.length === 1
                      ? ""
                      : "s"
                  } found`}
            </p>

          </div>


          {/* CURRENT FILTER STATUS */}

          {!loading &&
            filteredUsers.length > 0 && (
              <div className="users-table-summary">
                Showing{" "}
                <strong>
                  {filteredUsers.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {totalUsers}
                </strong>
              </div>
            )}

        </div>


        {loading ? (

          <div className="users-loading">

            <div className="users-spinner"></div>

            <p>
              Loading users...
            </p>

          </div>


        ) : filteredUsers.length === 0 ? (

          <div className="users-empty">

            <div className="users-empty-icon">
              👥
            </div>

            <h3>
              No users found
            </h3>

            <p>
              {search ||
              domainFilter !== "ALL"
                ? "Try changing your search or filter."
                : "There are no registered users yet."}
            </p>

          </div>


        ) : (

          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>

                <tr>

                  <th>
                    USER
                  </th>

                  <th>
                    EMAIL
                  </th>

                  <th>
                    PHONE
                  </th>

                  <th>
                    DOMAIN
                  </th>

                  <th>
                    ROLE
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredUsers.map((user) => (

                  <tr key={user.id}>

                    {/* USER */}

                    <td>

                      <div className="users-name-cell">

                        <div className="users-avatar">

                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "U"}

                        </div>


                        <div>

                          <span className="users-name">
                            {user.name}
                          </span>

                          <span className="users-user-id">
                            User #{user.id}
                          </span>

                        </div>

                      </div>

                    </td>


                    {/* EMAIL */}

                    <td>

                      <span className="users-email">
                        {user.email}
                      </span>

                    </td>


                    {/* PHONE */}

                    <td>

                      {user.phoneNumber ? (

                        <span className="users-phone">
                          {user.phoneNumber}
                        </span>

                      ) : (

                        <span className="users-no-phone">
                          Not Provided
                        </span>

                      )}

                    </td>


                    {/* DOMAIN */}

                    <td>

                      {user.domainName ? (

                        <span className="users-domain-badge">
                          {user.domainName}
                        </span>

                      ) : (

                        <span className="users-no-domain">
                          Not Assigned
                        </span>

                      )}

                    </td>


                    {/* ROLE */}

                    <td>

                      <span className="users-role-badge">
                        {user.role}
                      </span>

                    </td>


                    {/* STATUS */}

                    <td>

                      {user.active ? (

                        <span className="users-status-badge users-status-active">

                          <span className="users-status-dot"></span>

                          Active

                        </span>

                      ) : (

                        <span className="users-status-badge users-status-inactive">

                          <span className="users-status-dot"></span>

                          Inactive

                        </span>

                      )}

                    </td>


                    {/* ACTION */}

                    <td>

                      <button
                        type="button"
                        className={
                          user.active
                            ? "users-action-button users-deactivate-button"
                            : "users-action-button users-activate-button"
                        }
                        onClick={() =>
                          openConfirmation(user)
                        }
                        disabled={
                          updatingUserId === user.id
                        }
                      >

                        {user.active
                          ? "Deactivate"
                          : "Activate"}

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          CONFIRMATION MODAL
      ====================================================== */}

      {confirmation.open &&
        confirmation.user && (

          <div
            className="users-modal-overlay"
            onMouseDown={(event) => {

              if (
                event.target ===
                  event.currentTarget &&
                updatingUserId === null
              ) {
                closeConfirmation();
              }

            }}
          >

            <div
              className="users-confirmation-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="users-confirmation-title"
            >

              {/* MODAL ICON */}

              <div
                className={
                  confirmation.user.active
                    ? "users-confirmation-icon users-confirmation-icon-warning"
                    : "users-confirmation-icon users-confirmation-icon-success"
                }
              >

                {confirmation.user.active
                  ? "!"
                  : "✓"}

              </div>


              {/* MODAL CONTENT */}

              <div className="users-confirmation-content">

                <h3 id="users-confirmation-title">

                  {confirmation.user.active
                    ? "Deactivate User?"
                    : "Activate User?"}

                </h3>


                <p>

                  Are you sure you want to{" "}

                  <strong>
                    {confirmation.user.active
                      ? "deactivate"
                      : "activate"}
                  </strong>{" "}

                  <strong>
                    {confirmation.user.name}
                  </strong>
                  ?

                </p>


                <span className="users-confirmation-email">
                  {confirmation.user.email}
                </span>


                {confirmation.user.active ? (

                  <p className="users-confirmation-note">

                    This user will no longer
                    be able to log in, but
                    their existing record and
                    data will remain saved.

                  </p>

                ) : (

                  <p className="users-confirmation-note">

                    This user will be able to
                    log in and use the system
                    again.

                  </p>

                )}

              </div>


              {/* MODAL ACTIONS */}

              <div className="users-confirmation-actions">

                <button
                  type="button"
                  className="users-confirmation-cancel"
                  onClick={closeConfirmation}
                  disabled={
                    updatingUserId !== null
                  }
                >
                  Cancel
                </button>


                <button
                  type="button"
                  className={
                    confirmation.user.active
                      ? "users-confirmation-confirm users-confirmation-deactivate"
                      : "users-confirmation-confirm users-confirmation-activate"
                  }
                  onClick={handleToggleStatus}
                  disabled={
                    updatingUserId !== null
                  }
                >

                  {updatingUserId !== null
                    ? "Updating..."
                    : confirmation.user.active
                    ? "Yes, Deactivate"
                    : "Yes, Activate"}

                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Users;