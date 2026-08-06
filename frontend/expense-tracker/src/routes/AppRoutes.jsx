import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const AuthLayout = lazy(() => import('../components/layouts/AuthLayout'));
const Login = lazy(() => import('../pages/Auth/Login'));
const SignUp = lazy(() => import('../pages/Auth/SignUp'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));

const Home = lazy(() => import('../pages/Dashboard/Home'));
const Expense = lazy(() => import('../pages/Dashboard/Expense'));
const Income = lazy(() => import('../pages/Dashboard/Income'));
const Transactions = lazy(() => import('../pages/Dashboard/Transactions'));
const Budget = lazy(() => import('../pages/Dashboard/Budget'));
const Settings = lazy(() => import('../pages/Dashboard/Settings'));
const Reports = lazy(() => import('../pages/Dashboard/Reports'));
const Goals = lazy(() => import('../pages/Dashboard/Goals'));

const AppRoutes = () => {
  return (
    <Router>
      <Suspense
        fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}
      >
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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expense"
            element={
              <ProtectedRoute>
                <Expense />
              </ProtectedRoute>
            }
          />
          <Route
            path="/income"
            element={
              <ProtectedRoute>
                <Income />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <Budget />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('token');

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Root = () => {
  //check if token exists in localStorage
  const isAuthenticated = !!localStorage.getItem('token');

  //redirect to dashboard if authenticated, otherwise to login
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};
