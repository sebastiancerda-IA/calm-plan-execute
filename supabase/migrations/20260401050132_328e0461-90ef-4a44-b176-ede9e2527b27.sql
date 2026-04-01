
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('director', 'dg', 'staff');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. RLS policies for user_roles
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Directors can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'director'));

CREATE POLICY "Directors can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'director'))
WITH CHECK (public.has_role(auth.uid(), 'director'));

-- 6. Create profiles table for user metadata
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 7. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.email, '@', 1));
  
  -- Auto-assign role based on email
  IF NEW.email = 'sebastian.cerda@idma.cl' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'director');
  ELSIF NEW.email = 'director@idma.cl' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'dg');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Financial metrics table (restricted)
CREATE TABLE public.financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  concept TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  record_type TEXT NOT NULL DEFAULT 'ingreso',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

-- Only director and dg can see financial records
CREATE POLICY "Directors can read financial records"
ON public.financial_records FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'director') OR public.has_role(auth.uid(), 'dg')
);

CREATE POLICY "Directors can insert financial records"
ON public.financial_records FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'director') OR public.has_role(auth.uid(), 'dg')
);

CREATE POLICY "Directors can update financial records"
ON public.financial_records FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'director') OR public.has_role(auth.uid(), 'dg')
)
WITH CHECK (
  public.has_role(auth.uid(), 'director') OR public.has_role(auth.uid(), 'dg')
);
