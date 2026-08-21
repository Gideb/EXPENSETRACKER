import { TbSquareToggle } from 'react-icons/tb';

const Navbar = ({ openSideMenu, toggleSideMenu }) => {
  return (
    <div className="flex gap-5 bg-white dark:bg-gray-950 border-b-2 border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-50 transition-all duration-300 ease-in-out">
      {/* Toggle Side Menu */}
      <button
        type="button"
        onClick={toggleSideMenu}
        className="text-black dark:text-white cursor-pointer"
        aria-label="Toggle side menu"
        aria-expanded={openSideMenu}
      >
        <TbSquareToggle
          className={`text-2xl transition-colors duration-300 ${
            openSideMenu ? 'text-amber-600 ' : 'text-gray-500'
          }`}
        />
      </button>

      <h2 className="text-lg font-semibold flex items-center gap-3 text-amber-700 dark:text-amber-600">
        Expense Tracker
      </h2>
    </div>
  );
};

export default Navbar;
