import { useContext } from "react";
import { SIDE_MENU_DATA } from "../../utils/data";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import CharAvatar from "../Cards/CharAvatar";

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

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 z-20 p-5 sticky top-15.25">
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        {user?.profileImageUrl ? (
          <img
            src={user?.profileImageUrl || ""}
            alt="Profile Image"
            className="w-20 h-20 bg-slate-400 rounded-full"
          />
        ) : (
          <CharAvatar
            fullName={user?.fullName}
            width="w-20"
            height="h-20"
            style="text-xl"
          />
        )}

        <h5 className="text-gray-950 font-medium leading-6 ">
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
                : "text-slate-900 hover:bg-amber-600/20"
            }`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-xl" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default SideMenu;
