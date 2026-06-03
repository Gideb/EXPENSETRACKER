const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex gap-6 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200 hover:scale-105 transition-all duration-500 ">
      <div
        className={`flex items-center justify-center w-14 h-14 text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
      >
        {icon}
      </div>
      <div>
        <h6 className="text-sm text-gray-500 mb-1">{label}</h6>
        <span className="text-[22px]">GH₵{value}</span>
      </div>
    </div>
  );
};

export default InfoCard;
