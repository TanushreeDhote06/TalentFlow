# TalentFlow - Mini Hiring Platform

A comprehensive React-based HR management system for managing jobs, candidates, and assessments. Built with modern web technologies and featuring a fully offline-capable architecture.

## 🚀 Live Demo

[Live Demo Link] - *(To be added after deployment)*

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [Key Features Implementation](#key-features-implementation)
- [Technical Decisions](#technical-decisions)
- [Known Issues](#known-issues)
- [Future Improvements](#future-improvements)

## ✨ Features

### Jobs Management
- ✅ Create, edit, and archive job postings
- ✅ Server-like pagination and filtering (title, status, tags)
- ✅ Drag-and-drop reordering with optimistic updates and rollback on failure
- ✅ Deep linking to individual jobs (`/jobs/:jobId`)
- ✅ Job expiration dates with auto-archiving
- ✅ Visual indicators for expiring jobs

### Candidates Management
- ✅ Virtualized list supporting 1000+ candidates
- ✅ Client-side search (name/email) with debouncing
- ✅ Server-like filtering by stage
- ✅ Kanban board view with drag-and-drop stage transitions
- ✅ Candidate profile with complete timeline
- ✅ Follow-up flagging system
- ✅ Assessment completion status tracking

### Assessments
- ✅ Interactive assessment builder with live preview
- ✅ Multiple question types:
  - Single choice (radio buttons)
  - Multiple choice (checkboxes)
  - Short text input
  - Long text (textarea)
  - Numeric with range validation
  - File upload (UI stub)
- ✅ Validation rules (required, max length, numeric range)
- ✅ Conditional questions (show/hide based on other answers)
- ✅ Real-time form validation
- ✅ Persistent storage in IndexedDB

## 🛠 Tech Stack

### Core
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing

### State Management
- **Redux Toolkit** - Centralized state management
- **Redux Toolkit Query** - Async thunks for API calls

### Mock API & Storage
- **MirageJS** - Mock REST API server
- **Dexie.js** - IndexedDB wrapper for persistent storage

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components (modals)
- **Heroicons** - Icon library

### Drag & Drop
- **@dnd-kit** - Modern drag-and-drop toolkit
  - Core, Sortable, and Utilities packages

### Virtualization
- **TanStack Virtual (React Virtual)** - Efficient rendering of large lists

### Utilities
- **date-fns** - Date manipulation and formatting
- **nanoid** - Unique ID generation
- **clsx** - Conditional className utility

## 🏗 Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        React Application                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Jobs       │  │  Candidates  │  │  Assessments     │  │
│  │   Module     │  │   Module     │  │   Module         │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘  │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│                ┌──────────▼──────────┐                       │
│                │   Redux Store       │                       │
│                │  (State Management) │                       │
│                └──────────┬──────────┘                       │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                ┌───────────▼───────────┐
                │    MirageJS Server    │
                │  (Mock API Layer)     │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │      IndexedDB        │
                │  (Persistent Storage) │
                └───────────────────────┘
```

### Data Flow

1. **User Interaction** → Component dispatches Redux action
2. **Redux Thunk** → Makes API call to MirageJS endpoint
3. **MirageJS Handler** → Reads/writes to IndexedDB via Dexie
4. **Response** → Returns data with artificial latency
5. **Redux State Update** → Component re-renders with new data

### Offline-First Architecture

- All data is persisted in IndexedDB
- MirageJS acts as a "network layer" that reads/writes to IndexedDB
- On app refresh, data is restored from IndexedDB
- Simulates realistic API behavior (latency, errors) while being fully offline

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hr_management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Building for Production

```bash
npm run build
npm run preview  # Preview production build
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── app/                      # Redux store configuration
│   ├── store.js             # Store setup
│   └── uiSlice.js           # UI state (modals, toasts)
│
├── features/                 # Feature modules
│   ├── jobs/                # Jobs management
│   │   ├── jobsSlice.js
│   │   ├── JobsBoard.jsx
│   │   ├── JobCard.jsx
│   │   ├── JobFormModal.jsx
│   │   └── JobDetail.jsx
│   │
│   ├── candidates/          # Candidates tracking
│   │   ├── candidatesSlice.js
│   │   ├── CandidatesList.jsx
│   │   ├── CandidatesKanban.jsx
│   │   ├── CandidateCard.jsx
│   │   ├── KanbanColumn.jsx
│   │   └── CandidateProfile.jsx
│   │
│   └── assessments/         # Assessment builder
│       ├── assessmentsSlice.js
│       ├── AssessmentBuilder.jsx
│       ├── AssessmentPreview.jsx
│       ├── AssessmentPreviewPane.jsx
│       ├── QuestionEditor.jsx
│       └── QuestionRenderer.jsx
│
├── components/              # Shared UI components
│   ├── Layout.jsx
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Textarea.jsx
│   ├── Badge.jsx
│   ├── Modal.jsx
│   ├── Toast.jsx
│   ├── LoadingSpinner.jsx
│   └── EmptyState.jsx
│
├── services/                # External services
│   └── db.js               # Dexie IndexedDB setup
│
├── mocks/                   # Mock API
│   ├── server.js           # MirageJS server
│   └── seedData.js         # Data generators
│
├── App.jsx                  # Root component with routing
├── main.jsx                # Entry point
└── index.css               # Global styles
```

## 🎯 Key Features Implementation

### 1. Jobs Reordering with Optimistic Updates

**Implementation:**
- Uses `@dnd-kit/sortable` for drag-and-drop
- Immediately updates UI (optimistic update)
- Makes API call in background
- On failure (10% simulation), rolls back to previous state
- Shows toast notification for success/failure

**Code Location:** `src/features/jobs/JobsBoard.jsx`

### 2. Virtualized Candidates List

**Implementation:**
- Uses `@tanstack/react-virtual` for efficient rendering
- Only renders visible items + overscan
- Supports 1000+ candidates without performance issues
- Client-side search with debouncing (300ms)

**Code Location:** `src/features/candidates/CandidatesList.jsx`

### 3. Kanban Board with Stage Transitions

**Implementation:**
- Uses `@dnd-kit/core` for drag-and-drop
- Droppable columns for each stage
- Automatically creates timeline entries on stage change
- Updates candidate record via API

**Code Location:** `src/features/candidates/CandidatesKanban.jsx`

### 4. Assessment Builder with Conditional Logic

**Implementation:**
- Two-pane layout: builder + live preview
- Dynamic question types with type-specific editors
- Conditional logic: show questions based on other answers
- Real-time preview updates as you build
- Full validation on submission

**Code Location:** `src/features/assessments/AssessmentBuilder.jsx`

### 5. Data Persistence with IndexedDB

**Implementation:**
- Dexie.js wrapper for IndexedDB
- Schema with 6 tables: jobs, candidates, timeline, assessments, responses, metadata
- MirageJS reads/writes through Dexie helpers
- Auto-seed on first load
- Data persists across page refreshes

**Code Location:** `src/services/db.js`, `src/mocks/server.js`

## 🧠 Technical Decisions

### Why Redux Toolkit?

**Pros:**
- Predictable state management for complex interactions
- Built-in DevTools for debugging
- `createAsyncThunk` simplifies async logic
- Immutable updates with Immer
- Scales well with application growth

**Cons:**
- More boilerplate than Context API
- Learning curve for team members

**Decision:** Chose Redux Toolkit because the application has complex state interactions (kanban drag-drop, optimistic updates, multi-component state sharing) that benefit from centralized state.

### Why MirageJS + IndexedDB?

**Pros:**
- Fully offline-capable application
- Realistic API simulation (latency, errors)
- No backend required for demo/development
- Data persists across refreshes
- Easy to add/remove mock routes

**Cons:**
- Two layers of abstraction (Mirage + Dexie)
- Not a real backend (limitations)

**Decision:** Perfect for a front-end assignment. Demonstrates understanding of both API integration and client-side storage while being fully self-contained.

### Why @dnd-kit?

**Pros:**
- Modern, performant architecture
- Better accessibility than alternatives
- Great mobile/touch support
- Active maintenance
- Smaller bundle size than react-beautiful-dnd

**Cons:**
- More verbose API than react-beautiful-dnd
- Newer library (less Stack Overflow answers)

**Decision:** `react-beautiful-dnd` is deprecated. `@dnd-kit` is the recommended modern alternative with better performance and accessibility.

### Why TanStack Virtual?

**Pros:**
- Exceptional performance with large lists
- Framework-agnostic core (can use with other frameworks)
- Flexible API
- Small bundle size

**Cons:**
- More manual setup than react-window
- Need to manage scroll container

**Decision:** Best-in-class virtualization library with active development and modern API design.

### Why Tailwind CSS?

**Pros:**
- Rapid development with utility classes
- Consistent design system
- Small production bundle (purges unused styles)
- No CSS naming conflicts
- Easy responsive design

**Cons:**
- Verbose className attributes
- Learning curve for utility classes

**Decision:** Industry standard for modern React applications. Allows for beautiful, responsive UI without writing custom CSS.

## ⚠️ Known Issues

1. **File Upload Stub**: File upload in assessments is UI-only. Files are not actually stored (as this is a front-end only app).

2. **Candidate Assignment**: When creating jobs or candidates, there's no UI to assign candidates to jobs. Currently handled through seed data.

3. **Assessment Preview Uses Mock Candidate**: The assessment preview uses candidate ID 1 for demo purposes rather than selecting a real candidate.

4. **No Authentication**: The app has no authentication system. All HR users see the same data.

5. **Mobile Drag-and-Drop**: While @dnd-kit supports touch, drag-and-drop may be less intuitive on mobile devices.

6. **Error Recovery**: If IndexedDB fails to initialize, the app has limited error recovery.

## 🔮 Future Improvements

### High Priority
- [ ] Add candidate creation UI
- [ ] Implement @mentions functionality in notes with autocomplete
- [ ] Add export functionality (CSV/PDF for candidates/jobs)
- [ ] Email templates for candidate communications
- [ ] Advanced search with multiple filters

### Medium Priority
- [ ] Dashboard with analytics and charts
- [ ] Calendar integration for interview scheduling
- [ ] Bulk actions (archive multiple jobs, move multiple candidates)
- [ ] Custom fields for jobs and candidates
- [ ] Activity log/audit trail

### Low Priority
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Undo/redo functionality
- [ ] Multi-language support (i18n)
- [ ] Print-friendly layouts

### Technical Improvements
- [ ] Add TypeScript for type safety
- [ ] Implement proper error boundaries
- [ ] Add unit tests (Vitest)
- [ ] Add E2E tests (Playwright)
- [ ] Implement service worker for true offline mode
- [ ] Add progressive web app (PWA) support
- [ ] Optimize bundle size with code splitting
- [ ] Add accessibility audit and ARIA improvements

## 📊 Performance Considerations

- **Virtualization**: Handles 1000+ candidates efficiently
- **Debouncing**: Search inputs debounced to reduce re-renders
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Lazy Loading**: Routes are code-split (can be enhanced further)
- **IndexedDB**: Fast local storage for instant data access

## 🧪 Testing the Application

### Test Scenarios

1. **Jobs**
   - Create a new job with expiration date
   - Edit an existing job
   - Drag to reorder jobs (some reorders will fail - this is intentional)
   - Archive/unarchive jobs
   - Filter by status
   - Check for expiring soon badges

2. **Candidates**
   - Search for candidates by name/email
   - Filter by stage
   - Toggle between list and kanban views
   - Drag candidates between stages in kanban
   - Mark candidates for follow-up
   - View candidate timeline

3. **Assessments**
   - Create assessment for a job
   - Add different question types
   - Set up conditional questions
   - Preview assessment in real-time
   - Submit assessment (validation)
   - Check assessment completion on candidate profile

## 📝 License

This project is for educational/assignment purposes.

## 👥 Author

Created as part of a technical assessment for a front-end developer position.

---

**Note**: This is a demo application with simulated API behavior. All data is stored locally in your browser's IndexedDB and will persist across page refreshes but will be lost if you clear browser data.
