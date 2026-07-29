import { LiaExchangeAltSolid } from 'react-icons/lia';
import {
  LuChartPie,
  LuFileChartColumnIncreasing,
  LuHandCoins,
  LuLayoutDashboard,
  LuLogOut,
  LuWalletMinimal,
} from 'react-icons/lu';
import { IoSettingsOutline } from 'react-icons/io5';
import { GiBanknote, GiMoneyStack, GiPayMoney } from 'react-icons/gi';
import { FaMoneyBillTransfer, FaRegCreditCard } from 'react-icons/fa6';

export const SIDE_MENU_DATA = [
  {
    id: '01',
    label: 'Dashboard',
    icon: LuLayoutDashboard,
    path: '/dashboard',
  },
  {
    id: '02',
    label: 'Transactions',
    icon: FaMoneyBillTransfer,
    path: '/transactions',
  },
  {
    id: '03',
    label: 'Incomes',
    icon: GiMoneyStack,
    path: '/income',
  },
  {
    id: '04',
    label: 'Expenses',
    icon: FaRegCreditCard,
    path: '/expense',
  },
  {
    id: '05',
    label: 'Budgets',
    icon: LuChartPie,
    path: '/budget',
  },
  {
    id: '06',
    label: 'Reports',
    icon: LuFileChartColumnIncreasing,
    path: '/reports',
  },

  {
    id: '07',
    label: 'Settings',
    icon: IoSettingsOutline,
    path: '/settings',
  },

  {
    id: '08',
    label: 'Logout',
    icon: LuLogOut,
    path: '/logout',
  },
];
