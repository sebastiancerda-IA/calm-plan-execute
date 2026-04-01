
CREATE TYPE public.convenio_estado AS ENUM ('activo', 'expirado', 'pendiente_firma', 'en_negociacion', 'suspendido');

CREATE TYPE public.convenio_tipo AS ENUM ('practica_profesional', 'prosecucion_estudios', 'cooperacion_tecnica', 'descuento_arancel', 'colaboracion_institucional', 'otec_empresa', 'erasmus', 'investigacion');

CREATE TYPE public.convenio_contraparte AS ENUM ('municipalidad', 'empresa_privada', 'ies_universidad', 'ies_cft_ip', 'sociedad_civil_ong', 'organismo_publico', 'fundacion', 'internacional', 'otro');

CREATE TABLE public.convenios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_institucion text NOT NULL,
  tipo public.convenio_tipo NOT NULL,
  contraparte public.convenio_contraparte NOT NULL,
  estado public.convenio_estado NOT NULL DEFAULT 'activo',
  fecha_inicio date,
  fecha_termino date,
  descripcion text,
  carreras_habilitadas text[],
  beneficio_creditos integer,
  beneficio_arancel_pct decimal(5,2),
  para_carrera text,
  cupos_anuales integer,
  persona_contacto text,
  email_contacto text,
  criterios_cna text[],
  archivo_drive_url text,
  archivo_nombre text,
  observaciones text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer convenios
CREATE POLICY "Authenticated users can read convenios"
  ON public.convenios FOR SELECT TO authenticated
  USING (true);

-- Solo directores pueden insertar
CREATE POLICY "Directors can insert convenios"
  ON public.convenios FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'director'::public.app_role));

-- Solo directores pueden actualizar
CREATE POLICY "Directors can update convenios"
  ON public.convenios FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'director'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'director'::public.app_role));

-- Solo directores pueden eliminar
CREATE POLICY "Directors can delete convenios"
  ON public.convenios FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'director'::public.app_role));
