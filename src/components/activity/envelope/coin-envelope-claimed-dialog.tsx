'use client';

import SlotCounter, { SlotCounterRef } from '@/components/slot-counter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useWalletHexAddress } from '@/hooks/app-hooks';
import { CoinMetaInfo } from '@/interfaces';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { ArrowUpRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ClaimedDialogProps {
  open: boolean;
  onClose: () => void;
  claimedAmountFormatted?: string;
  claimedRankPercentage?: number;
  coinInfo?: CoinMetaInfo;
}

export function CoinEnvelopeClaimedDialog({
  open,
  onClose,
  claimedAmountFormatted,
  claimedRankPercentage,
  coinInfo,
}: ClaimedDialogProps) {
  const t = useTranslations('activities.envelope.claimed');
  const [showPercentage, setShowPercentage] = useState(false);
  const slotCounterRef = useRef<SlotCounterRef>(null);
  const walletAddress = useWalletHexAddress();

  const triggerConfetti = useCallback(() => {
    // 首次撒花 - 使用多个配置创建庆祝效果
    // 从中心向四周发散的彩花
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { x: 0.5, y: 0.5 },
      gravity: 0.5,
      ticks: 300,
      colors: ['#FF5252', '#FFD740', '#448AFF', '#69F0AE'],
    });

    // 从顶部散落的彩花
    setTimeout(() => {
      confetti({
        particleCount: 100,
        startVelocity: 30,
        spread: 120,
        origin: { x: 0.5, y: 0 },
        gravity: 1,
        ticks: 200,
        shapes: ['circle', 'square'],
      });
    }, 250);

    // 从左右两侧喷射的彩花
    setTimeout(() => {
      // 左侧
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        ticks: 300,
      });

      // 右侧
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        ticks: 300,
      });
    }, 400);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[350px] p-0 pb-4">
        <>
          <div className="overflow-hidden rounded-2xl text-center">
            <div className="mb-6 bg-gray-50 py-7 text-5xl">🎉</div>

            <h2 className="mb-8 text-2xl font-bold">{t('title')}</h2>
            <div className="mb-8">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">{t('congratulations')}</div>
                <div className="inline-flex h-[30px] items-center justify-center text-3xl/none text-green-500">
                  <div className="flex items-center">
                    {coinInfo?.imageUrl && (
                      <span
                        className="mr-0.5 inline-block h-6 w-6"
                        dangerouslySetInnerHTML={{ __html: coinInfo.imageUrl }}
                      />
                    )}
                    <SlotCounter
                      ref={slotCounterRef}
                      value={claimedAmountFormatted || ''}
                      duration={2}
                      startFromLastDigit
                      animateOnVisible={{
                        triggerOnce: true,
                      }}
                      containerClassName="!flex font-mono font-semibold ml-1"
                      onAnimationEnd={() => {
                        setShowPercentage(true);
                        triggerConfetti();
                      }}
                    />

                    {coinInfo?.symbol && (
                      <span className="flex text-[28px] font-normal tracking-tighter">
                        {' '}
                        {coinInfo.symbol}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'mt-2 text-sm text-gray-500 opacity-0',
                  open && showPercentage && 'opacity-100'
                )}
              >
                {t('topPercentage', { percentage: claimedRankPercentage })}
              </div>
            </div>
          </div>
        </>
        <div className="flex flex-col gap-3 px-6">
          <Button className="w-full" size="lg">
            <a
              href={`https://portal.rooch.network/account/${walletAddress}`}
              className="flex items-center justify-center"
            >
              <span>{t('portalLink')}</span>
              <ArrowUpRightIcon className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
          <Button variant="secondary" className="w-full" onClick={onClose}>
            {t('close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
