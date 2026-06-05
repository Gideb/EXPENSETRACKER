import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { validateEmail } from "../../utils/helper";
import { UserContext } from "../../context/UserContext";
import uploadImage from "../../utils/uploadImage";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);

  const navigate = useNavigate();

  //handle signup for form submit
  const handleSignUp = async (e) => {
    e.preventDefault();

    let profileImageUrl = null;

    if (!fullName) {
      setError("Please enter your name.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the correct password ");
      return;
    }

    setError("");

    try {
      if (profilePic) {
        const uploadResponse = await uploadImage(profilePic);
        profileImageUrl = uploadResponse.imageUrl ;
      }

      //signup api
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        fullName,
        email,
        password,
        profileImageUrl,
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
    <div className="lg:w-full h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
      <h3 className="text-black text-xl font-semibold">Create an account</h3>
      <p className="mt-1.25 text-slate-700 text-xs mb-6">
        Enter your details below to Join us
      </p>

      <form onSubmit={handleSignUp}>
        <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <Input
              label="Full Name"
              onChange={({ target }) => setFullName(target.value)}
              placeholder="Kwame Jane"
              type="text"
              value={fullName}
            />
          </div>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="kwame@example.com"
            type="text"
          />
          <div className="col-span-2">
            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Password"
              placeholder="min 8 characters"
              type="password"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button type="submit" className="btn-primary">
          SIGN UP
        </button>

        <p className="text-slate-800 text-[13px] mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline font-medium">
            LOGIN
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
