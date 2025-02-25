import EditEnvelopeActivity from '@/components/activity/envelope/edit-envelope-activity';

export default function EditEnvelopePage({ params }: { params: { id: string } }) {
  return <EditEnvelopeActivity id={params.id} />;
}
