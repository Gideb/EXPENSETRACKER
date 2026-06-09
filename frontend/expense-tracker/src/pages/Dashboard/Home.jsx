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



/* const totalIncome = dashboardData?.totalIncome || 0;
const totalExpense = dashboardData?.totalExpense || 0;

const percentage = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

const showWarning = percentage >= 80; */


const totalIncome = dashboardData?.totalIncome || 0;
const totalExpense = dashboardData?.totalExpense || 0;

const spendingRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

let healthStatus = "green"; // default

if (spendingRatio >= 90) {
  healthStatus = "red";
} else if (spendingRatio >= 80) {
  healthStatus = "yellow";
}

  return (
    <Dashboardlayout activeMenu="Dashboard">
      <div className="space-y-6 my-5 mx-auto">
        {loading && (
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            color="bg-slate-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="max-w-md">
            <div
              className={`p-4 rounded-lg text-xs border ${
                healthStatus === "green"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : healthStatus === "yellow"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                    : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {healthStatus === "green" && (
                <>
                  🟢 Financial Health: Good
                  <br />
                  Your spending is under control.
                </>
              )}

              {healthStatus === "yellow" && (
                <>
                  🟡 Financial Health: Warning
                  <br />
                  You're spending close to your income limit. Be careful.
                </>
              )}

              {healthStatus === "red" && (
                <>
                  🔴 Financial Health: Critical
                  <br />
                  Your expenses are too high compared to income.
                </>
              )}
            </div>

            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  healthStatus === "green"
                    ? "bg-green-500"
                    : healthStatus === "yellow"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${Math.min(spendingRatio, 100)}%` }}
              />
            </div>
          </div>
        </div>

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
