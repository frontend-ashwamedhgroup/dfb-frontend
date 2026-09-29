import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  getAllAdminSubmissions,
  getAdminSubmissionById,
} from "../../services/adminSubmissionService";

import "./Submissions.css";

function Submissions() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // =========================================================
  // STATE
  // =========================================================

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDomain, setSelectedDomain] = useState("Agro");
  const [selectedVisitType, setSelectedVisitType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // =========================================================
  // LOAD SUBMISSIONS
  // =========================================================

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllAdminSubmissions();

      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load submissions:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load submissions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  // =========================================================
  // AVAILABLE DOMAINS
  // =========================================================

  const domains = useMemo(() => {
    const uniqueDomains = new Map();

    submissions.forEach((submission) => {
      if (submission.domainId && submission.domainName) {
        uniqueDomains.set(
          submission.domainId,
          submission.domainName
        );
      }
    });

    return Array.from(uniqueDomains.entries()).map(
      ([id, name]) => ({
        id,
        name,
      })
    );
  }, [submissions]);

  // =========================================================
  // VISIT TYPES FOR SELECTED DOMAIN
  // =========================================================

  const visitTypes = useMemo(() => {
    const uniqueVisitTypes = new Map();

    submissions
      .filter((submission) => {
        if (selectedDomain === "ALL") {
          return true;
        }

        return (
          submission.domainName?.toLowerCase() ===
          selectedDomain.toLowerCase()
        );
      })
      .forEach((submission) => {
        if (
          submission.visitTypeId &&
          submission.visitTypeName
        ) {
          uniqueVisitTypes.set(
            submission.visitTypeId,
            submission.visitTypeName
          );
        }
      });

    return Array.from(uniqueVisitTypes.entries()).map(
      ([id, name]) => ({
        id,
        name,
      })
    );
  }, [submissions, selectedDomain]);

  // =========================================================
  // RESET VISIT TYPE WHEN DOMAIN CHANGES
  // =========================================================

  const handleDomainChange = (event) => {
    const value = event.target.value;

    setSelectedDomain(value);
    setSelectedVisitType("ALL");
  };

  // =========================================================
  // FILTER SUBMISSIONS
  // =========================================================

  const filteredSubmissions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return submissions.filter((submission) => {
      // Domain filter
      const matchesDomain =
        selectedDomain === "ALL" ||
        submission.domainName?.toLowerCase() ===
          selectedDomain.toLowerCase();

      // Visit type filter
      const matchesVisitType =
        selectedVisitType === "ALL" ||
        String(submission.visitTypeId) ===
          String(selectedVisitType);

      if (!matchesDomain || !matchesVisitType) {
        return false;
      }

      // Search
      if (!search) {
        return true;
      }

      const basicSearchText = [
        submission.submissionId,
        submission.formName,
        submission.visitTypeName,
        submission.domainName,
        submission.submittedByName,
        submission.submittedByEmail,
        submission.submittedAt,
      ]
        .join(" ")
        .toLowerCase();

      const fieldSearchText = (submission.values || [])
        .map((field) => field.value)
        .join(" ")
        .toLowerCase();

      return (
        basicSearchText.includes(search) ||
        fieldSearchText.includes(search)
      );
    });
  }, [
    submissions,
    selectedDomain,
    selectedVisitType,
    searchTerm,
  ]);

  // =========================================================
  // DYNAMIC TABLE COLUMNS
  // =========================================================

  const dynamicColumns = useMemo(() => {
    const fields = new Map();

    filteredSubmissions.forEach((submission) => {
      (submission.values || []).forEach((field) => {
        if (!fields.has(field.fieldKey)) {
          fields.set(field.fieldKey, {
            fieldKey: field.fieldKey,
            fieldLabel: field.fieldLabel,
            fieldType: field.fieldType,
          });
        }
      });
    });

    return Array.from(fields.values());
  }, [filteredSubmissions]);

  // =========================================================
  // GET FIELD VALUE
  // =========================================================

  const getFieldValue = (submission, fieldKey) => {
    const field = (submission.values || []).find(
      (item) => item.fieldKey === fieldKey
    );

    if (!field || field.value === null || field.value === undefined) {
      return "—";
    }

    if (Array.isArray(field.value)) {
      return field.value.join(", ");
    }

    return String(field.value);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // VIEW DETAILS
  // =========================================================

  const handleViewDetails = async (submission) => {
    try {
      setDetailsLoading(true);

      const details = await getAdminSubmissionById(
        submission.submissionId
      );

      setSelectedSubmission(details);
    } catch (err) {
      console.error("Failed to load submission details:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load submission details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // =========================================================
  // CLOSE DETAILS
  // =========================================================

  const closeDetails = () => {
    if (!detailsLoading) {
      setSelectedSubmission(null);
    }
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSelectedDomain("Agro");
    setSelectedVisitType("ALL");
    setSearchTerm("");
  };

  // =========================================================
  // EXPORT
  // =========================================================

  const handleExport = () => {
    if (!filteredSubmissions.length) {
      return;
    }

    const headers = [
      "Submission ID",
      "Domain",
      "Visit Type",
      "Submitted By",
      "Email",
      "Submitted At",
      ...dynamicColumns.map(
        (column) => column.fieldLabel
      ),
    ];

    const rows = filteredSubmissions.map(
      (submission) => [
        submission.submissionId,
        submission.domainName || "",
        submission.visitTypeName || "",
        submission.submittedByName || "",
        submission.submittedByEmail || "",
        submission.submittedAt || "",
        ...dynamicColumns.map((column) =>
          getFieldValue(
            submission,
            column.fieldKey
          )
        ),
      ]
    );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const stringValue =
              value === null ||
              value === undefined
                ? ""
                : String(value);

            return `"${stringValue.replaceAll(
              '"',
              '""'
            )}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `dfb-submissions-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // STATS
  // =========================================================

  const totalSubmissions = filteredSubmissions.length;

  const uniqueUsers = new Set(
    filteredSubmissions.map(
      (submission) => submission.submittedById
    )
  ).size;

  const selectedDomainName =
    selectedDomain === "ALL"
      ? "All Domains"
      : selectedDomain;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-submissions-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-submissions-sidebar">

        {/* BRAND */}

        <div className="admin-submissions-brand">

          <div className="admin-submissions-logo">
            D
          </div>

          <div>
            <strong>Dynamic Form</strong>
            <span>Builder</span>
          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="admin-submissions-nav">

          <div className="admin-submissions-section-title">
            ADMIN PORTAL
          </div>

          <button
            type="button"
            className="admin-submissions-nav-item"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <span>▦</span>
            Dashboard
          </button>


          <div className="admin-submissions-section-title">
            MANAGEMENT
          </div>

          <button
            type="button"
            className="admin-submissions-nav-item"
            onClick={() =>
              navigate("/admin/domains")
            }
          >
            <span>◇</span>
            Domains
          </button>

          <button
            type="button"
            className="admin-submissions-nav-item"
            onClick={() =>
              navigate("/admin/visit-types")
            }
          >
            <span>◈</span>
            Visit Types
          </button>

          <button
            type="button"
            className="admin-submissions-nav-item"
            onClick={() =>
              navigate("/admin/forms")
            }
          >
            <span>▤</span>
            Forms
          </button>

          <button
            type="button"
            className="admin-submissions-nav-item"
            onClick={() =>
              navigate("/admin/form-builder")
            }
          >
            <span>⚙</span>
            Form Builder
          </button>


          <div className="admin-submissions-section-title">
            USERS & DATA
          </div>

          <button
            type="button"
            className="admin-submissions-nav-item"
            onClick={() =>
              navigate("/admin/users")
            }
          >
            <span>♙</span>
            Users
          </button>

          <button
            type="button"
            className="admin-submissions-nav-item active"
          >
            <span>▣</span>
            All Submissions
          </button>


          <div className="admin-submissions-section-title">
            SYSTEM
          </div>

          <button
            type="button"
            className="admin-submissions-nav-item"
            onClick={() =>
              navigate("/admin/notifications")
            }
          >
            <span>♢</span>
            Notifications
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


        {/* FOOTER */}

        <div className="admin-submissions-sidebar-footer">

          <div className="admin-submissions-profile">

            <div className="admin-submissions-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
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
            className="admin-submissions-logout"
            onClick={handleLogout}
          >
            ↪
            <span>Logout</span>
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-submissions-main">

        {/* HEADER */}

        <header className="admin-submissions-header">

          <div>

            <div className="admin-submissions-label">
              USERS & DATA
            </div>

            <h1>
              All Submissions
            </h1>

            <p>
              View and manage submitted visits across all domains.
            </p>

          </div>

          <button
            type="button"
            className="admin-submissions-export"
            onClick={handleExport}
            disabled={!filteredSubmissions.length}
          >
            <span>↓</span>
            Export Excel
          </button>

        </header>


        {/* ERROR */}

        {error && (
          <div className="admin-submissions-error">
            <span>!</span>
            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={loadSubmissions}
            >
              Retry
            </button>
          </div>
        )}


        {/* FILTER CARD */}

        <section className="admin-submissions-filter-card">

          <div className="admin-submissions-filter-header">

            <div>
              <h2>Submission Filters</h2>
              <p>
                Select a domain and visit type to view submissions.
              </p>
            </div>

            <button
              type="button"
              className="admin-submissions-clear"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>


          <div className="admin-submissions-filter-grid">

            {/* DOMAIN */}

            <div className="admin-submissions-field">

              <label>
                Domain
              </label>

              <select
                value={selectedDomain}
                onChange={handleDomainChange}
              >
                <option value="ALL">
                  All Domains
                </option>

                {domains.map((domain) => (
                  <option
                    key={domain.id}
                    value={domain.name}
                  >
                    {domain.name}
                  </option>
                ))}

              </select>

            </div>


            {/* VISIT TYPE */}

            <div className="admin-submissions-field">

              <label>
                Visit Type
              </label>

              <select
                value={selectedVisitType}
                onChange={(event) =>
                  setSelectedVisitType(
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  All Visit Types
                </option>

                {visitTypes.map((visitType) => (
                  <option
                    key={visitType.id}
                    value={visitType.id}
                  >
                    {visitType.name}
                  </option>
                ))}

              </select>

            </div>


            {/* SEARCH */}

            <div className="admin-submissions-field search-field">

              <label>
                Search
              </label>

              <div className="admin-submissions-search">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search user, email, visit or field..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>

        </section>


        {/* STAT BAR */}

        <section className="admin-submissions-summary">

          <div>
            <span>
              Showing
            </span>

            <strong>
              {totalSubmissions}
            </strong>

            <small>
              submissions
            </small>
          </div>

          <div>
            <span>
              Domain
            </span>

            <strong>
              {selectedDomainName}
            </strong>
          </div>

          <div>
            <span>
              Users
            </span>

            <strong>
              {uniqueUsers}
            </strong>
          </div>

        </section>


        {/* TABLE */}

        <section className="admin-submissions-table-card">

          <div className="admin-submissions-table-header">

            <div>
              <h2>
                Submission Records
              </h2>

              <p>
                Dynamic fields are displayed according to the submitted form.
              </p>
            </div>

          </div>


          {loading ? (

            <div className="admin-submissions-loading">

              <div className="admin-submissions-spinner" />

              <p>
                Loading submissions...
              </p>

            </div>

          ) : filteredSubmissions.length === 0 ? (

            <div className="admin-submissions-empty">

              <div className="admin-submissions-empty-icon">
                ▣
              </div>

              <h3>
                No submissions found
              </h3>

              <p>
                There are no submissions matching the selected filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <div className="admin-submissions-table-wrapper">

              <table className="admin-submissions-table">

                <thead>

                  <tr>

                    <th>
                      ID
                    </th>

                    <th>
                      SUBMITTED BY
                    </th>

                    <th>
                      VISIT TYPE
                    </th>

                    <th>
                      DATE
                    </th>

                    {dynamicColumns.map(
                      (column) => (
                        <th key={column.fieldKey}>
                          {column.fieldLabel}
                        </th>
                      )
                    )}

                    <th>
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredSubmissions.map(
                    (submission) => (

                      <tr
                        key={submission.submissionId}
                      >

                        <td>
                          <span className="submission-id">
                            #{submission.submissionId}
                          </span>
                        </td>


                        <td>

                          <div className="submission-user-cell">

                            <div className="submission-user-avatar">
                              {submission.submittedByName
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                            </div>

                            <div>

                              <strong>
                                {submission.submittedByName ||
                                  "Unknown User"}
                              </strong>

                              <span>
                                {submission.submittedByEmail ||
                                  "—"}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <div className="submission-visit-cell">

                            <strong>
                              {submission.visitTypeName}
                            </strong>

                            <span>
                              {submission.domainName}
                            </span>

                          </div>

                        </td>


                        <td>

                          <div className="submission-date-cell">

                            <strong>
                              {formatDate(
                                submission.submittedAt
                              )}
                            </strong>

                            <span>
                              {formatTime(
                                submission.submittedAt
                              )}
                            </span>

                          </div>

                        </td>


                        {dynamicColumns.map(
                          (column) => (

                            <td
                              key={`${submission.submissionId}-${column.fieldKey}`}
                            >
                              <span className="submission-value">
                                {getFieldValue(
                                  submission,
                                  column.fieldKey
                                )}
                              </span>
                            </td>

                          )
                        )}


                        <td>

                          <button
                            type="button"
                            className="submission-view-button"
                            onClick={() =>
                              handleViewDetails(
                                submission
                              )
                            }
                          >
                            <span>◉</span>
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>


      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedSubmission && (

        <div
          className="submission-modal-overlay"
          onMouseDown={closeDetails}
        >

          <div
            className="submission-details-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="submission-modal-header">

              <div>

                <div className="submission-modal-label">
                  SUBMISSION #{selectedSubmission.submissionId}
                </div>

                <h2>
                  {selectedSubmission.visitTypeName}
                </h2>

                <p>
                  {selectedSubmission.domainName}
                </p>

              </div>

              <button
                type="button"
                className="submission-modal-close"
                onClick={closeDetails}
              >
                ×
              </button>

            </div>


            {/* SUBMITTER INFO */}

            <div className="submission-modal-info">

              <div>

                <span>
                  Submitted By
                </span>

                <strong>
                  {selectedSubmission.submittedByName}
                </strong>

              </div>

              <div>

                <span>
                  Email
                </span>

                <strong>
                  {selectedSubmission.submittedByEmail}
                </strong>

              </div>

              <div>

                <span>
                  Submitted At
                </span>

                <strong>
                  {formatDate(
                    selectedSubmission.submittedAt
                  )}{" "}
                  {formatTime(
                    selectedSubmission.submittedAt
                  )}
                </strong>

              </div>

            </div>


            {/* VALUES */}

            <div className="submission-modal-body">

              <div className="submission-modal-section-title">
                Visit Information
              </div>

              {detailsLoading ? (

                <div className="submission-details-loading">
                  <div className="admin-submissions-spinner" />
                  Loading details...
                </div>

              ) : (

                <div className="submission-details-grid">

                  {(selectedSubmission.values || []).map(
                    (field) => (

                      <div
                        className="submission-detail-field"
                        key={field.fieldKey}
                      >

                        <span>
                          {field.fieldLabel}
                        </span>

                        <strong>
                          {field.value === null ||
                          field.value === undefined ||
                          field.value === ""
                            ? "—"
                            : String(field.value)}
                        </strong>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* MODAL FOOTER */}

            <div className="submission-modal-footer">

              <button
                type="button"
                className="submission-modal-done"
                onClick={closeDetails}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Submissions;