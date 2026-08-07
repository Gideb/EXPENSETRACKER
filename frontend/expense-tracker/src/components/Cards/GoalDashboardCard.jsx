import { Target, Calendar } from 'lucide-react';

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
      <div className="bg-white rounded-2xl border p-6 h-full">
        <div className="flex items-center gap-3 mb-5">
          <Target className="w-6 h-6 text-amber-500" />
          <h3 className="font-semibold text-lg">Goals</h3>
        </div>

        <div className="text-center py-8">
          <div className="text-5xl mb-4">🎯</div>

          <h4 className="font-semibold text-lg">No Goals Yet</h4>

          <p className="text-gray-500 mt-2">
            Create your first savings goal and start tracking your progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border overflow-hidden h-full">
      <div className={`bg-linear-to-r ${COLORS[alert.color]} text-white p-5`}>
        <div className="flex justify-between">
          <div>
            <p className="text-3xl">{alert.icon}</p>

            <h3 className="font-semibold mt-2">{alert.title}</h3>

            <p className="text-sm text-white/90">{alert.message}</p>
          </div>

          <Target className="w-8 h-8 opacity-70" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-lg">{featuredGoal.title}</h4>

            <p className="text-sm text-gray-500">
              GH₵{featuredGoal.savedAmount.toLocaleString()} of GH₵
              {featuredGoal.targetAmount.toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-amber-600">{featuredGoal.percentage}%</p>
          </div>
        </div>

        <div className="mt-4 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
            style={{
              width: `${featuredGoal.percentage}%`,
            }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Remaining</p>

            <p className="font-semibold">
              GH₵
              {featuredGoal.remaining.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Due</p>

            <p className="font-semibold flex items-center gap-1">
              <Calendar size={15} />

              {featuredGoal.targetDate
                ? new Date(featuredGoal.targetDate).toLocaleDateString()
                : 'No date'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-between text-sm">
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
