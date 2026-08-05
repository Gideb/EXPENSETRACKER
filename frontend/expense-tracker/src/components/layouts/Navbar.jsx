import { useState } from 'react';
import SideMenu from './SideMenu';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  const closeSideMenu = () => setOpenSideMenu(false);

  return (
    <div className="flex gap-5 bg-white dark:bg-gray-950 border-b-2 border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30 transition-all duration-300 ease-in-out">
      <button
        className="block lg:hidden text-black dark:text-white cursor-pointer transition-all duration-500 ease-in-out"
        onClick={() => {
          setOpenSideMenu(!openSideMenu);
        }}
        aria-label="Toggle menu"
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

      {/* Mobile Side Menu with backdrop */}
      {openSideMenu && (
        <div
          className="fixed inset-0 top-15.25 left-0 lg:hidden bg-black/40 z-40"
          onClick={closeSideMenu}
        />
      )}

      <div
        className={`lg:hidden fixed top-15.25 left-0 z-50 transition-transform duration-500 ease-in-out ${
          openSideMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SideMenu activeMenu={activeMenu} />
      </div>
    </div>
  );
};

export default Navbar;
