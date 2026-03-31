import { useState } from 'react';
import { ragStats, mockDocuments, driveFolders } from '@/data/mockRAG';
import { qdrantService } from '@/services/qdrantService';
import { RAGDocument } from '@/types';
import { Search, FolderOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const distData = Object.entries(ragStats.agentDistribution).map(([name, value]) => ({
  name: name.toUpperCase(),
  value,
}));

const barColors = ['#E8734A', '#10B981'];

export default function RAGExplorer() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RAGDocument[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const res = await qdrantService.search(query, 5);
    setResults(res);
    setSearching(false);
  };

  const jinaPercent = ((ragStats.jinaTokensUsed / ragStats.jinaTokensLimit) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[#F1F5F9]">RAG Explorer</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
          <span className="text-[10px] text-[#6B7280] uppercase">Total documentos</span>
          <p className="text-2xl font-mono font-bold text-[#F1F5F9] mt-1">{ragStats.totalDocuments}</p>
        </div>
        <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
          <span className="text-[10px] text-[#6B7280] uppercase">Fuentes</span>
          <p className="text-sm text-[#F1F5F9] font-mono mt-1">
            Gmail: {ragStats.sources.gmail} | Drive: {ragStats.sources.drive}
          </p>
        </div>
        <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
          <span className="text-[10px] text-[#6B7280] uppercase">Jina Tokens</span>
          <div className="mt-2">
            <div className="w-full h-2 bg-[#1E293B] rounded-full">
              <div
                className="h-full bg-[#3B82F6] rounded-full"
                style={{ width: `${Math.max(parseFloat(jinaPercent), 1)}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-[#6B7280] mt-1">
              {ragStats.jinaTokensUsed.toLocaleString()} / {(ragStats.jinaTokensLimit / 1000).toFixed(0)}K ({jinaPercent}%)
            </p>
          </div>
        </div>
        <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
          <span className="text-[10px] text-[#6B7280] uppercase">Última indexación</span>
          <p className="text-sm text-[#F1F5F9] font-mono mt-1">
            {new Date(ragStats.lastIndexed).toLocaleDateString('es-CL')}
          </p>
        </div>
      </div>

      {/* Distribution chart */}
      <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
        <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-medium mb-3">
          Distribución por Agente
        </h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: '#F1F5F9' }}
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
      <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
        <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-medium mb-3">
          Documentos Indexados
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] text-[#6B7280]">
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
                <tr key={doc.id} className="border-b border-[#1E293B]">
                  <td className="py-2 px-2 text-[#F1F5F9] max-w-xs truncate">{doc.titulo}</td>
                  <td className="py-2 px-2 text-[#9CA3AF] font-mono">{doc.fuente}</td>
                  <td className="py-2 px-2 font-mono" style={{ color: doc.agente === 'A1' ? '#E8734A' : '#10B981' }}>
                    {doc.agente}
                  </td>
                  <td className="py-2 px-2 text-[#9CA3AF] font-mono">{doc.fecha}</td>
                  <td className="py-2 px-2 text-[#6B7280] font-mono text-[10px]">{doc.criterios_cna.join(', ')}</td>
                  <td className="py-2 px-2 text-[#9CA3AF] font-mono">{doc.chunkCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Semantic search */}
      <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
        <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-medium mb-3">
          Búsqueda Semántica
        </h3>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar en la base de conocimiento..."
              className="w-full bg-[#0A0F1C] border border-[#1E293B] rounded px-3 py-2 pl-9 text-sm text-[#F1F5F9] placeholder:text-[#4B5563] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-[#3B82F6] text-white text-sm font-medium rounded hover:bg-[#2563EB] transition-colors"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded bg-[#0A0F1C] border border-[#1E293B]">
                <div className="w-12">
                  <div className="h-1.5 bg-[#1E293B] rounded-full">
                    <div
                      className="h-full rounded-full bg-[#22C55E]"
                      style={{ width: `${(r.score || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#6B7280]">{((r.score || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#F1F5F9] truncate">{r.titulo}</p>
                  <p className="text-[10px] text-[#6B7280]">{r.categoria} · {r.agente} · {r.chunkCount} chunks</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drive folders */}
      <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
        <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-medium mb-3">
          Carpetas Drive Pendientes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {driveFolders.map((f) => (
            <div key={f.name} className="flex items-center gap-2 p-3 rounded bg-[#0A0F1C] border border-[#1E293B]">
              <FolderOpen size={14} className="text-[#6B7280]" />
              <div>
                <p className="text-xs text-[#F1F5F9] font-mono">{f.name}</p>
                <p className="text-[10px] text-[#EAB308]">{f.docs} documentos — esperando carga</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
