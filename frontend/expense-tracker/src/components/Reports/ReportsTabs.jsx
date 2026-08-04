import { BarChart3, Calendar, Wallet, PieChart } from 'lucide-react';

const TABS = [
  { id: 'summary', label: 'Financial Summary', icon: BarChart3 },
  { id: 'monthly', label: 'Monthly Reports', icon: Calendar },
  { id: 'budget', label: 'Budget Reports', icon: Wallet },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
];

const MOBTABS = [
  { id: 'summary', label: 'Summary', icon: BarChart3 },
  { id: 'monthly', label: 'Monthly', icon: Calendar },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'analytics', label: 'Insights', icon: PieChart },
];

const ReportsTabs = ({ activeTab, onChange }) => {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap gap-2 -mb-px">
          {TABS.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          {MOBTABS.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`sm:hidden flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ReportsTabs;

