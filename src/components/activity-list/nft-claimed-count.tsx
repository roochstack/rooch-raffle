import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface ClaimedCountProps {
  count: number;
  className?: string;
  isLoading?: boolean;
}

export function NFTClaimedCount({ count, isLoading, className }: ClaimedCountProps) {
  if (isLoading) {
    return <Skeleton className={cn('inline-block h-2 w-[30px]', className)} />;
  }

  return <p className={className}>{count} 人已参与</p>;
}
