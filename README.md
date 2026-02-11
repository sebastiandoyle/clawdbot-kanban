# Clawdbot Kanban

A minimal drag-and-drop kanban board that syncs with a markdown file. Built for [Clawdbot](https://github.com/clawdbot/clawdbot) but works standalone too.

![Demo](assets/demo.gif)

## Why?

- **Plain-text source of truth** — Tasks live in a markdown file, not a database
- **AI-friendly** — Clawdbot (or any LLM) can read and edit the markdown directly
- **Two-way sync** — Drag in the UI → file updates. Edit the file → board reflects it
- **Zero dependencies** — Just Node.js, no npm install needed

## Tech Stack

- Node.js (vanilla HTTP server)
- HTML/CSS/JS (no framework)
- Markdown parsing/serialization
- WebSocket for live sync

## Quick Start

```bash
git clone https://github.com/sebastiandoyle/clawdbot-kanban.git
cd clawdbot-kanban
node scripts/server.js
open http://localhost:3456
```

Creates `PROJECTS.md` on first run if it doesn't exist.

## As a Clawdbot Skill

```bash
cp -r clawdbot-kanban ~/.clawdbot/skills/
```

Then tell Clawdbot: "Start the kanban board"

## Markdown Format

```markdown
# Projects

## Backlog
- [ ] Task one
- [ ] Task two

## Active
- [ ] Currently working on this

## Done
- [x] Completed task
```

## Customization

Edit `scripts/server.js` to change columns:

```js
const COLUMNS = ['Backlog', 'Active', 'Done'];
const PORT = 3456;  // Or set KANBAN_PORT env var
```

## How It Works

1. Node.js server reads/writes the markdown file
2. Browser fetches board state via `/api/board`
3. Drag-and-drop triggers POST to save changes
4. Server parses/serializes markdown ↔ JSON bidirectionally

## License

MIT
