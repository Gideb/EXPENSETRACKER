exports.getYearDateRange = (year) => {
  const selectedYear = year || new Date().getFullYear();

  return {
    startDate: new Date(`${selectedYear}-01-01`),

    endDate: new Date(`${selectedYear}-12-31T23:59:59.999`),
  };
};
