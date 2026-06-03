import React from "react";

const DeleteAlert = ({ onDelete, content, onCancel }) => {
  return (
    <div className="">
      <p className="text-sm text-center">{content}</p>

      <div className="flex justify-end mt-6 gap-2">
        <button
          className="add-btn"
         onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className=" flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md text-xs md:text-sm font-medium whitespace-nowrap border border-red-600 hover:text-red-700 text-white hover:bg-red-100 bg-red-800"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteAlert;
