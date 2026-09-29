import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


/* =====================================================
   USER AUTH
===================================================== */

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";


/* =====================================================
   USER PAGES
===================================================== */

import Dashboard from "../pages/user/Dashboard";

import DynamicForm from "../pages/user/DynamicForm";

import MySubmissions from "../pages/user/MySubmissions";

import SubmissionDetail from "../pages/user/SubmissionDetail";

import Profile from "../pages/user/Profile";

import Notifications from "../pages/user/Notifications";



/* =====================================================
   ADMIN AUTH
===================================================== */

import AdminLogin from "../pages/admin/AdminLogin";

import AdminRegister from "../pages/admin/AdminRegister";


/* =====================================================
   ADMIN PAGES
===================================================== */

import AdminDashboard from "../pages/admin/AdminDashboard";

import Domains from "../pages/admin/Domains";

import VisitTypes from "../pages/admin/VisitTypes";

import Forms from "../pages/admin/Forms";

import CreateForm from "../pages/admin/CreateForm";

import FormBuilder from "../pages/admin/FormBuilder";

import Users from "../pages/admin/Users";

import Submissions from "../pages/admin/Submissions";

import AdminNotifications from "../pages/admin/AdminNotifications";

import AdminProfile from "../pages/admin/AdminProfile";


/* =====================================================
   ROUTE PROTECTION
===================================================== */

import ProtectedRoute from "./ProtectedRoute";

import AdminProtectedRoute from "./AdminProtectedRoute";


function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>


        {/* =================================================
            USER AUTH ROUTES
        ================================================= */}

        <Route
          path="/"
          element={
            <Login />
          }
        />


        <Route
          path="/register"
          element={
            <Register />
          }
        />


        {/* =================================================
            USER DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={

            <ProtectedRoute>

              <Dashboard />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            USER DYNAMIC FORM
        ================================================= */}

        <Route
          path="/form/:visitTypeId"
          element={

            <ProtectedRoute>

              <DynamicForm />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            USER MY SUBMISSIONS
        ================================================= */}

        <Route
          path="/my-submissions"
          element={

            <ProtectedRoute>

              <MySubmissions />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            USER SUBMISSION DETAILS
        ================================================= */}

        <Route
          path="/my-submissions/:submissionId"
          element={

            <ProtectedRoute>

              <SubmissionDetail />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            USER PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={

            <ProtectedRoute>

              <Profile />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            ADMIN ROOT
            /admin → /admin/login
        ================================================= */}

        <Route
          path="/admin"
          element={
            <Navigate
              to="/admin/login"
              replace
            />
          }
        />


        {/* =================================================
            ADMIN AUTH ROUTES
        ================================================= */}

        <Route
          path="/admin/login"
          element={
            <AdminLogin />
          }
        />


        <Route
          path="/admin/register"
          element={
            <AdminRegister />
          }
        />


        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin/dashboard"
          element={

            <AdminProtectedRoute>

              <AdminDashboard />

            </AdminProtectedRoute>

          }
        />


        {/* =================================================
            ADMIN DOMAINS
        ================================================= */}

        <Route
          path="/admin/domains"
          element={

            <AdminProtectedRoute>

              <Domains />

            </AdminProtectedRoute>

          }
        />


        {/* =================================================
            ADMIN VISIT TYPES
        ================================================= */}

        <Route
          path="/admin/visit-types"
          element={

            <AdminProtectedRoute>

              <VisitTypes />

            </AdminProtectedRoute>

          }
        />


        {/* =================================================
            ADMIN FORMS
        ================================================= */}

        <Route
          path="/admin/forms"
          element={

            <AdminProtectedRoute>

              <Forms />

            </AdminProtectedRoute>

          }
        />

        /* =================================================
    ADMIN CREATE FORM
================================================= */

<Route
  path="/admin/forms/create"
  element={

    <AdminProtectedRoute>

      <CreateForm />

    </AdminProtectedRoute>

  }
/>


        {/* =================================================
            ADMIN USERS
        ================================================= */}

        <Route
          path="/admin/users"
          element={

            <AdminProtectedRoute>

              <Users />

            </AdminProtectedRoute>

          }
        />


        {/* =================================================
            ADMIN FORM BUILDER
        ================================================= */}

        <Route
          path="/admin/form-builder"
          element={
            <Navigate
              to="/admin/forms"
              replace
            />
          }
        />

        <Route
  path="/admin/submissions"
  element={
    <AdminProtectedRoute>
      <Submissions />
    </AdminProtectedRoute>
  }
/>


        <Route
          path="/admin/form-builder/:formId"
          element={

            <AdminProtectedRoute>

              <FormBuilder />

            </AdminProtectedRoute>

          }
        />
        
          <Route
  path="/notifications"
  element={
    <ProtectedRoute>
      <Notifications />
    </ProtectedRoute>
  }
/> 

   <Route
  path="/admin/notifications"
  element={
    <AdminProtectedRoute>
      <AdminNotifications />
    </AdminProtectedRoute>
  }
/>
     <Route
  path="/admin/profile"
  element={
    <AdminProtectedRoute>
      <AdminProfile />
    </AdminProtectedRoute>
  }
/>


      </Routes>

    </BrowserRouter>

  );

}


export default AppRoutes;