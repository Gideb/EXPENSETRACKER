import EmojiPicker from "emoji-picker-react";
import { useState } from "react";
import { LuImage, LuX } from "react-icons/lu";

const EmojiPickerPopup = ({ icon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-start gap-5 mb-6">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className=" w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-amber-100 text-primary">
          {icon ? (
            <img className="w-12 h-12" src={icon} alt="Icon" />
          ) : (
            <LuImage />
          )}
        </div>
        <p className="dark:text-white text-sm hover:underline">{icon ? "Change icon" : "Pick icon"}</p>
      </div>
      {isOpen && (
        <div className="relative">
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 bg-white flex items-center justify-center absolute border border-gray-200 rounded-full -top-5 -right-90 z-100 cursor-pointer"
          >
            <LuX />
          </button>

          <div className="absolute top-full left-0 z-50 -mt-2 shadow-lg rounded-xl overflow-hidden">
            <EmojiPicker
              onEmojiClick={(emoji) => onSelect(emoji?.imageUrl || "")}
              pickerStyle={{ width: "100%", maxWidth: "360px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPickerPopup;
