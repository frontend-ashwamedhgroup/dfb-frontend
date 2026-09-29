import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import {
  registerAdmin,
  loginAdmin,
} from "../../services/adminAuthService";

import { useAuth } from "../../context/AuthContext";

import "./AdminRegister.css";


function AdminRegister() {

  const navigate = useNavigate();

  const { loginUser } = useAuth();


  /* ===================================================
     STATE
  =================================================== */

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


  /* ===================================================
     REGISTER ADMIN
  =================================================== */

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");


    /* =================================================
       PASSWORD VALIDATION
    ================================================= */

    if (password !== confirmPassword) {

      setError("Passwords do not match.");

      return;
    }


    setLoading(true);


    try {

      /* ===============================================
         1. REGISTER ADMIN

         Admin does not belong to any domain.
         Therefore domainId is intentionally null.
      =============================================== */

      await registerAdmin({
        name,
        email,
        password,
        domainId: null,
      });


      /* ===============================================
         2. AUTOMATICALLY LOGIN ADMIN
      =============================================== */

      const loginData =
        await loginAdmin(
          email,
          password
        );


      /* ===============================================
         3. VERIFY ADMIN ROLE
      =============================================== */

      if (
        loginData?.user?.role !==
        "ADMIN"
      ) {

        setError(
          "Admin account was created, but administrator access could not be verified."
        );

        return;
      }


      /* ===============================================
         4. STORE ADMIN JWT + USER
      =============================================== */

      loginUser(
        loginData.user,
        loginData.token
      );


      /* ===============================================
         5. GO TO ADMIN DASHBOARD
      =============================================== */

      navigate(
        "/admin/dashboard",
        {
          replace: true,
        }
      );


    } catch (error) {

      console.error(
        "Admin registration/login failed:",
        error
      );


      setError(

        error.response?.data?.message ||

        error.response?.data ||

        "Admin registration failed. Please try again."

      );


    } finally {

      setLoading(false);

    }

  };


  /* ===================================================
     UI
  =================================================== */

  return (

    <div className="admin-register-page">


      <div className="admin-register-container">


        {/* =============================================
            LEFT BRAND SECTION
        ============================================= */}

        <div className="admin-register-brand">


          <div className="admin-brand-content">


            <span className="admin-brand-badge">

              ADMIN PORTAL

            </span>


            <h1>

              Dynamic

              <br />

              Form Builder

            </h1>


            <p>

              Smart. Flexible. Dynamic.

            </p>


          </div>


          <div className="admin-brand-illustration">


            <div className="admin-illustration-icon">

              ⚙

            </div>


          </div>


        </div>


        {/* =============================================
            RIGHT REGISTER SECTION
        ============================================= */}

        <div className="admin-register-form-section">


          <div className="admin-register-header">


            <span className="admin-form-label">

              ADMINISTRATION

            </span>


            <h2>

              Create Admin Account

            </h2>


            <p>

              Register to manage your DFB system.

            </p>


          </div>


          <form
            onSubmit={handleSubmit}
            className="admin-register-form"
          >


            {/* =========================================
                NAME
            ========================================= */}

            <Input
              label="Name"
              name="name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter admin name"
              required
            />


            {/* =========================================
                EMAIL
            ========================================= */}

            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter admin email"
              required
            />


            {/* =========================================
                PASSWORD
            ========================================= */}

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
              placeholder="Create password"
              required
            />


            {/* =========================================
                CONFIRM PASSWORD
            ========================================= */}

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Confirm password"
              required
            />


            {/* =========================================
                ERROR
            ========================================= */}

            {error && (

              <p className="admin-register-error">

                {error}

              </p>

            )}


            {/* =========================================
                CREATE ADMIN BUTTON
            ========================================= */}

            <Button
              type="submit"
              disabled={loading}
            >

              {loading

                ? "Creating Admin Account..."

                : "Create Admin Account"

              }

            </Button>


            {/* =========================================
                ADMIN LOGIN
            ========================================= */}

            <p className="admin-login-link">

              Already have an admin account?

              {" "}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/login"
                  )
                }
              >

                Login

              </button>

            </p>


          </form>


        </div>


      </div>


    </div>

  );

}


export default AdminRegister;