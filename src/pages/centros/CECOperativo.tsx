import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CentroOperativo } from '@/components/centros/CentroOperativo';
import { CENTROS_DATA } from '@/data/centros';

export default function CECOperativo() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Centros' }, { label: 'CEC' }]} />
      <CentroOperativo centro={CENTROS_DATA['cec']} />
    </div>
  );
}
