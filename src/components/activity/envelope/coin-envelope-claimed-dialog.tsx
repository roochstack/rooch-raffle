'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { CoinMetaInfo } from '@/interfaces';
import SlotCounter from 'react-slot-counter';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRightIcon } from 'lucide-react';

interface ClaimedDialogProps {
  open: boolean;
  onClose: () => void;
  claimedAmountFormatted: String | null;
  claimedRankPercentage: number | null;
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
  const [showConfetti, setShowConfetti] = useState(false);

  // 触发撒花效果
  useEffect(() => {
    if (open && showConfetti) {
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
    }
  }, [open, showConfetti]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-none bg-transparent p-0 shadow-none">
        {open && (
          <>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="overflow-hidden rounded-2xl bg-gradient-to-b from-red-50 to-white p-8 text-center shadow-xl"
            >
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="mb-6 text-6xl"
              >
                {coinInfo?.imageUrl ? (
                  <span
                    className="inline-block h-24 w-24"
                    dangerouslySetInnerHTML={{ __html: coinInfo.imageUrl }}
                  />
                ) : (
                  '🎉'
                )}
              </motion.div>

              <h2 className="mb-8 text-2xl font-bold text-red-600">{t('title')}</h2>
              <div className="mb-8 space-y-6">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">{t('congratulations')}</div>
                  <div className="text-3xl font-bold text-red-600">
                    {coinInfo?.symbol && <span>{coinInfo.symbol} </span>}
                    <SlotCounter
                      value={String(claimedAmountFormatted)}
                      duration={2.5}
                      startValue={'0'.repeat(String(claimedAmountFormatted).length)}
                      startFromLastDigit
                      useMonospaceWidth
                      charClassName="font-mono"
                      separatorClassName="font-mono"
                      onAnimationEnd={() => {
                        setShowPercentage(true);
                        setShowConfetti(true);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {open && showPercentage && (
                    <div className="text-sm text-gray-500">
                      {t('topPercentage', { percentage: claimedRankPercentage })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Link
                    href={`/index`}
                    className="inline-flex cursor-pointer items-center justify-center rounded-md border-b border-transparent px-2.5 py-2 text-sm font-semibold leading-none text-gray-600 transition-all hover:bg-gray-600 hover:text-white"
                  >
                    <span>{t('portalLink')}</span>
                    <ArrowUpRightIcon className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={onClose}>
                {t('close')}
              </Button>
            </motion.div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
