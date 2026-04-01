import { GlobalMetrics } from '@/components/dashboard/GlobalMetrics';
import { AgentMap } from '@/components/dashboard/AgentMap';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { CNASnapshot } from '@/components/dashboard/CNASnapshot';
import { InfraFooter } from '@/components/dashboard/InfraFooter';
import { PulseWidget } from '@/components/dashboard/PulseWidget';

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <GlobalMetrics />
      <AgentMap />
      <PulseWidget />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityFeed />
        <CNASnapshot />
      </div>
      <InfraFooter />
    </div>
  );
}
