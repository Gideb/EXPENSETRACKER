import {
  LuLayoutDashboard,
  LuWallet,
  LuCreditCard,
  LuArrowLeftRight,
  LuChartPie,
  LuTarget,
  LuFileChartColumnIncreasing,
  LuSettings,
  LuLogOut,
} from 'react-icons/lu';

export const SIDE_MENU_DATA = [
  {
    id: '01',
    label: 'Dashboard',
    icon: LuLayoutDashboard,
    path: '/dashboard',
  },
  {
    id: '02',
    label: 'Income',
    icon: LuWallet,
    path: '/income',
  },
  {
    id: '03',
    label: 'Expenses',
    icon: LuCreditCard,
    path: '/expense',
  },
  {
    id: '04',
    label: 'Transactions',
    icon: LuArrowLeftRight,
    path: '/transactions',
  },
  {
    id: '05',
    label: 'Budgets',
    icon: LuChartPie,
    path: '/budget',
  },
  {
    id: '06',
    label: 'Goals',
    icon: LuTarget,
    path: '/goals',
  },
  {
    id: '07',
    label: 'Reports',
    icon: LuFileChartColumnIncreasing,
    path: '/reports',
  },
  {
    id: '08',
    label: 'Settings',
    icon: LuSettings,
    path: '/settings',
  },
  {
    id: '09',
    label: 'Logout',
    icon: LuLogOut,
    path: '/logout',
  },
];
