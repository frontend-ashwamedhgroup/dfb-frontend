import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createForm,
} from "../../services/formService";

import {
  getAllDomains,
} from "../../services/domainService";

import {
  getVisitTypesByDomain,
} from "../../services/visitTypeService";

import "./CreateForm.css";


function CreateForm() {

  const navigate = useNavigate();


  // =========================================================
  // DATA
  // =========================================================

  const [domains, setDomains] = useState([]);

  const [visitTypes, setVisitTypes] = useState([]);


  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({

    domainId: "",

    name: "",

    code: "",

    description: "",

    visitTypeIds: [],

  });


  // =========================================================
  // PAGE STATE
  // =========================================================

  const [loadingDomains, setLoadingDomains] =
    useState(true);

  const [loadingVisitTypes, setLoadingVisitTypes] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  // =========================================================
  // LOAD DOMAINS
  // =========================================================

  useEffect(() => {

    loadDomains();

  }, []);


  const loadDomains = async () => {

    try {

      setLoadingDomains(true);

      setError("");

      const data =
        await getAllDomains();

      setDomains(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load domains:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to load domains."
      );

    } finally {

      setLoadingDomains(false);

    }
  };


  // =========================================================
  // LOAD VISIT TYPES
  // =========================================================

  const loadVisitTypes = async (domainId) => {

    if (!domainId) {

      setVisitTypes([]);

      return;

    }


    try {

      setLoadingVisitTypes(true);

      setError("");

      const data =
        await getVisitTypesByDomain(
          domainId
        );

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
        err.response?.data ||
        "Failed to load visit types."
      );

    } finally {

      setLoadingVisitTypes(false);

    }
  };


  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData((previous) => ({

      ...previous,

      [name]: value,

    }));

  };


  // =========================================================
  // DOMAIN CHANGE
  // =========================================================

  const handleDomainChange = async (event) => {

    const domainId =
      event.target.value;


    setFormData((previous) => ({

      ...previous,

      domainId,

      visitTypeIds: [],

    }));


    setVisitTypes([]);


    await loadVisitTypes(
      domainId
    );

  };


  // =========================================================
  // VISIT TYPE TOGGLE
  // =========================================================

  const handleVisitTypeToggle = (
    visitTypeId
  ) => {

    const numericId =
      Number(visitTypeId);


    setFormData((previous) => {

      const alreadySelected =
        previous.visitTypeIds.includes(
          numericId
        );


      return {

        ...previous,

        visitTypeIds:
          alreadySelected

            ? previous.visitTypeIds.filter(
                (id) =>
                  id !== numericId
              )

            : [
                ...previous.visitTypeIds,
                numericId,
              ],

      };

    });

  };


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();


    setError("");


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!formData.name.trim()) {

      setError(
        "Form name is required."
      );

      return;

    }


    if (!formData.code.trim()) {

      setError(
        "Form code is required."
      );

      return;

    }


    if (!formData.domainId) {

      setError(
        "Please select a domain."
      );

      return;

    }


    if (
      formData.visitTypeIds.length === 0
    ) {

      setError(
        "Please select at least one visit type."
      );

      return;

    }


    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {

      domainId:
        Number(formData.domainId),

      name:
        formData.name.trim(),

      code:
        formData.code.trim(),

      description:
        formData.description.trim() ||
        null,

      visitTypeIds:
        formData.visitTypeIds.map(
          Number
        ),

    };


    try {

      setSaving(true);


      // -----------------------------------------------------
      // CREATE FORM
      // -----------------------------------------------------

      const createdForm =
        await createForm(
          payload
        );


      console.log(
        "Created form:",
        createdForm
      );


      // -----------------------------------------------------
      // GET CREATED FORM ID
      // -----------------------------------------------------

      const formId =
        createdForm?.id ||
        createdForm?.formId;


      if (!formId) {

        setError(
          "Form was created, but the form ID was not returned by the server."
        );

        return;

      }


      // -----------------------------------------------------
      // GO TO FORM BUILDER
      // -----------------------------------------------------

      navigate(
        `/admin/form-builder/${formId}`
      );

    } catch (err) {

      console.error(
        "Failed to create form:",
        err
      );


      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;


      setError(
        backendMessage ||
        "Failed to create form."
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {

    if (saving) {
      return;
    }


    navigate(
      "/admin/forms"
    );

  };


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="create-form-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="create-form-header">

        <div>

          <div className="create-form-page-label">
            ADMIN PORTAL
          </div>

          <h1>
            Create Form
          </h1>

          <p>
            Create a form and associate it with
            one or more visit types.
          </p>

        </div>


        <button
          type="button"
          className="create-form-back-button"
          onClick={handleCancel}
          disabled={saving}
        >
          ← Back to Forms
        </button>

      </header>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="create-form-error">

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
          FORM
      ===================================================== */}

      <form
        className="create-form-card"
        onSubmit={handleSubmit}
      >


        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="create-form-card-header">

          <div>

            <span className="create-form-section-label">
              FORM INFORMATION
            </span>

            <h2>
              Basic Details
            </h2>

            <p>
              Enter the basic information for the new form.
            </p>

          </div>

        </div>


        {/* ===================================================
            FORM BODY
        =================================================== */}

        <div className="create-form-card-body">


          {/* =================================================
              FORM NAME
          ================================================= */}

          <div className="create-form-group">

            <label htmlFor="form-name">

              Form Name

              <span>
                *
              </span>

            </label>

            <input
              id="form-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dealer Visit Form"
              disabled={saving}
              required
            />

            <small>
              Display name of the form.
            </small>

          </div>


          {/* =================================================
              FORM CODE
          ================================================= */}

          <div className="create-form-group">

            <label htmlFor="form-code">

              Form Code

              <span>
                *
              </span>

            </label>

            <input
              id="form-code"
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. AGRO_DEALER_VISIT"
              disabled={saving}
              required
            />

            <small>
              Unique internal code for this form.
            </small>

          </div>


          {/* =================================================
              DOMAIN
          ================================================= */}

          <div className="create-form-group">

            <label htmlFor="form-domain">

              Domain

              <span>
                *
              </span>

            </label>

            <select
              id="form-domain"
              name="domainId"
              value={formData.domainId}
              onChange={handleDomainChange}
              disabled={
                saving ||
                loadingDomains
              }
              required
            >

              <option value="">
                {loadingDomains
                  ? "Loading domains..."
                  : "Select Domain"}
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

            <small>
              Select the business domain for this form.
            </small>

          </div>


          {/* =================================================
              VISIT TYPES
          ================================================= */}

          <div className="create-form-group">

            <label>

              Visit Types

              <span>
                *
              </span>

            </label>

            <small className="create-form-help">
              Select one or more visit types where
              this form should be available.
            </small>


            {!formData.domainId ? (

              <div className="create-form-selection-empty">

                Select a domain first to view
                available visit types.

              </div>

            ) : loadingVisitTypes ? (

              <div className="create-form-selection-empty">

                Loading visit types...

              </div>

            ) : visitTypes.length === 0 ? (

              <div className="create-form-selection-empty">

                No visit types are available
                for this domain.

              </div>

            ) : (

              <div className="create-form-visit-types">

                {visitTypes.map(
                  (visitType) => {

                    const selected =
                      formData.visitTypeIds.includes(
                        Number(
                          visitType.id
                        )
                      );


                    return (

                      <label
                        key={visitType.id}
                        className={
                          selected
                            ? "create-form-visit-option selected"
                            : "create-form-visit-option"
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
                          disabled={saving}
                        />

                        <span className="create-form-checkbox">

                          {selected
                            ? "✓"
                            : ""}

                        </span>

                        <span className="create-form-visit-name">

                          {visitType.name}

                        </span>

                      </label>

                    );

                  }
                )}

              </div>

            )}

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="create-form-group">

            <label htmlFor="form-description">

              Description

            </label>

            <textarea
              id="form-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter a description for this form..."
              rows="5"
              disabled={saving}
            />

            <small>
              Optional description for administrators
              and users.
            </small>

          </div>

        </div>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="create-form-footer">

          <button
            type="button"
            className="create-form-cancel"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>


          <button
            type="submit"
            className="create-form-submit"
            disabled={saving}
          >

            {saving ? (

              <>
                <span className="create-form-spinner"></span>

                Creating Form...
              </>

            ) : (

              <>
                ✓ Create Form
              </>

            )}

          </button>

        </div>

      </form>

    </div>

  );

}


export default CreateForm;