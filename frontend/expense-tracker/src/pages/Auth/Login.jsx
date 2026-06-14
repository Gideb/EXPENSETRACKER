/* import AuthLayout from "../../components/layouts/AuthLayout"; */

import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { validateEmail } from "../../utils/helper";
import { UserContext } from "../../context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { updateUser } = useContext(UserContext);

  const navigate = useNavigate();

  //handle login form submit
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the correct password ");
      return;
    }

    setError("");

    //login api
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(user);
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center ">
      <h3 className="text-black dark:text-white text-xl font-semibold">
        Welcome Back
      </h3>
      <p className="mt-1.25 text-slate-700 dark:text-slate-400 text-xs mb-6">
        Please enter your details to login
      </p>

      <form onSubmit={handleLogin}>
        <Input
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          label="Email Address"
          placeholder="kwame@example.com"
          type="text"
        />

        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="min 8 characters"
          type="password"
        />

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button type="submit" className="btn-primary">
          LOGIN
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3">
          <Link
            to="/forgot-password"
            className="text-primary underline font-medium text-[13px] order-1 sm:order-2"
          >
            Forgot Password?
          </Link>

          <div className="sm:hidden h-px w-full bg-linear-to-r from-gray-300 via-gray-300 to-transparent my-4 order-2" />

          <p className="text-slate-800 dark:text-slate-400 text-[13px] order-3 sm:order-1">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary underline font-medium">
              SIGNUP
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
