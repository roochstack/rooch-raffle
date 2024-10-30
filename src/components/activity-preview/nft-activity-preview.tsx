'use client';

import React from 'react';
import { formatDate } from 'date-fns';
import EnvelopeStatusButton from '@/components/activity/envelope-status-button';
import NftRecipientList from '@/components/activity/envelope/nft-recipient-list';
import StatusBadge from '@/components/activity/status-badge';
import { Separator } from '@/components/ui/separator';
import { ActivityStatus } from '@/interfaces';
import PreviewBanner from './preview-banner';
import { useTranslations } from 'next-intl';

interface NFTActivityPreviewProps {
  coverImageUrl?: string | null;
  activityName?: string | null;
  status: ActivityStatus;
  startTime?: Date | null;
  endTime?: Date | null;
  nftCount: number | null;
}

const emptyAddressList: string[] = [];

export default function NFTActivityPreview({
  coverImageUrl,
  activityName,
  status,
  startTime,
  endTime,
  nftCount,
}: NFTActivityPreviewProps) {
  const t = useTranslations('activities.preview');

  return (
    <>
      <PreviewBanner />
      <div className="relative mt-28 flex min-h-[100vh] w-full md:items-center md:justify-center">
        <div
          className="fixed left-0 top-0 h-full w-full bg-cover bg-center opacity-15 blur-[80px] brightness-125 saturate-200"
          style={
            coverImageUrl
              ? {
                backgroundImage: `url(${coverImageUrl})`,
              }
              : {}
          }
        />

        <div className="container flex max-w-5xl flex-col gap-8 px-6 md:mt-[-200px] md:flex-row md:gap-14 xl:gap-20">
          <img
            src={coverImageUrl || '/placeholder.svg'}
            alt="preview-activity"
            className="pointer-events-none z-[-1] h-auto w-full rounded-lg object-cover shadow-xl drop-shadow-lg md:w-1/2 md:max-w-[488px]"
          />

          {/* activity info section */}

          <div className="relative mt-8 flex-grow lg:mt-0">
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h1 className="text-5xl font-bold leading-none text-gray-900">
                    {activityName || t('placeholder.activityName')}
                  </h1>
                </div>

                {/* status section */}

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={status} />
                    <span className="space-x-1.5 text-sm text-gray-500">
                      <span>
                        {startTime ? formatDate(startTime, 'yyyy-MM-dd HH:mm') : t('placeholder.startTime')}
                      </span>
                      <span>-</span>
                      <span>
                        {endTime ? formatDate(endTime, 'yyyy-MM-dd HH:mm') : t('placeholder.endTime')}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="flex items-center space-x-2 text-3xl font-bold leading-none text-gray-900">
                    <span>{t('nft.share')}</span>
                    <span>{nftCount} {t('nft.unit')}</span>
                    <span className="inline-flex items-center gap-1">
                      <span>{t('nft.type')}</span>
                    </span>
                  </h3>
                </div>

                <EnvelopeStatusButton type="not-started" />
              </div>
            </div>

            <Separator className="mb-4 mt-8 bg-gray-300/70 md:mb-6 md:mt-14" />

            <div className="space-y-2">
              <NftRecipientList claimedAddressList={emptyAddressList} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
