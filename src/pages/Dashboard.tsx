import { GlobalMetrics } from '@/components/dashboard/GlobalMetrics';
import { InstitutionalMetrics } from '@/components/dashboard/InstitutionalMetrics';
import { AgentMap } from '@/components/dashboard/AgentMap';
import { AccreditationGuide } from '@/components/dashboard/AccreditationGuide';
import { ActivityFeedLive } from '@/components/dashboard/ActivityFeedLive';
import { ActionCenter } from '@/components/dashboard/ActionCenter';
import { InfraFooter } from '@/components/dashboard/InfraFooter';
import { PulseWidget } from '@/components/dashboard/PulseWidget';

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <GlobalMetrics />
      <InstitutionalMetrics />
      <AgentMap />
      <PulseWidget />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ActivityFeedLive />
        <AccreditationGuide />
        <ActionCenter />
      </div>
      <InfraFooter />
    </div>
  );
}
