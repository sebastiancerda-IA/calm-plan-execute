import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AudioWaveform } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (loading) return null;
  if (session) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.endsWith('@idma.cl')) {
      toast.error('Solo se permiten correos @idma.cl');
      return;
    }

    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      toast.error('Error al enviar enlace: ' + error.message);
      setSending(false);
    } else {
      setSent(true);
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <AudioWaveform size={32} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">La Orquesta IDMA</h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono">Mission Control v4.2</p>
        </div>

        {!sent ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                Correo institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.nombre@idma.cl"
                required
                className="w-full bg-card border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-primary text-primary-foreground rounded-md py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Enviar enlace de acceso'}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">
              Recibirás un enlace de acceso en tu correo institucional
            </p>
          </form>
        ) : (
          <div className="text-center space-y-4 p-6 rounded-md border border-border bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <span className="text-primary text-lg">✓</span>
            </div>
            <div>
              <p className="text-sm text-foreground font-medium">Enlace enviado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Revisa tu correo <span className="font-mono text-foreground">{email}</span> y haz clic en el enlace para acceder.
              </p>
            </div>
            <button
              onClick={() => setSent(false)}
              className="text-xs text-primary hover:underline"
            >
              Reenviar enlace
            </button>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center font-mono">
          CFT IDMA — Instituto del Medio Ambiente
        </p>
      </div>
    </div>
  );
}
