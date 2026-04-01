import { lazy, Suspense, memo } from 'react';
import { GlobalMetrics } from '@/components/dashboard/GlobalMetrics';
import { InstitutionalMetrics } from '@/components/dashboard/InstitutionalMetrics';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const AgentMap = lazy(() => import('@/components/dashboard/AgentMap').then(m => ({ default: m.AgentMap })));
const ActivityFeedLive = lazy(() => import('@/components/dashboard/ActivityFeedLive').then(m => ({ default: m.ActivityFeedLive })));
const AccreditationGuide = lazy(() => import('@/components/dashboard/AccreditationGuide').then(m => ({ default: m.AccreditationGuide })));
const ActionCenter = lazy(() => import('@/components/dashboard/ActionCenter').then(m => ({ default: m.ActionCenter })));
const InfraFooter = lazy(() => import('@/components/dashboard/InfraFooter').then(m => ({ default: m.InfraFooter })));
const PulseWidget = lazy(() => import('@/components/dashboard/PulseWidget').then(m => ({ default: m.PulseWidget })));
const DataChecklist = lazy(() => import('@/components/dashboard/DataChecklist').then(m => ({ default: m.DataChecklist })));

function WidgetFallback() {
  return <div className="rounded-lg border border-border bg-card animate-pulse h-24" />;
}

function DashboardInner() {
  const { prefs } = useUserPreferences();
  const w = prefs.visibleWidgets;

  return (
    <div className="space-y-4">
      {w.globalMetrics && <GlobalMetrics />}
      {w.institutionalMetrics && <InstitutionalMetrics />}
      {w.agentMap && (
        <Suspense fallback={<WidgetFallback />}>
          <AgentMap />
        </Suspense>
      )}
      {w.pulse && (
        <Suspense fallback={<WidgetFallback />}>
          <PulseWidget />
        </Suspense>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {w.activityFeed && (
          <Suspense fallback={<WidgetFallback />}>
            <ActivityFeedLive />
          </Suspense>
        )}
        {w.accreditationGuide && (
          <Suspense fallback={<WidgetFallback />}>
            <AccreditationGuide />
          </Suspense>
        )}
        <div className="space-y-4">
          {w.actionCenter && (
            <Suspense fallback={<WidgetFallback />}>
              <ActionCenter />
            </Suspense>
          )}
          {w.dataChecklist && (
            <Suspense fallback={<WidgetFallback />}>
              <DataChecklist />
            </Suspense>
          )}
        </div>
      </div>
      {w.infraFooter && (
        <Suspense fallback={<WidgetFallback />}>
          <InfraFooter />
        </Suspense>
      )}
    </div>
  );
}

export default memo(DashboardInner);
