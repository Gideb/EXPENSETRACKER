import { useState, useEffect } from 'react';
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';

const AddBudgetForm = ({ categories = [], onBudgetAdded, onUpdateBudget, editData }) => {
  const [budget, setBudget] = useState({
    category: '',
    limitAmount: '',
    month: '',
    icon: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (!editData) return;

    setBudget((prev) => ({
      ...prev,
      category: editData.category || '',
      limitAmount:
        editData.limitAmount !== undefined && editData.limitAmount !== null
          ? editData.limitAmount
          : '',
      month: editData.month || '',
      year: editData.year || new Date().getFullYear(),
      icon: editData.icon || '',
    }));
  }, [editData]);

  const handleChange = (key, value) => setBudget({ ...budget, [key]: value });

  const handleSubmit = () => {
    if (editData) {
      onUpdateBudget?.(budget);
    } else {
      onBudgetAdded?.(budget);
    }
  };

  const isFormValid = budget.category && budget.limitAmount && budget.month;

  // Get current year-month for min attribute
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div>
      <EmojiPickerPopup
        icon={budget.icon}
        onSelect={(selectedIcon) => handleChange('icon', selectedIcon)}
      />

      {/* <Input
        value={budget.category}
        onChange={({ target }) => handleChange('category', target.value)}
        label="Category"
        placeholder="Food, Transport, Clothing"
        type="text"
      /> */}
      <div className="mt-4">
        <label className="text-[13px] block mb-2 dark:text-white">Category</label>

        <select
          value={budget.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full dark:bg-white input-box"
        >
          <option value="" className="bg-gray-200 dark:bg-slate-800 dark:text-white ">
            Select Category
          </option>

          {categories.map((item) => (
            <option key={item} value={item} className="dark:bg-slate-700 dark:text-white ">
              {item}
            </option>
          ))}
        </select>

        {categories.length === 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Add an expense first to create budget categories.
          </p>
        )}
      </div>

      <Input
        value={budget.limitAmount}
        onChange={({ target }) => handleChange('limitAmount', target.value)}
        label="Budget Amount"
        placeholder="Enter amount"
        type="number"
        min="0"
        step="0.01"
      />

      {/* <Input
        label="Month"
        placeholder="Select month"
        type="month"
        min={currentMonth}
        value={budget.month}
        onChange={({ target }) => handleChange('month', target.value)}
      /> */}

      <Input
        label="Month"
        type="month"
        min={currentMonth}
        value={`${budget.year}-${budget.month}`}
        onChange={({ target }) => {
          const [year, month] = target.value.split('-');

          setBudget({
            ...budget,
            year: Number(year),
            month,
          });
        }}
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
          disabled={!isFormValid}
          style={{
            opacity: !isFormValid ? 0.6 : 1,
            cursor: !isFormValid ? 'not-allowed' : 'pointer',
          }}
        >
          {editData ? 'Update Budget' : 'Add Budget'}
        </button>
      </div>
    </div>
  );
};

export default AddBudgetForm;
