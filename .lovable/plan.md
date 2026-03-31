

# La Orquesta IDMA — Mission Control Dashboard

## What We're Building
A 6-page dark-mode mission control dashboard for CFT IDMA's 12-agent AI ecosystem. Dense, institutional, Bloomberg Terminal aesthetic. All mock data, architecture ready for n8n/Qdrant/Sheets integration.

## Implementation Plan

### Phase 1: Foundation
**Files: types, theme, mock data, shared components**

1. **`src/types/index.ts`** — All TypeScript interfaces (Agent, ClassifiedEmail, CNACriterion, Alert, RAGDocument, enums)

2. **`src/index.css`** — Override CSS variables for dark mode default (#0A0F1C background, #111827 surfaces, #1E293B borders). Import Inter + JetBrains Mono from Google Fonts in `index.html`.

3. **Mock data files** (5 files):
   - `src/data/mockAgents.ts` — 12 agents with exact specs (codes, colors, statuses, CNA criteria, dependencies)
   - `src/data/mockEmails.ts` — 15 classified emails (VCM + OTEC mix, realistic Chilean institutional content)
   - `src/data/mockCNA.ts` — 16 CNA criteria with dimensions, levels, gaps, actions
   - `src/data/mockAlerts.ts` — 8 alerts (2 critical, 3 high, 2 medium, 1 info)
   - `src/data/mockRAG.ts` — Collection stats (51 docs), document list, distribution data

4. **Service interfaces** (3 files):
   - `src/services/n8nService.ts` — Mock implementation with TODO comments for real API
   - `src/services/qdrantService.ts` — Mock with TODO for Railway endpoint
   - `src/services/sheetsService.ts` — Mock with TODO for Google Sheets API

5. **Shared components** (`src/components/shared/`):
   - `StatusDot.tsx` — 8px circle, pulse animation for "procesando"
   - `AgentBadge.tsx` — Pill with agent color at 20% opacity, links to /agent/:id
   - `MetricTile.tsx` — Label + large value + trend arrow + optional Sparkline
   - `PriorityBadge.tsx` — Color-coded priority badges
   - `Sparkline.tsx` — SVG inline 60x20px, 7-point line chart

6. **Custom hooks** (`src/hooks/`):
   - `useAgentStatus.ts` — Returns agents with computed status info
   - `useAlerts.ts` — Alerts with filtering
   - `useCNAProgress.ts` — CNA progress calculations by dimension

### Phase 2: Layout
**Sidebar + TopBar + routing**

7. **`src/components/layout/TopBar.tsx`** — Logo "La Orquesta IDMA" with wave/network icon (Lucide `AudioWaveform` or `Network`), v4.2 badge, pulsing green dot "Sistema activo", current time

8. **`src/components/layout/AppSidebar.tsx`** — Using shadcn Sidebar, collapsible to icons. Nav items: Dashboard, Agentes, CNA Matrix, Alertas, RAG Explorer, Settings. Dark styling.

9. **`src/components/layout/PageContainer.tsx`** — Wrapper with SidebarProvider, TopBar, content area

10. **`src/App.tsx`** — Routes for all 6 pages with React.lazy for non-Dashboard pages. Framer Motion page transitions.

### Phase 3: Dashboard Page (/)
**The main view — densest page**

11. **`src/components/dashboard/GlobalMetrics.tsx`** — 4 MetricTiles in a row (agents operative 4/12, emails 24h, active alerts, knowledge base)

12. **`src/components/dashboard/AgentMap.tsx`** — The hero component. 12 agent nodes in a structured grid (Dios top, operatives middle, transversals bottom, infra right). SVG connection lines between dependent agents. Lines highlight on hover. Each node shows code, name, status dot, last run, items processed, agent color left border.

13. **`src/components/dashboard/ActivityFeed.tsx`** — Vertical timeline, 10 recent events with agent colors and timestamps

14. **`src/components/dashboard/CNASnapshot.tsx`** — 4x4 grid of criteria squares colored by level (N1 red, N2 amber, N3 green), C13/C14 with pulsing red border, tooltips

15. **`src/components/dashboard/InfraFooter.tsx`** — Horizontal bar: n8n, Qdrant, Jina, Gemini status + monthly cost

16. **`src/pages/Dashboard.tsx`** — Composes all dashboard components in the specified row layout

### Phase 4: Secondary Pages

17. **`src/pages/AgentDetail.tsx`** — Dynamic route, agent header with color/status, metric sparklines, execution table, email classification table (for A1/C1), CNA chips, dependency mini-map

18. **`src/pages/CNAMatrix.tsx`** — 4 dimension sections, expandable criterion cards (level, gap, actions, evidence count), dimension progress bars, accreditation timeline (Mar 2026 → Mar 2027)

19. **`src/pages/Alerts.tsx`** — Priority filters, counter badges (critical pulsing), alert cards with priority border, agent badge, resolve button, action badges

20. **`src/pages/RAGExplorer.tsx`** — Stats row (51 docs, Jina gauge, last indexed), agent distribution bar chart (recharts), document table, simulated semantic search with relevance scores, pending Drive folders section

21. **`src/pages/Settings.tsx`** — Infrastructure status cards, credentials table (names only), cost table, dark/light theme toggle

### Phase 5: Polish

22. **Framer Motion** — Install and add fade+slide transitions (200ms) to page routes
23. **Responsive** — Sidebar collapses at <1024px, grid stacks at <768px
24. **Final QA** — Verify all 10 checklist items from the spec

## Technical Details

- **New dependency**: `framer-motion` for page transitions
- **Fonts**: Inter (Google Fonts) for UI, JetBrains Mono for metrics/data — loaded via `<link>` in index.html
- **Dark mode**: Set as default via CSS variables override in `:root` (not toggled class). Settings page toggle adds `.light` class.
- **Agent map SVG lines**: Rendered in an absolutely-positioned SVG layer over the agent grid, using computed positions. `useRef` + `useEffect` to calculate node positions.
- **All colors hardcoded per spec** — not using shadcn theme variables for agent/status colors, those use direct hex values.
- **recharts** already installed — used for RAG distribution bar chart and dimension progress visualization.
- **Total new files**: ~35 files across types, data, services, hooks, components, and pages.

