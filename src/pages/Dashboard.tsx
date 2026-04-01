import { GlobalMetrics } from '@/components/dashboard/GlobalMetrics';
import { InstitutionalMetrics } from '@/components/dashboard/InstitutionalMetrics';
import { AgentMap } from '@/components/dashboard/AgentMap';
import { AccreditationGuide } from '@/components/dashboard/AccreditationGuide';
import { ActivityFeedLive } from '@/components/dashboard/ActivityFeedLive';
import { ActionCenter } from '@/components/dashboard/ActionCenter';
import { InfraFooter } from '@/components/dashboard/InfraFooter';
import { PulseWidget } from '@/components/dashboard/PulseWidget';
import { DataChecklist } from '@/components/dashboard/DataChecklist';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function Dashboard() {
  const { prefs } = useUserPreferences();
  const w = prefs.visibleWidgets;

  return (
    <div className="space-y-4">
      {w.globalMetrics && <GlobalMetrics />}
      {w.institutionalMetrics && <InstitutionalMetrics />}
      {w.agentMap && <AgentMap />}
      {w.pulse && <PulseWidget />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {w.activityFeed && <ActivityFeedLive />}
        {w.accreditationGuide && <AccreditationGuide />}
        <div className="space-y-4">
          {w.actionCenter && <ActionCenter />}
          {w.dataChecklist && <DataChecklist />}
        </div>
      </div>
      {w.infraFooter && <InfraFooter />}
    </div>
  );
}
