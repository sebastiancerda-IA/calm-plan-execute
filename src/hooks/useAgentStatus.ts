import { mockAgents } from '@/data/mockAgents';

export function useAgentStatus() {
  const agents = mockAgents;
  const operativos = agents.filter((a) => a.status === 'operativo').length;
  const total = agents.length;

  return { agents, operativos, total };
}
