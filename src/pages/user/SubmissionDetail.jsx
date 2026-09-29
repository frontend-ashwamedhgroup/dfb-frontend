import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getMySubmissionById,
} from "../../services/submissionService";

import {
  useAuth,
} from "../../context/AuthContext";

import "./SubmissionDetail.css";


/* =========================================================
   DOMAIN CONFIG
========================================================= */

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


/* =========================================================
   CORRECT VISIT TYPE NAMES
========================================================= */

const visitNames = {

  /* AGRO */

  1: "Dealer Visit",
  2: "Farmer Visit",
  3: "Nursery Visit",


  /* FMCG */

  4: "Branch Visit",
  5: "Doctor Visit",
  6: "Corporate Office Visit",


  /* POULTRY */

  7: "Dealer Visit",
  8: "Farmer Visit",
  9: "Branch Person Visit",
  10: "Corporate Office Person Visit",
  11: "Dealer Visit",
  12: "Corporate Visit",
  13: "Corporate Person Visit",

};


/* =========================================================
   VISIT ICON
========================================================= */

const getVisitIcon =
  (visitName = "") => {

    const name =
      visitName.toLowerCase();


    if (
      name.includes("dealer")
    ) {
      return "🏪";
    }


    if (
      name.includes("farmer")
    ) {
      return "👨‍🌾";
    }


    if (
      name.includes("nursery")
    ) {
      return "🌱";
    }


    if (
      name.includes("doctor")
    ) {
      return "🩺";
    }


    if (
      name.includes(
        "branch person"
      )
    ) {
      return "👤";
    }


    if (
      name.includes(
        "branch"
      )
    ) {
      return "🏢";
    }


    if (
      name.includes(
        "corporate office person"
      )
    ) {
      return "👤";
    }


    if (
      name.includes(
        "corporate office"
      )
    ) {
      return "🏢";
    }


    if (
      name.includes(
        "corporate person"
      )
    ) {
      return "👤";
    }


    if (
      name.includes(
        "corporate"
      )
    ) {
      return "🏢";
    }


    return "📋";

  };


/* =========================================================
   FORMAT FIELD LABEL
========================================================= */

const formatFieldLabel =
  (fieldKey = "") => {

    return fieldKey

      .replace(
        /([A-Z])/g,
        " $1"
      )

      .replace(
        /_/g,
        " "
      )

      .replace(
        /^./,
        (character) =>
          character.toUpperCase()
      );

  };


/* =========================================================
   FORMAT VALUE
========================================================= */

const formatValue =
  (value) => {

    if (

      value === null ||

      value === undefined ||

      value === ""

    ) {

      return "-";

    }


    if (
      Array.isArray(
        value
      )
    ) {

      return value
        .map(
          (item) =>
            formatValue(
              item
            )
        )
        .join(", ");

    }


    if (
      value === true ||
      value === "true"
    ) {

      return "Yes";

    }


    if (
      value === false ||
      value === "false"
    ) {

      return "No";

    }


    /*
     * OBJECT VALUE
     *
     * Try to show readable values
     * instead of raw JSON.
     */

    if (
      typeof value ===
      "object"
    ) {

      if (
        value.label
      ) {

        return String(
          value.label
        );

      }


      if (
        value.name
      ) {

        return String(
          value.name
        );

      }


      if (
        value.value !==
        undefined
      ) {

        return String(
          value.value
        );

      }


      return Object.values(
        value
      )

        .filter(
          (item) =>

            typeof item !==
            "object"
        )

        .map(
          (item) =>
            String(
              item
            )
        )

        .join(", ");

    }


    return String(
      value
    );

  };


/* =========================================================
   FORMAT DATE
========================================================= */

const formatDateTime =
  (dateValue) => {

    if (
      !dateValue
    ) {

      return "-";

    }


    try {

      const date =
        new Date(
          dateValue
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return dateValue;

      }


      return date.toLocaleString(
        "en-IN",
        {

          day: "2-digit",

          month: "short",

          year: "numeric",

          hour: "2-digit",

          minute: "2-digit",

          hour12: true,

        }
      );


    } catch {

      return dateValue;

    }

  };


/* =========================================================
   SUBMISSION DETAILS
========================================================= */

function SubmissionDetails() {

  const {
    submissionId,
  } = useParams();


  const navigate =
    useNavigate();


  const {
    user,
    logout,
  } = useAuth();


  const [
    submission,
    setSubmission,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const domain =
    domainConfig[
      Number(
        user?.domainId
      )
    ];


  /* =====================================================
     LOAD SUBMISSION
  ===================================================== */

  useEffect(() => {

    const fetchSubmission =
      async () => {

        try {

          setLoading(true);

          setError("");


          const response =
            await getMySubmissionById(
              submissionId
            );


          console.log(
            "Submission details:",
            response
          );


          setSubmission(
            response?.data ||
            response
          );


        } catch (error) {

          console.error(
            "Failed to load submission:",
            error
          );


          setError(

            error.response?.data?.message ||

            error.response?.data?.error ||

            "Unable to load submission details."

          );


        } finally {

          setLoading(false);

        }

      };


    fetchSubmission();


  }, [

    submissionId,

  ]);


  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handleLogout =
    () => {

      logout();

      navigate(
        "/",
        {
          replace: true,
        }
      );

    };


  const handleGoToDashboard =
    () => {

      navigate(
        "/dashboard"
      );

    };


  const handleGoToSubmissions =
    () => {

      navigate(
        "/my-submissions"
      );

    };


  /* =====================================================
     DOMAIN CHECK
  ===================================================== */

  if (
    !domain
  ) {

    return (

      <div className="submission-details-page">

        <div className="submission-details-error-page">

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


  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading
  ) {

    return (

      <div
        className="submission-details-page"
        style={{
          "--domain-accent":
            domain.accent,

          "--domain-light":
            domain.light,
        }}
      >

        <div className="submission-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading submission...
          </p>

        </div>

      </div>

    );

  }


  /* =====================================================
     ERROR
  ===================================================== */

  if (
    error
  ) {

    return (

      <div
        className="submission-details-page"
        style={{
          "--domain-accent":
            domain.accent,

          "--domain-light":
            domain.light,
        }}
      >

        <div className="submission-details-error-card">

          <div className="details-error-icon">
            !
          </div>


          <h2>
            Unable to Load Submission
          </h2>


          <p>
            {
              typeof error ===
              "string"

                ? error

                : "Unable to load submission details."
            }
          </p>


          <button
            type="button"
            onClick={
              handleGoToSubmissions
            }
          >

            Back to My Submissions

          </button>

        </div>

      </div>

    );

  }


  /* =====================================================
     NORMALIZE SUBMITTED VALUES
  ===================================================== */

  const submittedValues =

    submission?.values ||

    submission?.submissionValues ||

    submission?.formValues ||

    submission?.data?.values ||

    {};


  /* =====================================================
     VISIT TYPE ID
  ===================================================== */

  const submissionVisitTypeId =
    Number(

      submission?.visitTypeId ||

      submission?.formId ||

      submission?.form?.id ||

      submission?.visitType?.id

    );


  /* =====================================================
     VISIT TYPE NAME
  ===================================================== */

  const visitName =

    submission?.visitTypeName ||

    submission?.formName ||

    submission?.form?.name ||

    submission?.visitType?.name ||

    visitNames[
      submissionVisitTypeId
    ] ||

    "Visit Submission";


  /* =====================================================
     SUBMITTED DATE
  ===================================================== */

  const submittedAt =

    submission?.submittedAt ||

    submission?.createdAt ||

    submission?.submissionDate;


  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (

    <div
      className="submission-details-page"
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
              className="sidebar-item"
              onClick={
                handleGoToDashboard
              }
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
              className="sidebar-item active"
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

              "Collect Better Data."

              <br />

              Grow a Better Tomorrow."

            </p>

          </div>


          <button
            type="button"
            className="sidebar-item logout-item"
            onClick={
              handleLogout
            }
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

      <div className="submission-details-main">


        <header className="submission-details-header">

          <div className="submission-header-title">

            <span>

              {domain.icon}

              {" "}

              {domain.name}

            </span>


            <strong>
              Submitted Visit
            </strong>

          </div>


          <div className="submission-header-user">

            <div className="header-user-avatar">

              {
                user?.name
                  ?.charAt(0)
                  ?.toUpperCase()
              }

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


        <main className="submission-details-content">

          <div className="submission-details-card">


            <button
              type="button"
              className="submission-back-button"
              onClick={
                handleGoToSubmissions
              }
            >

              ← Back to My Submissions

            </button>


            <div className="submission-details-title">

              <div className="submission-visit-icon">

                {
                  getVisitIcon(
                    visitName
                  )
                }

              </div>


              <div>

                <span className="submission-domain-label">

                  {domain.name} VISIT

                </span>


                <h1>
                  {visitName}
                </h1>


                <p>
                  Submitted form details
                </p>

              </div>

            </div>


            <div className="submission-status-banner">

              <div className="submission-status-icon">
                ✓
              </div>


              <div>

                <strong>
                  Submission Successful
                </strong>


                <span>

                  Submitted on{" "}

                  {
                    formatDateTime(
                      submittedAt
                    )
                  }

                </span>

              </div>

            </div>


            <div className="submission-details-divider"></div>


            <div className="submitted-data-section">


              <div className="submitted-data-heading">

                <h2>
                  Submitted Information
                </h2>


                <span>
                  Read-only
                </span>

              </div>


              <div className="submitted-fields-grid">

  {
    !Array.isArray(submittedValues) ||
    submittedValues.length === 0

      ? (

          <div className="no-submitted-data">

            No submission data found.

          </div>

        )

      : (

          submittedValues.map(
            (field) => (

              <div
                className="submitted-field"
                key={
                  field.fieldId ||
                  field.fieldKey
                }
              >

                <span className="submitted-field-label">

                  {
                    field.fieldLabel ||
                    formatFieldLabel(
                      field.fieldKey
                    )
                  }

                </span>

                <div className="submitted-field-value">

                  {
                    formatValue(
                      field.value
                    )
                  }

                </div>

              </div>

            )
          )

        )

  }

</div>

            </div>


            <div className="submission-details-actions">

              <button
                type="button"
                className="back-to-submissions-button"
                onClick={
                  handleGoToSubmissions
                }
              >

                ← Back to My Submissions

              </button>

            </div>

          </div>

        </main>


        <footer className="dashboard-footer">

          <span>

            🌿

            {" "}

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

    </div>

  );

}


export default SubmissionDetails;