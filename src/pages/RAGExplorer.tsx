import { useState, useEffect } from 'react';
import { ragStats, mockDocuments, driveFolders } from '@/data/mockRAG';
import { qdrantService } from '@/services/qdrantService';
import { RAGDocument } from '@/types';
import { Search, FolderOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useDebounce } from '@/hooks/useDebounce';

const distData = Object.entries(ragStats.agentDistribution).map(([name, value]) => ({
  name: name.toUpperCase(),
  value,
}));

const barColors = ['#E8734A', '#10B981'];

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">{part}</mark> : part
  );
}

export default function RAGExplorer() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RAGDocument[]>([]);
  const [searching, setSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    qdrantService.search(debouncedQuery, 5).then((res) => {
      setResults(res);
      setSearching(false);
    });
  }, [debouncedQuery]);

  const jinaPercent = ((ragStats.jinaTokensUsed / ragStats.jinaTokensLimit) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'RAG Explorer' }]} />
      <h1 className="text-xl font-semibold text-foreground">RAG Explorer</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-md border border-border bg-card p-4">
          <span className="text-[10px] text-muted-foreground uppercase">Total documentos</span>
          <p className="text-2xl font-mono font-bold text-foreground mt-1">{ragStats.totalDocuments}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <span className="text-[10px] text-muted-foreground uppercase">Fuentes</span>
          <p className="text-sm text-foreground font-mono mt-1">
            Gmail: {ragStats.sources.gmail} | Drive: {ragStats.sources.drive}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <span className="text-[10px] text-muted-foreground uppercase">Jina Tokens</span>
          <div className="mt-2">
            <div className="w-full h-2 bg-secondary rounded-full">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.max(parseFloat(jinaPercent), 1)}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">
              {ragStats.jinaTokensUsed.toLocaleString()} / {(ragStats.jinaTokensLimit / 1000).toFixed(0)}K ({jinaPercent}%)
            </p>
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <span className="text-[10px] text-muted-foreground uppercase">Última indexación</span>
          <p className="text-sm text-foreground font-mono mt-1">
            {new Date(ragStats.lastIndexed).toLocaleDateString('es-CL')}
          </p>
        </div>
      </div>

      {/* Distribution chart */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Distribución por Agente
        </h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 11, fill: 'hsl(215 14% 45%)' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(217 19% 17%)', border: 'none', borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: 'hsl(210 40% 96%)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {distData.map((_, i) => (
                  <Cell key={i} fill={barColors[i % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Document table */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Documentos Indexados
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2">Título</th>
                <th className="text-left py-2 px-2">Fuente</th>
                <th className="text-left py-2 px-2">Agente</th>
                <th className="text-left py-2 px-2">Fecha</th>
                <th className="text-left py-2 px-2">CNA</th>
                <th className="text-left py-2 px-2">Chunks</th>
              </tr>
            </thead>
            <tbody>
              {mockDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-border">
                  <td className="py-2 px-2 text-foreground max-w-xs truncate">{doc.titulo}</td>
                  <td className="py-2 px-2 text-muted-foreground font-mono">{doc.fuente}</td>
                  <td className="py-2 px-2 font-mono" style={{ color: doc.agente === 'A1' ? '#E8734A' : '#10B981' }}>
                    {doc.agente}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground font-mono">{doc.fecha}</td>
                  <td className="py-2 px-2 text-muted-foreground font-mono text-[10px]">{doc.criterios_cna.join(', ')}</td>
                  <td className="py-2 px-2 text-muted-foreground font-mono">{doc.chunkCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Semantic search */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Búsqueda Semántica
        </h3>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en la base de conocimiento..."
              className="w-full bg-background border border-border rounded px-3 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Thinking dots */}
        {searching && (
          <div className="flex items-center gap-1 py-4 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                style={{ animation: `skeleton-bar 0.6s ease-in-out ${i * 0.15}s infinite alternate` }}
              />
            ))}
          </div>
        )}

        {!searching && results.length > 0 && (
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded bg-background border border-border">
                <div className="w-12">
                  <div className="h-1.5 bg-secondary rounded-full">
                    <div
                      className="h-full rounded-full bg-[#22C55E]"
                      style={{ width: `${(r.score || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{((r.score || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{highlightText(r.titulo, query)}</p>
                  <p className="text-[10px] text-muted-foreground">{r.categoria} · {r.agente} · {r.chunkCount} chunks</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drive folders */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Carpetas Drive Pendientes
        </h3>
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
