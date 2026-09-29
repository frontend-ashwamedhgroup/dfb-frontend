import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getFormById,
  getFormFieldsByForm,
  createFormField,
  updateFormField,
  deleteFormField,
} from "../../services/formService";

import "./FormBuilder.css";


function FormBuilder() {
  const { formId } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add / Edit modal
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Field form
  const [fieldForm, setFieldForm] = useState({
    fieldKey: "",
    label: "",
    fieldType: "TEXT",
    required: false,
    displayOrder: "",
    placeholder: "",
    validationRule: "",
  });


  // =========================================================
  // LOAD FORM BUILDER
  // =========================================================

  useEffect(() => {
    loadBuilder();
  }, [formId]);


  const loadBuilder = async () => {
    try {
      setLoading(true);
      setError("");

      const formData = await getFormById(formId);
      const fieldsData = await getFormFieldsByForm(formId);

      setForm(formData);

      setFields(
        Array.isArray(fieldsData)
          ? fieldsData
          : []
      );

    } catch (err) {
      console.error("Unable to load Form Builder:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to load Form Builder."
      );

    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // OPEN ADD FIELD MODAL
  // =========================================================

  const handleAddField = () => {
    setEditingField(null);

    setFieldForm({
      fieldKey: "",
      label: "",
      fieldType: "TEXT",
      required: false,
      displayOrder: "",
      placeholder: "",
      validationRule: "",
    });

    setError("");
    setShowFieldModal(true);
  };


  // =========================================================
  // OPEN EDIT FIELD MODAL
  // =========================================================

  const handleEditField = (field) => {
    setEditingField(field);

    setFieldForm({
      fieldKey: field.fieldKey || "",
      label: field.label || "",
      fieldType: field.fieldType || "TEXT",
      required: Boolean(field.required),
      displayOrder: field.displayOrder ?? "",
      placeholder: field.placeholder || "",
      validationRule: field.validationRule || "",
    });

    setError("");
    setShowFieldModal(true);
  };


  // =========================================================
  // CLOSE ADD / EDIT MODAL
  // =========================================================

  const closeFieldModal = () => {
    if (saving) {
      return;
    }

    setShowFieldModal(false);
    setEditingField(null);
  };


  // =========================================================
  // FIELD FORM CHANGE
  // =========================================================

  const handleFieldChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFieldForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  // =========================================================
  // SAVE FIELD
  // =========================================================

  const handleSaveField = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        fieldKey: fieldForm.fieldKey.trim(),
        label: fieldForm.label.trim(),
        fieldType: fieldForm.fieldType,
        required: Boolean(fieldForm.required),

        displayOrder:
          fieldForm.displayOrder === ""
            ? null
            : Number(fieldForm.displayOrder),

        placeholder:
          fieldForm.placeholder.trim() !== ""
            ? fieldForm.placeholder.trim()
            : null,

        validationRule:
          fieldForm.validationRule.trim() !== ""
            ? fieldForm.validationRule.trim()
            : null,
      };


      if (editingField) {
        await updateFormField(
          editingField.id,
          payload
        );
      } else {
        await createFormField(
          formId,
          payload
        );
      }


      setShowFieldModal(false);
      setEditingField(null);

      setFieldForm({
        fieldKey: "",
        label: "",
        fieldType: "TEXT",
        required: false,
        displayOrder: "",
        placeholder: "",
        validationRule: "",
      });

      await loadBuilder();

    } catch (err) {
      console.error("Unable to save field:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to save field."
      );

    } finally {
      setSaving(false);
    }
  };


  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  const handleDeleteField = (field) => {
    setFieldToDelete(field);
    setShowDeleteModal(true);
    setError("");
  };


  // =========================================================
  // CLOSE DELETE MODAL
  // =========================================================

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setFieldToDelete(null);
  };


  // =========================================================
  // CONFIRM DELETE
  // =========================================================

  const confirmDeleteField = async () => {
    if (!fieldToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteFormField(
        fieldToDelete.id
      );

      setShowDeleteModal(false);
      setFieldToDelete(null);

      await loadBuilder();

    } catch (err) {
      console.error("Unable to delete field:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to delete field."
      );

    } finally {
      setDeleting(false);
    }
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="form-builder-page">

        <div className="builder-loading">

          <div className="loading-spinner"></div>

          <span>
            Loading Form Builder...
          </span>

        </div>

      </div>
    );
  }


  // =========================================================
  // FORM LOAD ERROR
  // =========================================================

  if (error && !form) {
    return (
      <div className="form-builder-page">

        <div className="builder-error">

          <div className="error-icon">
            !
          </div>

          <h3>
            Unable to load Form Builder
          </h3>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={loadBuilder}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="form-builder-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="builder-header">

        <div>

          <h1>
            Form Builder
          </h1>

          <p className="builder-subtitle">
            Create and manage fields for this form.
          </p>

        </div>


        <div className="builder-header-actions">

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/forms")}
          >
            ← Back to Forms
          </button>


          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddField}
          >
            + Add Field
          </button>

        </div>

      </div>


      {/* =====================================================
          FORM INFORMATION
      ===================================================== */}

      {form && (
        <div className="form-info-card">

          <div className="form-info-main">

            <h2>
              {form.name}
            </h2>


            <div className="form-info-meta">

              <span>
                Code:
                <strong>
                  {form.code}
                </strong>
              </span>


              <span>
                Form ID:
                <strong>
                  {form.id}
                </strong>
              </span>


              <span
                className={
                  form.active
                    ? "status-badge active"
                    : "status-badge inactive"
                }
              >
                {form.active ? "Active" : "Inactive"}
              </span>

            </div>


            {form.description && (
              <p className="form-description">
                {form.description}
              </p>
            )}


            {form.visitTypeNames &&
              form.visitTypeNames.length > 0 && (

              <div className="visit-types">

                <strong>
                  Visit Types:
                </strong>


                {form.visitTypeNames.map(
                  (name, index) => (
                    <span
                      className="visit-type-badge"
                      key={`${name}-${index}`}
                    >
                      {name}
                    </span>
                  )
                )}

              </div>

            )}

          </div>

        </div>
      )}


      {/* =====================================================
          INFO BANNER
      ===================================================== */}

      <div className="builder-info">

        <div className="info-icon">
          i
        </div>


        <div>

          <strong>
            Form Builder
          </strong>

          <p>
            Add and manage fields and options for this form.
          </p>

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="builder-inline-error">

          <div className="inline-error-icon">
            !
          </div>

          <div>
            {error}
          </div>

          <button
            type="button"
            className="inline-error-close"
            onClick={() => setError("")}
          >
            ×
          </button>

        </div>
      )}


      {/* =====================================================
          FORM FIELDS SECTION
      ===================================================== */}

      <div className="fields-section">


        {/* SECTION HEADER */}

        <div className="section-header">

          <div>

            <h2>
              Form Fields
            </h2>

            <span>
              {fields.length}{" "}
              {fields.length === 1
                ? "field"
                : "fields"}
            </span>

          </div>


          <button
            type="button"
            className="btn btn-outline"
            onClick={handleAddField}
          >
            + Add Field
          </button>

        </div>


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {fields.length === 0 ? (

          <div className="empty-fields">

            <div className="empty-icon">
              +
            </div>

            <h3>
              No fields added yet
            </h3>

            <p>
              Start building this form by adding your first field.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddField}
            >
              + Add First Field
            </button>

          </div>

        ) : (

          /* =================================================
             FIELD LIST
          ================================================= */

          <div className="fields-list">

            {fields.map((field, index) => {

              return (
                <div
                  className="field-card"
                  key={field.id}
                >


                  {/* FIELD NUMBER */}

                  <div className="field-number">
                    {index + 1}
                  </div>


                  {/* FIELD CONTENT */}

                  <div className="field-content">


                    {/* FIELD TITLE */}

                    <div className="field-title-row">

                      <h3>
                        {field.label}
                      </h3>


                      <span
                        className={
                          field.active
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                      >
                        {field.active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>


                    {/* FIELD DETAILS */}

                    <div className="field-details">


                      <div>

                        <span>
                          FIELD KEY
                        </span>

                        <strong>
                          {field.fieldKey}
                        </strong>

                      </div>


                      <div>

                        <span>
                          TYPE
                        </span>

                        <strong className="type-badge">
                          {field.fieldType}
                        </strong>

                      </div>


                      <div>

                        <span>
                          REQUIRED
                        </span>

                        <strong>
                          {field.required
                            ? "Yes"
                            : "No"}
                        </strong>

                      </div>


                      <div>

                        <span>
                          ORDER
                        </span>

                        <strong>
                          {field.displayOrder}
                        </strong>

                      </div>


                    </div>


                    {/* VALIDATION */}

                    {field.validationRule && (
                      <div className="field-extra">

                        <strong>
                          Validation:
                        </strong>

                        <span>
                          {field.validationRule}
                        </span>

                      </div>
                    )}


                    {/* =================================================
                        OPTIONS
                    ================================================= */}

                    {field.options &&
                      field.options.length > 0 && (

                      <div className="field-extra">

                        <strong>
                          Options:
                        </strong>


                        <div className="options-list">

                          {field.options.map((option) => {

                            return (
                              <span
                                key={option.id}
                                className="option-badge"
                              >
                                {option.label}
                              </span>
                            );

                          })}

                        </div>

                      </div>

                    )}

                  </div>


                  {/* =================================================
                      FIELD ACTIONS
                  ================================================= */}

                  <div className="field-actions">


                    {/* EDIT */}

                    <button
                      type="button"
                      className="field-action edit"
                      onClick={() =>
                        handleEditField(field)
                      }
                    >
                      ✎ Edit
                    </button>


                    {/* OPTIONS */}

                    {field.fieldType === "SELECT" && (
                      <button
                        type="button"
                        className="field-action options"
                        onClick={() => {
                          // Options management will be added here.
                        }}
                      >
                        ⚙ Options
                      </button>
                    )}


                    {/* DELETE */}

                    <button
                      type="button"
                      className="field-action delete"
                      onClick={() =>
                        handleDeleteField(field)
                      }
                    >
                      🗑 Delete
                    </button>

                  </div>

                </div>
              );

            })}

          </div>

        )}

      </div>


      {/* =====================================================
          ADD / EDIT FIELD MODAL
      ===================================================== */}

      {showFieldModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeFieldModal();
            }

          }}
        >

          <div
            className="field-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  {editingField
                    ? "Edit Field"
                    : "Add Field"}
                </h2>

                <p>
                  {editingField
                    ? "Update the field configuration."
                    : "Create a new field for this form."}
                </p>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={closeFieldModal}
                disabled={saving}
              >
                ×
              </button>

            </div>


            {/* =================================================
                FIELD FORM
            ================================================= */}

            <form onSubmit={handleSaveField}>

              <div className="modal-body">


                {/* FIELD KEY */}

                <div className="form-group">

                  <label>
                    Field Key
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="fieldKey"
                    value={fieldForm.fieldKey}
                    onChange={handleFieldChange}
                    placeholder="e.g. shopName"
                    required
                    disabled={saving}
                  />

                  <small>
                    Unique key used internally.
                  </small>

                </div>


                {/* LABEL */}

                <div className="form-group">

                  <label>
                    Label
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="label"
                    value={fieldForm.label}
                    onChange={handleFieldChange}
                    placeholder="e.g. Shop Name"
                    required
                    disabled={saving}
                  />

                </div>


                {/* FIELD TYPE */}

                <div className="form-group">

                  <label>
                    Field Type
                    <span>*</span>
                  </label>

                  <select
                    name="fieldType"
                    value={fieldForm.fieldType}
                    onChange={handleFieldChange}
                    disabled={saving}
                  >

                    <option value="TEXT">
                      TEXT
                    </option>

                    <option value="NUMBER">
                      NUMBER
                    </option>

                    <option value="TEXTAREA">
                      TEXTAREA
                    </option>

                    <option value="SELECT">
                      SELECT
                    </option>

                    <option value="DATE">
                      DATE
                    </option>

                    <option value="EMAIL">
                      EMAIL
                    </option>

                    <option value="PHONE">
                      PHONE
                    </option>

                    <option value="SYSTEM">
                      SYSTEM
                    </option>

                  </select>

                </div>


                {/* REQUIRED */}

                <div className="checkbox-group">

                  <label>

                    <input
                      type="checkbox"
                      name="required"
                      checked={fieldForm.required}
                      onChange={handleFieldChange}
                      disabled={saving}
                    />

                    <span>
                      Required field
                    </span>

                  </label>

                </div>


                {/* DISPLAY ORDER */}

                <div className="form-group">

                  <label>
                    Display Order
                  </label>

                  <input
                    type="number"
                    name="displayOrder"
                    value={fieldForm.displayOrder}
                    onChange={handleFieldChange}
                    min="1"
                    placeholder="Auto"
                    disabled={saving}
                  />

                </div>


                {/* PLACEHOLDER */}

                <div className="form-group">

                  <label>
                    Placeholder
                  </label>

                  <input
                    type="text"
                    name="placeholder"
                    value={fieldForm.placeholder}
                    onChange={handleFieldChange}
                    placeholder="Enter placeholder text"
                    disabled={saving}
                  />

                </div>


                {/* VALIDATION */}

                <div className="form-group">

                  <label>
                    Validation Rule
                  </label>

                  <input
                    type="text"
                    name="validationRule"
                    value={fieldForm.validationRule}
                    onChange={handleFieldChange}
                    placeholder="e.g. Exactly 10 digits"
                    disabled={saving}
                  />

                </div>

              </div>


              {/* MODAL FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeFieldModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    editingField
                      ? "Update Field"
                      : "Create Field"
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {showDeleteModal && fieldToDelete && (
        <div
          className="modal-overlay delete-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeDeleteModal();
            }

          }}
        >

          <div
            className="delete-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >


            {/* DELETE ICON */}

            <div className="delete-modal-icon">

              <span>
                !
              </span>

            </div>


            {/* DELETE CONTENT */}

            <div className="delete-modal-content">

              <h2>
                Delete Field
              </h2>


              <p className="delete-question">

                Are you sure you want to delete{" "}

                <strong>
                  "{fieldToDelete.label}"
                </strong>

                ?

              </p>


              <p className="delete-warning">

                This will permanently remove the
                field from this form and cannot
                be undone.

              </p>

            </div>


            {/* DELETE FOOTER */}

            <div className="delete-modal-footer">

              <button
                type="button"
                className="btn btn-secondary delete-cancel"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>


              <button
                type="button"
                className="btn delete-confirm"
                onClick={confirmDeleteField}
                disabled={deleting}
              >

                {deleting ? (
                  <>
                    <span className="button-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    🗑 Delete Field
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


export default FormBuilder;