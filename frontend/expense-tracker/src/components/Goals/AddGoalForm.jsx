import { useState, useEffect } from 'react';
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';

const AddGoalForm = ({ onGoalAdded, onGoalUpdated, editData }) => {
  const [goal, setGoal] = useState({
    title: '',
    icon: '',
    targetAmount: '',
    targetDate: '',
    description: '',
  });

  useEffect(() => {
    if (!editData) return;

    setGoal({
      title: editData.title || '',
      icon: editData.icon || '',
      targetAmount: editData.targetAmount || '',
      targetDate: editData.targetDate
        ? new Date(editData.targetDate).toISOString().split('T')[0]
        : '',
      description: editData.description || '',
    });
  }, [editData]);

  const handleChange = (key, value) => setGoal({ ...goal, [key]: value });

  const handleSubmit = () => {
    if (editData) {
      onGoalUpdated?.(goal);
    } else {
      onGoalAdded?.(goal);
    }
  };

  const isFormValid = goal.title?.trim() && goal.targetAmount && goal.targetDate;

  return (
    <div>
      <EmojiPickerPopup
        icon={goal.icon}
        onSelect={(selectedIcon) => handleChange('icon', selectedIcon)}
      />

      <Input
        label="Goal Title"
        onChange={({ target }) => handleChange('title', target.value)}
        value={goal.title}
        placeholder="New Car"
        type="text"
      />

      <Input
        value={goal.targetAmount}
        onChange={({ target }) => handleChange('targetAmount', target.value)}
        label="Target Amount"
        placeholder="Enter amount"
        type="number"
        min="0"
        step="0.01"
      />

      <Input
        value={goal.targetDate}
        onChange={({ target }) => handleChange('targetDate', target.value)}
        label="Target Date"
        type="date"
        min={new Date().toISOString().split('T')[0]}
      />

      <Input
        value={goal.description}
        onChange={({ target }) => handleChange('description', target.value)}
        label="Description"
        placeholder="Goal notes"
        type="text"
        rows="3"
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
          disabled={!isFormValid}
          style={{
            opacity: isFormValid ? 1 : 0.6,
            cursor: isFormValid ? 'pointer' : 'not-allowed',
          }}
        >
          {editData ? 'Update Goal' : 'Add Goal'}
        </button>
      </div>
    </div>
  );
};

export default AddGoalForm;
