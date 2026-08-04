import { useState } from 'react';
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';

const AddGoalModal = ({ onGoalAdded, onGoalUpdated, onGoalEdited }) => {
  const [goal, setGoal] = useState({
    title: '',
    icon: '',
    targetAmount: '',
    targetDate: '',
    description: '',
  });

  const handleChange = (key, value) => setGoal({ ...goal, [key]: value });

  const handleSubmit = () => {
    if (onGoalEdited) {
      onGoalUpdated?.(goal);
    } else {
      onGoalAdded?.(goal);
    }
  };

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
          style={{
            cursor: 'pointer',
          }}
        >
          {onGoalEdited ? 'Update Goal' : 'Add Goal'}
        </button>
      </div>
    </div>
  );
};

export default AddGoalModal;
