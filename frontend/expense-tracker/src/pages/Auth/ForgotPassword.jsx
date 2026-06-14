import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Input from "../../components/Inputs/Input";
import { toast } from "react-hot-toast";
import { API_PATHS } from "../../utils/apiPaths";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post(
        API_PATHS.AUTH.FORGOT_PASSWORD,
        {
          email,
        },
      );

      toast.success(response.data.message);
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <div className="space-y-6 mt-10">
      <div>
        <h2 className="text-md font-medium dark:text-gray-400">
          Forgot Password?
        </h2>
        <p className="text-sm text-gray-500">
          Enter your email and we'll send you a password reset link.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          placeholder="your-email@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" className=" add-btn">
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
