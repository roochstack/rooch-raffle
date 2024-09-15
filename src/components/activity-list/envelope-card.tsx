import { cn } from '@/lib/utils';
import Image from 'next/image';
import { formatDate } from 'date-fns';
import { CoinClaimedCount } from '@/components/activity-list/coin-claimed-count';
import StatusCellContent from '@/components/activity/status-cell-content';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { EnvelopeItem } from '@/interfaces';
import { useRouter } from 'next/navigation';
import { NFTClaimedCount } from '@/components/activity-list/nft-claimed-count';
import { Badge } from '@/components/ui/badge';

interface EnvelopeCardProps {
  envelope: EnvelopeItem;
  className?: string;
}

export const EnvelopeCard = ({ envelope, className }: EnvelopeCardProps) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        'flex cursor-pointer items-center justify-between px-3 py-4 transition-all hover:bg-muted/50',
        className
      )}
      onClick={() => {
        router.push(`/activities/envelope/manage/${envelope.id}`);
      }}
    >
      <div className="flex gap-4">
        <Image
          alt="raffle cover image"
          className="h-20 w-20 rounded-md object-cover"
          height="80"
          src={envelope.coverImageUrl}
          width="80"
        />

        <div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="text-base/6 font-semibold">{envelope.name}</div>
              {envelope.assetType === 'coin' && (
                <Badge variant="outline" className="px-1.5">
                  🪙 Coin
                </Badge>
              )}
              {envelope.assetType === 'nft' && (
                <Badge variant="outline" className="px-1.5">
                  🖼️ NFT
                </Badge>
              )}
            </div>
            <p className="text-xs/6 text-gray-500">
              {envelope.status === 'ongoing'
                ? `started at ${formatDate(envelope.startTime, 'yyyy-MM-dd HH:mm')}`
                : envelope.status === 'not-started'
                  ? `start at ${formatDate(envelope.startTime, 'yyyy-MM-dd HH:mm')}`
                  : envelope.status === 'ended'
                    ? `ended at ${formatDate(envelope.endTime, 'yyyy-MM-dd HH:mm')}`
                    : ''}
            </p>

            {envelope.assetType === 'coin' && (
              <CoinClaimedCount
                tableHandleId={envelope.claimedAddressTableId}
                className="text-xs/6 text-gray-600"
              />
            )}

            {envelope.assetType === 'nft' && (
              <NFTClaimedCount
                count={envelope.claimedAddressList.length}
                className="text-xs/6 text-gray-600"
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusCellContent status={envelope.status} />
        <Button size="icon" variant="ghost">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
