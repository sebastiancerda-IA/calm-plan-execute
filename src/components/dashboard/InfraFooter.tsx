import { StatusDot } from '@/components/shared/StatusDot';

const infraItems = [
  { name: 'n8n Cloud', status: 'activo' as const, detail: '4 workflows' },
  { name: 'Qdrant', status: 'activo' as const, detail: '51 pts' },
  { name: 'Jina AI', status: 'activo' as const, detail: '0.37% usado' },
  { name: 'Gemini 2.5 Flash', status: 'activo' as const, detail: 'Nivel 1' },
  { name: 'Costo mensual IA', status: 'activo' as const, detail: '$0' },
];

export function InfraFooter() {
  return (
    <div className="rounded-md border border-[#1E293B] bg-[#111827] px-4 py-3 flex flex-wrap items-center gap-6">
      {infraItems.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <StatusDot status={item.status === 'activo' ? 'operativo' : 'error'} size={5} />
          <span className="text-[11px] text-[#9CA3AF]">
            {item.name}: <span className="text-[#F1F5F9] font-mono">{item.detail}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
