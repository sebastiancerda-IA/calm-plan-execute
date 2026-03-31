import { Link } from 'react-router-dom';

interface AgentBadgeProps {
  code: string;
  color: string;
  agentId: string;
  clickable?: boolean;
}

export function AgentBadge({ code, color, agentId, clickable = true }: AgentBadgeProps) {
  const content = (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-semibold transition-opacity hover:opacity-80"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {code}
    </span>
  );

  if (clickable) {
    return <Link to={`/agent/${agentId}`}>{content}</Link>;
  }
  return content;
}
