import { LiaExchangeAltSolid } from "react-icons/lia";
import {
  LuHandCoins,
  LuLayoutDashboard,
  LuLogOut,
  LuWalletMinimal,
} from "react-icons/lu";

export const  SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/dashboard",
  },{
    id: "02",
    label: "Transactions",
    icon: LiaExchangeAltSolid,
    path: "/transactions",
  },
  {
    id: "03",
    label: "Income",
    icon: LuWalletMinimal,
    path: "/income",
  },
  {
    id: "04",
    label: "Expense",
    icon: LuHandCoins,
    path: "/expense",
  },
  
  {
    id: "06",
    label: "Logout",
    icon: LuLogOut,
    path: "/logout",
  },
];
