import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Input from "../../components/ui/Input";

import Button from "../../components/ui/Button";

import {
  loginAdmin as loginAdminApi,
} from "../../services/adminAuthService";

import {
  useAuth,
} from "../../context/AuthContext";

import "./AdminLogin.css";


function AdminLogin() {


  const navigate =
    useNavigate();


  const {
    loginAdmin,
  } = useAuth();


  /* ===================================================
     STATE
  =================================================== */

  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  /* ===================================================
     LOGIN
  =================================================== */

  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setError("");

      setLoading(true);


      try {

        const data =
          await loginAdminApi(
            email,
            password
          );


        /* =============================================
           SECURITY CHECK
        ============================================= */

        if (
          data?.user?.role !==
          "ADMIN"
        ) {

          setError(
            "This account does not have administrator access."
          );

          return;

        }


        /* =============================================
           SAVE ADMIN SESSION
        ============================================= */

        loginAdmin(
          data.user,
          data.token
        );


        /* =============================================
           ADMIN DASHBOARD
        ============================================= */

        navigate(
          "/admin/dashboard",
          {
            replace: true,
          }
        );


      } catch (error) {

        console.error(
          "Admin login failed:",
          error
        );


        setError(

          error.response?.data?.message ||

          error.response?.data ||

          "Admin login failed. Please check your email and password."

        );


      } finally {

        setLoading(false);

      }

    };


  /* ===================================================
     UI
  =================================================== */

  return (

    <div className="admin-login-page">


      <div className="admin-login-container">


        {/* =============================================
           LEFT BRAND PANEL
        ============================================= */}

        <div className="admin-login-brand">


          <div className="admin-brand-content">


            <div className="admin-brand-badge">

              ADMIN PORTAL

            </div>


            <h1>

              Dynamic

              <br />

              Form Builder

            </h1>


            <p>

              Manage. Configure. Monitor.

            </p>


          </div>


          <div className="admin-brand-illustration">


            <div className="admin-shield">

              ⚙

            </div>


            <div className="admin-floating-item admin-item-one">

              📋

            </div>


            <div className="admin-floating-item admin-item-two">

              👥

            </div>


            <div className="admin-floating-item admin-item-three">

              📊

            </div>


          </div>


        </div>


        {/* =============================================
           LOGIN PANEL
        ============================================= */}

        <div className="admin-login-form-section">


          <div className="admin-login-header">


            <div className="admin-login-icon">

              🔐

            </div>


            <h2>

              Administrator Login

            </h2>


            <p>

              Sign in to manage your Dynamic Form Builder.

            </p>


          </div>


          <form
            onSubmit={
              handleSubmit
            }
            className="admin-login-form"
          >


            <Input
              label="Admin Email"
              type="email"
              name="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter your admin email"
              required
            />


            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Enter your password"
              required
            />


            {
              error && (

                <p className="admin-login-error">

                  {
                    error
                  }

                </p>

              )
            }


            <Button
              type="submit"
              disabled={
                loading
              }
            >

              {
                loading

                  ? "Signing in..."

                  : "Login to Admin Portal"
              }

            </Button>


            <p className="admin-register-link">

              New administrator?

              {" "}


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/register"
                  )
                }
              >

                Register

              </button>


            </p>


          </form>


        </div>


      </div>


    </div>

  );

}


export default AdminLogin;