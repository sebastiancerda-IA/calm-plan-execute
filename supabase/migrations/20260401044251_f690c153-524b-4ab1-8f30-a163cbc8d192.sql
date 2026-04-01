
-- Create agent_tasks table
CREATE TABLE public.agent_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'media',
  status TEXT NOT NULL DEFAULT 'pendiente',
  category TEXT NOT NULL DEFAULT 'sistema',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated can read and update
CREATE POLICY "Authenticated users can read agent_tasks"
  ON public.agent_tasks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update agent_tasks"
  ON public.agent_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow orchestrator-api to insert tasks
CREATE POLICY "Authenticated users can insert agent_tasks"
  ON public.agent_tasks FOR INSERT TO authenticated WITH CHECK (true);

-- Add UPDATE policy to agents table for orchestrator-api
CREATE POLICY "Authenticated users can update agents"
  ON public.agents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Add INSERT policies for tables orchestrator-api needs to write to
CREATE POLICY "Authenticated users can insert alerts"
  ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can insert executions"
  ON public.executions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can insert rag_documents"
  ON public.rag_documents FOR INSERT TO authenticated WITH CHECK (true);
