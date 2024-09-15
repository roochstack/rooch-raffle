import { useEnvelopeClaimedInfo } from '@/hooks';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface ClaimedCountProps {
  tableHandleId: string;
  className?: string;
}

export function CoinClaimedCount({ tableHandleId, className }: ClaimedCountProps) {
  const { data, isLoading } = useEnvelopeClaimedInfo(tableHandleId);

  if (isLoading) {
    return <Skeleton className={cn('inline-block h-2 w-[30px]', className)} />;
  }

  return <p className={className}>{data.length} 人已参与</p>;
}
