import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllDomains,
  activateDomain,
  deactivateDomain,
} from "../../services/domainService";

import "./Domains.css";

function Domains() {
  const navigate = useNavigate();

  /* =====================================================
     DOMAIN DATA
  ===================================================== */

  const [domains, setDomains] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =====================================================
     FILTER STATE
  ===================================================== */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* =====================================================
     STATUS MODAL
  ===================================================== */

  const [modalType, setModalType] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);

  const [error, setError] = useState("");

  /* =====================================================
     LOAD DOMAINS
  ===================================================== */

  const loadDomains = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllDomains();

      const formattedDomains = data.map((domain) => ({
        id: domain.id,
        name: domain.name,
        code: domain.code,
        description: domain.description || "",
        active: Boolean(domain.active),

        /*
         * Current DFB visit-type counts
         */
        visitTypes:
          domain.code === "AGRO"
            ? 3
            : domain.code === "POULTRY"
            ? 7
            : domain.code === "FMCG"
            ? 3
            : 0,

        /*
         * Domain icons
         */
        icon:
          domain.code === "AGRO"
            ? "🌿"
            : domain.code === "POULTRY"
            ? "🐔"
            : domain.code === "FMCG"
            ? "🛒"
            : "◇",

        iconClass:
          domain.code === "AGRO"
            ? "agro"
            : domain.code === "POULTRY"
            ? "poultry"
            : domain.code === "FMCG"
            ? "fmcg"
            : "default",
      }));

      setDomains(formattedDomains);

    } catch (err) {
      console.error(
        "Failed to load domains:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load domains from the server."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD DOMAINS ON PAGE LOAD
  ===================================================== */

  useEffect(() => {
    loadDomains();
  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredDomains = domains.filter((domain) => {
    const searchValue =
      search.toLowerCase().trim();

    const matchesSearch =
      domain.name
        .toLowerCase()
        .includes(searchValue) ||
      domain.code
        .toLowerCase()
        .includes(searchValue) ||
      domain.description
        .toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" &&
        domain.active) ||
      (statusFilter === "INACTIVE" &&
        !domain.active);

    return (
      matchesSearch &&
      matchesStatus
    );
  });

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalDomains =
    domains.length;

  const activeDomains =
    domains.filter(
      (domain) => domain.active
    ).length;

  const inactiveDomains =
    domains.filter(
      (domain) => !domain.active
    ).length;

  const totalVisitTypes =
    domains.reduce(
      (total, domain) =>
        total + domain.visitTypes,
      0
    );

  /* =====================================================
     OPEN STATUS MODAL
  ===================================================== */

  const openStatusModal = (domain) => {
    setSelectedDomain(domain);
    setError("");

    setModalType(
      domain.active
        ? "DEACTIVATE"
        : "ACTIVATE"
    );
  };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalType(null);
    setSelectedDomain(null);
    setError("");
  };

  /* =====================================================
     ACTIVATE / DEACTIVATE DOMAIN
  ===================================================== */

  const confirmStatusChange =
    async () => {

      if (
        !selectedDomain ||
        saving
      ) {
        return;
      }

      try {
        setSaving(true);
        setError("");

        /* ===============================================
           DEACTIVATE
        =============================================== */

        if (
          modalType ===
          "DEACTIVATE"
        ) {
          await deactivateDomain(
            selectedDomain.id
          );
        }

        /* ===============================================
           ACTIVATE
        =============================================== */

        if (
          modalType ===
          "ACTIVATE"
        ) {
          await activateDomain(
            selectedDomain.id
          );
        }

        /* ===============================================
           GET LATEST DATABASE DATA
        =============================================== */

        await loadDomains();

        setModalType(null);
        setSelectedDomain(null);

      } catch (err) {
        console.error(
          "Failed to change domain status:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to change domain status."
        );

      } finally {
        setSaving(false);
      }
    };

  /* =====================================================
     REFRESH
  ===================================================== */

  const handleRefresh =
    async () => {

      setSearch("");
      setStatusFilter("ALL");
      setError("");

      await loadDomains();
    };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="domains-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <header className="domains-header">

        <div className="domains-header-left">

          <div className="domains-title-icon">
            ◇
          </div>

          <div className="domains-title-content">

            <div className="domains-breadcrumb">
              Administration
              <span>/</span>
              Domains
            </div>

            <h1>
              Domains
            </h1>

            <p>
              Manage business domain
              availability and status.
            </p>

          </div>

        </div>


        <div className="domains-header-actions">

          <button
            type="button"
            className="back-dashboard-button"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
          >
            <span>←</span>
            Back to Dashboard
          </button>

        </div>

      </header>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && !modalType && (
        <div className="admin-form-error">

          <span>!</span>

          {error}

        </div>
      )}


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <section className="domain-summary-grid">

        {/* TOTAL */}

        <div className="domain-summary-card">

          <div className="summary-icon blue">
            ◇
          </div>

          <div className="summary-content">

            <span>
              Total Domains
            </span>

            <strong>
              {totalDomains}
            </strong>

            <small>
              Business domains
            </small>

          </div>

        </div>


        {/* ACTIVE */}

        <div className="domain-summary-card">

          <div className="summary-icon green">
            ✓
          </div>

          <div className="summary-content">

            <span>
              Active Domains
            </span>

            <strong>
              {activeDomains}
            </strong>

            <small>
              Currently available
            </small>

          </div>

        </div>


        {/* INACTIVE */}

        <div className="domain-summary-card">

          <div className="summary-icon orange">
            ⊘
          </div>

          <div className="summary-content">

            <span>
              Inactive Domains
            </span>

            <strong>
              {inactiveDomains}
            </strong>

            <small>
              Currently disabled
            </small>

          </div>

        </div>


        {/* VISIT TYPES */}

        <div className="domain-summary-card">

          <div className="summary-icon purple">
            ◆
          </div>

          <div className="summary-content">

            <span>
              Total Visit Types
            </span>

            <strong>
              {totalVisitTypes}
            </strong>

            <small>
              Across all domains
            </small>

          </div>

        </div>

      </section>


      {/* =================================================
          TABLE
      ================================================= */}

      <section className="domains-table-card">

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="domains-table-toolbar">

          <div className="domain-search-box">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by domain name, code or description..."
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>


          <div className="toolbar-right">

            <div className="domain-filter">

              <label htmlFor="domain-status">
                Status
              </label>

              <select
                id="domain-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All Domains
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

              </select>

            </div>


            <button
              type="button"
              className="refresh-button"
              onClick={handleRefresh}
              disabled={loading}
            >
              ↻{" "}
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>

        </div>


        {/* =================================================
            TABLE HEADER
        ================================================= */}

        <div className="domains-table-head">

          <span className="col-number">
            #
          </span>

          <span className="col-domain">
            DOMAIN
          </span>

          <span className="col-code">
            CODE
          </span>

          <span className="col-visits">
            VISIT TYPES
          </span>

          <span className="col-status">
            STATUS
          </span>

          <span className="col-actions">
            ACTIONS
          </span>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="domains-empty">

            <div className="empty-icon">
              ↻
            </div>

            <h3>
              Loading domains...
            </h3>

            <p>
              Fetching the latest
              domain information.
            </p>

          </div>

        ) : filteredDomains.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="domains-empty">

            <div className="empty-icon">
              ⌕
            </div>

            <h3>
              No domains found
            </h3>

            <p>
              Try changing your search
              or status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter(
                  "ALL"
                );
              }}
            >
              Clear Filters
            </button>

          </div>

        ) : (

          /* =================================================
             DOMAIN ROWS
          ================================================= */

          filteredDomains.map(
            (domain, index) => (

              <div
                className="domains-table-row"
                key={domain.id}
              >

                {/* NUMBER */}

                <span className="domain-number">
                  {index + 1}
                </span>


                {/* DOMAIN */}

                <div className="domain-name-cell">

                  <div
                    className={`domain-avatar ${domain.iconClass}`}
                  >
                    {domain.icon}
                  </div>

                  <div className="domain-name-content">

                    <strong>
                      {domain.name}
                    </strong>

                    <small>
                      {domain.description}
                    </small>

                  </div>

                </div>


                {/* CODE */}

                <span className="domain-code">
                  {domain.code}
                </span>


                {/* VISIT TYPES */}

                <div className="domain-visit-types">

                  <strong>
                    {domain.visitTypes}
                  </strong>

                  <small>
                    Visit Types
                  </small>

                </div>


                {/* STATUS */}

                <span
                  className={
                    domain.active
                      ? "domain-status active"
                      : "domain-status inactive"
                  }
                >

                  <span className="status-dot" />

                  {domain.active
                    ? "Active"
                    : "Inactive"}

                </span>


                {/* ACTION */}

                <div className="domain-actions">

                  <button
                    type="button"
                    className={
                      domain.active
                        ? "domain-action status"
                        : "domain-action activate"
                    }
                    title={
                      domain.active
                        ? "Deactivate Domain"
                        : "Activate Domain"
                    }
                    onClick={() =>
                      openStatusModal(
                        domain
                      )
                    }
                  >

                    {domain.active
                      ? "⊘"
                      : "✓"}

                  </button>

                </div>

              </div>

            )
          )

        )}


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="domains-footer">

          <span>
            Showing{" "}
            <strong>
              {filteredDomains.length}
            </strong>{" "}
            of{" "}
            <strong>
              {domains.length}
            </strong>{" "}
            domains
          </span>

        </div>

      </section>


      {/* =================================================
          INFORMATION BANNER
      ================================================= */}

      <section className="domain-info-banner">

        <div className="domain-info-icon">
          🛡
        </div>

        <div className="domain-info-content">

          <strong>
            Domain Inactivation
          </strong>

          <p>
            Deactivated domains remain visible
            to existing users but cannot be used
            for new activity. Activating a domain
            restores user access.
          </p>

        </div>

      </section>


      {/* =================================================
          ACTIVATE / DEACTIVATE MODAL
      ================================================= */}

      {(modalType === "ACTIVATE" ||
        modalType === "DEACTIVATE") && (

        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="admin-confirm-modal">

            {/* ICON */}

            <div
              className={
                modalType ===
                "DEACTIVATE"
                  ? "confirm-icon warning"
                  : "confirm-icon success"
              }
            >

              {modalType ===
              "DEACTIVATE"
                ? "⊘"
                : "✓"}

            </div>


            {/* BADGE */}

            <div className="confirm-badge">
              DOMAIN STATUS
            </div>


            {/* TITLE */}

            <h2>

              {modalType ===
              "DEACTIVATE"
                ? "Deactivate Domain?"
                : "Activate Domain?"}

            </h2>


            {/* DESCRIPTION */}

            <p>

              {modalType ===
              "DEACTIVATE"
                ? `Are you sure you want to deactivate ${selectedDomain?.name}?`
                : `Are you sure you want to activate ${selectedDomain?.name}?`}

            </p>


            {/* WARNING / SUCCESS */}

            <div
              className={
                modalType ===
                "DEACTIVATE"
                  ? "confirm-warning-box"
                  : "confirm-success-box"
              }
            >

              <strong>

                {modalType ===
                "DEACTIVATE"
                  ? "User access will be affected"
                  : "User access will be restored"}

              </strong>


              <span>

                {modalType ===
                "DEACTIVATE"
                  ? "Users assigned to this domain will see it as inactive and should not be able to create new submissions."
                  : "Users assigned to this domain will be able to use the domain again."}

              </span>

            </div>


            {/* ERROR */}

            {error && (
              <div className="admin-form-error">

                <span>!</span>

                {error}

              </div>
            )}


            {/* ACTIONS */}

            <div className="confirm-actions">

              <button
                type="button"
                className="admin-cancel-button"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>


              <button
                type="button"
                className={
                  modalType ===
                  "DEACTIVATE"
                    ? "confirm-danger-button"
                    : "confirm-success-button"
                }
                onClick={
                  confirmStatusChange
                }
                disabled={saving}
              >

                {saving
                  ? "Please wait..."
                  : modalType ===
                    "DEACTIVATE"
                  ? "Deactivate Domain"
                  : "Activate Domain"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Domains;