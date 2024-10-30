import { ManageRaffleActivity } from '@/components/activity-manage/manage-raffle-activity';

export default function PreviewPage({ params }: { params: { id: string } }) {
  return <ManageRaffleActivity id={params.id} />;
}
