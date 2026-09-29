import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllForms,
  getFormById,
  createForm,
  updateForm,
  activateForm,
  deactivateForm,
  deleteForm,
} from "../../services/formService";

import { getAllDomains } from "../../services/domainService";
import { getVisitTypesByDomain } from "../../services/visitTypeService";

import "./Forms.css";


function Forms() {

  const navigate = useNavigate();


  // =========================================================
  // DATA
  // =========================================================

  const [forms, setForms] = useState([]);
  const [domains, setDomains] = useState([]);

  const [visitTypes, setVisitTypes] = useState([]);


  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");


  // =========================================================
  // PAGE STATE
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================================
  // EDIT MODAL
  // =========================================================

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editingForm, setEditingForm] =
    useState(null);

  const [editLoading, setEditLoading] =
    useState(false);

  const [savingEdit, setSavingEdit] =
    useState(false);


  const [editForm, setEditForm] = useState({
    domainId: "",
    name: "",
    code: "",
    description: "",
    visitTypeIds: [],
  });


  // =========================================================
  // DELETE MODAL
  // =========================================================

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deletingForm, setDeletingForm] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);


  // =========================================================
  // ADD FORM MODAL
  // =========================================================
  //
  // Existing Add Form page can still be used.
  // We keep this separate from Edit.
  //
  // =========================================================


  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        formsData,
        domainsData,
      ] = await Promise.all([
        getAllForms(),
        getAllDomains(),
      ]);

      setForms(
        Array.isArray(formsData)
          ? formsData
          : []
      );

      setDomains(
        Array.isArray(domainsData)
          ? domainsData
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load forms:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to load forms."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // LOAD VISIT TYPES FOR DOMAIN
  // =========================================================

  const loadVisitTypes = async (domainId) => {

    if (!domainId) {

      setVisitTypes([]);

      return;
    }

    try {

      const data =
        await getVisitTypesByDomain(domainId);

      setVisitTypes(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load visit types:",
        err
      );

      setVisitTypes([]);

      setError(
        err.response?.data?.message ||
        "Failed to load visit types."
      );
    }
  };


  // =========================================================
  // STATUS CHANGE
  // =========================================================

  const handleStatusChange = async (form) => {

    try {

      setError("");

      if (form.active) {

        await deactivateForm(form.id);

      } else {

        await activateForm(form.id);

      }

      await loadData();

    } catch (err) {

      console.error(
        "Failed to change form status:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to change form status."
      );
    }
  };


  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleOpenEdit = async (form) => {

    try {

      setError("");

      setEditingForm(form);

      setShowEditModal(true);

      setEditLoading(true);

      setEditForm({
        domainId: form.domainId || "",
        name: form.name || "",
        code: form.code || "",
        description: form.description || "",
        visitTypeIds:
          Array.isArray(form.visitTypeIds)
            ? form.visitTypeIds.map(Number)
            : [],
      });


      // Load visit types for current domain
      if (form.domainId) {

        const data =
          await getVisitTypesByDomain(
            form.domainId
          );

        setVisitTypes(
          Array.isArray(data)
            ? data
            : []
        );
      } else {

        setVisitTypes([]);
      }


      // Get latest form data
      try {

        const latestForm =
          await getFormById(form.id);

        if (latestForm) {

          setEditingForm(latestForm);

          setEditForm({
            domainId:
              latestForm.domainId || "",

            name:
              latestForm.name || "",

            code:
              latestForm.code || "",

            description:
              latestForm.description || "",

            visitTypeIds:
              Array.isArray(
                latestForm.visitTypeIds
              )
                ? latestForm.visitTypeIds.map(Number)
                : [],
          });

          if (latestForm.domainId) {

            const latestVisitTypes =
              await getVisitTypesByDomain(
                latestForm.domainId
              );

            setVisitTypes(
              Array.isArray(
                latestVisitTypes
              )
                ? latestVisitTypes
                : []
            );
          }
        }

      } catch (detailsError) {

        console.warn(
          "Could not refresh form details:",
          detailsError
        );

      }

    } catch (err) {

      console.error(
        "Failed to open edit form:",
        err
      );

      setShowEditModal(false);

      setError(
        err.response?.data?.message ||
        "Failed to open form editor."
      );

    } finally {

      setEditLoading(false);

    }
  };


  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================

  const handleCloseEdit = () => {

    if (savingEdit) {
      return;
    }

    setShowEditModal(false);

    setEditingForm(null);

    setVisitTypes([]);

    setEditForm({
      domainId: "",
      name: "",
      code: "",
      description: "",
      visitTypeIds: [],
    });
  };


  // =========================================================
  // EDIT INPUT CHANGE
  // =========================================================

  const handleEditChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // =========================================================
  // DOMAIN CHANGE IN EDIT
  // =========================================================

  const handleEditDomainChange = async (event) => {

    const domainId = event.target.value;

    setEditForm((previous) => ({
      ...previous,
      domainId,
      visitTypeIds: [],
    }));

    await loadVisitTypes(domainId);
  };


  // =========================================================
  // VISIT TYPE TOGGLE
  // =========================================================

  const handleVisitTypeToggle = (visitTypeId) => {

    const numericId = Number(visitTypeId);

    setEditForm((previous) => {

      const alreadySelected =
        previous.visitTypeIds.includes(
          numericId
        );

      return {
        ...previous,

        visitTypeIds: alreadySelected
          ? previous.visitTypeIds.filter(
              (id) => id !== numericId
            )
          : [
              ...previous.visitTypeIds,
              numericId,
            ],
      };

    });
  };


  // =========================================================
  // SAVE EDIT
  // =========================================================

  const handleSaveEdit = async (event) => {

    event.preventDefault();

    if (!editingForm) {
      return;
    }


    if (
      !editForm.name.trim() ||
      !editForm.code.trim()
    ) {

      setError(
        "Form name and form code are required."
      );

      return;
    }


    if (!editForm.domainId) {

      setError(
        "Please select a domain."
      );

      return;
    }


    if (
      !editForm.visitTypeIds ||
      editForm.visitTypeIds.length === 0
    ) {

      setError(
        "Please select at least one visit type."
      );

      return;
    }


    try {

      setSavingEdit(true);
      setError("");


      const payload = {

        domainId:
          Number(editForm.domainId),

        name:
          editForm.name.trim(),

        code:
          editForm.code.trim(),

        description:
          editForm.description.trim() ||
          null,

        visitTypeIds:
          editForm.visitTypeIds.map(Number),

      };


      await updateForm(
        editingForm.id,
        payload
      );


      setShowEditModal(false);

      setEditingForm(null);

      setVisitTypes([]);

      await loadData();

    } catch (err) {

      console.error(
        "Failed to update form:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to update form."
      );

    } finally {

      setSavingEdit(false);

    }
  };


  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  const handleOpenDelete = (form) => {

    setDeletingForm(form);

    setShowDeleteModal(true);

  };


  // =========================================================
  // CLOSE DELETE MODAL
  // =========================================================

  const handleCloseDelete = () => {

    if (deleting) {
      return;
    }

    setShowDeleteModal(false);

    setDeletingForm(null);

  };


  // =========================================================
  // DELETE FORM
  // =========================================================

  const handleDeleteForm = async () => {

    if (!deletingForm) {
      return;
    }


    try {

      setDeleting(true);

      setError("");


      await deleteForm(
        deletingForm.id
      );


      setShowDeleteModal(false);

      setDeletingForm(null);


      await loadData();

    } catch (err) {

      console.error(
        "Failed to delete form:",
        err
      );

      setShowDeleteModal(false);

      setDeletingForm(null);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to delete this form."
      );

    } finally {

      setDeleting(false);

    }
  };


  // =========================================================
  // FILTER FORMS
  // =========================================================

  const filteredForms =
    forms.filter((form) => {

      const searchText =
        search.toLowerCase().trim();


      const matchesSearch =
        !searchText ||
        form.name
          ?.toLowerCase()
          .includes(searchText) ||
        form.code
          ?.toLowerCase()
          .includes(searchText) ||
        form.domainName
          ?.toLowerCase()
          .includes(searchText);


      const matchesDomain =
        domainFilter === "ALL" ||
        String(form.domainId) ===
          String(domainFilter);


      const matchesStatus =
        statusFilter === "ALL" ||
        (
          statusFilter === "ACTIVE" &&
          form.active
        ) ||
        (
          statusFilter === "INACTIVE" &&
          !form.active
        );


      return (
        matchesSearch &&
        matchesDomain &&
        matchesStatus
      );

    });


  // =========================================================
  // STATISTICS
  // =========================================================

  const activeForms =
    forms.filter(
      (form) => form.active
    ).length;


  const inactiveForms =
    forms.filter(
      (form) => !form.active
    ).length;


  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {

    navigate(
      "/admin/dashboard"
    );

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="admin-forms-page">

        <div className="forms-loading-page">

          <div className="forms-spinner"></div>

          <p>
            Loading forms...
          </p>

        </div>

      </div>

    );
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="admin-forms-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-forms-header">

        <div>

          <div className="admin-forms-page-label">
            ADMIN PORTAL
          </div>

          <h1>
            Forms
          </h1>

          <p>
            Manage forms and their visit type associations.
          </p>

        </div>


        <div className="admin-forms-header-actions">

          <button
            type="button"
            className="forms-back-button"
            onClick={handleBack}
          >
            ← Dashboard
          </button>


          <button
            type="button"
            className="forms-add-button"
            onClick={() =>
              navigate("/admin/forms/create")
            }
          >
            + Add Form
          </button>

        </div>

      </header>


      {/* =====================================================
          INFO BANNER
      ===================================================== */}

      <div className="forms-info-banner">

        <span className="forms-info-icon">
          ℹ
        </span>

        <div>

          <strong>
            Forms & Form Builder
          </strong>

          <p>
            Use Forms to manage basic form information
            and visit type associations. Use Form Builder
            to manage fields, options and rules.
          </p>

        </div>

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="forms-statistics">

        <div className="forms-stat-card">

          <span>
            Total Forms
          </span>

          <strong>
            {forms.length}
          </strong>

        </div>


        <div className="forms-stat-card active">

          <span>
            Active Forms
          </span>

          <strong>
            {activeForms}
          </strong>

        </div>


        <div className="forms-stat-card inactive">

          <span>
            Inactive Forms
          </span>

          <strong>
            {inactiveForms}
          </strong>

        </div>

      </section>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="forms-filter-section">

        <div className="forms-search-wrapper">

          <span className="forms-search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search forms..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        <select
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

          {domains.map((domain) => (

            <option
              key={domain.id}
              value={domain.id}
            >
              {domain.name}
            </option>

          ))}

        </select>


        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >

          <option value="ALL">
            All Status
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="INACTIVE">
            Inactive
          </option>

        </select>


        <button
          type="button"
          className="forms-refresh-button"
          onClick={loadData}
        >
          ↻ Refresh
        </button>

      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="forms-error">

          <span>
            !
          </span>

          <div>
            {error}
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* =====================================================
          TABLE
      ===================================================== */}

      <section className="forms-table-section">

        {filteredForms.length === 0 ? (

          <div className="forms-empty">

            <div className="forms-empty-icon">
              ▤
            </div>

            <h3>
              No forms found
            </h3>

            <p>
              Try changing your search or filters.
            </p>

          </div>

        ) : (

          <div className="forms-table-wrapper">

            <table className="forms-table">

              <thead>

                <tr>

                  <th>
                    Form
                  </th>

                  <th>
                    Domain
                  </th>

                  <th>
                    Visit Types
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredForms.map((form) => (

                  <tr key={form.id}>


                    {/* FORM */}

                    <td>

                      <div className="form-name-cell">

                        <strong>
                          {form.name}
                        </strong>

                        <span>
                          {form.code}
                        </span>

                      </div>

                    </td>


                    {/* DOMAIN */}

                    <td>

                      <span className="form-domain-badge">
                        {form.domainName}
                      </span>

                    </td>


                    {/* VISIT TYPES */}

                    <td>

                      <div className="form-visit-types">

                        {form.visitTypeNames?.length > 0 ? (

                          form.visitTypeNames.map(
                            (
                              visitTypeName,
                              index
                            ) => (

                              <span
                                key={
                                  `${form.id}-${index}`
                                }
                                className="form-visit-type-badge"
                              >
                                {visitTypeName}
                              </span>

                            )
                          )

                        ) : (

                          <span className="form-no-visit-type">
                            Not associated
                          </span>

                        )}

                      </div>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={
                          form.active
                            ? "form-status active"
                            : "form-status inactive"
                        }
                      >
                        {form.active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="form-actions">


                        {/* EDIT */}

                        <button
                          type="button"
                          title="Edit Form"
                          className="form-action edit"
                          onClick={() =>
                            handleOpenEdit(form)
                          }
                        >
                          ✎
                        </button>


                        {/* STATUS */}

                        <button
                          type="button"
                          title={
                            form.active
                              ? "Deactivate Form"
                              : "Activate Form"
                          }
                          className={
                            form.active
                              ? "form-action deactivate"
                              : "form-action activate"
                          }
                          onClick={() =>
                            handleStatusChange(
                              form
                            )
                          }
                        >
                          {form.active
                            ? "⏸"
                            : "▶"}
                        </button>


                        {/* FORM BUILDER */}

                        <button
                          type="button"
                          title="Open Form Builder"
                          className="form-action builder"
                          onClick={() =>
                            navigate(
                              `/admin/form-builder/${form.id}`
                            )
                          }
                        >
                          ⚙
                        </button>


                        {/* DELETE */}

                        <button
                          type="button"
                          title="Delete Form"
                          className="form-action delete"
                          onClick={() =>
                            handleOpenDelete(
                              form
                            )
                          }
                        >
                          🗑
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          EDIT FORM MODAL
      ===================================================== */}

      {showEditModal && (

        <div
          className="forms-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget &&
              !savingEdit
            ) {

              handleCloseEdit();

            }

          }}
        >

          <div className="forms-modal edit-form-modal">


            {/* HEADER */}

            <div className="forms-modal-header">

              <div>

                <div className="forms-modal-label">
                  FORM SETTINGS
                </div>

                <h2>
                  Edit Form
                </h2>

                <p>
                  Update the form information and
                  visit type associations.
                </p>

              </div>


              <button
                type="button"
                className="forms-modal-close"
                onClick={handleCloseEdit}
                disabled={savingEdit}
              >
                ×
              </button>

            </div>


            {editLoading ? (

              <div className="forms-modal-loading">

                <div className="forms-spinner"></div>

                <p>
                  Loading form details...
                </p>

              </div>

            ) : (

              <form
                onSubmit={handleSaveEdit}
              >

                <div className="forms-modal-body">


                  {/* FORM NAME */}

                  <div className="forms-form-group">

                    <label>
                      Form Name
                      <span>*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      placeholder="Enter form name"
                      required
                    />

                  </div>


                  {/* FORM CODE */}

                  <div className="forms-form-group">

                    <label>
                      Form Code
                      <span>*</span>
                    </label>

                    <input
                      type="text"
                      name="code"
                      value={editForm.code}
                      onChange={handleEditChange}
                      placeholder="e.g. AGRO_DEALER_VISIT"
                      required
                    />

                    <small>
                      Unique internal code for this form.
                    </small>

                  </div>


                  {/* DOMAIN */}

                  <div className="forms-form-group">

                    <label>
                      Domain
                      <span>*</span>
                    </label>

                    <select
                      name="domainId"
                      value={editForm.domainId}
                      onChange={
                        handleEditDomainChange
                      }
                      required
                    >

                      <option value="">
                        Select Domain
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


                  {/* VISIT TYPES */}

                  <div className="forms-form-group">

                    <label>
                      Visit Types
                      <span>*</span>
                    </label>

                    <small className="forms-field-help">
                      Select the visit types where this
                      form should be available.
                    </small>


                    {!editForm.domainId ? (

                      <div className="forms-selection-empty">
                        Select a domain first.
                      </div>

                    ) : visitTypes.length === 0 ? (

                      <div className="forms-selection-empty">
                        No visit types available for this domain.
                      </div>

                    ) : (

                      <div className="forms-visit-type-selection">

                        {visitTypes.map(
                          (visitType) => {

                            const selected =
                              editForm.visitTypeIds.includes(
                                Number(
                                  visitType.id
                                )
                              );

                            return (

                              <label
                                key={
                                  visitType.id
                                }
                                className={
                                  selected
                                    ? "forms-visit-option selected"
                                    : "forms-visit-option"
                                }
                              >

                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() =>
                                    handleVisitTypeToggle(
                                      visitType.id
                                    )
                                  }
                                />

                                <span className="forms-custom-checkbox">
                                  {selected
                                    ? "✓"
                                    : ""}
                                </span>

                                <span>
                                  {visitType.name}
                                </span>

                              </label>

                            );

                          }
                        )}

                      </div>

                    )}

                  </div>


                  {/* DESCRIPTION */}

                  <div className="forms-form-group">

                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={
                        editForm.description
                      }
                      onChange={handleEditChange}
                      placeholder="Enter a description for this form"
                      rows="4"
                    />

                  </div>

                </div>


                {/* FOOTER */}

                <div className="forms-modal-footer">

                  <button
                    type="button"
                    className="forms-modal-cancel"
                    onClick={handleCloseEdit}
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="forms-modal-save"
                    disabled={savingEdit}
                  >

                    {savingEdit ? (

                      <>
                        <span className="forms-button-spinner"></span>
                        Saving...
                      </>

                    ) : (

                      <>
                        ✓ Save Changes
                      </>

                    )}

                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE FORM MODAL
      ===================================================== */}

      {showDeleteModal &&
        deletingForm && (

        <div
          className="forms-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget &&
              !deleting
            ) {

              handleCloseDelete();

            }

          }}
        >

          <div className="forms-modal delete-form-modal">


            {/* DELETE ICON */}

            <div className="delete-modal-icon">
              🗑
            </div>


            <div className="delete-modal-content">

              <h2>
                Delete Form?
              </h2>

              <p>
                You are about to permanently delete
                the form
                <strong>
                  {" "}
                  "{deletingForm.name}"
                </strong>.
              </p>

              <div className="delete-warning-box">

                <span>
                  ⚠
                </span>

                <div>

                  <strong>
                    This action cannot be undone.
                  </strong>

                  <p>
                    The form and its configuration may
                    be permanently removed from the system.
                  </p>

                </div>

              </div>

            </div>


            <div className="forms-modal-footer delete-footer">

              <button
                type="button"
                className="forms-modal-cancel"
                onClick={handleCloseDelete}
                disabled={deleting}
              >
                Cancel
              </button>


              <button
                type="button"
                className="forms-delete-confirm"
                onClick={handleDeleteForm}
                disabled={deleting}
              >

                {deleting ? (

                  <>
                    <span className="forms-button-spinner"></span>
                    Deleting...
                  </>

                ) : (

                  <>
                    🗑 Delete Form
                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default Forms;