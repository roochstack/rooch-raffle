import { ManageEnvelopeActivity } from '@/components/activity-manage/manage-envelope-activity';

export default function PreviewPage({ params }: { params: { id: string } }) {
  return <ManageEnvelopeActivity id={params.id} />;
}
