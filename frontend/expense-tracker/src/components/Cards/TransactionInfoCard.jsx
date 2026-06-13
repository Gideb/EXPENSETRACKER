import { useState, useRef, useEffect } from "react";

import {
  LuTrendingDown,
  LuTrendingUp,
  LuUtensils,
  LuEllipsisVertical,
  LuTrash2,
  LuPencil,
} from "react-icons/lu";

const TransactionInfoCard = ({
  title,
  icon,
  date,
  amount,
  type,
  hideDeleteBtn,
  onDelete,
  onEdit,
  transaction,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getAmountStyles = () =>
    type === "budget"
      ? "bg-amber-50 text-amber-600"
      : type === "income"
        ? "bg-green-50 text-green-500"
        : "bg-red-50 text-red-500";

  const handleEdit = () => {
    setShowMenu(false);
    onEdit?.(transaction);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete?.();
  };

  return (
    <div className="group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/40 dark:bg-gray-800 dark:hover:bg-gray-500/80 border border-gray-100 mx-1 shadow-md hover:-translate-y-1.5 duration-500 ease-in-out transition-all hover:shadow-xl">
      <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 dark:text-gray-400 bg-gray-100  rounded-full">
        {icon ? (
          <img src={icon} alt={title} className="w-6 h-6" />
        ) : (
          <LuUtensils />
        )}
      </div>

      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-100 font-medium">
            {title}
          </p>
          <p className="text-xs text-gray-400 mt-1">{date}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Three-dot menu */}
          {!hideDeleteBtn && (
            <div className="relative" ref={menuRef}>
              <button
                className="
                  p-1 rounded-md text-gray-400 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-400
                  opacity-100  md:opacity-0 md:group-hover:opacity-100             transition-all duration-200          cursor-pointer "
                onClick={() => setShowMenu((prev) => !prev)}
              >
                <LuEllipsisVertical size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-5 top-1 w-30 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-4 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700  cursor-pointer"
                  >
                    <LuPencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-4 px-4 py-2 text-sm text-red-500 hover:bg-red-50  cursor-pointer"
                  >
                    <LuTrash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()}`}
          >
            <h6 className="text-xs font-medium">
              {type === "budget" ? "" : type === "income" ? "+" : "-"} GH₵
              {amount}
            </h6>

            {type === "budget" ? (
              ""
            ) : type === "income" ? (
              <LuTrendingUp />
            ) : (
              <LuTrendingDown />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionInfoCard;
