import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFormFieldsByVisitType } from "../../services/dynamicFormService";
import { submitForm } from "../../services/submissionService";
import { useAuth } from "../../context/AuthContext";
import "./DynamicForm.css";

const domainConfig = {
  1: {
    name: "AGRO",
    icon: "🌿",
    accent: "#0b8f55",
    light: "#eaf7f0",
  },
  2: {
    name: "POULTRY",
    icon: "🐔",
    accent: "#e67e22",
    light: "#fff3e6",
  },
  3: {
    name: "FMCG",
    icon: "🛒",
    accent: "#6d4aff",
    light: "#f1edff",
  },
};

const visitNames = {
  1: "Dealer Visit",
  2: "Farmer Visit",
  3: "Nursery Visit",

  // POULTRY
  4: "Branch Visit",
  5: "Branch Person Visit",
  6: "Doctor Visit",
  7: "Corporate Office Visit",
  8: "Corporate Office Person Visit",
  9: "Dealer Visit",
  10: "Poultry Farmer Visit",

  11: "Dealer Visit",
  12: "Corporate Visit",
  13: "Corporate Person Visit",
};

const getVisitIcon = (visitName) => {
  const name = visitName.toLowerCase();

  if (name.includes("dealer")) return "🏪";
  if (name.includes("farmer")) return "👨‍🌾";
  if (name.includes("nursery")) return "🌱";
  if (name.includes("doctor")) return "🩺";
  if (name.includes("branch person")) return "👤";
  if (name.includes("branch")) return "🏢";
  if (name.includes("corporate office person")) return "👤";
  if (name.includes("corporate office")) return "🏢";
  if (name.includes("corporate person")) return "👤";
  if (name.includes("corporate")) return "🏢";

  return "📋";
};


/* =========================================================
   SEARCHABLE MULTI SELECT
========================================================= */

function SearchableMultiSelect({
  field,
  selectedValues,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchText("");
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const options = field.options || [];

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );

  const filteredOptions = options.filter((option) =>
    option.label
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
  };

  return (
    <div
      className="searchable-multi-select"
      ref={containerRef}
    >
      <button
        type="button"
        className={`multi-select-control ${
          isOpen ? "open" : ""
        }`}
        onClick={() =>
          setIsOpen((previous) => !previous)
        }
      >
        <div className="selected-values">
          {selectedOptions.length === 0 ? (
            <span className="multi-select-placeholder">
              Select {field.label}
            </span>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.id}
                className="selected-value-tag"
              >
                <span>
                  {option.label}
                </span>

                <span
                  className="remove-selected"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOptionClick(option.value);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${option.label}`}
                >
                  ×
                </span>
              </span>
            ))
          )}
        </div>

        <span className="multi-select-arrow">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div className="multi-select-dropdown">

          <div className="multi-select-search">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              value={searchText}
              placeholder={`Search ${field.label.toLowerCase()}...`}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              onClick={(event) =>
                event.stopPropagation()
              }
              autoFocus
            />

          </div>

          <div className="multi-select-options-list">

            {filteredOptions.length === 0 ? (
              <div className="no-options">
                No matching options found.
              </div>
            ) : (
              filteredOptions.map((option) => {
                const selected =
                  selectedValues.includes(
                    option.value
                  );

                return (
                  <button
                    type="button"
                    key={option.id}
                    className={`multi-select-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={(event) => {
                      event.stopPropagation();

                      handleOptionClick(
                        option.value
                      );
                    }}
                  >
                    <span
                      className={`custom-checkbox ${
                        selected
                          ? "checked"
                          : ""
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>

                    <span>
                      {option.label}
                    </span>

                  </button>
                );
              })
            )}

          </div>

        </div>
      )}

    </div>
  );
}


/* =========================================================
   DYNAMIC FORM
========================================================= */

function DynamicForm() {
  const { visitTypeId } = useParams();

  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [fields, setFields] =
    useState([]);

  const [values, setValues] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [redirectCountdown, setRedirectCountdown] =
    useState(10);

  const redirectTimerRef =
    useRef(null);

  const countdownTimerRef =
    useRef(null);

  const domain =
    domainConfig[user?.domainId];

  const visitName =
    visitNames[Number(visitTypeId)] ||
    "Visit Form";


  /* =======================================================
     LOAD FORM FIELDS
  ======================================================= */

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getFormFieldsByVisitType(
            visitTypeId
          );

        setFields(data);

      } catch (error) {
        console.error(
          "Failed to load form fields:",
          error
        );

        setError(
          "Unable to load form."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchFields();

  }, [visitTypeId]);


  /* =======================================================
     SUCCESS POPUP TIMERS
  ======================================================= */

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(
          redirectTimerRef.current
        );
      }

      if (countdownTimerRef.current) {
        clearInterval(
          countdownTimerRef.current
        );
      }
    };
  }, []);


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  /* =======================================================
     NAVIGATION HELPERS
  ======================================================= */

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };


  const handleGoToSubmissions = () => {
    if (redirectTimerRef.current) {
      clearTimeout(
        redirectTimerRef.current
      );
    }

    if (countdownTimerRef.current) {
      clearInterval(
        countdownTimerRef.current
      );
    }

    setSuccessMessage("");

     navigate("/my-submissions");
  };


  const handleCloseSuccessPopup = () => {
    if (redirectTimerRef.current) {
      clearTimeout(
        redirectTimerRef.current
      );
    }

    if (countdownTimerRef.current) {
      clearInterval(
        countdownTimerRef.current
      );
    }

    setSuccessMessage("");
  };


  /* =======================================================
     FIELD HELPERS
  ======================================================= */

  const isPhoneField = (field) => {
    const fieldName = `${
      field.fieldKey || ""
    } ${
      field.label || ""
    }`.toLowerCase();

    return (
      fieldName.includes("phone") ||
      fieldName.includes("mobile") ||
      fieldName.includes("contact number") ||
      fieldName.includes("contactno") ||
      fieldName.includes("phone number") ||
      fieldName.includes("mobile number")
    );
  };


  const isNumericField = (field) => {
    return (
      field.fieldType?.toUpperCase() ===
      "NUMBER"
    );
  };


  /* =======================================================
     NORMAL FIELD CHANGE
  ======================================================= */

  const handleChange = (
    fieldKey,
    value
  ) => {
    setValues((previous) => ({
      ...previous,
      [fieldKey]: value,
    }));
  };


  /* =======================================================
     MULTI SELECT CHANGE
  ======================================================= */

  const handleMultiSelectChange = (
    fieldKey,
    optionValue
  ) => {
    setValues((previous) => {
      const currentValues =
        previous[fieldKey] || [];

      const updatedValues =
        currentValues.includes(optionValue)
          ? currentValues.filter(
              (value) =>
                value !== optionValue
            )
          : [
              ...currentValues,
              optionValue,
            ];

      return {
        ...previous,
        [fieldKey]: updatedValues,
      };
    });
  };


  /* =======================================================
     GET FIELD KEY
  ======================================================= */

  const getFieldKey = (fieldId) => {
    const field =
      fields.find(
        (item) =>
          item.id === fieldId
      );

    return field?.fieldKey;
  };


  /* =======================================================
     CONDITIONAL VISIBILITY
  ======================================================= */

  const isFieldVisible = (field) => {
    if (
      !field.rules ||
      field.rules.length === 0
    ) {
      return true;
    }

    const showRules =
      field.rules.filter(
        (rule) =>
          rule.action?.toUpperCase() ===
          "SHOW"
      );

    if (showRules.length === 0) {
      return true;
    }

    return showRules.every((rule) => {
      const sourceFieldKey =
        getFieldKey(
          rule.sourceFieldId
        );

      const sourceValue =
        values[sourceFieldKey];

      if (
        sourceValue === undefined ||
        sourceValue === null ||
        sourceValue === ""
      ) {
        return false;
      }

      if (
        Array.isArray(sourceValue)
      ) {
        return sourceValue.includes(
          rule.expectedValue
        );
      }

      return (
        String(sourceValue) ===
        String(rule.expectedValue)
      );
    });
  };


  /* =======================================================
     SUBMIT FORM
  ======================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const submissionData = {
  formId: Number(
    visitTypeId
  ),

  visitTypeId: Number(
    visitTypeId
  ),

  values,
};

      console.log(
        "Submitting form:",
        submissionData
      );

      const response =
        await submitForm(
          submissionData
        );

      console.log(
        "Form submitted successfully:",
        response
      );

      setSuccessMessage(
        "success"
      );

      setRedirectCountdown(
        10
      );


      /*
       * Countdown timer
       */

      let seconds = 10;

      countdownTimerRef.current =
        setInterval(() => {
          seconds -= 1;

          setRedirectCountdown(
            seconds
          );

          if (
            seconds <= 0
          ) {
            clearInterval(
              countdownTimerRef.current
            );
          }
        }, 1000);


      /*
       * Redirect after 10 seconds
       */

      redirectTimerRef.current =
        setTimeout(() => {
          setSuccessMessage("");

          navigate("/dashboard");

        }, 10000);

    } catch (error) {
      console.error(
        "Form submission failed:",
        error
      );

      setError(
        error.response?.data?.message ||
        error.response?.data ||
        "Unable to submit form. Please try again."
      );

    } finally {
      setSubmitting(false);
    }
  };


  /* =======================================================
     RENDER FIELD
  ======================================================= */

  const renderField = (field) => {
    if (!isFieldVisible(field)) {
      return null;
    }

    const fieldType =
      field.fieldType?.toUpperCase();

    const value =
      values[field.fieldKey] ?? "";


    /* SYSTEM */

    if (
      fieldType === "SYSTEM"
    ) {
      return (
        <div
          className="dynamic-field"
          key={field.id}
        >
          <label>
            {field.label}
          </label>

          <input
            type="text"
            value="Automatically added by system"
            disabled
          />

        </div>
      );
    }


    /* TEXTAREA */

    if (
      fieldType === "TEXTAREA"
    ) {
      return (
        <div
          className="dynamic-field"
          key={field.id}
        >
          <label
            htmlFor={
              field.fieldKey
            }
          >
            {field.label}

            {field.required && (
              <span className="required-mark">
                {" "}
                *
              </span>
            )}

          </label>

          <textarea
            id={field.fieldKey}
            value={value}
            placeholder={
              field.placeholder || ""
            }
            required={
              field.required
            }
            onChange={(event) =>
              handleChange(
                field.fieldKey,
                event.target.value
              )
            }
          />

        </div>
      );
    }


    /* SELECT */

    if (
      fieldType === "SELECT"
    ) {
      return (
        <div
          className="dynamic-field"
          key={field.id}
        >
          <label
            htmlFor={
              field.fieldKey
            }
          >
            {field.label}

            {field.required && (
              <span className="required-mark">
                {" "}
                *
              </span>
            )}

          </label>

          <select
            id={field.fieldKey}
            value={value}
            required={
              field.required
            }
            onChange={(event) =>
              handleChange(
                field.fieldKey,
                event.target.value
              )
            }
          >
            <option value="">
              Select {field.label}
            </option>

            {field.options?.map(
              (option) => (
                <option
                  key={option.id}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}

          </select>

        </div>
      );
    }


    /* MULTI SELECT */

    if (
      fieldType ===
      "MULTI_SELECT"
    ) {
      const selectedValues =
        values[field.fieldKey] ||
        [];

      return (
        <div
          className="dynamic-field"
          key={field.id}
        >
          <label>
            {field.label}

            {field.required && (
              <span className="required-mark">
                {" "}
                *
              </span>
            )}

          </label>

          <SearchableMultiSelect
            field={field}
            selectedValues={
              selectedValues
            }
            onChange={(optionValue) =>
              handleMultiSelectChange(
                field.fieldKey,
                optionValue
              )
            }
          />

        </div>
      );
    }


    /* BOOLEAN */

    if (
      fieldType === "BOOLEAN"
    ) {
      return (
        <div
          className="dynamic-field"
          key={field.id}
        >
          <label
            htmlFor={
              field.fieldKey
            }
          >
            {field.label}

            {field.required && (
              <span className="required-mark">
                {" "}
                *
              </span>
            )}

          </label>

          <select
            id={field.fieldKey}
            value={value}
            required={
              field.required
            }
            onChange={(event) =>
              handleChange(
                field.fieldKey,
                event.target.value
              )
            }
          >
            <option value="">
              Select
            </option>

            <option value="true">
              Yes
            </option>

            <option value="false">
              No
            </option>

          </select>

        </div>
      );
    }


    /* =====================================================
       NORMAL INPUT
    ===================================================== */

    let inputType =
      "text";

    if (
      fieldType === "EMAIL"
    ) {
      inputType = "email";
    }

    if (
      fieldType === "DATE"
    ) {
      inputType = "date";
    }

    if (
      fieldType === "DATETIME"
    ) {
      inputType =
        "datetime-local";
    }


    const phoneField =
      isPhoneField(field);

    const numericField =
      isNumericField(field);


    /* =====================================================
       INPUT CHANGE
    ===================================================== */

    const handleInputChange = (
      event
    ) => {
      let inputValue =
        event.target.value;


      /*
       * PHONE / MOBILE / CONTACT NUMBER
       *
       * Only digits
       * Maximum 10 digits
       */

      if (phoneField) {
        inputValue =
          inputValue
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              10
            );
      }


      /*
       * NUMBER FIELD
       *
       * Only positive whole numbers
       *
       * Blocks:
       * - Negative numbers
       * - Decimals
       * - Scientific notation
       */

      if (numericField) {
        inputValue =
          inputValue.replace(
            /\D/g,
            ""
          );
      }


      handleChange(
        field.fieldKey,
        inputValue
      );
    };


    return (
      <div
        className="dynamic-field"
        key={field.id}
      >
        <label
          htmlFor={
            field.fieldKey
          }
        >
          {field.label}

          {field.required && (
            <span className="required-mark">
              {" "}
              *
            </span>
          )}

        </label>

        <input
          id={field.fieldKey}
          type={
            phoneField ||
            numericField
              ? "text"
              : inputType
          }

          inputMode={
            phoneField ||
            numericField
              ? "numeric"
              : undefined
          }

          pattern={
            phoneField ||
            numericField
              ? "[0-9]*"
              : undefined
          }

          maxLength={
            phoneField
              ? 10
              : undefined
          }

          value={value}

          placeholder={
            field.placeholder ||
            ""
          }

          required={
            field.required
          }

          onChange={
            handleInputChange
          }

          onKeyDown={(
            event
          ) => {
            if (
              (
                phoneField ||
                numericField
              ) &&
              [
                "-",
                "+",
                "e",
                "E",
                ".",
              ].includes(
                event.key
              )
            ) {
              event.preventDefault();
            }
          }}

        />

      </div>
    );
  };


  /* =======================================================
     DOMAIN CHECK
  ======================================================= */

  if (!domain) {
    return (
      <div className="dynamic-form-page">

        <div className="dynamic-form-error-page">

          <h2>
            Domain information unavailable
          </h2>

          <p>
            Please contact the administrator.
          </p>

          <button
            type="button"
            onClick={
              handleGoToDashboard
            }
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );
  }


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        className="dynamic-form-page"
        style={{
          "--domain-accent":
            domain.accent,
          "--domain-light":
            domain.light,
        }}
      >

        <aside className="dashboard-sidebar">

          <div className="sidebar-top">

            <div className="sidebar-brand">

              <div className="sidebar-brand-icon">
                🌿
              </div>

              <div>

                <h1>
                  DFB
                </h1>

                <span>
                  Dynamic Form Builder
                </span>

              </div>

            </div>


            <div className="sidebar-domain">

              <div className="domain-main-icon">
                {domain.icon}
              </div>

              <div>

                <strong>
                  {domain.name}
                </strong>

                <span>
                  User Portal
                </span>

              </div>

            </div>

          </div>


          <div className="sidebar-bottom">

            <button
              type="button"
              className="sidebar-item logout-item"
              onClick={handleLogout}
            >
              <span className="sidebar-item-icon">
                ↪
              </span>

              <span>
                Logout
              </span>

            </button>

          </div>

        </aside>


        <div className="dynamic-form-main">

          <div className="dynamic-form-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading form...
            </p>

          </div>

        </div>

      </div>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error &&
    !submitting
  ) {
    return (
      <div
        className="dynamic-form-page"
        style={{
          "--domain-accent":
            domain.accent,
          "--domain-light":
            domain.light,
        }}
      >

        <aside className="dashboard-sidebar">

          <div className="sidebar-top">

            <div className="sidebar-brand">

              <div className="sidebar-brand-icon">
                🌿
              </div>

              <div>

                <h1>
                  DFB
                </h1>

                <span>
                  Dynamic Form Builder
                </span>

              </div>

            </div>


            <div className="sidebar-domain">

              <div className="domain-main-icon">
                {domain.icon}
              </div>

              <div>

                <strong>
                  {domain.name}
                </strong>

                <span>
                  User Portal
                </span>

              </div>

            </div>

          </div>


          <div className="sidebar-bottom">

            <button
              type="button"
              className="sidebar-item logout-item"
              onClick={handleLogout}
            >
              <span className="sidebar-item-icon">
                ↪
              </span>

              <span>
                Logout
              </span>

            </button>

          </div>

        </aside>


        <div className="dynamic-form-main">

          <div className="dynamic-form-card error-card">

            <div className="error-icon">
              !
            </div>

            <h2>
              Unable to Load Form
            </h2>

            <p className="dynamic-form-error">
              {error}
            </p>

            <button
              type="button"
              className="primary-action-button"
              onClick={
                handleGoToDashboard
              }
            >
              Back to Dashboard
            </button>

          </div>

        </div>

      </div>
    );
  }


  /* =======================================================
     MAIN FORM
  ======================================================= */

  return (
    <div
      className="dynamic-form-page"
      style={{
        "--domain-accent":
          domain.accent,

        "--domain-light":
          domain.light,
      }}
    >

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-top">

          <div className="sidebar-brand">

            <div className="sidebar-brand-icon">
              🌿
            </div>

            <div>

              <h1>
                DFB
              </h1>

              <span>
                Dynamic Form Builder
              </span>

            </div>

          </div>


          <div className="sidebar-domain">

            <div className="domain-main-icon">
              {domain.icon}
            </div>

            <div>

              <strong>
                {domain.name}
              </strong>

              <span>
                User Portal
              </span>

            </div>

          </div>


          <nav className="sidebar-navigation">

            <button
              type="button"
              className="sidebar-item"
              onClick={
                handleGoToDashboard
              }
            >
              <span className="sidebar-item-icon">
                ⌂
              </span>

              <span>
                Dashboard
              </span>

            </button>


            <button
              type="button"
              className="sidebar-item active"
            >
              <span className="sidebar-item-icon">
                ▤
              </span>

              <span>
                My Forms
              </span>

            </button>


            <button
              type="button"
              className="sidebar-item"
              onClick={
                handleGoToSubmissions
              }
            >
              <span className="sidebar-item-icon">
                ▣
              </span>

              <span>
                My Submissions
              </span>

            </button>


            <button
              type="button"
              className="sidebar-item"
            >
              <span className="sidebar-item-icon">
                ♙
              </span>

              <span>
                Profile
              </span>

            </button>

          </nav>

        </div>


        <div className="sidebar-bottom">

          <div className="sidebar-quote">

            <div className="quote-icon">
              {domain.icon}
            </div>

            <p>
              "Collect Better Data.
              <br />
              Grow a Better Tomorrow."
            </p>

          </div>


          <button
            type="button"
            className="sidebar-item logout-item"
            onClick={handleLogout}
          >
            <span className="sidebar-item-icon">
              ↪
            </span>

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* MAIN */}

      <div className="dynamic-form-main">


        {/* HEADER */}

        <header className="dynamic-form-header-bar">

          <div className="form-header-title">

            <span>
              {domain.icon}{" "}
              {domain.name}
            </span>

            <strong>
              New Visit
            </strong>

          </div>


          <div className="form-header-user">

            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
            >
              ♧

              <span className="notification-dot"></span>

            </button>


            <div className="header-user-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>


            <div className="header-user-info">

              <strong>
                {user?.name}
              </strong>

              <span>
                USER
              </span>

            </div>

          </div>

        </header>


        {/* CONTENT */}

        <main className="dynamic-form-content">

          <div className="dynamic-form-card">

            <div className="dynamic-form-title">

              <button
                type="button"
                className="back-button"
                onClick={
                  handleGoToDashboard
                }
              >
                ← Back to Dashboard
              </button>


              <div className="form-title-main">

                <div className="form-title-icon">
                  {getVisitIcon(
                    visitName
                  )}
                </div>


                <div>

                  <span className="form-domain-label">
                    {domain.name} VISIT
                  </span>

                  <h1>
                    {visitName}
                  </h1>

                  <p>
                    Fill in the details below
                    to record this visit.
                  </p>

                </div>

              </div>

            </div>


            <div className="form-divider"></div>


            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="dynamic-fields">

                {fields.map(
                  (field) =>
                    renderField(field)
                )}

              </div>


              {error && (
                <div className="form-submit-error">
                  {error}
                </div>
              )}


              <div className="form-actions">

                <button
                  type="button"
                  className="form-cancel-button"
                  onClick={
                    handleGoToDashboard
                  }
                  disabled={
                    submitting
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="dynamic-submit-button"
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Visit"}
                </button>

              </div>

            </form>

          </div>

        </main>


        {/* FOOTER */}

        <footer className="dashboard-footer">

          <span>
            🌿{" "}
            <strong>
              DFB
            </strong>
            {" | "}
            Dynamic Form Builder
          </span>

          <span>
            One Domain.
            Smarter Data.
            Greater Impact.
          </span>

        </footer>

      </div>


      {/* ===================================================
          SUCCESS SUBMISSION POPUP
      =================================================== */}

      {successMessage && (
        <div className="submission-success-overlay">

          <div className="submission-success-popup">

            <button
              type="button"
              className="submission-success-close"
              onClick={
                handleCloseSuccessPopup
              }
              aria-label="Close success popup"
            >
              ×
            </button>


            <div className="success-popup-icon-wrapper">

              <div className="success-popup-icon">
                ✓
              </div>

            </div>


            <span className="success-popup-label">
              SUBMISSION SUCCESSFUL
            </span>


            <h2>
              Visit Submitted Successfully!
            </h2>


            <p>
              Your{" "}
              <strong>
                {visitName}
              </strong>{" "}
              details have been successfully
              recorded.
            </p>


            {/* NEW INSTRUCTION */}

            <div className="success-popup-instruction">

              <span className="instruction-icon">
                ▣
              </span>

              <div>

                <strong>
                  View Your Submission
                </strong>

                <span>
                  You can view your submitted form
                  in the <b>Form Submissions</b> tab.
                </span>

              </div>

            </div>


            <div className="success-popup-status">

              <span className="success-status-check">
                ✓
              </span>

              <span>
                Submission saved successfully
              </span>

            </div>


            {/* VIEW SUBMISSIONS BUTTON */}

            <button
              type="button"
              className="view-submissions-button"
              onClick={
                handleGoToSubmissions
              }
            >
              View Form Submissions
              <span>
                →
              </span>
            </button>


            {/* 10 SECOND COUNTDOWN */}

            <div className="success-popup-redirect">

              <span className="redirect-loader"></span>

              <span>
                Returning to dashboard in{" "}
                <strong>
                  {redirectCountdown}
                </strong>{" "}
                second
                {redirectCountdown !== 1
                  ? "s"
                  : ""}
                ...
              </span>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default DynamicForm;