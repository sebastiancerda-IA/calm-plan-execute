import { useState } from 'react';
import { X, Leaf, Zap, Shield, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  { icon: Zap, label: 'Agentes autónomos monitoreados 24/7', color: 'text-[hsl(var(--idma-green))]' },
  { icon: Shield, label: 'Seguimiento de acreditación CNA en tiempo real', color: 'text-[hsl(var(--idma-teal))]' },
  { icon: BarChart3, label: 'Métricas institucionales y financieras', color: 'text-[hsl(var(--idma-blue))]' },
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
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
          className="relative glass-card glow-green rounded-lg p-5 overflow-hidden"
        >
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[hsl(var(--idma-green))] via-[hsl(var(--idma-teal))] to-[hsl(var(--idma-blue))]" />

          <button onClick={handleDismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <Leaf size={20} className="text-[hsl(var(--idma-green))]" />
            <h2 className="text-base font-semibold text-foreground">¡Bienvenido a La Orquesta, {name}!</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Este es tu centro de comando para toda la operación institucional de IDMA.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.3 }}
                className="flex items-center gap-2 text-xs text-foreground"
              >
                <f.icon size={14} className={f.color} />
                <span>{f.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
