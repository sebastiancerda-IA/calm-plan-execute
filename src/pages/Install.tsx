import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Smartphone, Monitor, Download, Share, QrCode } from 'lucide-react';

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true);

    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: 'Instalar App' }]} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <Smartphone className="text-primary" size={32} />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">¡Ya estás usando la app!</h1>
          <p className="text-muted-foreground text-sm max-w-md">
            La Orquesta IDMA está instalada y funcionando en tu dispositivo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Instalar App' }]} />
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Instalar La Orquesta IDMA</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Accede al centro de comando desde tu teléfono como una app nativa, sin necesidad de App Store.
        </p>
      </div>

      {deferredPrompt && (
        <div className="flex justify-center">
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <Download size={18} />
            Instalar ahora
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
        <div className={`rounded-xl border border-border bg-card p-6 space-y-4 ${isIOS ? 'ring-2 ring-primary/30' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Smartphone size={20} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">iPhone / iPad</h3>
              {isIOS && <span className="text-[10px] text-primary font-medium">Tu dispositivo</span>}
            </div>
          </div>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
              <span>Toca el botón <Share size={14} className="inline text-primary" /> <strong>Compartir</strong> en Safari</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
              <span>Desplázate y selecciona <strong>"Agregar a pantalla de inicio"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
              <span>Toca <strong>"Agregar"</strong> — ¡listo!</span>
            </li>
          </ol>
        </div>

        <div className={`rounded-xl border border-border bg-card p-6 space-y-4 ${!isIOS ? 'ring-2 ring-primary/30' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Monitor size={20} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Android / Chrome</h3>
              {!isIOS && <span className="text-[10px] text-primary font-medium">Tu dispositivo</span>}
            </div>
          </div>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
              <span>Toca el menú <strong>⋮</strong> en Chrome</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
              <span>Selecciona <strong>"Instalar aplicación"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
              <span>Confirma — la app aparecerá en tu home</span>
            </li>
          </ol>
        </div>
      </div>

      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
          <QrCode size={14} />
          Comparte este link para instalar en otros dispositivos
        </div>
      </div>
    </div>
  );
}
