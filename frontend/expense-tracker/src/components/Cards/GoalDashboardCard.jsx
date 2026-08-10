import { Target } from 'lucide-react';

const COLORS = {
  blue: 'from-blue-500 to-indigo-600',
  green: 'from-green-500 to-emerald-600',
  amber: 'from-amber-500 to-orange-500',
  red: 'from-red-500 to-rose-600',
};

const GoalDashboardCard = ({ dashboard }) => {
  const { summary, featuredGoal, alert } = dashboard;

  if (!featuredGoal) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-3 h-3 text-amber-500" />
          <h3 className="font-semibold text-lg">Goals</h3>
        </div>

        <div className="text-center py-3">
          <div className="text-sm mb-4">🎯</div>

          <h4 className="font-medium text-xs">No Goals Yet</h4>

          <p className="text-gray-200 mt-1">
            Create your first savings goal and start tracking your progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div>
        <div
          className={`flex px-10 py-2 justify-between items-center bg-linear-to-r ${COLORS[alert.color]}`}
        >
          <div>
            <h3 className="font-medium mt-1 text-white">{alert.title}</h3>
            <p className="text-xs text-white/80">{alert.message}</p>
          </div>

          <div>
            <h4 className="font-medium text-sm text-white">{featuredGoal.title}</h4>

            <p className="text-xs  text-white/80">
              GH₵{featuredGoal.savedAmount.toLocaleString()} of GH₵
              {featuredGoal.targetAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-2 flex justify-between text-xs px-10 py-3">
          <span>
            Active: <strong>{summary.activeGoals}</strong>
          </span>

          <span>
            Completed: <strong>{summary.completedGoals}</strong>
          </span>

          <span>
            Archived: <strong>{summary.archivedGoals}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default GoalDashboardCard;
