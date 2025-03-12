import { useTranslations } from 'next-intl';
import confetti from 'canvas-confetti';
import { AlarmClockMinusIcon, CircleCheckBigIcon, LoaderCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import ShimmerButton from '../magicui/shimmer-button';
import { Button } from '../ui/button';

interface StatusButtonProps {
  type: 'waiting' | 'already-claimed' | 'not-started' | 'ongoing' | 'ended' | 'all-claimed';
  onClaim?: () => Promise<void>;
  loading?: boolean;
  minLoadingDuration?: number;
  showClaimedAmount?: boolean;
  claimedAmountFormatted?: string;
  coinInfoSymbol?: string;
}

export default function EnvelopeStatusButton({
  type,
  onClaim,
  loading,
  minLoadingDuration = 800,
  showClaimedAmount = false,
  claimedAmountFormatted,
  coinInfoSymbol,
}: StatusButtonProps) {
  const t = useTranslations('activities.envelope.claimButton');
  const [innerLoading, setInnerLoading] = useState(false);

  useEffect(() => {
    if (loading) {
      setInnerLoading(true);
    } else {
      setTimeout(() => {
        setInnerLoading(false);
      }, minLoadingDuration);
    }
  }, [loading]);

  if (innerLoading) {
    return (
      <ShimmerButton
        borderRadius="6px"
        className="h-12 w-full text-base font-semibold"
        onClick={onClaim}
      >
        <LoaderCircleIcon className="mr-1 h-4 w-4 animate-spin" />
        {t('claiming')}
      </ShimmerButton>
    );
  }

  if (type === 'waiting') {
    return (
      <Button size="lg" className="h-12 w-full cursor-not-allowed" disabled>
        <LoaderCircleIcon className="mr-1 h-4 w-4 animate-spin" />
        {t('waiting')}
      </Button>
    );
  }

  if (type === 'already-claimed') {
    return (
      <Button size="lg" className="h-12 w-full cursor-not-allowed" disabled>
        <CircleCheckBigIcon className="mr-1 h-4 w-4" />
        {showClaimedAmount
          ? t('claimedWithAmount', {
              coinInfoSymbol: coinInfoSymbol,
              amount: claimedAmountFormatted,
            })
          : t('claimed')}
      </Button>
    );
  }

  if (type === 'not-started') {
    return (
      <Button size="lg" className="h-12 w-full cursor-not-allowed" disabled>
        <AlarmClockMinusIcon className="mr-1 h-4 w-4" />
        {t('notStarted')}
      </Button>
    );
  }

  if (type === 'ongoing') {
    return (
      <ShimmerButton
        borderRadius="6px"
        className="h-12 w-full text-base font-semibold"
        onClick={async (event) => {
          await onClaim?.();

          if (event.target instanceof HTMLElement) {
            const rect = event.target.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            confetti({
              spread: 120,
              ticks: 100,
              gravity: 0.5,
              startVelocity: 20,
              particleCount: 50,
              origin: {
                x: x / window.innerWidth,
                y: y / window.innerHeight,
              },
            });
          }
        }}
      >
        {t('claim')}
      </ShimmerButton>
    );
  }

  if (type === 'ended') {
    return (
      <Button size="lg" className="h-12 w-full cursor-not-allowed" disabled>
        {t('ended')}
      </Button>
    );
  }

  if (type === 'all-claimed') {
    return (
      <Button size="lg" className="h-12 w-full cursor-not-allowed" disabled>
        {t('allClaimed')}
      </Button>
    );
  }

  return null;
}
