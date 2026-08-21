import { useContext, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import Navbar from './Navbar';
import SideMenu from './SideMenu';

const Dashboardlayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);

  const [openSideMenu, setOpenSideMenu] = useState(true);

  const toggleSideMenu = () => {
    setOpenSideMenu((prev) => !prev);
  };

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <Navbar activeMenu={activeMenu} openSideMenu={openSideMenu} toggleSideMenu={toggleSideMenu} />

      {user && (
        <div className="flex">
          {/* Sidebar */}
          <div
            className={`
              fixed left-0 top-[61px] z-40
              h-[calc(100vh-61px)]
              w-64
              transition-transform duration-500 ease-in-out
              ${openSideMenu ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <SideMenu activeMenu={activeMenu} />
          </div>

          {/* Main content */}
          <div
            className={`
              grow mx-5
              transition-all duration-500 ease-in-out
              ${openSideMenu ? 'md:ml-69' : 'md:ml-5'}
            `}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboardlayout;
