import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  modals: {
    jobForm: {
      isOpen: false,
      jobId: null, // null for create, number for edit
    },
  },
  toasts: [],
  loading: {
    global: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openJobFormModal: (state, action) => {
      state.modals.jobForm.isOpen = true;
      state.modals.jobForm.jobId = action.payload || null;
    },
    closeJobFormModal: (state) => {
      state.modals.jobForm.isOpen = false;
      state.modals.jobForm.jobId = null;
    },
    showToast: (state, action) => {
      const toast = {
        id: Date.now(),
        type: action.payload.type || 'info', // success, error, warning, info
        message: action.payload.message,
        duration: action.payload.duration || 3000,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
  },
});

export const {
  openJobFormModal,
  closeJobFormModal,
  showToast,
  removeToast,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;

