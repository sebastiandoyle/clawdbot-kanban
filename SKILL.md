---
name: clawdbot-kanban
description: Visual kanban board with drag-and-drop that syncs to a markdown file. Use when managing projects, tasks, or priorities visually while maintaining a plain-text source of truth. Start the server with `node scripts/server.js` then open localhost:3456.
---

# Clawdbot Kanban

A minimal kanban board that syncs bidirectionally with a markdown file.

## Quick Start

1. Start the server:
   ```bash
   node /path/to/skill/scripts/server.js [path/to/PROJECTS.md]
   ```
   Defaults to `PROJECTS.md` in the current directory.

2. Open `http://localhost:3456` in a browser

3. Drag tasks between columns — changes save automatically to the markdown file

## Markdown Format

The board reads/writes a simple markdown structure:

```markdown
# Projects

## Backlog
- [ ] Task one
- [ ] Task two with details

## Active
- [ ] Currently working on this

## Done
- [x] Completed task
```

## For Agents

- Read `PROJECTS.md` to see current task state
- Edit `PROJECTS.md` directly — the dashboard will reflect changes on reload
- Add new tasks by appending `- [ ] Task name` under the appropriate section
- Move tasks by cutting/pasting between sections
- Mark done by changing `[ ]` to `[x]`

## Customizing Columns

Edit the `columns` array in `scripts/server.js` to change column names:
```js
const columns = ['Backlog', 'Active', 'Done'];
```
