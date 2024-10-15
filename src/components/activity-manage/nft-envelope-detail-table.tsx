import { formatDate } from 'date-fns';
import { NFTEnvelopeItem } from '@/interfaces';
import { formatCoinType } from '@/utils/kit';

interface NFTEnvelopeDetailTableProps {
  data: NFTEnvelopeItem;
}
export default function NFTEnvelopeDetailTable({ data }: NFTEnvelopeDetailTableProps) {
  return (
    <dl className="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm/6">
      <dt className="col-start-1 border-t border-gray-950/5 pt-3 text-gray-500 first:border-none dark:border-white/5 dark:text-gray-400 sm:py-3 sm:dark:border-white/5">
        NFT
      </dt>
      <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-gray-950 dark:text-white sm:py-3 dark:sm:border-white/5">
        {formatCoinType(data.nftType)}
      </dd>
      <dt className="col-start-1 border-t border-gray-950/5 pt-3 text-gray-500 first:border-none dark:border-white/5 dark:text-gray-400 sm:py-3 sm:dark:border-white/5">
        Created at
      </dt>
      <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-gray-950 dark:text-white sm:border-t sm:border-gray-950/5 sm:py-3 dark:sm:border-white/5">
        {formatDate(data.createdAt, 'yyyy-MM-dd HH:mm:ss')}
      </dd>
      <dt className="col-start-1 border-t border-gray-950/5 pt-3 text-gray-500 first:border-none dark:border-white/5 dark:text-gray-400 sm:border-t sm:border-gray-950/5 sm:py-3 sm:dark:border-white/5">
        Start time
      </dt>
      <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-gray-950 dark:text-white sm:border-t sm:border-gray-950/5 sm:py-3 dark:sm:border-white/5">
        {formatDate(data.startTime, 'yyyy-MM-dd HH:mm:ss')}
      </dd>
      <dt className="col-start-1 border-t border-gray-950/5 pt-3 text-gray-500 first:border-none dark:border-white/5 dark:text-gray-400 sm:border-t sm:border-gray-950/5 sm:py-3 sm:dark:border-white/5">
        End time
      </dt>
      <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-gray-950 dark:text-white sm:border-t sm:border-gray-950/5 sm:py-3 dark:sm:border-white/5">
        {formatDate(data.endTime, 'yyyy-MM-dd HH:mm:ss')}
      </dd>
    </dl>
  );
}
