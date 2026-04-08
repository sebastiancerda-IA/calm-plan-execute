
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  budget_type TEXT NOT NULL DEFAULT 'operativo',
  status TEXT NOT NULL DEFAULT 'borrador',
  period TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  allocated_amount NUMERIC DEFAULT 0,
  department TEXT,
  description TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.commercial_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_rut TEXT,
  client_email TEXT,
  proposal_type TEXT NOT NULL DEFAULT 'capacitacion',
  status TEXT NOT NULL DEFAULT 'borrador',
  title TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  line_items JSONB DEFAULT '[]'::jsonb,
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Directors can read budgets" ON public.budgets FOR SELECT TO authenticated USING (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'dg'::app_role));
CREATE POLICY "Directors can insert budgets" ON public.budgets FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'dg'::app_role));
CREATE POLICY "Directors can update budgets" ON public.budgets FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'dg'::app_role)) WITH CHECK (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'dg'::app_role));
CREATE POLICY "Directors can delete budgets" ON public.budgets FOR DELETE TO authenticated USING (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'dg'::app_role));

ALTER TABLE public.commercial_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Directors can read proposals" ON public.commercial_proposals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'dg'::app_role));
CREATE POLICY "Directors can insert proposals" ON public.commercial_proposals FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'dg'::app_role));
CREATE POLICY "Directors can update proposals" ON public.commercial_proposals FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'dg'::app_role)) WITH CHECK (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'dg'::app_role));
CREATE POLICY "Directors can delete proposals" ON public.commercial_proposals FOR DELETE TO authenticated USING (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'dg'::app_role));

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.commercial_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
