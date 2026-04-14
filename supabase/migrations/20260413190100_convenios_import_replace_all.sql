-- Backup + import runs for convenio replace-all workflow
CREATE TABLE IF NOT EXISTS public.convenios_import_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_batch_id uuid NOT NULL,
  source_file text NOT NULL,
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  snapshot_row jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS convenios_import_backups_batch_idx
  ON public.convenios_import_backups (import_batch_id);

CREATE TABLE IF NOT EXISTS public.convenios_import_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_batch_id uuid NOT NULL,
  source_file text NOT NULL,
  requested_action text NOT NULL,
  dry_run boolean NOT NULL DEFAULT true,
  total_rows integer NOT NULL DEFAULT 0,
  valid_rows integer NOT NULL DEFAULT 0,
  invalid_rows integer NOT NULL DEFAULT 0,
  replaced_previous_rows integer NOT NULL DEFAULT 0,
  inserted_rows integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  report jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS convenios_import_runs_created_idx
  ON public.convenios_import_runs (created_at DESC);

CREATE OR REPLACE FUNCTION public.replace_all_convenios(
  p_records jsonb,
  p_source_file text,
  p_report jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch uuid := gen_random_uuid();
  v_prev_count integer := 0;
  v_inserted integer := 0;
  v_total integer := 0;
  v_error text;
BEGIN
  IF p_records IS NULL OR jsonb_typeof(p_records) <> 'array' THEN
    RAISE EXCEPTION 'p_records must be a JSON array';
  END IF;

  v_total := jsonb_array_length(p_records);
  SELECT COUNT(*) INTO v_prev_count FROM public.convenios;

  INSERT INTO public.convenios_import_backups (import_batch_id, source_file, snapshot_row)
  SELECT v_batch, p_source_file, to_jsonb(c)
  FROM public.convenios c;

  DELETE FROM public.convenios;

  INSERT INTO public.convenios (
    nombre_institucion,
    tipo,
    contraparte,
    estado,
    fecha_inicio,
    fecha_termino,
    descripcion,
    carreras_habilitadas,
    beneficio_creditos,
    beneficio_arancel_pct,
    para_carrera,
    cupos_anuales,
    persona_contacto,
    email_contacto,
    criterios_cna,
    archivo_drive_url,
    archivo_nombre,
    observaciones
  )
  SELECT
    rec.nombre_institucion,
    rec.tipo,
    rec.contraparte,
    rec.estado,
    rec.fecha_inicio,
    rec.fecha_termino,
    rec.descripcion,
    rec.carreras_habilitadas,
    rec.beneficio_creditos,
    rec.beneficio_arancel_pct,
    rec.para_carrera,
    rec.cupos_anuales,
    rec.persona_contacto,
    rec.email_contacto,
    rec.criterios_cna,
    rec.archivo_drive_url,
    rec.archivo_nombre,
    rec.observaciones
  FROM jsonb_to_recordset(p_records) AS rec(
    nombre_institucion text,
    tipo public.convenio_tipo,
    contraparte public.convenio_contraparte,
    estado public.convenio_estado,
    fecha_inicio date,
    fecha_termino date,
    descripcion text,
    carreras_habilitadas text[],
    beneficio_creditos integer,
    beneficio_arancel_pct numeric,
    para_carrera text,
    cupos_anuales integer,
    persona_contacto text,
    email_contacto text,
    criterios_cna text[],
    archivo_drive_url text,
    archivo_nombre text,
    observaciones text
  );

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  INSERT INTO public.convenios_import_runs (
    import_batch_id,
    source_file,
    requested_action,
    dry_run,
    total_rows,
    valid_rows,
    invalid_rows,
    replaced_previous_rows,
    inserted_rows,
    status,
    report
  ) VALUES (
    v_batch,
    p_source_file,
    'replace_all',
    false,
    v_total,
    v_total,
    0,
    v_prev_count,
    v_inserted,
    'completed',
    p_report
  );

  RETURN jsonb_build_object(
    'import_batch_id', v_batch,
    'source_file', p_source_file,
    'previous_rows', v_prev_count,
    'inserted_rows', v_inserted,
    'total_rows', v_total,
    'status', 'completed'
  );
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;

  DELETE FROM public.convenios;

  INSERT INTO public.convenios
  SELECT (jsonb_populate_record(NULL::public.convenios, b.snapshot_row)).*
  FROM public.convenios_import_backups b
  WHERE b.import_batch_id = v_batch;

  INSERT INTO public.convenios_import_runs (
    import_batch_id,
    source_file,
    requested_action,
    dry_run,
    total_rows,
    valid_rows,
    invalid_rows,
    replaced_previous_rows,
    inserted_rows,
    status,
    report
  ) VALUES (
    v_batch,
    p_source_file,
    'replace_all',
    false,
    COALESCE(v_total, 0),
    0,
    COALESCE(v_total, 0),
    v_prev_count,
    0,
    'failed',
    COALESCE(p_report, '{}'::jsonb) || jsonb_build_object('error', v_error)
  );

  RAISE;
END;
$$;
