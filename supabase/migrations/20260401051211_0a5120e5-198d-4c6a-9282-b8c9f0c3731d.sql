
-- Insert profile if missing
INSERT INTO public.profiles (id, email, display_name)
VALUES ('1046c1f6-0c59-4da1-9090-80a045e4a7a2', 'sebastian.cerda@idma.cl', 'sebastian.cerda')
ON CONFLICT (id) DO NOTHING;

-- Assign director role
INSERT INTO public.user_roles (user_id, role)
VALUES ('1046c1f6-0c59-4da1-9090-80a045e4a7a2', 'director')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create trigger for future users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
