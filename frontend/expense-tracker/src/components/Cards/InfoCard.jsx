const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md hover:shadow-gray-300 dark:hover:shadow-neutral-800 border border-gray-300 dark:border-gray-600 hover:shadow-2xl transition-all duration-500 ">
      <div
        className={`flex items-center justify-center w-14 h-14 text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
      >
        {icon}
      </div>
      <div>
        <h6 className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</h6>
        <span className="text-[22px] dark:text-white">GH₵{value}</span>
      </div>
    </div>
  );
};

export default InfoCard;
