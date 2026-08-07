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
      <div className="bg-white rounded border p-6">
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
          className={`flex px-6 py-2 justify-between items-center bg-linear-to-r ${COLORS[alert.color]}`}
        >
          <div>
            <p className="text-sm">{alert.icon}</p>

            <h3 className="font-medium mt-1">{alert.title}</h3>

            <p className="text-xs text-white/90">{alert.message}</p>
          </div>

          <div className="p-5">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium text-sm">{featuredGoal.title}</h4>

                <p className="text-xs text-gray-200">
                  GH₵{featuredGoal.savedAmount.toLocaleString()} of GH₵
                  {featuredGoal.targetAmount.toLocaleString()}
                </p>
              </div>

              {/*  <div className="text-right">
                <p className="text-xl font-bold text-amber-600">{featuredGoal.percentage}%</p>
              </div> */}
            </div>
          </div>
        </div>

        {/* <div className="mt-2 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
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
        </div> */}

        <div className="mt-2 flex justify-between text-xs p-5">
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
