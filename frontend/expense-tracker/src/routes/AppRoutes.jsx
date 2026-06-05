import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";

import Home from "../pages/Dashboard/Home";
import Expense from "../pages/Dashboard/Expense";
import Income from "../pages/Dashboard/Income";
import AuthLayout from "../components/layouts/AuthLayout";
import Transactions from "../pages/Dashboard/Transactions";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />

        <Route path="/" element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        <Route path="/dashboard" element={<Home />} />
        <Route path="/expense" element={<Expense />} />
        <Route path="/income" element={<Income />} />
        <Route path="/transactions" element={<Transactions />} />
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
