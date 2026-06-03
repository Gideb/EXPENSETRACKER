import { Outlet } from "react-router-dom";
import Card from "../../assets/images/card1.jpg";
import { LuTrendingUpDown } from "react-icons/lu";

import { ImCalculator } from "react-icons/im";

const StatsInfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex gap-6 bg-white p-4 rounded-xl shadow-md shadow-purple-400/15 border border-gray-200 z-10">
      <div
        className={`w-12 h-12 flex items-center justify-center text-white text-[26px] ${color} rounded-full drop-shadow-xl`}
      >
        {icon}
      </div>
      <div>
        <h6 className="text-xs text-gray-500 mb-1">{label}</h6>
        <span className="text-[20px]">GH₵{value}</span>
      </div>
    </div>
  );
};

const AuthLayout = () => {
  return (
    <div className="flex">
      <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12 ">
        <h2 className="text-lg font-medium text-black flex items-center gap-3">
          Expense Tracker <ImCalculator className="text-amber-800" />
        </h2>

        <Outlet />
      </div>

      <div className="hidden md:block w-[40vw] h-screen bg-violet-50 bg-auth-bg-img bg-cover bg-no-repeat relative overflow-hidden bg-center p-8 ">
        <div className="bg-primary w-48 h-48 rounded-[40px] absolute -top-7 -left-5 " />
        <div className="border-20 border-orange-600 w-48 h-48 rounded-[40px] absolute top-[30%] right-[-10%] " />
        <div className="bg-primary w-48 h-48 rounded-[40px] absolute -bottom-7 -left-5 " />

        <div className="grid grid-cols-1 z-20">
          <StatsInfoCard
            icon={<LuTrendingUpDown />}
            label="Track Your Income & Expenses"
            value="430,000"
            color="bg-primary"
          />
        </div>

        <img
          src={Card}
          alt="expense tracker app image"
          className="w-84 lg:w-[95%] absolute bottom-10 shadow-lg shadow-blue-400/15 "
        />
      </div>
    </div>
  );
};

export default AuthLayout;
