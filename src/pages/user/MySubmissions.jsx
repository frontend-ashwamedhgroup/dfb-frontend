import {
  useEffect,
  useMemo,
  useState,
} from "react";

import * as XLSX from "xlsx";

import {
  useNavigate,
} from "react-router-dom";

import {
  getMySubmissions,
  getMySubmissionById,
} from "../../services/submissionService";

import {
  useAuth,
} from "../../context/AuthContext";

import "./MySubmissions.css";


/* =====================================================
   MY SUBMISSIONS COMPONENT
===================================================== */

function MySubmissions() {


  const navigate =
    useNavigate();


  const {
    user,
  } = useAuth();


  /* ===================================================
     STATES
  =================================================== */

  const [
    submissions,
    setSubmissions,
  ] = useState([]);


  const [
    selectedVisitTypeId,
    setSelectedVisitTypeId,
  ] = useState("");


  const [
    submissionDetails,
    setSubmissionDetails,
  ] = useState([]);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    fromDate,
    setFromDate,
  ] = useState("");


  const [
    toDate,
    setToDate,
  ] = useState("");


  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    tableLoading,
    setTableLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /* ===================================================
     CURRENT USER DOMAIN
  =================================================== */

  const currentDomainId =
    Number(
      user?.domainId
    );


  /* ===================================================
     FORMAT DATE
  =================================================== */

  const formatDate =
    (date) => {

      if (
        !date
      ) {

        return "-";

      }


      const parsedDate =
        new Date(
          date
        );


      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {

        return date;

      }


      return parsedDate.toLocaleString();

    };


  /* ===================================================
     LOAD SUBMISSION HISTORY
  =================================================== */

  const loadSubmissions =
    async () => {

      try {

        setLoading(
          true
        );


        setError(
          ""
        );


        const response =
          await getMySubmissions();


        let submissionList =
          [];


        /* ===============================================
           SUPPORT DIFFERENT RESPONSE STRUCTURES
        =============================================== */

        if (
          Array.isArray(
            response
          )
        ) {

          submissionList =
            response;

        }


        else if (
          Array.isArray(
            response?.data
          )
        ) {

          submissionList =
            response.data;

        }


        else if (
          Array.isArray(
            response?.content
          )
        ) {

          submissionList =
            response.content;

        }


        /*
         * Backend already returns the correct
         * visitTypeId and visitTypeName.
         */

        const validSubmissions =
          submissionList.filter(
            (submission) =>
              submission.visitTypeId
          );


        setSubmissions(
          validSubmissions
        );


        /*
         * Select the first available visit type.
         */

        if (
          validSubmissions.length > 0
        ) {

          const firstVisitTypeId =
            validSubmissions[0]
              .visitTypeId;


          setSelectedVisitTypeId(
            String(
              firstVisitTypeId
            )
          );

        }


        else {

          setSelectedVisitTypeId(
            ""
          );

        }

      } catch (err) {

        console.error(
          "Failed to load submissions:",
          err
        );


        const errorMessage =

          err.response?.data?.message ||

          err.response?.data?.error ||

          "Failed to load submissions.";


        setError(

          typeof errorMessage ===
          "string"

            ? errorMessage

            : "Failed to load submissions."

        );

      } finally {

        setLoading(
          false
        );

      }

    };


  /* ===================================================
     LOAD SUBMISSIONS ON PAGE OPEN
  =================================================== */

  useEffect(() => {

    loadSubmissions();

  }, [

    currentDomainId,

  ]);


  /* ===================================================
     AVAILABLE VISIT TYPES

     Generated dynamically from backend submissions.
  =================================================== */

  const availableVisitTypes =
    useMemo(
      () => {

        const visitTypeMap =
          new Map();


        submissions.forEach(
          (submission) => {

            if (
              submission.visitTypeId
            ) {

              visitTypeMap.set(

                String(
                  submission.visitTypeId
                ),

                {

                  id:
                    submission.visitTypeId,

                  name:
                    submission.visitTypeName ||

                    submission.formName ||

                    `Visit Type ${submission.visitTypeId}`,

                }

              );

            }

          }
        );


        return Array.from(
          visitTypeMap.values()
        );

      },

      [

        submissions,

      ]

    );


  /* ===================================================
     SELECTED VISIT TYPE SUBMISSIONS
  =================================================== */

  const selectedSubmissions =
    useMemo(
      () => {

        if (
          !selectedVisitTypeId
        ) {

          return [];

        }


        return submissions.filter(
          (submission) =>

            String(
              submission.visitTypeId
            ) ===
            String(
              selectedVisitTypeId
            )

        );

      },

      [

        submissions,
        selectedVisitTypeId,

      ]

    );


  /* ===================================================
     SELECTED VISIT TYPE NAME
  =================================================== */

  const selectedVisitType =
    availableVisitTypes.find(

      (visitType) =>

        String(
          visitType.id
        ) ===
        String(
          selectedVisitTypeId
        )

    );


  /* ===================================================
     LOAD SELECTED SUBMISSION DETAILS
  =================================================== */

  useEffect(() => {


    const loadSubmissionDetails =
      async () => {


        /*
         * No visit type selected.
         */

        if (
          !selectedVisitTypeId
        ) {

          setSubmissionDetails(
            []
          );


          return;

        }


        /*
         * No submissions available.
         */

        if (
          selectedSubmissions.length ===
          0
        ) {

          setSubmissionDetails(
            []
          );


          return;

        }


        try {

          setTableLoading(
            true
          );


          setError(
            ""
          );


          /*
           * Load details for every submission
           * belonging to the selected visit type.
           */

          const detailResponses =
            await Promise.all(

              selectedSubmissions.map(

                (submission) =>

                  getMySubmissionById(
                    submission.submissionId
                  )

              )

            );


          setSubmissionDetails(
            detailResponses
          );


        } catch (err) {

          console.error(
            "Failed to load submission details:",
            err
          );


          const errorMessage =

            err.response?.data?.message ||

            err.response?.data?.error ||

            "Failed to load submission details.";


          setError(

            typeof errorMessage ===
            "string"

              ? errorMessage

              : "Failed to load submission details."

          );


          setSubmissionDetails(
            []
          );


        } finally {

          setTableLoading(
            false
          );

        }

      };


    loadSubmissionDetails();


  }, [

    selectedVisitTypeId,
    selectedSubmissions,

  ]);


  /* ===================================================
     DYNAMIC TABLE COLUMNS

     Generated from fieldLabel.
  =================================================== */

  const tableColumns =
    useMemo(
      () => {

        const columnMap =
          new Map();


        submissionDetails.forEach(
          (submission) => {

            submission.values?.forEach(
              (field) => {

                /*
                 * fieldKey is the stable identifier.
                 * fieldLabel is shown to the user.
                 */

                if (
                  field.fieldKey &&
                  !columnMap.has(
                    field.fieldKey
                  )
                ) {

                  columnMap.set(

                    field.fieldKey,

                    {

                      fieldKey:
                        field.fieldKey,

                      fieldLabel:
                        field.fieldLabel ||

                        field.fieldKey,

                    }

                  );

                }

              }
            );

          }
        );


        return Array.from(
          columnMap.values()
        );

      },

      [

        submissionDetails,

      ]

    );


  /* ===================================================
     FORMAT FIELD VALUE
  =================================================== */

  const formatFieldValue =
    (value) => {

      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {

        return "-";

      }


      /*
       * Arrays
       */

      if (
        Array.isArray(
          value
        )
      ) {

        return value.join(
          ", "
        );

      }


      /*
       * Objects
       */

      if (
        typeof value ===
        "object"
      ) {

        return JSON.stringify(
          value
        );

      }


      return String(
        value
      );

    };


  /* ===================================================
     FILTER TABLE ROWS

     Search
     From Date
     To Date
     Month
  =================================================== */

  const filteredSubmissionDetails =
    useMemo(
      () => {

        return submissionDetails.filter(
          (submission) => {


            /* ===========================================
               SUBMISSION DATE
            =========================================== */

            const submissionDate =
              submission.submittedAt
                ? new Date(
                    submission.submittedAt
                  )
                : null;


            const validSubmissionDate =
              submissionDate &&

              !Number.isNaN(
                submissionDate.getTime()
              );


            /* ===========================================
               FROM DATE FILTER
            =========================================== */

            if (
              fromDate
            ) {

              /*
               * If a date filter is applied,
               * submissions without a valid date
               * should not be included.
               */

              if (
                !validSubmissionDate
              ) {

                return false;

              }


              const from =
                new Date(
                  `${fromDate}T00:00:00`
                );


              if (
                submissionDate < from
              ) {

                return false;

              }

            }


            /* ===========================================
               TO DATE FILTER
            =========================================== */

            if (
              toDate
            ) {

              if (
                !validSubmissionDate
              ) {

                return false;

              }


              const to =
                new Date(
                  `${toDate}T23:59:59.999`
                );


              if (
                submissionDate > to
              ) {

                return false;

              }

            }


            /* ===========================================
               MONTH FILTER
            =========================================== */

            if (
              selectedMonth
            ) {

              if (
                !validSubmissionDate
              ) {

                return false;

              }


              const month =
                submissionDate.getMonth() +
                1;


              if (
                Number(
                  selectedMonth
                ) !==
                month
              ) {

                return false;

              }

            }


            /* ===========================================
               SEARCH FILTER
            =========================================== */

            if (
              !search.trim()
            ) {

              return true;

            }


            const searchText =
              search
                .trim()
                .toLowerCase();


            /*
             * Search visit type.
             */

            if (

              submission.visitTypeName
                ?.toLowerCase()
                .includes(
                  searchText
                )

            ) {

              return true;

            }


            /*
             * Search submitted date.
             */

            if (

              formatDate(
                submission.submittedAt
              )
                .toLowerCase()
                .includes(
                  searchText
                )

            ) {

              return true;

            }


            /*
             * Search all dynamic field labels
             * and values.
             */

            return submission.values?.some(
              (field) => {


                const label =
                  String(
                    field.fieldLabel ||
                    ""
                  )
                    .toLowerCase();


                const value =
                  formatFieldValue(
                    field.value
                  )
                    .toLowerCase();


                return (

                  label.includes(
                    searchText
                  )

                  ||

                  value.includes(
                    searchText
                  )

                );

              }
            );

          }
        );

      },

      [

        submissionDetails,
        search,
        fromDate,
        toDate,
        selectedMonth,

      ]

    );


  /* ===================================================
     CLEAR FILTERS
  =================================================== */

  const handleClearFilters =
    () => {

      setSearch(
        ""
      );


      setFromDate(
        ""
      );


      setToDate(
        ""
      );


      setSelectedMonth(
        ""
      );

    };


  /* ===================================================
     EXPORT TO EXCEL
  =================================================== */

  const handleExportToExcel =
    () => {

      if (
        filteredSubmissionDetails.length ===
        0
      ) {

        return;

      }


      /*
       * Convert filtered submission data
       * into Excel-friendly objects.
       */

      const excelData =
        filteredSubmissionDetails.map(
          (
            submission,
            index
          ) => {


            const row = {

              "#":
                index + 1,

              "Submitted On":
                formatDate(
                  submission.submittedAt
                ),

            };


            /*
             * Create field value lookup.
             */

            const valueMap =
              new Map(

                submission.values?.map(

                  (field) => [

                    field.fieldKey,

                    field.value,

                  ]

                ) || []

              );


            /*
             * Add dynamic fields.
             */

            tableColumns.forEach(
              (column) => {

                row[
                  column.fieldLabel
                ] =
                  formatFieldValue(

                    valueMap.get(
                      column.fieldKey
                    )

                  );

              }
            );


            return row;

          }
        );


      /*
       * Create worksheet.
       */

      const worksheet =
        XLSX.utils.json_to_sheet(
          excelData
        );


      /*
       * Set reasonable column widths.
       */

      const columnWidths =
        [

          { wch: 8 },

          { wch: 24 },

          ...tableColumns.map(
            () => (
              {
                wch: 22,
              }
            )
          ),

        ];


      worksheet["!cols"] =
        columnWidths;


      /*
       * Create workbook.
       */

      const workbook =
        XLSX.utils.book_new();


      XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Submissions"

      );


      /*
       * Generate safe filename.
       */

      const visitTypeName =
        selectedVisitType?.name
          ?.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          )

          ||

        "Submissions";


      const currentDate =
        new Date()
          .toISOString()
          .split(
            "T"
          )[0];


      const fileName =

        `${visitTypeName}_Submissions_${currentDate}.xlsx`;


      /*
       * Download Excel file.
       */

      XLSX.writeFile(

        workbook,

        fileName

      );

    };


  /* ===================================================
     REFRESH
  =================================================== */

  const handleRefresh =
    async () => {

      handleClearFilters();


      setSelectedVisitTypeId(
        ""
      );


      setSubmissionDetails(
        []
      );


      await loadSubmissions();

    };


  /* ===================================================
     LOADING
  =================================================== */

  if (
    loading
  ) {

    return (

      <div className="submissions-page">

        <div className="submissions-loading">

          <div className="submissions-spinner">
          </div>


          <p>
            Loading submissions...
          </p>

        </div>

      </div>

    );

  }


  /* ===================================================
     ERROR
  =================================================== */

  if (
    error &&
    submissions.length ===
    0
  ) {

    return (

      <div className="submissions-page">

        <div className="submissions-error">

          <h2>
            Unable to Load Submissions
          </h2>


          <p>
            {error}
          </p>


          <div className="error-actions">

            <button
              type="button"
              onClick={
                loadSubmissions
              }
            >
              Try Again
            </button>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >
              Back to Dashboard
            </button>

          </div>

        </div>

      </div>

    );

  }


  /* ===================================================
     MAIN PAGE
  =================================================== */

  return (

    <div className="submissions-page">


      {/* ================================================
         PAGE HEADER
      ================================================= */}

      <div className="submissions-page-header">


        <div>

          <h1>
            My Submissions
          </h1>


          <p>
            View your submitted forms in a table.
          </p>

        </div>


        <div className="submissions-header-actions">


          <button
            type="button"
            className="back-dashboard-button"
            onClick={
              handleRefresh
            }
          >
            ↻ Refresh
          </button>


          <button
            type="button"
            className="back-dashboard-button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            ← Dashboard
          </button>


        </div>


      </div>


      {/* ================================================
         FILTERS
      ================================================= */}

      <div className="submissions-filter-card">


        {/* SEARCH */}

        <div className="filter-group search-group">


          <label>
            Search
          </label>


          <div className="search-input-wrapper">


            <span>
              🔍
            </span>


            <input
              type="text"
              placeholder="Search submitted data..."
              value={
                search
              }
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />


          </div>


        </div>


        {/* FROM DATE */}

        <div className="filter-group">


          <label>
            From Date
          </label>


          <input
            type="date"
            value={
              fromDate
            }
            onChange={(event) =>
              setFromDate(
                event.target.value
              )
            }
          />


        </div>


        {/* TO DATE */}

        <div className="filter-group">


          <label>
            To Date
          </label>


          <input
            type="date"
            value={
              toDate
            }
            onChange={(event) =>
              setToDate(
                event.target.value
              )
            }
          />


        </div>


        {/* MONTH */}

        <div className="filter-group">


          <label>
            Month
          </label>


          <select
            value={
              selectedMonth
            }
            onChange={(event) =>
              setSelectedMonth(
                event.target.value
              )
            }
          >

            <option value="">
              All Months
            </option>


            <option value="1">
              January
            </option>


            <option value="2">
              February
            </option>


            <option value="3">
              March
            </option>


            <option value="4">
              April
            </option>


            <option value="5">
              May
            </option>


            <option value="6">
              June
            </option>


            <option value="7">
              July
            </option>


            <option value="8">
              August
            </option>


            <option value="9">
              September
            </option>


            <option value="10">
              October
            </option>


            <option value="11">
              November
            </option>


            <option value="12">
              December
            </option>


          </select>


        </div>


        {/* CLEAR FILTERS */}

        <button
          type="button"
          className="clear-filter-button"
          onClick={
            handleClearFilters
          }
        >
          ✕ Clear
        </button>


      </div>


      {/* ================================================
         VISIT TYPE TABS
      ================================================= */}

      {
        availableVisitTypes.length >
        0

          &&

          (

            <div className="visit-type-tabs-card">


              <div className="visit-type-tabs-header">

                <h3>
                  Visit Types
                </h3>


                <p>
                  Select a visit type to view submissions.
                </p>


              </div>


              <div className="visit-type-tabs">


                {
                  availableVisitTypes.map(

                    (visitType) => (

                      <button
                        key={
                          visitType.id
                        }
                        type="button"
                        className={
                          `visit-type-tab ${
                            String(
                              selectedVisitTypeId
                            ) ===
                            String(
                              visitType.id
                            )

                              ? "active"

                              : ""

                          }`
                        }
                        onClick={() =>
                          setSelectedVisitTypeId(

                            String(
                              visitType.id
                            )

                          )
                        }
                      >

                        {
                          visitType.name
                        }

                      </button>

                    )

                  )
                }


              </div>


            </div>

          )

      }


      {/* ================================================
         TABLE CARD
      ================================================= */}

      <div className="submissions-table-card">


        <div className="table-card-header">


          <div>

            <h2>

              {
                selectedVisitType?.name ||

                "Submissions"

              }

            </h2>


            <p>

              {
                filteredSubmissionDetails.length
              }

              {" "}

              submission

              {
                filteredSubmissionDetails.length !==
                1

                  ? "s"

                  : ""

              }

              {" "}

              found

            </p>


          </div>


          {/* EXPORT TO EXCEL */}

          <button
            type="button"
            className="export-excel-button"
            onClick={
              handleExportToExcel
            }
            disabled={
              filteredSubmissionDetails.length ===
              0
            }
          >
            ⬇ Export to Excel
          </button>


        </div>


        {/* ==============================================
           TABLE LOADING
        =============================================== */}

        {
          tableLoading

            ? (

              <div className="submissions-table-loading">


                <div className="submissions-spinner">
                </div>


                <p>
                  Loading submitted data...
                </p>


              </div>

            )


            /* ==========================================
               EMPTY STATE
            =========================================== */

            : filteredSubmissionDetails.length ===
              0

              ? (

                <div className="empty-submissions">


                  <div className="empty-icon">
                    📋
                  </div>


                  <h3>
                    No Submissions Found
                  </h3>


                  <p>

                    {
                      search ||
                      fromDate ||
                      toDate ||
                      selectedMonth

                        ? "No submitted data matches your filters."

                        : "No submissions are available for this visit type."

                    }

                  </p>


                  <button
                    type="button"
                    className="back-dashboard-button"
                    onClick={() =>
                      navigate(
                        "/dashboard"
                      )
                    }
                  >
                    Go to Dashboard
                  </button>


                </div>

              )


              /* ========================================
                 DYNAMIC TABLE
              ========================================= */

              : (

                <div className="table-responsive">


                  <table className="submissions-table">


                    <thead>

                      <tr>


                        <th>
                          #
                        </th>


                        <th>
                          Submitted On
                        </th>


                        {
                          tableColumns.map(
                            (column) => (

                              <th
                                key={
                                  column.fieldKey
                                }
                              >

                                {
                                  column.fieldLabel
                                }

                              </th>

                            )
                          )
                        }


                      </tr>

                    </thead>


                    <tbody>


                      {
                        filteredSubmissionDetails.map(

                          (
                            submission,
                            index
                          ) => {


                            /*
                             * Convert field values
                             * into a lookup map.
                             */

                            const valueMap =
                              new Map(

                                submission.values?.map(

                                  (field) => [

                                    field.fieldKey,

                                    field.value,

                                  ]

                                ) || []

                              );


                            return (

                              <tr
                                key={
                                  submission.submissionId
                                }
                                className="submission-row"
                              >


                                <td>

                                  {
                                    index + 1
                                  }

                                </td>


                                <td>

                                  {
                                    formatDate(
                                      submission.submittedAt
                                    )
                                  }

                                </td>


                                {
                                  tableColumns.map(
                                    (column) => (

                                      <td
                                        key={
                                          column.fieldKey
                                        }
                                      >

                                        {
                                          formatFieldValue(

                                            valueMap.get(
                                              column.fieldKey
                                            )

                                          )
                                        }

                                      </td>

                                    )
                                  )
                                }


                              </tr>

                            );

                          }

                        )
                      }


                    </tbody>


                  </table>


                </div>

              )

        }


      </div>


    </div>

  );

}


export default MySubmissions;