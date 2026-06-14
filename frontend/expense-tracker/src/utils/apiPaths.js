export const BASE_URL = import.meta.env.VITE_API_URL;

// utils/apiPaths.js

export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    GET_USER_INFO: "/api/v1/auth/getUser",
    UPDATE_PROFILE: "/api/v1/auth/update-profile",
    CHANGE_PASSWORD: "/api/v1/auth/change-password",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
  },
  DASHBOARD: {
    GET_DATA: "/api/v1/dashboard",
  },
  INCOME: {
    ADD_INCOME: "/api/v1/income/add",
    GET_ALL_INCOME: "/api/v1/income/get",
    UPDATE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DOWNLOAD_INCOME: "/api/v1/income/downloadexcel",
  },
  EXPENSE: {
    ADD_EXPENSE: "/api/v1/expense/add",
    GET_ALL_EXPENSES: "/api/v1/expense/get",
    UPDATE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DOWNLOAD_EXPENSES: "/api/v1/expense/downloadexcel",
  },
  BUDGET: {
    ADD_BUDGET: "/api/v1/budget/add",
    GET_ALL_BUDGET: "/api/v1/budget/get",
    UPDATE_BUDGET: (budgetId) => `/api/v1/budget/${budgetId}`,
    DELETE_BUDGET: (budgetId) => `/api/v1/budget/${budgetId}`,
    GET_BUDGET_SUMMARY: "/api/v1/budget/summary",
    GET_BUDGET_SUMMARY_BY_MONTH: (month) => `/api/v1/budget/summary/${month}`,
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/v1/auth/upload-image",
  },
};
