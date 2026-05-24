# Tasks — a full-featured todo app

A dark-themed task management app built with React, TypeScript, and Redux Toolkit.  
Uses `json-server` as a local REST backend so all data persists across sessions.

---

## Tech stack

| Layer | Library |
|---|---|
| UI | React 18, TypeScript |
| State / API | Redux Toolkit, RTK Query |
| Routing | React Router v6 |
| Drag & drop | @dnd-kit |
| Backend | json-server (local REST) |
| Export | html2canvas (PNG) |
| Styling | CSS Modules, dark theme |

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start both the React app and json-server together
npm run dev
```

App → http://localhost:3000  
API → http://localhost:3001

Or start them separately:

```bash
npm run server   # json-server on :3001
npm start        # React on :3000
```

---

## Features

### Tasks
- Add tasks with title, description, priority (high / medium / low), deadline, tags, recurrence
- Inline edit — all fields editable without leaving the list
- Drag-and-drop reorder (custom sort)
- Sort by priority, deadline, title, creation date, or custom order
- Filter by status (all / active / completed) and by tag
- Full-text search across title, description, tags, and subtasks
- Bulk actions — complete all, clear done
- Configurable items per page

### Subtasks
- Add / edit / delete subtasks inline
- Progress bar showing completed / total
- Subtask input fades in on card hover

### Recurring tasks
- Daily, weekly, monthly, or custom interval / specific weekdays
- Optional end date — recurrence stops automatically
- Completing a recurring task advances the deadline to the next occurrence instead of marking it done permanently
- When the end date is reached the task is permanently completed

### Calendar view
- Month grid with task chips per day
- Click any day to open a modal — add, edit, complete, delete tasks for that day
- Today highlighted, completed tasks shown with strikethrough

### History
- Full activity log: added, completed, reopened, updated, deleted
- Grouped by day (Today / Yesterday / full date)
- Filter by action type, stat chips, pagination

### Profile
- User stats: total, done, active, overdue tasks
- Priority breakdown and tag usage charts
- Upcoming deadlines panel
- Recent activity feed
- Export todos as JSON or PNG

### Settings
- Default priority for new tasks
- Tasks per page (5 / 7 / 10 / 15 / 20)
- History items per page (5 / 10 / 20 / 50)
- Clear all history
- Delete account (removes all data)
- Settings take effect immediately — no page reload needed

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start app + API server together |
| `npm start` | React dev server only |
| `npm run server` | json-server only |
| `npm run build` | Production build |
| `npm test` | Run tests |
