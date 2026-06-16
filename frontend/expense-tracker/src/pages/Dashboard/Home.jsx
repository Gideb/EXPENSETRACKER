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
import {
  GiCash,
  GiMoneyStack,
  GiTakeMyMoney,
} from "react-icons/gi";
import FinanceOverview from "../../components/Dashboard/FinanceOverview";
import ExpenseTransactions from "../../components/Dashboard/ExpenseTransactions";
import Last30DaysExpenses from "../../components/Dashboard/Last30DaysExpenses";
import RecentIncomeWithChart from "../../components/Dashboard/RecentIncomeWithChart";
import RecentIncome from "../../components/Dashboard/RecentIncome";
import HealthScore from "../../components/Cards/HealthScore";

import BudgetWidget from "../../components/Dashboard/BudgetWidget";
import EmptyStateCard from "../../components/Common/EmptyStateCard";

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


const hasAnyIncome = (dashboardData?.totalIncome || 0) > 0;

const hasAnyExpense = (dashboardData?.totalExpense || 0) > 0;

const hasIncomeInLast60Days =
  dashboardData?.last60DaysIncome?.transactions?.length > 0;

const hasExpenseInLast30Days =
  dashboardData?.last30DaysExpense?.transactions?.length > 0;

const hasTransactions =
  dashboardData?.recentTransactions?.length > 0;

const hasFinancialData = hasAnyIncome || hasAnyExpense;

const isNewUser =  !hasAnyIncome &&  !hasAnyExpense;

  return (
    <Dashboardlayout activeMenu="Dashboard">
      <div className="space-y-6 my-5 mx-auto">
        {loading && (
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Widgets */}
          <div className="flex-1 flex flex-col gap-6">
            <BudgetWidget />
            <HealthScore dashboardData={dashboardData} />
          </div>

          {/* Right Column - Cards Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                icon={<GiMoneyStack />}
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
        </div>

       {/*  {isNewUser && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
            <h2 className="text-xl font-semibold">
              Welcome to Expense Tracker
            </h2>

            <p className="text-slate-500 mt-2">
              Start by adding your first income or expense.
            </p>
          </div>
        )} */}

        {isNewUser ? (
          <div className="bg-white dark:bg-transparent  border border-gray-300   rounded-xl p-8 shadow-sm text-center">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Welcome to Expense Tracker
            </h3>

            <p className="text-slate-500 mt-2 text-xs sm:text-sm">
              You haven't added any income or expenses yet. Start by recording
              your first transaction.
            </p>

            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={() => navigate("/income")}
                className="px-4 py-2 bg-emerald-600 text-white rounded add-btn"
              >
                + Add Income
              </button>

              <button
                onClick={() => navigate("/expense")}
                className="px-4 py-2 bg-red-600! text-white! rounded add-btn border-red-500! hover:bg-red-800!"
              >
                + Add Expense
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* list for 5 most recent transactions */}
            {hasTransactions && (
              <RecentTransactions
                transactions={dashboardData?.recentTransactions}
                onSeeMore={() => navigate("/transactions")}
              />
            )}

            {/* pie chart for 5 most recent transactions */}
            {hasFinancialData && (
              <FinanceOverview
                totalBalance={dashboardData?.totalBalance || 0}
                totalIncome={dashboardData?.totalIncome || 0}
                totalExpenses={dashboardData?.totalExpense || 0}
                last30DaysExpense={dashboardData?.last30DaysExpense?.total || 0}
                last60DaysIncome={dashboardData?.last60DaysIncome?.total || 0}
              />
            )}

            {/* list for Last 30 days expense  */}
            {hasAnyExpense && (
              <>
                <ExpenseTransactions
                  transactions={
                    dashboardData?.last30DaysExpense?.transactions || []
                  }
                  onSeeMore={() => navigate("/expense")}
                />

                {hasExpenseInLast30Days ? (
                  <Last30DaysExpenses
                    data={dashboardData?.last30DaysExpense?.transactions || []}
                  />
                ) : (
                  <EmptyStateCard
                    title="No expenses in the last 30 days"
                    description="You have expense records, but none were added during this period."
                  />
                )}
              </>
            )}

            {/* pie chart for Last 60 days income */}
            {hasAnyIncome && (
              <>
                {hasIncomeInLast60Days ? (
                  <RecentIncomeWithChart
                    data={
                      dashboardData?.last60DaysIncome?.transactions?.slice(
                        0,
                        4,
                      ) || []
                    }
                    totalIncome={dashboardData?.last60DaysIncome?.total || 0}
                  />
                ) : (
                  <EmptyStateCard
                    title="No income in the last 60 days"
                    description="You have income records, but none were added during this period."
                  />
                )}

                <RecentIncome
                  transactions={
                    dashboardData?.last60DaysIncome?.transactions || []
                  }
                  onSeeMore={() => navigate("/income")}
                />
              </>
            )}
          </div>
        )}
      </div>
    </Dashboardlayout>
  );
};

export default Home;
