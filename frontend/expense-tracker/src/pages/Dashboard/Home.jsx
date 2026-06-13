import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboardlayout from "../../components/layouts/Dashboardlayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import RecentTransactions from "../../components/Dashboard/RecentTransactions";

import { IoMdCard } from "react-icons/io";
import { LuHandCoins, LuWalletMinimal } from "react-icons/lu";
import { GiCash, GiTakeMyMoney } from "react-icons/gi";
import FinanceOverview from "../../components/Dashboard/FinanceOverview";
import ExpenseTransactions from "../../components/Dashboard/ExpenseTransactions";
import Last30DaysExpenses from "../../components/Dashboard/Last30DaysExpenses";
import RecentIncomeWithChart from "../../components/Dashboard/RecentIncomeWithChart";
import RecentIncome from "../../components/Dashboard/RecentIncome";
import HealthScore from "../../components/Cards/HealthScore";

import BudgetWidget from "../../components/Dashboard/BudgetWidget";

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA);

      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchDashboardData);
  }, [fetchDashboardData]);

  return (
    <Dashboardlayout activeMenu="Dashboard">
      <div className="space-y-6 my-5 mx-auto">
        {loading && (
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <BudgetWidget />
            <HealthScore dashboardData={dashboardData} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard
              icon={<IoMdCard />}
              label="Total Balance"
              value={addThousandsSeparator(dashboardData?.totalBalance)}
              color="bg-primary"
            />
            <InfoCard
              icon={<LuWalletMinimal />}
              label="Total Income"
              value={addThousandsSeparator(dashboardData?.totalIncome)}
              color="bg-emerald-600"
            />
            <InfoCard
              icon={<LuHandCoins />}
              label="Total Expense"
              value={addThousandsSeparator(dashboardData?.totalExpense)}
              color="bg-red-600"
            />
            <InfoCard
              icon={<GiCash />}
              label="Past 60 Days Income"
              value={addThousandsSeparator(
                dashboardData?.last60DaysIncome?.total,
              )}
              color="bg-purple-600"
            />
            <InfoCard
              icon={<GiTakeMyMoney />}
              label="Past 30 Days Expense"
              value={addThousandsSeparator(
                dashboardData?.last30DaysExpense?.total,
              )}
              color="bg-rose-700"
            />
            <InfoCard
              icon={<GiTakeMyMoney />}
              label="Last 7 Days Expense"
              value={addThousandsSeparator(
                dashboardData?.currentWeeksExpense?.total || 0,
              )}
              color="bg-yellow-600"
            />
          </div>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
        {/* <div className="flex flex-col gap-6">
          <BudgetWidget />
          <HealthScore dashboardData={dashboardData} />
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* list for 5 most recent transactions */}
          <RecentTransactions
            transactions={dashboardData?.recentTransactions}
            onSeeMore={() => navigate("/transactions")}
          />

          {/* pie chart for 5 most recent transactions */}
          <FinanceOverview
            totalBalance={dashboardData?.totalBalance || 0}
            totalIncome={dashboardData?.totalIncome || 0}
            totalExpenses={dashboardData?.totalExpense || 0}
            last30DaysExpense={dashboardData?.last30DaysExpense?.total || 0}
            last60DaysIncome={dashboardData?.last60DaysIncome?.total || 0}
          />

          {/* list for Last 30 days expense */}
          <ExpenseTransactions
            transactions={dashboardData?.last30DaysExpense?.transactions || []}
            onSeeMore={() => navigate("/expense")}
          />

          {/* bar chart for Last 30 days expense */}
          <Last30DaysExpenses
            data={dashboardData?.last30DaysExpense?.transactions || []}
          />

          {/* pie chart for Last 60 days income */}
          <RecentIncomeWithChart
            data={
              dashboardData?.last60DaysIncome?.transactions?.slice(0, 4) || []
            }
            totalIncome={dashboardData?.last60DaysIncome?.total || 0}
          />

          {/* list of Last 60 days income */}
          <RecentIncome
            transactions={dashboardData?.last60DaysIncome?.transactions || []}
            onSeeMore={() => navigate("/income")}
          />
        </div>
      </div>
    </Dashboardlayout>
  );
};

export default Home;
