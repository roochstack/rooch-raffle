'use client';

import { useEnvelopeDetail } from '@/hooks/use-envelope-detail';
import EditCoinEnvelopeActivity from '@/components/activity/envelope/edit-coin-envelope-activity';
import EditCoinEnvelopeActivitySkeleton from '@/components/activity/envelope/edit-coin-envelope-activity-sketchlon';
export default function EditEnvelopeActivity(params: { id: string }) {
  const envelopeResp = useEnvelopeDetail(params.id);

  if (envelopeResp.isPending) {
    return <EditCoinEnvelopeActivitySkeleton />;
  }

  if (envelopeResp.data?.assetType === 'coin') {
    return <EditCoinEnvelopeActivity data={envelopeResp.data} />;
  }

  return <div>Not Supported</div>;
}
