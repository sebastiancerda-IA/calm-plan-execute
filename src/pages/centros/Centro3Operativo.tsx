import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CentroOperativo } from '@/components/centros/CentroOperativo';
import { CENTROS_DATA } from '@/data/centros';

export default function Centro3Operativo() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Centros' }, { label: 'Centro-3' }]} />
      <CentroOperativo centro={CENTROS_DATA['centro-3']} />
    </div>
  );
}
