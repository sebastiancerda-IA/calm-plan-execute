
-- Agents table
create table public.agents (
  id text primary key,
  code text not null,
  name text not null,
  description text,
  area text not null,
  color text not null,
  color_secondary text,
  status text not null default 'futuro',
  platform text not null,
  trigger_type text,
  workflow_id text,
  last_run timestamptz,
  items_processed_24h integer default 0,
  error_rate decimal(4,3) default 0,
  criteria_cna text[],
  dependencies text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Email logs table
create table public.email_logs (
  id text primary key,
  agent_id text references public.agents(id),
  fecha date not null,
  asunto text,
  de text,
  categoria text,
  sub_etiqueta text,
  prioridad text,
  deadline date,
  accion_requerida boolean default false,
  accion_resumen text,
  criterios_cna text[],
  created_at timestamptz default now()
);
create index on public.email_logs(agent_id, created_at desc);
create index on public.email_logs(prioridad);

-- Alerts table
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  agent_id text references public.agents(id),
  priority text not null,
  title text not null,
  description text,
  action_required text,
  resolved boolean default false,
  resolved_at timestamptz,
  created_at timestamptz default now()
);
create index on public.alerts(resolved, priority, created_at desc);

-- Executions table
create table public.executions (
  id uuid primary key default gen_random_uuid(),
  agent_id text references public.agents(id),
  workflow_id text,
  status text,
  items_processed integer default 0,
  error_message text,
  duration_ms integer,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz default now()
);
create index on public.executions(agent_id, created_at desc);

-- CNA criteria table
create table public.cna_criteria (
  id text primary key,
  name text not null,
  dimension text not null,
  current_level text default 'N1',
  target_level text default 'N2',
  responsible_agent text,
  evidence_count integer default 0,
  gap_description text,
  actions text[],
  is_priority boolean default false,
  is_mandatory boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RAG documents table
create table public.rag_documents (
  id text primary key,
  titulo text not null,
  fuente text,
  agent_id text references public.agents(id),
  fecha date,
  categoria text,
  criterios_cna text[],
  chunk_count integer default 1,
  created_at timestamptz default now()
);

-- System metrics table
create table public.system_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  metric_value decimal,
  metric_text text,
  recorded_at timestamptz default now()
);

-- Enable realtime for agents and alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- RLS policies (public read for now, webhook writes via service role)
alter table public.agents enable row level security;
alter table public.email_logs enable row level security;
alter table public.alerts enable row level security;
alter table public.executions enable row level security;
alter table public.cna_criteria enable row level security;
alter table public.rag_documents enable row level security;
alter table public.system_metrics enable row level security;

-- Read policies for authenticated users
create policy "Authenticated users can read agents" on public.agents for select to authenticated using (true);
create policy "Authenticated users can read email_logs" on public.email_logs for select to authenticated using (true);
create policy "Authenticated users can read alerts" on public.alerts for select to authenticated using (true);
create policy "Authenticated users can update alerts" on public.alerts for update to authenticated using (true) with check (true);
create policy "Authenticated users can read executions" on public.executions for select to authenticated using (true);
create policy "Authenticated users can read cna_criteria" on public.cna_criteria for select to authenticated using (true);
create policy "Authenticated users can read rag_documents" on public.rag_documents for select to authenticated using (true);
create policy "Authenticated users can read system_metrics" on public.system_metrics for select to authenticated using (true);
