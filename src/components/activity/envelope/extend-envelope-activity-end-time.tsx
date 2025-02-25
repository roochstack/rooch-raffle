'use client';

import { useEnvelopeDetail } from '@/hooks/use-envelope-detail';
import ExtendCoinEnvelopeEndTimePage from './extend-coin-envelope-activity-end-time';

export default function ExtendEnvelopeActivityEndTime(params: { id: string }) {
  const envelopeResp = useEnvelopeDetail(params.id);

  if (envelopeResp.isPending) {
    return <div>Loading</div>;
  }

  if (envelopeResp.data?.assetType === 'coin') {
    return <ExtendCoinEnvelopeEndTimePage data={envelopeResp.data} />;
  }

  return <div>Not Supported</div>;
}
