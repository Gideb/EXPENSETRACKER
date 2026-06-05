
const Modal = ({ title, onClose, isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-[calc(100%-1rem)] max-h-full overflow-y-auto overflow-x-hidden bg-black/20 backdrop-opacity-30 ">
      <div className="relative p-4 w-full max-w-2xl max-h-full ">

        {/* modal content */}
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          {/* Modal header */}

          <div className="flex items-center justify-between p-4 border-b md:p-5 rounded-t border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>

            <button
              className="text-gray-400 bg-transparent hover:bg-red-200 hover:text-gray-900 rounded-md text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-red-600 dark:hover:text-white cursor-pointer"
              onClick={onClose}
              type="button"
            >
              🗙
            </button>
          </div>

          {/* modal body */}
          <div className="p-4 md:p-5 space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
