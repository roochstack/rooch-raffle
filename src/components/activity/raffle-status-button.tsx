import { AlarmClockMinusIcon, CircleCheckBigIcon, LoaderCircleIcon } from 'lucide-react';
import ShimmerButton from '../magicui/shimmer-button';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface StatusButtonProps {
  type: 'waiting' | 'already-claimed' | 'not-started' | 'ongoing' | 'ended' | 'all-claimed';
  onClaim?: () => Promise<void>;
  loading?: boolean;
  minLoadingDuration?: number;
}

export default function RaffleStatusButton({
  type,
  onClaim,
  loading,
  minLoadingDuration = 800,
}: StatusButtonProps) {
  const [innerLoading, setInnerLoading] = useState(false);

  useEffect(() => {
    if (loading) {
      setInnerLoading(true);
    } else {
      const timer = setTimeout(() => {
        setInnerLoading(false);
      }, minLoadingDuration);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (innerLoading) {
    return (
      <ShimmerButton borderRadius="6px" className="h-12 w-full text-base font-semibold">
        <LoaderCircleIcon className="mr-1 h-4 w-4 animate-spin" />
        参与中...
      </ShimmerButton>
    );
  }

  if (type === 'waiting') {
    return (
      <Button size="lg" className="h-12 w-full cursor-not-allowed" disabled>
        <LoaderCircleIcon className="mr-1 h-4 w-4 animate-spin" />
        等待中...
      </Button>
    );
  }

  if (type === 'already-claimed') {
    return (
      <Button size="lg" className="h-12 w-full cursor-not-allowed" disabled>
        <CircleCheckBigIcon className="mr-1 h-4 w-4" />
        已参与
      </Button>
    );
  }

  if (type === 'not-started') {
    return (
      <Button size="lg" className="h-12 w-full cursor-not-allowed" disabled>
        <AlarmClockMinusIcon className="mr-1 h-4 w-4" />
        尚未开始
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
        🎁 立即参与
      </ShimmerButton>
    );
  }

  if (type === 'ended') {
    return (
      <Button size="lg" className="h-12 w-full cursor-not-allowed" disabled>
        活动已结束
      </Button>
    );
  }

  if (type === 'all-claimed') {
    return (
      <Button size="lg" className="h-12 w-full cursor-not-allowed" disabled>
        参与人数已满
      </Button>
    );
  }

  return null;
}
