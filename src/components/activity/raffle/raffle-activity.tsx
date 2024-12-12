'use client';

import { useAppSession, useRaffleDetail, useWalletHexAddress } from '@/hooks';
import { MODULE_ADDRESS, RAFFLE_MODULE_NAME } from '@/utils/constants';
import { Args, Transaction } from '@roochnetwork/rooch-sdk';
import { useCurrentWallet, useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { Separator } from '../../ui/separator';
import ActivityTime from '../activity-time';
import RaffleRecipientList from '../raffle-recipient-list';
import StatusBadge from '../status-badge';
import RaffleStatusButton from '../raffle-status-button';
import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { Skeleton } from '../../ui/skeleton';
import { useTranslations } from 'next-intl';
import { formatCoverImageUrl } from '@/utils/kit';
interface ActivityProps {
  id: string;
}

export default function RaffleActivity({ id }: ActivityProps) {
  const t = useTranslations();
  const raffleResp = useRaffleDetail(id);
  const client = useRoochClient();
  const { sessionOrWallet } = useAppSession();
  const walletAddress = useWalletHexAddress();
  const { isConnecting: isWalletConnecting } = useCurrentWallet();
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isDescExpandable, setIsDescExpandable] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (descRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(descRef.current).lineHeight);
      const height = descRef.current.clientHeight;
      setIsDescExpandable(height > lineHeight * 3);
    }
  }, [raffleResp.data?.description]);

  const alreadyClaimed = useMemo(() => {
    return raffleResp.data?.claimedAddressList.some((address) => address === walletAddress);
  }, [raffleResp.data?.claimedAddressList, walletAddress]);

  const toggleDescExpand = () => {
    setIsDescExpanded(!isDescExpanded);
  };

  return (
    <div className="relative flex h-[100vh] w-full items-center justify-center">
      <div
        className="fixed left-0 top-0 h-full w-full bg-cover bg-center opacity-15 blur-[80px] brightness-125 saturate-200"
        style={{
          backgroundImage: `url(${formatCoverImageUrl(raffleResp.data?.coverImageUrl || '')})`,
        }}
      />

      <div className="container mt-[-200px] flex max-w-5xl space-x-14 px-6 xl:space-x-20">
        {raffleResp.isLoading ? (
          <Skeleton className="h-[488px] min-w-[488px] rounded-lg object-cover shadow-xl drop-shadow-lg" />
        ) : (
          <img
            src={formatCoverImageUrl(raffleResp.data!.coverImageUrl)}
            alt="preview-activity"
            className="pointer-events-none z-[-1] h-auto w-1/2 rounded-lg object-cover shadow-xl drop-shadow-lg"
          />
        )}

        <div className="relative mt-8 w-full lg:mt-0">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="space-y-3">
                {raffleResp.isLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <h1 className="text-5xl font-bold text-gray-900">{raffleResp.data!.name}</h1>
                )}
              </div>

              {raffleResp.isLoading ? (
                <Skeleton className="h-[22px] w-full" />
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={raffleResp.data!.status} />
                    <ActivityTime
                      startTime={raffleResp.data!.startTime}
                      endTime={raffleResp.data!.endTime}
                      status={raffleResp.data!.status}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <>
                <div>
                  <div
                    ref={descRef}
                    className={cn(`text-primary`, isDescExpanded ? '' : 'line-clamp-3')}
                  >
                    {raffleResp.isLoading ? (
                      <Skeleton className="h-6 w-full" />
                    ) : (
                      raffleResp.data?.description
                    )}
                  </div>
                  {isDescExpandable && (
                    <div className="mt-1 flex items-center gap-4">
                      <Separator className="flex-1 bg-transparent" />
                      {isDescExpanded ? (
                        <span
                          className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground/80"
                          onClick={toggleDescExpand}
                        >
                          {t('activities.raffle.description.collapse')}{' '}
                          <ChevronUpIcon className="h-3 w-3" />
                        </span>
                      ) : (
                        <span
                          className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground"
                          onClick={toggleDescExpand}
                        >
                          {t('activities.raffle.description.expand')}{' '}
                          <ChevronDownIcon className="h-3 w-3" />
                        </span>
                      )}
                      <Separator className="flex-1 bg-transparent" />
                    </div>
                  )}
                </div>

                {raffleResp.isLoading || isWalletConnecting ? (
                  <RaffleStatusButton type="waiting" />
                ) : alreadyClaimed ? (
                  <RaffleStatusButton type="already-claimed" />
                ) : (
                  <RaffleStatusButton
                    type={raffleResp.data!.status}
                    loading={isSubmitting}
                    onClaim={async () => {
                      const tx = new Transaction();
                      tx.callFunction({
                        target: `${MODULE_ADDRESS}::${RAFFLE_MODULE_NAME}::claim_box`,
                        args: [Args.objectId(id)],
                      });
                      try {
                        setIsSubmitting(true);
                        const res = await client.signAndExecuteTransaction({
                          transaction: tx,
                          signer: sessionOrWallet!,
                        });
                        console.log('res', res);
                        raffleResp.refetch();
                      } catch (error) {
                        console.error('Error claiming raffle', error);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  />
                )}
              </>
            </div>
          </div>

          <Separator className="mb-6 mt-14 bg-gray-300/70" />

          <div className="space-y-2">
            {raffleResp.isLoading ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {t('activities.raffle.participants.count')}
                </span>
                <Skeleton className="h-3 w-10" />
              </div>
            ) : (
              <RaffleRecipientList
                claimed={
                  raffleResp.data?.claimedAddressList.map((address) => ({
                    address,
                  })) || []
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
