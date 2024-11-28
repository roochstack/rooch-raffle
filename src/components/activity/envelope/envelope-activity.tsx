'use client';

import CoinActivity from '@/components/activity/envelope/coin-activity';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useEnvelopeDetail } from '@/hooks/use-envelope-detail';
import EnvelopeStatusButton from '../envelope-status-button';
import NFTActivity from './nft-activity';
import { useTranslations } from 'next-intl';


interface ActivityProps {
  id: string;
}

export default function EnvelopeActivity({ id }: ActivityProps) {
  const envelopeResp = useEnvelopeDetail(id);
  const t = useTranslations();

  if (envelopeResp.isPending) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center">
        <div className="fixed left-0 top-0 h-full w-full bg-cover bg-center opacity-15 blur-[80px] brightness-125 saturate-200" />

        <div className="container mt-16 flex max-w-5xl flex-col px-4 md:mt-[-100px] md:flex-row md:gap-14 md:px-6">
          <Skeleton className="md:max-w-[488px]] mb-8 h-auto w-full rounded-lg object-cover shadow-xl drop-shadow-lg sm:mb-0 md:w-1/2" />

          {/* activity info section */}

          <div className="relative mt-8 flex-grow lg:mt-0">
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                </div>

                {/* status section */}

                <Skeleton className="h-[22px] w-full" />
              </div>

              <div className="space-y-4">
                <Skeleton className="h-[31px] w-full" />
                <EnvelopeStatusButton type="waiting" />
              </div>
            </div>

            <Separator className="mb-6 mt-14 bg-gray-300/70" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {t('activities.preview.coin.claimedCount')}
                </span>
                <Skeleton className="h-3 w-10" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {t('activities.preview.coin.claimedAmount')}
                </span>
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (envelopeResp.data?.assetType === 'coin') {
    return (
      <CoinActivity
        data={envelopeResp.data}
        onClaimed={() => {
          return envelopeResp.refetch();
        }}
      />
    );
  }

  if (envelopeResp.data?.assetType === 'nft') {
    return (
      <NFTActivity
        data={envelopeResp.data}
        onClaimed={() => {
          return envelopeResp.refetch();
        }}
      />
    );
  }

  return null;
}
