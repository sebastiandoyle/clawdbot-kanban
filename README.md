# 🗂️ Clawdbot Kanban

A minimal drag-and-drop kanban board that syncs with a markdown file. Built for [Clawdbot](https://github.com/clawdbot/clawdbot) but works standalone too.

![Demo](assets/demo.gif)

## Why?

- **Plain-text source of truth** — Your tasks live in a markdown file, not a database
- **AI-friendly** — Clawdbot can read and edit the markdown directly
- **Two-way sync** — Drag in the UI → file updates. Edit the file → board reflects it
- **Zero dependencies** — Just Node.js, no npm install needed

## Quick Start

```bash
# Clone the repo
git clone https://github.com/sebastiandoyle/clawdbot-kanban.git
cd clawdbot-kanban

# Run the server (creates PROJECTS.md if it doesn't exist)
node scripts/server.js

# Open in browser
open http://localhost:3456
```

## As a Clawdbot Skill

Copy the skill folder to your Clawdbot skills directory:

```bash
cp -r clawdbot-kanban ~/.clawdbot/skills/
```

Then tell Clawdbot to start the board:
> "Start the kanban board"

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
const COLUMNS = ['Backlog', 'Active', 'Done'];  // Change these
const PORT = 3456;  // Or set KANBAN_PORT env var
```

## How It Works

1. Node.js server reads/writes markdown file
2. Browser fetches board state via `/api/board`
3. Drag-and-drop triggers POST to save changes
4. Server parses/serializes markdown ↔ JSON

## License

MIT — do whatever you want with it.

---

Built by [@sebastiandoyle](https://github.com/sebastiandoyle) with [Clawdbot](https://github.com/clawdbot/clawdbot) 🌊
