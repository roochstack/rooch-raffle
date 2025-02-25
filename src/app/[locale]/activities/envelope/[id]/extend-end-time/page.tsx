import ExtendEnvelopeActivityEndTime from '@/components/activity/envelope/extend-envelope-activity-end-time';

export default function ExtendEnvelopeEndTimePage({ params }: { params: { id: string } }) {
  return <ExtendEnvelopeActivityEndTime id={params.id} />;
}
