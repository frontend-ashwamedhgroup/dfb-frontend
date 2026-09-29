import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { login, register } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [domainId, setDomainId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const domains = [
    { id: 1, name: "AGRO" },
    { id: 2, name: "POULTRY" },
    { id: 3, name: "FMCG" },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // =========================================================
    // PHONE NUMBER VALIDATION
    // =========================================================

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    // =========================================================
    // DOMAIN VALIDATION
    // =========================================================

    if (!domainId) {
      setError("Please select a domain.");
      return;
    }

    // =========================================================
    // PASSWORD VALIDATION
    // =========================================================

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // =======================================================
      // STEP 1: REGISTER THE USER
      // =======================================================

      await register({
        name,
        email,
        password,
        phoneNumber,
        domainId: Number(domainId),
      });

      // =======================================================
      // STEP 2: AUTOMATICALLY LOGIN THE NEW USER
      // =======================================================

      const loginData = await login(email, password);

      // =======================================================
      // STEP 3: STORE JWT AND USER INFORMATION
      // =======================================================

      loginUser(loginData.user, loginData.token);

      // =======================================================
      // STEP 4: GO TO DASHBOARD
      // =======================================================

      navigate("/dashboard");

    } catch (error) {
      console.error("Registration/Login failed:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-container">

        {/* =====================================================
            LEFT BRAND SECTION
        ====================================================== */}

        <div className="register-brand">

          <div className="brand-content">

            <h1>
              Dynamic
              <br />
              Form Builder
            </h1>

            <p>Smart. Flexible. Dynamic.</p>

          </div>

          <div className="brand-illustration">

            <div className="illustration-icon">
              +
            </div>

          </div>

        </div>


        {/* =====================================================
            REGISTRATION FORM
        ====================================================== */}

        <div className="register-form-section">

          <div className="register-header">

            <h2>Create Account</h2>

            <p>Register to get started</p>

          </div>


          <form
            onSubmit={handleSubmit}
            className="register-form"
          >

            {/* =================================================
                NAME
            ================================================== */}

            <Input
              label="Name"
              name="name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
              required
            />


            {/* =================================================
                EMAIL
            ================================================== */}

            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
            />


            {/* =================================================
                PHONE NUMBER
            ================================================== */}

            <Input
              label="Phone Number"
              type="tel"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(event) => {
                const value = event.target.value;

                // Allow only digits and maximum 10 digits
                if (/^\d{0,10}$/.test(value)) {
                  setPhoneNumber(value);
                }
              }}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              required
            />


            {/* =================================================
                PASSWORD
            ================================================== */}

            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
            />


            {/* =================================================
                CONFIRM PASSWORD
            ================================================== */}

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm your password"
              required
            />


            {/* =================================================
                DOMAIN SELECTION
            ================================================== */}

            <div className="domain-selection">

              <label>
                Select Domain
                <span className="required-mark"> *</span>
              </label>


              <div className="domain-options">

                {domains.map((domain) => (

                  <label
                    key={domain.id}
                    className={`domain-option ${
                      Number(domainId) === domain.id
                        ? "selected"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="domain"
                      value={domain.id}
                      checked={
                        Number(domainId) === domain.id
                      }
                      onChange={(event) =>
                        setDomainId(event.target.value)
                      }
                    />

                    <span>
                      {domain.name}
                    </span>

                  </label>

                ))}

              </div>

            </div>


            {/* =================================================
                ERROR MESSAGE
            ================================================== */}

            {error && (
              <p className="register-error">
                {error}
              </p>
            )}


            {/* =================================================
                SUCCESS MESSAGE
            ================================================== */}

            {success && (
              <p className="register-success">
                {success}
              </p>
            )}


            {/* =================================================
                REGISTER BUTTON
            ================================================== */}

            <Button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Register"}
            </Button>


            {/* =================================================
                LOGIN LINK
            ================================================== */}

            <p className="login-link">

              Already have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/")}
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

export default Register;