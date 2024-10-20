'use client';

import { formatDate } from 'date-fns';
import { ArrowUpRightIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useClaimRemainingCoin, useClaimRemainingNFT, useEnvelopeDetail, useToast } from '@/hooks';
import { formatRelativeTime } from '@/utils/kit';
import StatusCellContent from '../activity/status-cell-content';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import CoinEnvelopeDetailTable from './coin-envelope-detail-table';
import NftEnvelopeDetailTable from './nft-envelope-detail-table';

interface ManageActivityProps {
  id: string;
}

export function ManageEnvelopeActivity({ id }: ManageActivityProps) {
  const { data: envelopeDetail } = useEnvelopeDetail(id);
  const claimRemainingCoin = useClaimRemainingCoin();
  const claimRemainingNFT = useClaimRemainingNFT();
  const { toast } = useToast();

  if (!envelopeDetail) {
    return <div>Loading...</div>;
  }

  console.log('envelopeDetail', envelopeDetail);

  return (
    <div className="relative pt-14">
      <style jsx global>
        {`
          body {
            background-color: hsl(var(--muted) / 0.4);
          }
        `}
      </style>
      <div className="fixed left-0 top-0 z-[-1] h-44 w-full bg-gradient-to-b from-[#f0f4fa] to-muted/0"></div>
      <div className="mx-auto max-w-5xl space-y-6 p-6 pt-11">
        <div className="flex items-stretch gap-x-6">
          <Image
            alt="raffle cover image"
            className="h-20 w-20 cursor-pointer rounded-md object-cover"
            height="64"
            src={envelopeDetail.coverImageUrl}
            width="64"
          />

          <div className="flex w-full flex-col justify-around">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <h1 className="text-2xl font-bold leading-none">{envelopeDetail?.name}</h1>
                <StatusCellContent status={envelopeDetail.status} />
              </div>
              <Link
                href={`/activities/envelope/${id}`}
                className="inline-flex cursor-pointer items-center justify-center rounded-md border-b border-transparent bg-gray-200/60 px-2.5 py-2 text-sm font-semibold leading-none text-gray-600 transition-all hover:bg-gray-600 hover:text-white"
              >
                <span>Activity Page</span> <ArrowUpRightIcon className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-1.5">
                <Badge variant="secondary" className="px-2">
                  🧧 红包
                </Badge>
                <Badge variant="secondary" className="px-2">
                  {envelopeDetail.assetType === 'coin' ? '🪙 Coin' : '🖼️ NFT'}
                </Badge>
              </div>

              <div
                className="text-sm leading-none text-gray-500"
                title={formatDate(envelopeDetail.createdAt, 'yyyy-MM-dd HH:mm')}
              >
                Created at {formatRelativeTime(envelopeDetail.createdAt, 'hours')}
              </div>
            </div>
          </div>
        </div>
        <Separator />

        {envelopeDetail.status === 'ended' &&
          envelopeDetail.assetType === 'coin' &&
          envelopeDetail.remainingCoin > 0 && (
            <div>
              <Button
                onClick={async () => {
                  try {
                    await claimRemainingCoin({
                      envelopeId: id,
                      coinType: envelopeDetail.coinType,
                    });
                    toast({
                      title: '✅ 退回成功',
                    });
                  } catch (error) {
                    console.error(error);
                    toast({
                      title: '❌ 退回失败',
                    });
                  }
                }}
              >
                退回剩余资金
              </Button>
            </div>
          )}

        {envelopeDetail.status === 'ended' && envelopeDetail.assetType === 'nft' && (
          <div>
            <Button
              onClick={async () => {
                try {
                  await claimRemainingNFT({
                    envelopeId: id,
                    nftType: envelopeDetail.nftType,
                  });
                  toast({
                    title: '✅ 退回成功',
                  });
                } catch (error) {
                  console.error(error);
                  toast({
                    title: '❌ 退回失败',
                  });
                }
              }}
            >
              退回剩余 NFT
            </Button>
          </div>
        )}

        <div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-base/7 font-semibold text-gray-950 sm:text-sm/6">Summary</div>
            <hr className="mt-4 w-full border-t border-gray-950/10" />
            {envelopeDetail.assetType === 'nft' && <NftEnvelopeDetailTable data={envelopeDetail} />}
            {envelopeDetail.assetType === 'coin' && (
              <CoinEnvelopeDetailTable data={envelopeDetail} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
