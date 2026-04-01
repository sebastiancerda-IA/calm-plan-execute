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
const DashboardAnalytics = lazy(() => import('@/components/dashboard/DashboardAnalytics').then(m => ({ default: m.DashboardAnalytics })));

function WidgetFallback() {
  return (
    <div className="glass-card rounded-lg p-4 space-y-3">
      <div className="h-3 w-20 rounded bg-muted" style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, hsl(var(--idma-green) / 0.08) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
      <div className="h-6 w-32 rounded bg-muted" style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, hsl(var(--idma-green) / 0.08) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
    </div>
  );
}

function DashboardInner() {
  const { prefs } = useUserPreferences();
  const w = prefs.visibleWidgets;

  return (
    <div className="space-y-4">
      <WelcomeCard />
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
      <Suspense fallback={<WidgetFallback />}>
        <DashboardAnalytics />
      </Suspense>
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
