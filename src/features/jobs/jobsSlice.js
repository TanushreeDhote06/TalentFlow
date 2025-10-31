import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async ({ search = '', status = '', page = 1, pageSize = 12, sort = 'order' } = {}) => {
    const params = new URLSearchParams({
      search,
      status,
      page: page.toString(),
      pageSize: pageSize.toString(),
      sort,
    });
    
    const response = await fetch(`/api/jobs?${params}`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return await response.json();
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId) => {
    const response = await fetch(`/api/jobs/${jobId}`);
    if (!response.ok) throw new Error('Failed to fetch job');
    return await response.json();
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData) => {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create job');
    }
    
    return await response.json();
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, updates }) => {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update job');
    }
    
    return await response.json();
  }
);

export const reorderJobs = createAsyncThunk(
  'jobs/reorderJobs',
  async ({ fromOrder, toOrder }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/jobs/0/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromOrder, toOrder }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reorder jobs');
      }
      
      return { fromOrder, toOrder };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  currentJob: null,
  filters: {
    search: '',
    status: '',
    tags: [],
  },
  pagination: {
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  },
  sort: 'order',
  loading: false,
  error: null,
  reorderSnapshot: null, // For optimistic updates rollback
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page on filter change
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    optimisticReorder: (state, action) => {
      // Save snapshot for rollback
      state.reorderSnapshot = [...state.items];
      
      const { fromIndex, toIndex } = action.payload;
      const newItems = [...state.items];
      const [moved] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, moved);
      
      // Update order values
      newItems.forEach((job, index) => {
        job.order = index;
      });
      
      state.items = newItems;
    },
    rollbackReorder: (state) => {
      if (state.reorderSnapshot) {
        state.items = state.reorderSnapshot;
        state.reorderSnapshot = null;
      }
    },
    clearReorderSnapshot: (state) => {
      state.reorderSnapshot = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch job by ID
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create job
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update job
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentJob?.id === action.payload.id) {
          state.currentJob = action.payload;
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Reorder jobs
      .addCase(reorderJobs.fulfilled, (state) => {
        state.reorderSnapshot = null;
      })
      .addCase(reorderJobs.rejected, (state) => {
        // Rollback will be handled in component
      });
  },
});

export const {
  setFilters,
  setPage,
  setSort,
  optimisticReorder,
  rollbackReorder,
  clearReorderSnapshot,
} = jobsSlice.actions;

export default jobsSlice.reducer;

