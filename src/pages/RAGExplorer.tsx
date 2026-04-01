import { useState } from 'react';
import { useSupabaseRAG } from '@/hooks/useSupabaseRAG';
import { useSupabaseAgents } from '@/hooks/useSupabaseAgents';
import { Search, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ExportButton } from '@/components/shared/ExportButton';
import { useDebounce } from '@/hooks/useDebounce';
import { driveFolders } from '@/data/mockRAG';

const barColors = ['#E8734A', '#10B981', '#3B82F6', '#8B5CF6'];

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">{part}</mark> : part
  );
}

export default function RAGExplorer() {
  const { documents, stats, isLoading } = useSupabaseRAG();
  const { agents } = useSupabaseAgents();
  const [query, setQuery] = useState('');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);

  const filteredDocs = debouncedQuery.trim()
    ? documents.filter((d: any) => d.titulo.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : documents;

  const distData = Object.entries(stats.agentDistribution).map(([agentId, value]) => {
    const agent = agents.find((a: any) => a.id === agentId);
    return { name: agent?.code || agentId, value };
  });

  const jinaPercent = stats.jinaTokensLimit > 0
    ? ((Number(stats.jinaTokensUsed) / stats.jinaTokensLimit) * 100).toFixed(2)
    : '0';

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'RAG Explorer' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">RAG Explorer</h1>
        <ExportButton data={filteredDocs} filename="rag_documents" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-md border border-border bg-card p-4">
          <span className="text-[10px] text-muted-foreground uppercase">Total documentos</span>
          <p className="text-2xl font-mono font-bold text-foreground mt-1">{stats.totalDocuments}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <span className="text-[10px] text-muted-foreground uppercase">Fuentes</span>
          <p className="text-sm text-foreground font-mono mt-1">
            Gmail: {stats.sources.gmail} | Drive: {stats.sources.drive}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <span className="text-[10px] text-muted-foreground uppercase">Jina Tokens</span>
          <div className="mt-2">
            <div className="w-full h-2 bg-secondary rounded-full">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(parseFloat(jinaPercent), 1)}%` }} />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">
              {Number(stats.jinaTokensUsed).toLocaleString()} / {(stats.jinaTokensLimit / 1000).toFixed(0)}K ({jinaPercent}%)
            </p>
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <span className="text-[10px] text-muted-foreground uppercase">Última indexación</span>
          <p className="text-sm text-foreground font-mono mt-1">
            {stats.lastIndexed ? new Date(stats.lastIndexed).toLocaleDateString('es-CL') : '—'}
          </p>
        </div>
      </div>

      {distData.length > 0 && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Distribución por Agente</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 11, fill: 'hsl(215 14% 45%)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(217 19% 17%)', border: 'none', borderRadius: 4, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {distData.map((_, i) => (
                    <Cell key={i} fill={barColors[i % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Documentos Indexados</h3>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en la base de conocimiento..."
              className="w-full bg-background border border-border rounded px-3 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2 w-6"></th>
                <th className="text-left py-2 px-2">Título</th>
                <th className="text-left py-2 px-2">Fuente</th>
                <th className="text-left py-2 px-2">Agente</th>
                <th className="text-left py-2 px-2">Fecha</th>
                <th className="text-left py-2 px-2">CNA</th>
                <th className="text-left py-2 px-2">Chunks</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc: any) => {
                const agent = agents.find((a: any) => a.id === doc.agent_id);
                const isExpanded = expandedDoc === doc.id;
                return (
                  <>
                    <tr key={doc.id} className="border-b border-border cursor-pointer hover:bg-accent/30" onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}>
                      <td className="py-2 px-2 text-muted-foreground">
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </td>
                      <td className="py-2 px-2 text-foreground max-w-xs truncate">{highlightText(doc.titulo, query)}</td>
                      <td className="py-2 px-2 text-muted-foreground font-mono">{doc.fuente}</td>
                      <td className="py-2 px-2 font-mono" style={{ color: agent?.color || '#6B7280' }}>{agent?.code || doc.agent_id}</td>
                      <td className="py-2 px-2 text-muted-foreground font-mono">{doc.fecha}</td>
                      <td className="py-2 px-2 text-muted-foreground font-mono text-[10px]">{(doc.criterios_cna || []).join(', ')}</td>
                      <td className="py-2 px-2 text-muted-foreground font-mono">{doc.chunk_count}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${doc.id}-detail`} className="border-b border-border bg-accent/20">
                        <td colSpan={7} className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                            <div>
                              <span className="text-muted-foreground block">ID</span>
                              <span className="font-mono text-foreground">{doc.id}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Categoría</span>
                              <span className="text-foreground">{doc.categoria || '—'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Chunks</span>
                              <span className="text-foreground font-mono">{doc.chunk_count}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Indexado</span>
                              <span className="text-foreground font-mono">{doc.created_at ? new Date(doc.created_at).toLocaleString('es-CL') : '—'}</span>
                            </div>
                            <div className="col-span-2 md:col-span-4">
                              <span className="text-muted-foreground block">Criterios CNA vinculados</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(doc.criterios_cna || []).length > 0 ? (
                                  doc.criterios_cna.map((c: string) => (
                                    <span key={c} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">{c}</span>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground italic">Sin criterios vinculados</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Carpetas Drive Pendientes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {driveFolders.map((f) => (
            <div key={f.name} className="flex items-center gap-2 p-3 rounded bg-background border border-border">
              <FolderOpen size={14} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-foreground font-mono">{f.name}</p>
                <p className="text-[10px] text-[#EAB308]">{f.docs} documentos — esperando carga</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
