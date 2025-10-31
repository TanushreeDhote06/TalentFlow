import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchAssessment = createAsyncThunk(
  'assessments/fetchAssessment',
  async (jobId) => {
    const response = await fetch(`/api/assessments/${jobId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No assessment exists yet
      }
      throw new Error('Failed to fetch assessment');
    }
    return await response.json();
  }
);

export const saveAssessment = createAsyncThunk(
  'assessments/saveAssessment',
  async ({ jobId, sections }) => {
    const response = await fetch(`/api/assessments/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save assessment');
    }
    
    return await response.json();
  }
);

export const submitAssessmentResponse = createAsyncThunk(
  'assessments/submitAssessmentResponse',
  async ({ jobId, candidateId, responses }) => {
    const response = await fetch(`/api/assessments/${jobId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, responses }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit assessment');
    }
    
    return await response.json();
  }
);

export const fetchAssessmentResponse = createAsyncThunk(
  'assessments/fetchAssessmentResponse',
  async ({ jobId, candidateId }) => {
    const response = await fetch(`/api/assessments/${jobId}/responses/${candidateId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No response exists yet
      }
      throw new Error('Failed to fetch assessment response');
    }
    return await response.json();
  }
);

const initialState = {
  currentAssessment: null,
  currentJobId: null,
  sections: [],
  previewMode: false,
  responses: {}, // For filling out the assessment
  candidateResponse: null, // Submitted response
  loading: false,
  saving: false,
  error: null,
};

const assessmentsSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    initializeAssessment: (state, action) => {
      state.currentJobId = action.payload;
      state.sections = [];
      state.responses = {};
    },
    setSections: (state, action) => {
      state.sections = action.payload;
    },
    addSection: (state, action) => {
      state.sections.push(action.payload);
    },
    updateSection: (state, action) => {
      const { sectionId, updates } = action.payload;
      const index = state.sections.findIndex(s => s.id === sectionId);
      if (index !== -1) {
        state.sections[index] = { ...state.sections[index], ...updates };
      }
    },
    removeSection: (state, action) => {
      state.sections = state.sections.filter(s => s.id !== action.payload);
    },
    reorderSections: (state, action) => {
      const { fromIndex, toIndex } = action.payload;
      const newSections = [...state.sections];
      const [moved] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, moved);
      state.sections = newSections;
    },
    addQuestion: (state, action) => {
      const { sectionId, question } = action.payload;
      const section = state.sections.find(s => s.id === sectionId);
      if (section) {
        if (!section.questions) {
          section.questions = [];
        }
        section.questions.push(question);
      }
    },
    updateQuestion: (state, action) => {
      const { sectionId, questionId, updates } = action.payload;
      const section = state.sections.find(s => s.id === sectionId);
      if (section?.questions) {
        const questionIndex = section.questions.findIndex(q => q.id === questionId);
        if (questionIndex !== -1) {
          section.questions[questionIndex] = {
            ...section.questions[questionIndex],
            ...updates,
          };
        }
      }
    },
    removeQuestion: (state, action) => {
      const { sectionId, questionId } = action.payload;
      const section = state.sections.find(s => s.id === sectionId);
      if (section?.questions) {
        section.questions = section.questions.filter(q => q.id !== questionId);
      }
    },
    reorderQuestions: (state, action) => {
      const { sectionId, fromIndex, toIndex } = action.payload;
      const section = state.sections.find(s => s.id === sectionId);
      if (section?.questions) {
        const newQuestions = [...section.questions];
        const [moved] = newQuestions.splice(fromIndex, 1);
        newQuestions.splice(toIndex, 0, moved);
        section.questions = newQuestions;
      }
    },
    setPreviewMode: (state, action) => {
      state.previewMode = action.payload;
    },
    setResponse: (state, action) => {
      const { questionId, value } = action.payload;
      state.responses[questionId] = value;
    },
    clearResponses: (state) => {
      state.responses = {};
    },
    clearAssessment: (state) => {
      state.currentAssessment = null;
      state.currentJobId = null;
      state.sections = [];
      state.responses = {};
      state.candidateResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assessment
      .addCase(fetchAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentAssessment = action.payload;
          state.sections = action.payload.sections || [];
          state.currentJobId = action.payload.jobId;
        }
      })
      .addCase(fetchAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Save assessment
      .addCase(saveAssessment.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveAssessment.fulfilled, (state, action) => {
        state.saving = false;
        state.currentAssessment = action.payload;
      })
      .addCase(saveAssessment.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message;
      })
      
      // Submit assessment response
      .addCase(submitAssessmentResponse.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(submitAssessmentResponse.fulfilled, (state) => {
        state.saving = false;
        state.responses = {};
      })
      .addCase(submitAssessmentResponse.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message;
      })
      
      // Fetch assessment response
      .addCase(fetchAssessmentResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentResponse.fulfilled, (state, action) => {
        state.loading = false;
        state.candidateResponse = action.payload;
      })
      .addCase(fetchAssessmentResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  initializeAssessment,
  setSections,
  addSection,
  updateSection,
  removeSection,
  reorderSections,
  addQuestion,
  updateQuestion,
  removeQuestion,
  reorderQuestions,
  setPreviewMode,
  setResponse,
  clearResponses,
  clearAssessment,
} = assessmentsSlice.actions;

export default assessmentsSlice.reducer;

