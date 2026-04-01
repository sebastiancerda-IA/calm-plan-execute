import { StatusDot } from '@/components/shared/StatusDot';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const infraItems = [
  { name: 'n8n Cloud', status: 'activo' as const, detail: '4 workflows', tooltip: 'Starter plan • sebastiancerda-ia.app.n8n.cloud • 4 workflows activos' },
  { name: 'Qdrant', status: 'activo' as const, detail: '51 pts', tooltip: 'Railway free tier • 51 puntos / 1M capacidad • Colección: idma_knowledge' },
  { name: 'Jina AI', status: 'activo' as const, detail: '0.37% usado', tooltip: 'Free tier • 3,700 / 1M tokens • Embedding r1' },
  { name: 'Gemini 2.5 Flash', status: 'activo' as const, detail: 'Nivel 1', tooltip: 'Google AI Studio • Nivel 1 gratuito • Clasificación de emails' },
  { name: 'Costo mensual IA', status: 'activo' as const, detail: '$0', tooltip: 'Todo en free tier. Sin costos recurrentes por servicios IA.' },
];

export function InfraFooter() {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3 flex flex-wrap items-center gap-6">
      {infraItems.map((item) => (
        <Tooltip key={item.name}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-default">
              <StatusDot status={item.status === 'activo' ? 'operativo' : 'error'} size={5} />
              <span className="text-[11px] text-muted-foreground">
                {item.name}: <span className="text-foreground font-mono">{item.detail}</span>
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-secondary border-border text-foreground max-w-xs">
            <p className="text-xs">{item.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
