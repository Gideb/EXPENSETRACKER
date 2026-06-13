const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex gap-6 light-dark(bg-white, bg-gray-800) p-6 rounded-2xl shadow-md shadow-gray-100 dark:shadow-gray-900 border border-gray-200 hover:scale-105 transition-all duration-500 ">
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
