import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AuthLayout from "../components/layouts/AuthLayout";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

import Home from "../pages/Dashboard/Home";
import Expense from "../pages/Dashboard/Expense";
import Income from "../pages/Dashboard/Income";
import Transactions from "../pages/Dashboard/Transactions";
import Budget from "../pages/Dashboard/Budget";

import Settings from "../pages/Dashboard/Settings";


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Root />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<Home />} />
        <Route path="/expense" element={<Expense />} />
        <Route path="/income" element={<Income />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

const Root = () => {
  //check if token exists in localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  //redirect to dashboard if authenticated, otherwise to login
  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/login" />
  );
};
