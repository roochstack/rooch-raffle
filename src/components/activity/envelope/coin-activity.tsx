'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppSession, useCoinInfo, useEnvelopeClaimedInfo, useWalletHexAddress } from '@/hooks';
import { CoinEnvelopeItem } from '@/interfaces';
import { ENVELOPE_MODULE_NAME, MODULE_ADDRESS } from '@/utils/constants';
import { formatCoinType, formatUnits } from '@/utils/kit';
import { Args, Transaction } from '@roochnetwork/rooch-sdk';
import { useCurrentWallet, useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { useMemo, useState } from 'react';
import { Separator } from '../../ui/separator';
import { Skeleton } from '../../ui/skeleton';
import ActivityTime from '../activity-time';
import EnvelopeRecipientList from '../envelope-recipient-list';
import EnvelopeStatusButton from '../envelope-status-button';
import StatusBadge from '../status-badge';
import { WalletConnectDialog } from '../../wallet-connect-dialog';
interface ActivityProps {
  data: CoinEnvelopeItem;
  onClaimed: () => void;
}

export default function CoinActivity({ data, onClaimed }: ActivityProps) {
  const client = useRoochClient();
  const { sessionKey, sessionOrWallet } = useAppSession();
  const walletAddress = useWalletHexAddress();
  const { isConnecting: isWalletConnecting, isConnected: isWalletConnected } = useCurrentWallet();
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  console.log({ isWalletConnecting, isWalletConnected });

  const coinInfoResp = useCoinInfo(data.coinType);
  const claimedAddressResp = useEnvelopeClaimedInfo(data.claimedAddressTableId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alreadyClaimed = useMemo(() => {
    return claimedAddressResp.data.some((o) => o.address === walletAddress);
  }, [claimedAddressResp.data, walletAddress]);

  const allClaimedAmount = useMemo(() => {
    return claimedAddressResp.data.reduce((acc, cur) => acc + cur.amount, 0);
  }, [claimedAddressResp.data]);

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
                {coinInfoResp.isPending ? (
                  <Skeleton className="h-[30px] w-full" />
                ) : (
                  <h3 className="flex items-center space-x-2 text-3xl font-bold leading-none text-gray-900">
                    <span>瓜分</span>
                    <span>{formatUnits(data.totalCoin, coinInfoResp.data!.decimals)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <span className="cursor-pointer border-b border-dashed border-gray-400 transition-all hover:border-gray-600">
                            {coinInfoResp.data!.symbol}
                          </span>
                        </PopoverTrigger>
                        <PopoverContent className="w-50 p-3">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium leading-none">
                                {coinInfoResp.data!.name}
                              </div>
                              <p className="font-mono text-xs text-muted-foreground">
                                {formatCoinType(coinInfoResp.data!.coinType)}
                              </p>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      {coinInfoResp.data?.imageUrl && (
                        <span
                          className="inline-block h-[26px] w-[26px] overflow-hidden rounded-full"
                          dangerouslySetInnerHTML={{ __html: coinInfoResp.data.imageUrl }}
                        />
                      )}
                    </span>
                  </h3>
                )}
              </div>

              {isWalletConnecting || claimedAddressResp.isLoading || coinInfoResp.isPending ? (
                <EnvelopeStatusButton type="waiting" />
              ) : alreadyClaimed ? (
                <EnvelopeStatusButton type="already-claimed" />
              ) : (
                <EnvelopeStatusButton
                  type={data.status}
                  loading={isSubmitting}
                  onClaim={async () => {
                    if (!isWalletConnected) {
                      setConnectModalOpen(true);
                      throw new Error('Wallet not connected');
                    }
                    const tx = new Transaction();
                    tx.callFunction({
                      target: `${MODULE_ADDRESS}::${ENVELOPE_MODULE_NAME}::claim_coin_envelope`,
                      typeArgs: [data.coinType],
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
                        claimedAddressResp.refetch();
                        coinInfoResp.refetch();
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
            {claimedAddressResp.isLoading || coinInfoResp.isPending ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">已领取人数</span>
                <Skeleton className="h-3 w-10" />
              </div>
            ) : (
              <EnvelopeRecipientList
                claimed={claimedAddressResp.data!}
                coinDecimals={coinInfoResp.data!.decimals}
                coinSymbol={coinInfoResp.data!.symbol}
              />
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">已领取金额</span>
              {coinInfoResp.isPending || claimedAddressResp.isLoading ? (
                <Skeleton className="h-3 w-10" />
              ) : (
                <span className="space-x-1 text-sm leading-none text-gray-500">
                  <span>{formatUnits(allClaimedAmount, coinInfoResp.data!.decimals)}</span>
                  <span>/</span>
                  <span>{formatUnits(data.totalCoin, coinInfoResp.data!.decimals)}</span>
                  <span className="text-xs">{coinInfoResp.data!.symbol}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <WalletConnectDialog open={connectModalOpen} onOpenChange={setConnectModalOpen} />
    </div>
  );
}
