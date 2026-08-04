import API from './api'; // Assuming you have an API client setup

const GOALS = {
  CREATE_GOAL: '/api/v1/goals/add',
  GET_ALL_GOALS: '/api/v1/goals',
  GET_GOAL: (goalId) => `/api/v1/goals/${goalId}`,
  UPDATE_GOAL: (goalId) => `/api/v1/goals/${goalId}`,
  DELETE_GOAL: (goalId) => `/api/v1/goals/${goalId}`,
  UPDATE_SAVED_AMOUNT: (goalId) => `/api/v1/goals/${goalId}/savings`,
  GET_GOAL_SUMMARY: '/api/v1/goals/summary',
};

// Create a new goal
export const createGoal = async (goalData) => {
  try {
    const response = await API.post(GOALS.CREATE_GOAL, goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create goal' };
  }
};

// Get all goals
export const getGoals = async () => {
  try {
    const response = await API.get(GOALS.GET_ALL_GOALS);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch goals' };
  }
};

// Get single goal
export const getGoal = async (goalId) => {
  try {
    const response = await API.get(GOALS.GET_GOAL(goalId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch goal' };
  }
};

// Update goal
export const updateGoal = async (goalId, goalData) => {
  try {
    const response = await API.put(GOALS.UPDATE_GOAL(goalId), goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update goal' };
  }
};

// Update saved amount
export const updateSavedAmount = async (goalId, amount) => {
  try {
    const response = await API.put(GOALS.UPDATE_SAVED_AMOUNT(goalId), { amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update savings' };
  }
};

// Delete goal
export const deleteGoal = async (goalId) => {
  try {
    const response = await API.delete(GOALS.DELETE_GOAL(goalId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete goal' };
  }
};

// Get goal summary
export const getGoalSummary = async () => {
  try {
    const response = await API.get(GOALS.GET_GOAL_SUMMARY);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch summary' };
  }
};
