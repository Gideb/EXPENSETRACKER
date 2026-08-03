import { useState } from 'react';
import SideMenu from './SideMenu';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  return (
    <div className="flex gap-5 bg-white dark:bg-gray-950 border-b-2 border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30 transition-all duration-300 ease-in-out">
      <button
        className="block lg:hidden text-black dark:text-white cursor-pointer transition-all duration-500 ease-in-out"
        onClick={() => {
          setOpenSideMenu(!openSideMenu);
        }}
      >
        {openSideMenu ? (
          <HiOutlineX className="text-2xl " />
        ) : (
          <HiOutlineMenu className="text-2xl " />
        )}
      </button>

      <h2 className="text-lg font-semibold flex items-center gap-3 text-amber-700 dark:text-amber-600">
        Expense Tracker
      </h2>

      {openSideMenu && (
        <div className="fixed top-15.25 -ml-4 bg-white transition-all duration-500 ease-in-out">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
