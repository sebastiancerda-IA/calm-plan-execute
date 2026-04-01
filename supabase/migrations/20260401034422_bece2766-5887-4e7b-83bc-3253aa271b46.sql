
-- Table: institutional_metrics (KPIs de CFT IDMA)
CREATE TABLE public.institutional_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key text NOT NULL,
  metric_value numeric,
  metric_text text,
  period text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.institutional_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read institutional_metrics"
  ON public.institutional_metrics FOR SELECT TO authenticated USING (true);

-- Table: otec_programs (Cursos y diplomados OTEC)
CREATE TABLE public.otec_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'curso',
  status text NOT NULL DEFAULT 'activo',
  sence_code text,
  students_enrolled integer DEFAULT 0,
  start_date date,
  end_date date,
  empresa text,
  revenue numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.otec_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read otec_programs"
  ON public.otec_programs FOR SELECT TO authenticated USING (true);

-- Table: acreditation_documents (Docs acreditación anterior + actual)
CREATE TABLE public.acreditation_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  document_type text NOT NULL DEFAULT 'evidencia',
  criterio_cna text,
  dimension text,
  file_path text,
  summary text,
  uploaded_at timestamp with time zone DEFAULT now(),
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.acreditation_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read acreditation_documents"
  ON public.acreditation_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert acreditation_documents"
  ON public.acreditation_documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update acreditation_documents"
  ON public.acreditation_documents FOR UPDATE TO authenticated USING (true);

-- Storage bucket for acreditation PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('acreditation-docs', 'acreditation-docs', false);

CREATE POLICY "Authenticated users can upload acreditation docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'acreditation-docs');

CREATE POLICY "Authenticated users can read acreditation docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'acreditation-docs');
