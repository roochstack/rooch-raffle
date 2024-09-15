'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSession, useWalletHexAddress } from '@/hooks';
import { useEnvelopeNFTs } from '@/hooks/use-envelope-nfts';
import { NFTEnvelopeItem } from '@/interfaces';
import { ENVELOPE_MODULE_NAME, MODULE_ADDRESS } from '@/utils/constants';
import { Args, Transaction } from '@roochnetwork/rooch-sdk';
import { useCurrentWallet, useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { useMemo, useRef, useState } from 'react';
import { Separator } from '../../ui/separator';
import ActivityTime from '../activity-time';
import EnvelopeStatusButton from '../envelope-status-button';
import StatusBadge from '../status-badge';
import NftRecipientList from './nft-recipient-list';
import { CoinImage } from '@/components/coin-image';

interface ActivityProps {
  data: NFTEnvelopeItem;
  onClaimed: () => void;
}

export default function NFTActivity({ data, onClaimed }: ActivityProps) {
  const client = useRoochClient();
  const { sessionOrWallet } = useAppSession();
  const { isConnecting: isWalletConnecting } = useCurrentWallet();
  const walletAddress = useWalletHexAddress();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nftsQueryResult = useEnvelopeNFTs(data.nftListTableHandleId);

  console.log('nftsQueryResult', nftsQueryResult);

  const alreadyClaimed = useMemo(
    () => data.claimedAddressList.includes(walletAddress),
    [data.claimedAddressList]
  );

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center">
      <div
        className="fixed left-0 top-0 h-full w-full bg-cover bg-center opacity-15 blur-[80px] brightness-125 saturate-200"
        style={{
          backgroundImage: `url(${data.coverImageUrl})`,
        }}
      />

      <div className="container mt-16 flex max-w-5xl flex-col px-4 md:mt-[-100px] md:flex-row md:gap-14 md:px-6 xl:gap-20">
        <img
          src={data.coverImageUrl}
          alt="preview-activity"
          className="pointer-events-none z-[-1] mb-8 h-auto w-full rounded-lg object-cover shadow-xl drop-shadow-lg sm:mb-0 md:w-1/2 md:max-w-[488px]"
        />

        {/* activity info section */}

        <div className="relative mt-8 flex-grow lg:mt-0">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold leading-none text-gray-900 sm:text-5xl">
                  {data.name}
                </h1>
              </div>

              {/* status section */}

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <StatusBadge status={data.status} />
                  <ActivityTime
                    startTime={data.startTime}
                    endTime={data.endTime}
                    status={data.status}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h3 className="flex items-center space-x-2 text-3xl font-bold leading-none text-gray-900">
                  <span>瓜分</span>
                  {nftsQueryResult.isPending ? (
                    <Skeleton className="h-[22px] w-full" />
                  ) : (
                    <span>{nftsQueryResult.data!.length} 个</span>
                  )}

                  <span className="inline-flex items-center gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className="cursor-pointer space-x-1 border-b border-dashed border-gray-400 transition-all hover:border-gray-600">
                          <span>NFT</span>
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="w-50 py-3 pl-3 pr-5">
                        <div className="grid gap-4">
                          <div className="space-y-3">
                            {nftsQueryResult.data?.map((nft) => (
                              <div key={nft.id} className="flex items-center">
                                {nft.imageUrl && (
                                  <CoinImage
                                    imageUrl={nft.imageUrl}
                                    className="mr-2 h-8 w-8"
                                  />
                                )}
                                <div>
                                  <div className="leading-none">{nft.name}</div>
                                  <div className="mt-1 text-xs text-gray-500">
                                    {nft.description}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </span>
                </h3>
              </div>

              {isWalletConnecting ? (
                <EnvelopeStatusButton type="waiting" />
              ) : alreadyClaimed ? (
                <EnvelopeStatusButton type="already-claimed" />
              ) : (
                <EnvelopeStatusButton
                  type={data.status}
                  loading={isSubmitting}
                  onClaim={async () => {
                    const tx = new Transaction();
                    tx.callFunction({
                      target: `${MODULE_ADDRESS}::${ENVELOPE_MODULE_NAME}::claim_nft_envelope`,
                      typeArgs: [data.nftType],
                      args: [Args.objectId(data.id)],
                    });
                    try {
                      setIsSubmitting(true);
                      const res = await client.signAndExecuteTransaction({
                        transaction: tx,
                        signer: sessionOrWallet!,
                      });
                      if (res.execution_info.status.type === 'executed') {
                        onClaimed();
                      }
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                />
              )}
            </div>
          </div>

          <Separator className="mb-6 mt-14 bg-gray-300/70" />

          <div className="space-y-2">
            <NftRecipientList claimedAddressList={data.claimedAddressList} />
          </div>
        </div>
      </div>
    </div>
  );
}
