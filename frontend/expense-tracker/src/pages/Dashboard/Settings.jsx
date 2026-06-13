import Dashboardlayout from "../../components/layouts/Dashboardlayout";
import { useUserAuth } from "../../hooks/useUserAuth";

const Settings = ({ handleProfileUpdate, handlePasswordChange }) => {
  useUserAuth();
  return (
    <Dashboardlayout activeMenu="Settings">
      <div className="max-w-2xl mx-auto mt-5">
        <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-medium mb-4">Profile Information</h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/*   <button
            onClick={handleProfileUpdate}
            className="bg-primary text-white px-5 py-2 rounded-lg"
          >
            Save Profile
          </button> */}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h3 className="font-medium mb-4">Change Password</h3>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="password"
              placeholder="New Password"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border rounded-lg p-3"
            />
          </div>
          {/*  <button
            onClick={handlePasswordChange}
            className="bg-primary text-white px-5 py-2 rounded-lg"
          >
            Change Password
          </button> */}
        </div>
      </div>
    </Dashboardlayout>
  );
};

export default Settings;
