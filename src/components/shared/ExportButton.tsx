import { Download } from 'lucide-react';

interface ExportButtonProps {
  data: any[];
  filename: string;
  columns?: { key: string; label: string }[];
  className?: string;
}

export function ExportButton({ data, filename, columns, className = '' }: ExportButtonProps) {
  const handleExport = () => {
    if (!data.length) return;
    const keys = columns ? columns.map(c => c.key) : Object.keys(data[0]);
    const headers = columns ? columns.map(c => c.label) : keys;

    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        keys.map(k => {
          const val = row[k];
          const str = Array.isArray(val) ? val.join('; ') : String(val ?? '');
          return `"${str.replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data.length}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40 ${className}`}
    >
      <Download size={12} />
      CSV
    </button>
  );
}
