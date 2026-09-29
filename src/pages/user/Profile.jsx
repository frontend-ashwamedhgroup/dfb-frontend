import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  getMySubmissions,
} from "../../services/submissionService";

import "./Profile.css";


/* =====================================================
   PROFILE COMPONENT
===================================================== */

function Profile() {


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
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /* ===================================================
     LOAD USER SUBMISSIONS
  =================================================== */

  useEffect(() => {


    const loadProfileData =
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


          /*
           * Support different backend
           * response structures.
           */

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


          setSubmissions(
            submissionList
          );


        } catch (err) {

          console.error(
            "Failed to load profile statistics:",
            err
          );


          setError(
            "Unable to load submission statistics."
          );


          setSubmissions(
            []
          );


        } finally {

          setLoading(
            false
          );

        }

      };


    loadProfileData();


  }, []);


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


      return parsedDate.toLocaleDateString(
        undefined,
        {

          day:
            "2-digit",

          month:
            "short",

          year:
            "numeric",

        }

      );

    };


  /* ===================================================
     USER DISPLAY NAME
  =================================================== */

  const userName =
    user?.name ||

    user?.fullName ||

    user?.username ||

    "User";


  /* ===================================================
     USER EMAIL
  =================================================== */

  const userEmail =
    user?.email ||

    "-";


  /* ===================================================
     USER INITIAL
  =================================================== */

  const userInitial =
    userName
      .charAt(
        0
      )
      .toUpperCase();


  /* ===================================================
     TOTAL SUBMISSIONS
  =================================================== */

  const totalSubmissions =
    submissions.length;


  /* ===================================================
     VISIT TYPE STATISTICS
  =================================================== */

  const visitTypeStats =
    useMemo(
      () => {

        const visitTypeMap =
          new Map();


        submissions.forEach(
          (submission) => {

            const visitTypeName =

              submission.visitTypeName ||

              submission.formName ||

              "Other";


            const existingCount =

              visitTypeMap.get(
                visitTypeName
              ) ||

              0;


            visitTypeMap.set(

              visitTypeName,

              existingCount + 1

            );

          }
        );


        return Array.from(
          visitTypeMap.entries()
        )
          .map(

            ([
              name,
              count,
            ]) => ({

              name,
              count,

            })

          )
          .sort(

            (
              first,
              second
            ) =>

              second.count -
              first.count

          );

      },

      [

        submissions,

      ]

    );


  /* ===================================================
     TOTAL VISIT TYPES USED
  =================================================== */

  const totalVisitTypes =
    visitTypeStats.length;


  /* ===================================================
     LATEST SUBMISSION
  =================================================== */

  const latestSubmission =
    useMemo(
      () => {

        if (
          submissions.length ===
          0
        ) {

          return null;

        }


        const sortedSubmissions =
          [
            ...submissions,
          ].sort(

            (
              first,
              second
            ) => {

              const firstDate =
                new Date(
                  first.submittedAt ||
                  first.createdAt ||
                  0
                );


              const secondDate =
                new Date(
                  second.submittedAt ||
                  second.createdAt ||
                  0
                );


              return (

                secondDate -
                firstDate

              );

            }

          );


        return sortedSubmissions[0];

      },

      [

        submissions,

      ]

    );


  /* ===================================================
     LATEST SUBMISSION DATE
  =================================================== */

  const latestSubmissionDate =

    latestSubmission

      ? formatDate(

          latestSubmission.submittedAt ||

          latestSubmission.createdAt

        )

      : "No submissions yet";


  /* ===================================================
     MOST ACTIVE VISIT TYPE
  =================================================== */

  const mostActiveVisitType =

    visitTypeStats.length > 0

      ? visitTypeStats[0].name

      : "No activity yet";


  /* ===================================================
     PROGRESS CALCULATION

     Every 10 submissions is a milestone.
  =================================================== */

  const milestoneSize =
    10;


  const currentMilestone =

    Math.floor(

      totalSubmissions /
      milestoneSize

    ) *
    milestoneSize;


  const nextMilestone =

    currentMilestone +
    milestoneSize;


  const progressPercentage =

    totalSubmissions ===
    0

      ? 0

      : (

          (
            totalSubmissions -
            currentMilestone
          ) /

          milestoneSize

        ) *
        100;


  /* ===================================================
     REFRESH PROFILE
  =================================================== */

  const handleRefresh =
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


        setSubmissions(
          submissionList
        );


      } catch (err) {

        console.error(
          "Failed to refresh profile:",
          err
        );


        setError(
          "Unable to refresh profile statistics."
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  /* ===================================================
     LOADING
  =================================================== */

  if (
    loading
  ) {

    return (

      <div className="profile-page">


        <div className="profile-loading">


          <div className="profile-spinner">
          </div>


          <p>
            Loading your profile...
          </p>


        </div>


      </div>

    );

  }


  /* ===================================================
     MAIN PAGE
  =================================================== */

  return (

    <div className="profile-page">


      {/* ================================================
         PAGE HEADER
      ================================================= */}

      <div className="profile-page-header">


        <div>


          <p className="profile-page-eyebrow">
            USER PROFILE
          </p>


          <h1>
            My Profile
          </h1>


          <p>
            View your account details and submission activity.
          </p>


        </div>


        <div className="profile-header-actions">


          <button
            type="button"
            className="profile-refresh-button"
            onClick={
              handleRefresh
            }
          >
            ↻ Refresh
          </button>


          <button
            type="button"
            className="profile-dashboard-button"
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
         PROFILE HERO
      ================================================= */}

      <div className="profile-hero-card">


        <div className="profile-user-main">


          <div className="profile-avatar">

            {
              userInitial
            }

          </div>


          <div className="profile-user-info">


            <p className="profile-welcome">
              WELCOME BACK
            </p>


            <h2>
              {
                userName
              }
            </h2>


            <p className="profile-email">

              ✉

              {" "}

              {
                userEmail
              }

            </p>


          </div>


        </div>


        <div className="profile-activity-badge">


          <span>
            🌱
          </span>


          <div>

            <p>
              Your Activity
            </p>


            <strong>

              {
                totalSubmissions
              }

              {" "}

              Forms Submitted

            </strong>


          </div>


        </div>


      </div>


      {/* ================================================
         ERROR MESSAGE
      ================================================= */}

      {
        error && (

          <div className="profile-warning">

            <span>
              ⚠
            </span>


            <p>
              {
                error
              }
            </p>


          </div>

        )
      }


      {/* ================================================
         STATISTICS
      ================================================= */}

      <div className="profile-stats-grid">


        <div className="profile-stat-card">


          <div className="profile-stat-icon">

            📋

          </div>


          <div>


            <p>
              Total Submissions
            </p>


            <h3>

              {
                totalSubmissions
              }

            </h3>


            <span>
              Forms completed
            </span>


          </div>


        </div>


        <div className="profile-stat-card">


          <div className="profile-stat-icon">

            🗂

          </div>


          <div>


            <p>
              Visit Types Used
            </p>


            <h3>

              {
                totalVisitTypes
              }

            </h3>


            <span>
              Different forms submitted
            </span>


          </div>


        </div>


        <div className="profile-stat-card">


          <div className="profile-stat-icon">

            🏆

          </div>


          <div>


            <p>
              Most Active Visit
            </p>


            <h3 className="profile-stat-text">

              {
                mostActiveVisitType
              }

            </h3>


            <span>
              Your top activity
            </span>


          </div>


        </div>


        <div className="profile-stat-card">


          <div className="profile-stat-icon">

            🕒

          </div>


          <div>


            <p>
              Latest Submission
            </p>


            <h3 className="profile-stat-date">

              {
                latestSubmissionDate
              }

            </h3>


            <span>
              Last recorded activity
            </span>


          </div>


        </div>


      </div>


      {/* ================================================
         ACTIVITY & PROGRESS
      ================================================= */}

      <div className="profile-content-grid">


        {/* ==============================================
           ACTIVITY BREAKDOWN
        =============================================== */}

        <div className="profile-section-card">


          <div className="profile-section-header">


            <div>


              <p className="section-eyebrow">
                ACTIVITY OVERVIEW
              </p>


              <h2>
                Submission Breakdown
              </h2>


              <p>
                Your submissions across different visit types.
              </p>


            </div>


          </div>


          {
            visitTypeStats.length ===
            0

              ? (

                <div className="profile-no-data">


                  <div>
                    📭
                  </div>


                  <h3>
                    No activity yet
                  </h3>


                  <p>
                    Submit your first form to start tracking your progress.
                  </p>


                </div>

              )

              : (

                <div className="visit-type-stat-list">


                  {
                    visitTypeStats.map(

                      (
                        visitType
                      ) => {

                        const percentage =

                          totalSubmissions >
                          0

                            ? (

                                visitType.count /
                                totalSubmissions

                              ) *
                              100

                            : 0;


                        return (

                          <div
                            key={
                              visitType.name
                            }
                            className="visit-type-stat-item"
                          >


                            <div className="visit-type-stat-top">


                              <div>


                                <span className="visit-type-name">

                                  {
                                    visitType.name
                                  }

                                </span>


                                <span className="visit-type-count">

                                  {
                                    visitType.count
                                  }

                                  {" "}

                                  submission

                                  {
                                    visitType.count !==
                                    1

                                      ? "s"

                                      : ""

                                  }

                                </span>


                              </div>


                              <strong>

                                {
                                  Math.round(
                                    percentage
                                  )
                                }

                                %

                              </strong>


                            </div>


                            <div className="visit-type-progress-track">


                              <div
                                className="visit-type-progress-fill"
                                style={{

                                  width:
                                    `${Math.min(
                                      percentage,
                                      100
                                    )}%`,

                                }}
                              >
                              </div>


                            </div>


                          </div>

                        );

                      }

                    )
                  }


                </div>

              )

          }


        </div>


        {/* ==============================================
           GROWTH CARD
        =============================================== */}

        <div className="profile-growth-card">


          <div className="growth-icon">

            📈

          </div>


          <p className="section-eyebrow">
            KEEP GROWING
          </p>


          <h2>
            Great progress,
            {" "}
            {
              userName
            }!
          </h2>


          <p className="growth-description">

            Every submission brings you one step closer
            to your next achievement.

          </p>


          <div className="growth-progress-info">


            <div>


              <span>
                Current Progress
              </span>


              <strong>

                {
                  totalSubmissions
                }

                {" / "}

                {
                  nextMilestone
                }

              </strong>


            </div>


          </div>


          <div className="growth-progress-track">


            <div
              className="growth-progress-fill"
              style={{

                width:
                  `${Math.min(
                    progressPercentage,
                    100
                  )}%`,

              }}
            >
            </div>


          </div>


          <p className="growth-message">

            {
              totalSubmissions ===
              0

                ? "Your journey starts with your first submission."

                : `${nextMilestone - totalSubmissions} more submission${
                    nextMilestone - totalSubmissions !==
                    1

                      ? "s"

                      : ""

                  } to reach ${nextMilestone}!`
            }

          </p>


          <button
            type="button"
            className="profile-growth-button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            Submit Another Form
            {" "}
            →
          </button>


        </div>


      </div>


    </div>

  );

}


export default Profile;