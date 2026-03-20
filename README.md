# 🗼 AG Tower — Antigravity Control Tower

> **The desktop command center for managing your AI coding assistant ecosystem.**

AG Tower is a premium Tauri + React application that gives you full visibility and control over your [Antigravity](https://github.com/qdev89/AppXDevKit) AI coding environment — MCP servers, workflows, skills, knowledge bases, agents, sprint pipelines, and more — all from a single beautiful interface.

![AG Tower](https://img.shields.io/badge/Platform-Windows-blue?style=flat-square) ![Tauri](https://img.shields.io/badge/Tauri-v2-yellow?style=flat-square) ![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)

---

## ✨ Features

### Core Management
- **🔌 MCP Servers** — View, manage, and monitor Model Context Protocol server connections
- **📋 Rules** — Edit and manage project rules (GEMINI.md, CLAUDE.md, user rules)
- **🧠 Brain Sync** — Sync knowledge to cloud via NotebookLM MCP
- **📊 Dashboard** — Ecosystem health overview with sprint pipeline mini-diagram

### Asset Browsers
- **🔀 Workflows** — Visual workflow diagrams with auto-detection for 9+ workflow types (gstack, brainstorm, PM, test, YOLO, docs, UI, machina, safety)
- **⚡ Skills** — Browse and manage installed agent skills
- **📚 Knowledge Bases** — View knowledge items with metadata

### Sprint Pipeline (gstack-inspired)
- **🎯 Pipeline View** — 7-stage Kanban (Think → Plan → Build → Review → Test → Ship → Reflect)
- **🔄 Drag & Drop** — Move tasks between stages with toast notifications
- **👥 Parallel View** — Multi-lane concurrent agent execution visualization
- **✅ Readiness View** — Review gate dashboard per feature

### Developer Experience
- **🌙 Theme Switcher** — Light/dark mode with CSS token swapping
- **⌨️ Command Palette** — `Ctrl+K` quick navigation with fuzzy search
- **🔔 Toast Notifications** — Global notification system (success/error/info)
- **🎹 Keyboard Navigation** — `j/k` or arrow keys to navigate sidebar
- **🚀 Deploy** — Release pipeline management
- **📈 Retro** — Developer statistics and sprint retrospectives
- **💬 Office Hours** — Product reframing wizard (YC-style)

---

## 🖥️ Screenshots

*Coming soon — the app uses a premium dark mode design with:*
- Deep space navy background (`#06080f`)
- Purple-blue gradient accents (`#667eea → #764ba2`)
- Inter + JetBrains Mono typography
- Glassmorphic cards with subtle animations

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (for Tauri)
- [pnpm](https://pnpm.io/) or npm

### Development

```bash
# Clone the repo
git clone https://github.com/qdev89/ag-tower.git
cd ag-tower

# Install dependencies
npm install

# Start dev server (frontend only)
npm run dev

# Start with Tauri (full desktop app)
npm run tauri dev
```

### Build Installer

```bash
# Build MSI + NSIS installer
npm run tauri build
```

Output will be in `src-tauri/target/release/bundle/`:
- `msi/AG Tower_0.1.0_x64_en-US.msi` — Windows Installer
- `nsis/AG Tower_0.1.0_x64-setup.exe` — Setup Wizard

---

## 🏗️ Architecture

```
ag-tower/
├── src/                          # React frontend
│   ├── App.tsx                   # Main layout + routing + keyboard nav
│   ├── components/
│   │   ├── ThemeSwitcher.tsx     # Light/dark mode toggle
│   │   ├── CommandPalette.tsx    # Ctrl+K navigation
│   │   └── Toast.tsx             # Notification system
│   ├── pages/
│   │   ├── Dashboard.tsx         # Hero + health bar + quick actions
│   │   ├── McpManager.tsx        # MCP server management
│   │   ├── RulesEditor.tsx       # Project rules editor
│   │   ├── BrainSync.tsx         # Knowledge sync
│   │   ├── WorkflowBrowser.tsx   # Visual workflow diagrams
│   │   ├── SkillsCatalog.tsx     # Skills browser
│   │   ├── KnowledgeBases.tsx    # Knowledge items
│   │   ├── SprintPipeline.tsx    # 3-view sprint pipeline
│   │   ├── Deploy.tsx            # Release pipeline
│   │   ├── Retro.tsx             # Sprint retrospectives
│   │   ├── OfficeHours.tsx       # Product reframing
│   │   ├── Agents.tsx            # Agent configurations
│   │   ├── Hooks.tsx             # Git hooks
│   │   ├── Memory.tsx            # Agent memory
│   │   ├── Settings.tsx          # App settings
│   │   ├── DesignEditor.tsx      # DESIGN.md editor
│   │   └── DocsHealth.tsx        # Documentation freshness
│   └── index.css                 # Design system + animations
├── src-tauri/                    # Rust backend
│   ├── src/lib.rs                # 8 Tauri commands + data models
│   └── tauri.conf.json           # App + installer config
└── package.json
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Desktop Runtime** | Tauri v2 (Rust + WebView) |
| **Frontend** | React 19 + TypeScript 5 |
| **Build** | Vite 7 |
| **Icons** | Lucide React |
| **Routing** | React Router DOM v7 |
| **Styling** | Vanilla CSS with design tokens |
| **Installer** | MSI (Windows Installer) + NSIS (.exe wizard) |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| `--bg-primary` | `#06080f` (deep space) |
| `--bg-card` | `#111827` |
| `--accent-gradient` | `#667eea → #764ba2` |
| `--font-sans` | Inter |
| `--font-mono` | JetBrains Mono |
| `--radius-sm/md/lg/xl` | 6/10/14/20px |
| `--transition-fast` | 150ms ease |

---

## 📋 Workflow Types Detected

AG Tower auto-detects and renders visual phase diagrams for:

| Workflow | Phases |
|----------|--------|
| **gstack** | Think → Plan → Build → Review → Test → Ship → Reflect |
| **brainstorm** | Diverge → Cluster → Evaluate → Decide |
| **PM** | Discover → Define → Backlog → Sprint → Review |
| **test** | Plan → Prepare → Execute → Analyze → Report |
| **yolo** | Scan → Execute → Verify |
| **docs** | Scan → Generate → Merge → Commit |
| **ui** | Analyze → Design → Search → Build → Check |
| **machina** | Detect → Rewrite → Score |
| **safety** | Scan → Protect → Verify |

---

## 🔑 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open command palette |
| `↑` / `k` | Navigate sidebar up |
| `↓` / `j` | Navigate sidebar down |
| `Enter` | Open focused page |
| `Escape` | Close palette/dialogs |

---

## 📄 License

MIT © [AppXDev](https://github.com/qdev89)

---

<p align="center">
  <em>Built with 🗼 by the Antigravity ecosystem</em>
</p>
