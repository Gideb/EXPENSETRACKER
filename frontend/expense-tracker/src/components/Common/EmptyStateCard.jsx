const EmptyStateCard = ({ title, description }) => {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-slate-800 dark:text-gray-200">{title}</h3>

      <p className="text-sm text-slate-500 mt-2">{description}</p>
    </div>
  );
};

export default EmptyStateCard;
