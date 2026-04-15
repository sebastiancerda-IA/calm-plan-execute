import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CentroOperativo } from '@/components/centros/CentroOperativo';
import { CENTROS_DATA } from '@/data/centros';

export default function CTSOperativo() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Centros' }, { label: 'CTS' }]} />
      <CentroOperativo centro={CENTROS_DATA['cts']} />
    </div>
  );
}
