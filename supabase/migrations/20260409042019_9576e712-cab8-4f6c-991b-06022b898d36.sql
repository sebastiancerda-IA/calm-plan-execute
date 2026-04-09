
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE public.agents ADD CONSTRAINT agents_code_unique UNIQUE (code);
