import { useContext } from "react";
import { SIDE_MENU_DATA } from "../../utils/data";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/apiPaths";
import CharAvatar from "../Cards/CharAvatar";
import { LuSettings } from "react-icons/lu";

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "/logout") {
      handleLogout();
      return;
    }

    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  //  MOVE LOGIC HERE (outside JSX)
  const hasImage = user?.profileImageUrl && user.profileImageUrl !== "";

  //  Convert relative URL to absolute URL for backend access
  const imageUrl =
    hasImage && user.profileImageUrl.startsWith("/")
      ? `${BASE_URL}${user.profileImageUrl}`
      : user.profileImageUrl;

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 dark:bg-gray-950 z-20 p-5 sticky top-15.25">
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        
        {hasImage ? (
          <img
            src={imageUrl}
            alt="Profile Image"
            className="w-20 h-20 bg-slate-400 rounded-full object-cover"
          />
        ) : (
          <CharAvatar
            fullName={user?.fullName}
            width="w-20"
            height="h-20"
            style="text-xl"
          />
        )}

        <h5 className="text-gray-950 font-medium leading-6">
          {user?.fullName || ""}
        </h5>
      </div>

      {SIDE_MENU_DATA.map((item, index) => {
        const isActive = activeMenu === item.label;

        return (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 cursor-pointer text-[15px] py-3 px-6 rounded-lg mb-3 ${
              isActive
                ? "bg-primary text-white hover:bg-primary/90"
                : "text-slate-900 hover:bg-amber-600/20 dark:hover:bg-amber-600/30 dark:text-gray-100"
            }`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-xl" />
            {item.label}
          </button>
        );
      })}

      {/* <button
        onClick={() => navigate("/settings")}
        className="w-full flex flex-col h-full items-center gap-4 cursor-pointer text-[15px] py-3 px-6 rounded-lg mb-3  text-gray-600 hover:text-primary"
      >
        <LuSettings className="text-xl" />
        Settings
      </button> */}
    </div>
  );
};

export default SideMenu;
