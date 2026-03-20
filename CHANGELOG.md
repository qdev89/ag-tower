# Changelog

All notable changes to AG Tower will be documented in this file.

## [0.1.0] — 2026-03-20

### 🎉 Initial Release

**Core Management**
- Dashboard with ecosystem health bar and sprint pipeline overview
- MCP Server management (status, config, connection details)
- Rules Editor (GEMINI.md, CLAUDE.md, user rules)
- Brain Sync for cloud knowledge persistence
- Memory management for agent state

**Asset Browsers**
- Workflow Browser with visual phase diagrams (9 workflow types auto-detected)
- Skills Catalog with category filtering
- Knowledge Base browser with metadata display
- Hooks management (pre-commit, post-build)

**Sprint Pipeline (gstack-inspired)**
- 7-stage Kanban pipeline (Think → Plan → Build → Review → Test → Ship → Reflect)
- Drag-and-drop task movement between stages
- Parallel View for multi-lane concurrent agent execution
- Readiness Dashboard with per-feature gate tracking

**Developer Experience**
- Theme Switcher (light/dark mode with CSS token swapping + localStorage)
- Command Palette (`Ctrl+K` with fuzzy search + keyboard navigation)
- Toast Notifications (global pub/sub system with auto-dismiss)
- Keyboard Navigation (`j/k` arrows + Enter in sidebar)
- Deploy page with release pipeline visualization
- Retro dashboard with shipping streaks and code health
- Office Hours product reframing wizard
- Design Editor for DESIGN.md management
- Docs Health freshness dashboard
- Settings with cross-machine sync and safety controls

**Infrastructure**
- Tauri v2 desktop shell with 8 backend commands
- MSI + NSIS installer configuration
- GitHub Actions CI/CD for Windows, macOS, Linux builds
- TypeScript + Vite build pipeline (0 errors, 1776 modules)
