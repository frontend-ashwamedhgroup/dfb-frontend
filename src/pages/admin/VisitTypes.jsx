import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllDomains,
} from "../../services/domainService";

import {
  getVisitTypesByDomain,
  createVisitType,
  updateVisitType,
  activateVisitType,
  deactivateVisitType,
  getVisitTypeDeleteInfo,
  deleteVisitType,
} from "../../services/visitTypeService";

import "./VisitTypes.css";

function VisitTypes() {
  const navigate = useNavigate();

  /* =====================================================
     DATA
  ===================================================== */

  const [domains, setDomains] = useState([]);
  const [visitTypes, setVisitTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =====================================================
     FILTER STATE
  ===================================================== */

  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* =====================================================
     MODAL STATE
  ===================================================== */

  const [modalType, setModalType] = useState(null);

  const [selectedVisitType, setSelectedVisitType] =
    useState(null);

  const [visitTypeName, setVisitTypeName] =
    useState("");

  const [selectedDomainId, setSelectedDomainId] =
    useState("");

  const [error, setError] = useState("");

  /* =====================================================
     DELETE STATE
  ===================================================== */

  const [deleteInfo, setDeleteInfo] =
    useState(null);

  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const domainData = await getAllDomains();

      setDomains(domainData);

      const results = await Promise.all(
        domainData.map(async (domain) => {
          try {
            return await getVisitTypesByDomain(
              domain.id
            );
          } catch (err) {
            console.error(
              `Failed to load visit types for ${domain.name}`,
              err
            );

            return [];
          }
        })
      );

      const allVisitTypes =
        results.flat();

      setVisitTypes(
        allVisitTypes
      );

    } catch (err) {
      console.error(
        "Failed to load visit types:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load visit types from the server."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredVisitTypes =
    visitTypes.filter((visitType) => {

      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        visitType.name
          .toLowerCase()
          .includes(searchValue) ||
        visitType.domainName
          .toLowerCase()
          .includes(searchValue);

      const matchesDomain =
        domainFilter === "ALL" ||
        String(visitType.domainId) ===
          String(domainFilter);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          visitType.active) ||
        (statusFilter === "INACTIVE" &&
          !visitType.active);

      return (
        matchesSearch &&
        matchesDomain &&
        matchesStatus
      );
    });

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalVisitTypes =
    visitTypes.length;

  const activeVisitTypes =
    visitTypes.filter(
      (visitType) =>
        visitType.active
    ).length;

  const inactiveVisitTypes =
    visitTypes.filter(
      (visitType) =>
        !visitType.active
    ).length;

  const totalDomains =
    domains.length;

  /* =====================================================
     OPEN ADD MODAL
  ===================================================== */

  const openAddModal = () => {
    setModalType("ADD");

    setSelectedVisitType(null);

    setVisitTypeName("");

    setSelectedDomainId(
      domains.length > 0
        ? String(domains[0].id)
        : ""
    );

    setError("");
  };

  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const openEditModal = (
    visitType
  ) => {

    setModalType("EDIT");

    setSelectedVisitType(
      visitType
    );

    setVisitTypeName(
      visitType.name
    );

    setSelectedDomainId(
      String(visitType.domainId)
    );

    setError("");
  };

  /* =====================================================
     OPEN STATUS MODAL
  ===================================================== */

  const openStatusModal = (
    visitType
  ) => {

    setModalType(
      visitType.active
        ? "DEACTIVATE"
        : "ACTIVATE"
    );

    setSelectedVisitType(
      visitType
    );

    setError("");
  };

  /* =====================================================
     OPEN DELETE MODAL
  ===================================================== */

  const openDeleteModal = async (
    visitType
  ) => {

    try {

      setSaving(true);

      setError("");

      setDeleteInfo(null);

      setDeleteConfirmation("");

      setSelectedVisitType(
        visitType
      );

      setModalType("DELETE");


      const info =
        await getVisitTypeDeleteInfo(
          visitType.id
        );


      setDeleteInfo(info);

    } catch (err) {

      console.error(
        "Failed to get delete information:",
        err
      );

      setModalType(null);

      setSelectedVisitType(null);

      setError(
        err.response?.data?.message ||
          "Unable to check visit type deletion information."
      );

    } finally {

      setSaving(false);
    }
  };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {

    if (saving) {
      return;
    }

    setModalType(null);

    setSelectedVisitType(null);

    setVisitTypeName("");

    setSelectedDomainId("");

    setDeleteInfo(null);

    setDeleteConfirmation("");

    setError("");
  };

  /* =====================================================
     SAVE ADD / EDIT
  ===================================================== */

  const handleSave = async () => {

    const trimmedName =
      visitTypeName.trim();


    if (!trimmedName) {

      setError(
        "Visit Type name is required."
      );

      return;
    }


    if (
      trimmedName.length < 2
    ) {

      setError(
        "Visit Type name must contain at least 2 characters."
      );

      return;
    }


    if (
      modalType === "ADD" &&
      !selectedDomainId
    ) {

      setError(
        "Please select a domain."
      );

      return;
    }


    try {

      setSaving(true);

      setError("");


      /* ===============================================
         CREATE
      =============================================== */

      if (
        modalType === "ADD"
      ) {

        await createVisitType(
          Number(selectedDomainId),
          trimmedName
        );
      }


      /* ===============================================
         UPDATE
      =============================================== */

      if (
        modalType === "EDIT"
      ) {

        await updateVisitType(
          selectedVisitType.id,
          trimmedName
        );
      }


      /* ===============================================
         GET LATEST DATABASE DATA
      =============================================== */

      await loadData();

      closeModal();

    } catch (err) {

      console.error(
        "Failed to save visit type:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save visit type."
      );

    } finally {

      setSaving(false);
    }
  };

  /* =====================================================
     CONFIRM STATUS CHANGE
  ===================================================== */

  const confirmStatusChange =
    async () => {

      if (
        !selectedVisitType ||
        saving
      ) {

        return;
      }


      try {

        setSaving(true);

        setError("");


        if (
          modalType ===
          "DEACTIVATE"
        ) {

          await deactivateVisitType(
            selectedVisitType.id
          );
        }


        if (
          modalType ===
          "ACTIVATE"
        ) {

          await activateVisitType(
            selectedVisitType.id
          );
        }


        await loadData();


        setModalType(null);

        setSelectedVisitType(null);

      } catch (err) {

        console.error(
          "Failed to change visit type status:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to change visit type status."
        );

      } finally {

        setSaving(false);
      }
    };

  /* =====================================================
     CONFIRM PERMANENT DELETE
  ===================================================== */

  const confirmDelete =
    async () => {

      if (
        !selectedVisitType ||
        saving
      ) {

        return;
      }


      /* ===============================================
         IF SUBMISSIONS EXIST
         REQUIRE DELETE CONFIRMATION
      =============================================== */

      if (
        deleteInfo?.hasSubmissions &&
        deleteConfirmation !== "DELETE"
      ) {

        setError(
          "Please type DELETE exactly to confirm permanent deletion."
        );

        return;
      }


      try {

        setSaving(true);

        setError("");


        await deleteVisitType(
          selectedVisitType.id
        );


        /* =============================================
           REFRESH DATABASE DATA
        ============================================= */

        await loadData();


        setModalType(null);

        setSelectedVisitType(null);

        setDeleteInfo(null);

        setDeleteConfirmation("");

      } catch (err) {

        console.error(
          "Failed to delete visit type:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to permanently delete visit type."
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

      setDomainFilter("ALL");

      setStatusFilter("ALL");

      setError("");

      await loadData();
    };

  /* =====================================================
     DOMAIN ICON
  ===================================================== */

  const getDomainIcon = (
    domainName
  ) => {

    const name =
      domainName.toLowerCase();


    if (
      name.includes("agro")
    ) {

      return "🌿";
    }


    if (
      name.includes("poultry")
    ) {

      return "🐔";
    }


    if (
      name.includes("fmcg")
    ) {

      return "🛒";
    }


    return "◇";
  };

  /* =====================================================
     DOMAIN CLASS
  ===================================================== */

  const getDomainClass = (
    domainName
  ) => {

    const name =
      domainName.toLowerCase();


    if (
      name.includes("agro")
    ) {

      return "agro";
    }


    if (
      name.includes("poultry")
    ) {

      return "poultry";
    }


    if (
      name.includes("fmcg")
    ) {

      return "fmcg";
    }


    return "default";
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="visit-types-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <header className="visit-types-header">

        <div className="visit-types-header-left">

          <div className="visit-types-title-icon">
            ◆
          </div>


          <div className="visit-types-title-content">

            <div className="visit-types-breadcrumb">

              Administration

              <span>
                /
              </span>

              Visit Types

            </div>


            <h1>
              Visit Types
            </h1>


            <p>
              Manage domain-specific visit types
              and their availability.
            </p>

          </div>

        </div>


        <div className="visit-types-header-actions">

          <button
            type="button"
            className="back-dashboard-button"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
          >

            <span>
              ←
            </span>

            Back to Dashboard

          </button>


          <button
            type="button"
            className="add-visit-type-button"
            onClick={
              openAddModal
            }
          >

            <span>
              +
            </span>

            Add Visit Type

          </button>

        </div>

      </header>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && !modalType && (

        <div className="admin-form-error">

          <span>
            !
          </span>

          {error}

        </div>

      )}


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <section className="visit-type-summary-grid">


        <div className="visit-type-summary-card">

          <div className="summary-icon blue">
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


        <div className="visit-type-summary-card">

          <div className="summary-icon green">
            ✓
          </div>


          <div className="summary-content">

            <span>
              Active Visit Types
            </span>


            <strong>
              {activeVisitTypes}
            </strong>


            <small>
              Currently available
            </small>

          </div>

        </div>


        <div className="visit-type-summary-card">

          <div className="summary-icon orange">
            ⊘
          </div>


          <div className="summary-content">

            <span>
              Inactive Visit Types
            </span>


            <strong>
              {inactiveVisitTypes}
            </strong>


            <small>
              Currently disabled
            </small>

          </div>

        </div>


        <div className="visit-type-summary-card">

          <div className="summary-icon purple">
            ◇
          </div>


          <div className="summary-content">

            <span>
              Domains
            </span>


            <strong>
              {totalDomains}
            </strong>


            <small>
              Visit type categories
            </small>

          </div>

        </div>

      </section>


      {/* =================================================
          TABLE
      ================================================= */}

      <section className="visit-types-table-card">


        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="visit-types-table-toolbar">

          <div className="visit-type-search-box">

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
              placeholder="Search by visit type or domain..."
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


            <div className="visit-type-filter">

              <label htmlFor="visit-domain">
                Domain
              </label>


              <select
                id="visit-domain"
                value={domainFilter}
                onChange={(event) =>
                  setDomainFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All Domains
                </option>


                {domains.map(
                  (domain) => (

                    <option
                      key={domain.id}
                      value={domain.id}
                    >
                      {domain.name}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="visit-type-filter">

              <label htmlFor="visit-status">
                Status
              </label>


              <select
                id="visit-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All
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
              onClick={
                handleRefresh
              }
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

        <div className="visit-types-table-head">

          <span className="col-number">
            #
          </span>


          <span className="col-visit-name">
            VISIT TYPE
          </span>


          <span className="col-domain">
            DOMAIN
          </span>


          <span className="col-form">
            FORM
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

          <div className="visit-types-empty">

            <div className="empty-icon">
              ↻
            </div>


            <h3>
              Loading visit types...
            </h3>


            <p>
              Fetching the latest
              visit type information.
            </p>

          </div>

        ) : filteredVisitTypes.length === 0 ? (

          <div className="visit-types-empty">

            <div className="empty-icon">
              ⌕
            </div>


            <h3>
              No visit types found
            </h3>


            <p>
              Try changing your search
              or filters.
            </p>


            <button
              type="button"
              onClick={() => {

                setSearch("");

                setDomainFilter(
                  "ALL"
                );

                setStatusFilter(
                  "ALL"
                );

              }}
            >
              Clear Filters
            </button>

          </div>

        ) : (

          filteredVisitTypes.map(
            (visitType, index) => (

              <div
                className="visit-types-table-row"
                key={visitType.id}
              >


                {/* NUMBER */}

                <span className="visit-type-number">
                  {index + 1}
                </span>


                {/* VISIT TYPE */}

                <div className="visit-name-cell">

                  <div
                    className={`visit-avatar ${getDomainClass(
                      visitType.domainName
                    )}`}
                  >

                    {getDomainIcon(
                      visitType.domainName
                    )}

                  </div>


                  <div className="visit-name-content">

                    <strong>
                      {visitType.name}
                    </strong>


                    <small>
                      Visit Type #{visitType.id}
                    </small>

                  </div>

                </div>


                {/* DOMAIN */}

                <div className="visit-domain-cell">

                  <span
                    className={`domain-pill ${getDomainClass(
                      visitType.domainName
                    )}`}
                  >

                    {visitType.domainName}

                  </span>

                </div>


                {/* FORM */}

                <div className="visit-form-cell">

                  <span className="form-association">
                    ◆
                  </span>


                  <span>
                    Associated
                  </span>

                </div>


                {/* STATUS */}

                <span
                  className={
                    visitType.active
                      ? "visit-type-status active"
                      : "visit-type-status inactive"
                  }
                >

                  <span className="status-dot" />


                  {visitType.active
                    ? "Active"
                    : "Inactive"}

                </span>


                {/* ACTIONS */}

                <div className="visit-type-actions">


                  <button
                    type="button"
                    className="visit-action edit"
                    title="Edit Visit Type"
                    onClick={() =>
                      openEditModal(
                        visitType
                      )
                    }
                  >
                    ✎
                  </button>


                  <button
                    type="button"
                    className={
                      visitType.active
                        ? "visit-action status"
                        : "visit-action activate"
                    }
                    title={
                      visitType.active
                        ? "Deactivate Visit Type"
                        : "Activate Visit Type"
                    }
                    onClick={() =>
                      openStatusModal(
                        visitType
                      )
                    }
                  >

                    {visitType.active
                      ? "⊘"
                      : "✓"}

                  </button>


                  {/* DELETE */}

                  <button
                    type="button"
                    className="visit-action delete"
                    title="Permanently Delete Visit Type"
                    onClick={() =>
                      openDeleteModal(
                        visitType
                      )
                    }
                  >
                    🗑
                  </button>

                </div>

              </div>

            )
          )

        )}


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="visit-types-footer">

          <span>

            Showing{" "}

            <strong>
              {filteredVisitTypes.length}
            </strong>{" "}

            of{" "}

            <strong>
              {visitTypes.length}
            </strong>{" "}

            visit types

          </span>

        </div>

      </section>


      {/* =================================================
          INFORMATION BANNER
      ================================================= */}

      <section className="visit-type-info-banner">

        <div className="visit-type-info-icon">
          🛡
        </div>


        <div className="visit-type-info-content">

          <strong>
            Visit Type Management
          </strong>


          <p>
            Visit Types are domain-specific.
            Deactivating a Visit Type prevents
            new user submissions while preserving
            historical visit data. Permanent deletion
            removes the Visit Type and its related data.
          </p>

        </div>

      </section>


      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {(modalType === "ADD" ||
        modalType === "EDIT") && (

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

          <div className="admin-form-modal">

            <div className="form-modal-icon">

              {modalType === "ADD"
                ? "+"
                : "✎"}

            </div>


            <div className="confirm-badge">
              VISIT TYPE
            </div>


            <h2>

              {modalType === "ADD"
                ? "Add Visit Type"
                : "Edit Visit Type"}

            </h2>


            <p>

              {modalType === "ADD"
                ? "Create a new visit type for a domain."
                : "Update the visit type name."}

            </p>


            {/* DOMAIN */}

            <div className="admin-form-group">

              <label>
                Domain
              </label>


              <select
                value={selectedDomainId}
                onChange={(event) =>
                  setSelectedDomainId(
                    event.target.value
                  )
                }
                disabled={
                  modalType === "EDIT"
                }
              >

                {domains.map(
                  (domain) => (

                    <option
                      key={domain.id}
                      value={domain.id}
                    >
                      {domain.name}
                    </option>

                  )
                )}

              </select>


              {modalType === "EDIT" && (

                <small>
                  Domain cannot be changed
                  after creation.
                </small>

              )}

            </div>


            {/* NAME */}

            <div className="admin-form-group">

              <label>
                Visit Type Name
              </label>


              <input
                type="text"
                value={visitTypeName}
                onChange={(event) =>
                  setVisitTypeName(
                    event.target.value
                  )
                }
                placeholder="Enter visit type name"
                maxLength={150}
                autoFocus
              />

            </div>


            {/* ERROR */}

            {error && (

              <div className="admin-form-error">

                <span>
                  !
                </span>

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
                className="confirm-success-button"
                onClick={handleSave}
                disabled={saving}
              >

                {saving
                  ? "Please wait..."
                  : modalType === "ADD"
                  ? "Create Visit Type"
                  : "Save Changes"}

              </button>

            </div>

          </div>

        </div>

      )}


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


            <div className="confirm-badge">
              VISIT TYPE STATUS
            </div>


            <h2>

              {modalType ===
              "DEACTIVATE"
                ? "Deactivate Visit Type?"
                : "Activate Visit Type?"}

            </h2>


            <p>

              {modalType ===
              "DEACTIVATE"
                ? `Are you sure you want to deactivate ${selectedVisitType?.name}?`
                : `Are you sure you want to activate ${selectedVisitType?.name}?`}

            </p>


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
                  ? "New submissions will be blocked"
                  : "User access will be restored"}

              </strong>


              <span>

                {modalType ===
                "DEACTIVATE"
                  ? "Historical submissions remain preserved in the database."
                  : "Users assigned to this domain can use this visit type again."}

              </span>

            </div>


            {error && (

              <div className="admin-form-error">

                <span>
                  !
                </span>

                {error}

              </div>

            )}


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
                  ? "Deactivate Visit Type"
                  : "Activate Visit Type"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          PERMANENT DELETE MODAL
      ================================================= */}

      {modalType === "DELETE" && (

        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget &&
              !saving
            ) {

              closeModal();
            }

          }}
        >

          <div className="admin-confirm-modal delete-confirm-modal">

            {/* ICON */}

            <div className="confirm-icon warning">
              🗑
            </div>


            {/* BADGE */}

            <div className="confirm-badge">
              PERMANENT DELETION
            </div>


            {/* TITLE */}

            <h2>
              Delete Visit Type?
            </h2>


            {/* LOADING DELETE INFO */}

            {deleteInfo === null ? (

              <div className="visit-delete-loading">

                Checking related data...

              </div>

            ) : (

              <>

                {/* VISIT TYPE */}

                <p>

                  You are about to permanently delete{" "}

                  <strong>
                    {deleteInfo.visitTypeName}
                  </strong>.

                </p>


                {/* NO SUBMISSIONS */}

                {!deleteInfo.hasSubmissions && (

                  <div className="confirm-warning-box">

                    <strong>
                      This action cannot be undone.
                    </strong>


                    <span>
                      This Visit Type has no form
                      submissions. The Visit Type
                      and its related mappings will
                      be permanently removed.
                    </span>

                  </div>

                )}


                {/* HAS SUBMISSIONS */}

                {deleteInfo.hasSubmissions && (

                  <div className="permanent-delete-warning">

                    <strong>
                      ⚠️ WARNING: PERMANENT DATA DELETION
                    </strong>


                    <span>

                      This Visit Type has{" "}

                      <strong>
                        {deleteInfo.submissionCount}
                      </strong>{" "}

                      existing submission
                      {deleteInfo.submissionCount === 1
                        ? ""
                        : "s"}.

                    </span>


                    <span>

                      Deleting it will permanently
                      remove the Visit Type and its
                      related submission data. This
                      data cannot be restored or recovered.

                    </span>

                  </div>

                )}


                {/* TYPE DELETE */}

                {deleteInfo.hasSubmissions && (

                  <div className="admin-form-group">

                    <label>
                      Type <strong>DELETE</strong> to confirm
                    </label>


                    <input
                      type="text"
                      value={
                        deleteConfirmation
                      }
                      onChange={(event) =>
                        setDeleteConfirmation(
                          event.target.value
                        )
                      }
                      placeholder="Type DELETE"
                      autoFocus
                      autoComplete="off"
                    />

                  </div>

                )}


                {/* ERROR */}

                {error && (

                  <div className="admin-form-error">

                    <span>
                      !
                    </span>

                    {error}

                  </div>

                )}


                {/* ACTIONS */}

                <div className="confirm-actions">

                  <button
                    type="button"
                    className="admin-cancel-button"
                    onClick={
                      closeModal
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    className="confirm-danger-button"
                    onClick={
                      confirmDelete
                    }
                    disabled={
                      saving ||
                      (
                        deleteInfo.hasSubmissions &&
                        deleteConfirmation !==
                          "DELETE"
                      )
                    }
                  >

                    {saving
                      ? "Deleting..."
                      : "Permanently Delete"}

                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default VisitTypes;