import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Input from "../../components/Inputs/Input";
import { toast } from "react-hot-toast";
import { API_PATHS } from "../../utils/apiPaths";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return toast.error("All fields are required");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        `${API_PATHS.AUTH.RESET_PASSWORD}/${token}`,
        { password },
      );

      toast.success(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-10">
      <div>
        <h2 className="text-md font-medium dark:text-gray-400">
          Reset Password
        </h2>
        <p className="text-sm text-gray-500">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" className="add-btn" disabled={loading}>
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
