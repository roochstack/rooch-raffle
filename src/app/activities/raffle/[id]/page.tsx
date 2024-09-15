import RaffleActivity from '@/components/activity/raffle/raffle-activity';

export default function PreviewPage({ params }: { params: { id: string } }) {
  return <RaffleActivity id={params.id} />;
}
