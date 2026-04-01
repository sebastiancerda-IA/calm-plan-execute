import { useState } from 'react';
import { X, Leaf, Zap, Shield, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  { icon: Zap, label: 'Agentes autónomos monitoreados 24/7', color: 'text-idma-green' },
  { icon: Shield, label: 'Seguimiento de acreditación CNA en tiempo real', color: 'text-idma-teal' },
  { icon: BarChart3, label: 'Métricas institucionales y financieras', color: 'text-idma-blue' },
];

export function WelcomeCard() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('orquesta_welcome_dismissed') === 'true'
  );

  if (dismissed) return null;

  const name = user?.email?.split('@')[0] || 'usuario';

  const handleDismiss = () => {
    localStorage.setItem('orquesta_welcome_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div className="relative rounded-lg border border-idma-green/30 bg-gradient-to-r from-idma-green/5 via-idma-teal/5 to-idma-blue/5 p-5">
      <button onClick={handleDismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
        <X size={16} />
      </button>
      <div className="flex items-center gap-2 mb-3">
        <Leaf size={20} className="text-idma-green" />
        <h2 className="text-base font-semibold text-foreground">¡Bienvenido a La Orquesta, {name}!</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Este es tu centro de comando para toda la operación institucional de IDMA.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {features.map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-xs text-foreground">
            <f.icon size={14} className={f.color} />
            <span>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
