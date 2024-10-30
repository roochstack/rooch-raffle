import EnvelopeActivity from '@/components/activity/envelope/envelope-activity';

export default function PreviewPage({ params }: { params: { id: string } }) {
  return <EnvelopeActivity id={params.id} />;
}
