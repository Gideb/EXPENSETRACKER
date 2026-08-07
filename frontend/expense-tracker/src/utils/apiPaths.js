export const BASE_URL = import.meta.env.VITE_API_URL || '';

// utils/apiPaths.js

export const API_PATHS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    GET_USER_INFO: '/api/v1/auth/getUser',
    UPDATE_PROFILE: '/api/v1/auth/update-profile',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  DASHBOARD: {
    GET_DATA: '/api/v1/dashboard',
  },
  INCOME: {
    ADD_INCOME: '/api/v1/income/add',
    GET_ALL_INCOME: '/api/v1/income/get',
    UPDATE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DOWNLOAD_INCOME: '/api/v1/income/download-excel',
    EXPORT_PDF: '/api/v1/income/export-pdf',
  },
  EXPENSE: {
    ADD_EXPENSE: '/api/v1/expense/add',
    GET_ALL_EXPENSES: '/api/v1/expense/get',
    UPDATE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DOWNLOAD_EXPENSES: '/api/v1/expense/download-excel',
    EXPORT_PDF: '/api/v1/expense/export-pdf',
  },
  BUDGET: {
    ADD_BUDGET: '/api/v1/budget/add',
    GET_ALL_BUDGET: '/api/v1/budget/get',
    UPDATE_BUDGET: (budgetId) => `/api/v1/budget/${budgetId}`,
    DELETE_BUDGET: (budgetId) => `/api/v1/budget/${budgetId}`,
    GET_BUDGET_SUMMARY: '/api/v1/budget/summary',
    GET_BUDGET_SUMMARY_BY_MONTH: (month) => `/api/v1/budget/summary/${month}`,
    BUDGET_CATEGORIES: '/api/v1/budget/categories',
  },

  TRANSACTIONS: {
    GET_ALL: '/api/v1/transactions',
    DELETE: (type, id) => `/api/v1/transactions/${type}/${id}`,
    EXPORT_EXCEL: '/api/v1/transactions/download-excel',
    EXPORT_PDF: '/api/v1/transactions/export-pdf',
  },
  REPORTS: {
    FINANCIAL: '/api/v1/reports/financial',
    MONTHLY: '/api/v1/reports/monthly',
    CATEGORY_ANALYSIS: '/api/v1/reports/category-analysis',
    BUDGET_PERFORMANCE: '/api/v1/reports/budget-performance',
    FULL: '/api/v1/reports/full',
    EXPORT_PDF: '/api/v1/reports/export-pdf',
    EXPORT_CSV: '/api/v1/reports/export-csv',
    EMAIL_REPORT: '/api/v1/reports/email-report',
    AVAILABLE_PERIODS: '/api/v1/reports/available-periods',
    CATEGORIES: '/api/v1/reports/categories',
  },
  GOALS: {
    CREATE_GOAL: '/api/v1/goals/add',
    GET_ALL_GOALS: '/api/v1/goals/get',
    GET_GOAL: (goalId) => `/api/v1/goals/${goalId}`,
    UPDATE_GOAL: (goalId) => `/api/v1/goals/${goalId}`,
    DELETE_GOAL: (goalId) => `/api/v1/goals/${goalId}`,
    UPDATE_SAVED_AMOUNT: (goalId) => `/api/v1/goals/${goalId}/savings`,
    ARCHIVE_GOAL: (goalId) => `/api/v1/goals/${goalId}/archive`,
    GET_GOAL_SUMMARY: '/api/v1/goals/summary',
    DASHBOARD_INFO: '/api/v1/goals/dashboard',
  },
  SETTINGS: {},
  IMAGE: {
    UPLOAD_IMAGE: '/api/v1/auth/upload-image',
  },
};
