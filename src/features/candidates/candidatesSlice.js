import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchCandidates = createAsyncThunk(
  'candidates/fetchCandidates',
  async ({ search = '', stage = '' } = {}) => {
    const params = new URLSearchParams({
      search,
      stage,
      pageSize: '10000', // Get all for virtualization
    });
    
    const response = await fetch(`/api/candidates?${params}`);
    if (!response.ok) throw new Error('Failed to fetch candidates');
    return await response.json();
  }
);

export const fetchCandidateById = createAsyncThunk(
  'candidates/fetchCandidateById',
  async (candidateId) => {
    const response = await fetch(`/api/candidates/${candidateId}`);
    if (!response.ok) throw new Error('Failed to fetch candidate');
    return await response.json();
  }
);

export const fetchCandidateTimeline = createAsyncThunk(
  'candidates/fetchCandidateTimeline',
  async (candidateId) => {
    const response = await fetch(`/api/candidates/${candidateId}/timeline`);
    if (!response.ok) throw new Error('Failed to fetch timeline');
    return await response.json();
  }
);

export const createCandidate = createAsyncThunk(
  'candidates/createCandidate',
  async (candidateData) => {
    const response = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidateData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create candidate');
    }
    
    return await response.json();
  }
);

export const updateCandidate = createAsyncThunk(
  'candidates/updateCandidate',
  async ({ id, updates }) => {
    const response = await fetch(`/api/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update candidate');
    }
    
    return await response.json();
  }
);

export const updateCandidateStage = createAsyncThunk(
  'candidates/updateCandidateStage',
  async ({ id, stage, notes = '' }) => {
    const response = await fetch(`/api/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, notes }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update candidate stage');
    }
    
    return await response.json();
  }
);

const initialState = {
  items: [],
  currentCandidate: null,
  currentTimeline: [],
  filters: {
    search: '',
    stage: '',
    followUpOnly: false,
  },
  viewMode: 'list', // 'list' or 'kanban'
  loading: false,
  error: null,
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    clearCurrentCandidate: (state) => {
      state.currentCandidate = null;
      state.currentTimeline = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch candidates
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch candidate by ID
      .addCase(fetchCandidateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidateById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCandidate = action.payload;
      })
      .addCase(fetchCandidateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch timeline
      .addCase(fetchCandidateTimeline.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCandidateTimeline.fulfilled, (state, action) => {
        state.currentTimeline = action.payload;
      })
      .addCase(fetchCandidateTimeline.rejected, (state, action) => {
        state.error = action.error.message;
      })
      
      // Create candidate
      .addCase(createCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update candidate
      .addCase(updateCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCandidate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentCandidate?.id === action.payload.id) {
          state.currentCandidate = action.payload;
        }
      })
      .addCase(updateCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update candidate stage
      .addCase(updateCandidateStage.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCandidateStage.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentCandidate?.id === action.payload.id) {
          state.currentCandidate = action.payload;
        }
      })
      .addCase(updateCandidateStage.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const {
  setFilters,
  setViewMode,
  clearCurrentCandidate,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;

