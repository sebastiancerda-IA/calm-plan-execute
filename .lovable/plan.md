

# Plan: Deep Upgrade — La Orquesta IDMA

## Overview
Implement all 6 blocks of the Deep Upgrade plan across the existing codebase. The plan is split into implementation phases ordered by impact per credit. WhatsApp integration is noted but deferred — it requires a WhatsApp Business API or third-party bridge (like Twilio), which isn't available as a connector yet.

Regarding WhatsApp: there's no native WhatsApp connector in Lovable. The closest option is Twilio (available as connector), which supports WhatsApp Business API. We could build a notification channel that sends critical alerts via Twilio/WhatsApp. This would be a Block 4 addition once we get the base integrations working.

---

## Block 1: Visual Polish (edit ~8 files)

### 1.1 SVG Connection Lines in AgentMap
- Refactor `AgentMap.tsx` to use `useRef` on each agent node + a parent container
- Add an absolutely-positioned `<svg>` overlay that draws quadratic bezier curves between dependent agents
- Lines default to `#1E293B`, highlight to `#3B82F6` when either endpoint is hovered
- Use `useLayoutEffect` + `ResizeObserver` to recalculate positions

### 1.2 Framer Motion Page Transitions
- Edit `App.tsx`: wrap `<Routes>` content with `AnimatePresence`
- Create a `PageTransition` wrapper component using `motion.div` with fade+slideY (200ms)
- Apply to each route's element

### 1.3 Micro-animations
- **MetricTile.tsx**: Add count-up animation using a simple `useEffect` + `requestAnimationFrame` (no extra library). Numbers animate from 0 to value over 600ms
- **AgentNode** (in AgentMap): Add `hover:scale-[1.02]` + box-shadow glow using agent color on hover
- **Loading component** (App.tsx): Replace spinner with 3-bar skeleton pulse
- **StatusDot.tsx**: Improve pulse animation — use a custom keyframe with scale + opacity for "procesando"

### 1.4 TopBar Real-time Clock
- Edit `TopBar.tsx`: Add `useEffect` with `setInterval(60000)` to update time every minute
- Add "uptime" counter showing time since page load

---

## Block 2: UX Features (edit/create ~10 files)

### 2.1 Agents List Page
- Create `src/pages/AgentsList.tsx` — table/grid of 12 agents with filter chips (by status, area, platform)
- Add route `/agents` in `App.tsx`
- Update `AppSidebar.tsx`: "Agentes" links to `/agents`

### 2.2 Dashboard Interactivity
- **GlobalMetrics.tsx**: Wrap each `MetricTile` in a `Link` — agents→`/agents`, emails→`/agent/a1-vcm`, alerts→`/alerts`, RAG→`/rag`
- **CNASnapshot.tsx**: Make each cell a `Link` to `/cna?expand=C1` (or whatever ID). CNAMatrix reads URL param to auto-expand
- **ActivityFeed.tsx**: Add filter dropdown by agent code at top
- **InfraFooter.tsx**: Add tooltips on each item showing extra detail

### 2.3 Alerts with localStorage Persistence
- Refactor `useAlerts.ts`: Track resolved alert IDs in `localStorage`
- Add `resolveAlert(id)` function that persists to localStorage
- Add toast notification on resolve (using existing sonner)
- Add resolved/pending toggle filter in `Alerts.tsx`

### 2.4 RAG Explorer Search Improvements
- Add `useDebounce` hook (simple 300ms debounce)
- Auto-search on typing after debounce
- Highlight matching query text in results with `<mark>` tags
- Add "thinking" dots animation during search

### 2.5 CNA Matrix Radial Charts
- Add recharts `PieChart` (donut) per dimension showing at-target vs gap criteria
- Improve timeline: progress bar between milestones, filled up to current position

---

## Block 3: Theme & Responsive (edit ~6 files)

### 3.1 Theme Toggle
- Define `.light` class variables in `index.css` with light palette
- Create `useTheme` hook with localStorage persistence
- Settings toggle actually applies/removes `.light` class on `<html>`

### 3.2 Responsive Polish
- Dashboard grid: verify stacking on mobile (already using responsive classes)
- Tables: add `overflow-x-auto` wrapper (already present, verify)
- TopBar: hide date string on `<768px` with `hidden sm:block`
- AgentMap: 1-column on mobile

### 3.3 Breadcrumbs
- Create `Breadcrumbs.tsx` shared component
- Add to `AgentDetail`, `CNAMatrix`, `Alerts`, `RAGExplorer`, `Settings`

---

## Block 4: Live Data Connections (create ~4 edge functions)

**Prerequisite: Enable Lovable Cloud first**

### 4.1 n8n API Connection
- Create edge function `supabase/functions/n8n-proxy/index.ts`
- Reads `N8N_API_KEY` from secrets
- Endpoints: GET workflows, GET executions
- Update `n8nService.ts` to call edge function

### 4.2 Qdrant Connection
- Create edge function `supabase/functions/qdrant-proxy/index.ts`
- Reads `QDRANT_API_KEY` from secrets
- Endpoints: collection info, search
- Update `qdrantService.ts`

### 4.3 Google Sheets Connection
- Create edge function `supabase/functions/sheets-proxy/index.ts`
- Reads Google credentials from secrets
- Reads VCM Log and OTEC Log sheets
- Update `sheetsService.ts`

### 4.4 Auto-refresh with React Query
- Configure `queryClient` with `refetchInterval: 300000` (5 min)
- Add "Última actualización" indicator in TopBar
- Services return real data when edge functions available, fall back to mock

---

## Block 5: Authentication (create ~5 files)

### 5.1 Login Page
- Enable Lovable Cloud auth
- Create `src/pages/Login.tsx` with IDMA branding
- Add `AuthProvider` context + `ProtectedRoute` wrapper
- All routes except `/login` are protected

### 5.2 User Profile
- Create profiles table (if user confirms need)
- Show user avatar + name in TopBar
- Logout button

---

## Block 6: Premium Features (create ~4 files)

### 6.1 Command Palette (Cmd+K)
- Create `src/components/shared/CommandPalette.tsx` using shadcn `Command` + `CommandDialog`
- Register `Cmd+K` / `Ctrl+K` keyboard shortcut
- Index: all agents, all CNA criteria, all alert titles, page navigation
- Navigate on selection

### 6.2 Pulse Heatmap Widget
- Create `src/components/dashboard/PulseWidget.tsx`
- 24 blocks (one per hour) colored by activity intensity
- Uses mock activity data from the last 24h
- Add to Dashboard between AgentMap and the two-panel row

### 6.3 Export Functions
- CNA: Button to export criteria table as CSV (client-side `Blob` + download)
- Alerts: Button to export filtered alerts as CSV
- No external libraries needed — pure JS CSV generation

### 6.4 Notification Sounds
- Add a toggle in Settings for notification sounds
- Play a subtle "ping" sound (base64 encoded, tiny) when a critical alert appears
- Persist preference in localStorage

---

## Execution Order
1. Block 1 (Visual Polish) — immediate visual impact
2. Block 2 (UX Features) — makes app usable
3. Block 3 (Theme + Responsive) — professional completeness
4. Block 6.1 (Command Palette) — high glamour, low effort
5. Block 6.2-6.4 (Pulse, Export, Sounds) — nice polish
6. Block 4 (Live Data) — requires Lovable Cloud setup
7. Block 5 (Auth) — requires Lovable Cloud

**Estimated total: ~25 credits across all blocks**

## Technical Notes
- No new heavy dependencies — `framer-motion` already installed, `recharts` already installed
- Count-up animation is pure JS (no library)
- SVG connections use native SVG + React refs (no D3)
- CSV export is pure client-side Blob
- All enhancements are lazy-loaded where possible
- Light theme is additive CSS only (`.light` class override)

