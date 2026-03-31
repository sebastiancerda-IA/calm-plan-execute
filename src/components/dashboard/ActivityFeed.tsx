import { mockAgents } from '@/data/mockAgents';
import { mockEmails } from '@/data/mockEmails';
import { mockAlerts } from '@/data/mockAlerts';
import { ActivityEvent } from '@/types';

const events: ActivityEvent[] = [
  { id: '1', timestamp: mockAgents[0].lastRun!, agentCode: 'A1', agentColor: '#E8734A', action: 'Clasificó 8 emails VCM', result: 'Éxito' },
  { id: '2', timestamp: mockAgents[3].lastRun!, agentCode: 'C1', agentColor: '#10B981', action: 'Procesó 5 emails OTEC', result: 'Éxito' },
  { id: '3', timestamp: mockAlerts[0].timestamp, agentCode: 'A1', agentColor: '#EF4444', action: 'Alerta: GENERA sin respuesta 36h', result: 'Pendiente' },
  { id: '4', timestamp: mockAlerts[1].timestamp, agentCode: 'A1', agentColor: '#EF4444', action: 'Alerta: Deadline PIF 5 días', result: 'Crítico' },
  { id: '5', timestamp: mockAgents[2].lastRun!, agentCode: 'A3q', agentColor: '#3B82F6', action: 'Ejecutó 12 consultas RAG', result: 'Éxito' },
  { id: '6', timestamp: mockEmails[4].fecha, agentCode: 'A1', agentColor: '#E8734A', action: 'Email Campus Sustentable clasificado', result: 'Media' },
  { id: '7', timestamp: mockAlerts[3].timestamp, agentCode: 'C1', agentColor: '#F97316', action: 'Alerta: SENCE sin responder 52h', result: 'Alta' },
  { id: '8', timestamp: mockAgents[1].lastRun!, agentCode: 'A3', agentColor: '#3B82F6', action: 'Indexación semanal: 51 docs', result: 'Éxito' },
  { id: '9', timestamp: mockEmails[7].fecha, agentCode: 'A1', agentColor: '#E8734A', action: 'CORFO postulación clasificada', result: 'Alta' },
  { id: '10', timestamp: mockEmails[9].fecha, agentCode: 'A1', agentColor: '#E8734A', action: 'Visita Torres del Paine confirmada', result: 'Info' },
];

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'hace <1h';
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export function ActivityFeed() {
  return (
    <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4 h-full">
      <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-medium mb-3">
        Actividad Reciente
      </h3>
      <div className="space-y-0">
        {events.map((ev) => (
          <div key={ev.id} className="flex items-start gap-3 py-2 border-b border-[#1E293B] last:border-0">
            <div className="mt-1.5 flex-shrink-0">
              <span
                className="block w-2 h-2 rounded-full"
                style={{ backgroundColor: ev.agentColor }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold" style={{ color: ev.agentColor }}>
                  {ev.agentCode}
                </span>
                <span className="text-xs text-[#F1F5F9] truncate">{ev.action}</span>
              </div>
              <span className="text-[10px] text-[#6B7280]">{timeAgo(ev.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
