/**
 * Application-wide constants
 */

export const STAGES = {
  APPLIED: 'applied',
  SCREEN: 'screen',
  TECH: 'tech',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
};

export const STAGE_LABELS = {
  [STAGES.APPLIED]: 'Applied',
  [STAGES.SCREEN]: 'Screen',
  [STAGES.TECH]: 'Tech Interview',
  [STAGES.OFFER]: 'Offer',
  [STAGES.HIRED]: 'Hired',
  [STAGES.REJECTED]: 'Rejected',
};

export const JOB_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};

export const QUESTION_TYPES = {
  SHORT_TEXT: 'short-text',
  LONG_TEXT: 'long-text',
  SINGLE_CHOICE: 'single-choice',
  MULTI_CHOICE: 'multi-choice',
  NUMERIC: 'numeric',
  FILE_UPLOAD: 'file-upload',
};

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const VIEW_MODES = {
  LIST: 'list',
  KANBAN: 'kanban',
};

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 12,
  CANDIDATE_PAGE_SIZE: 50,
};

export const DEBOUNCE_DELAY = 300; // milliseconds

export const EXPIRY_WARNING_DAYS = 7; // Show warning when job expires within this many days

