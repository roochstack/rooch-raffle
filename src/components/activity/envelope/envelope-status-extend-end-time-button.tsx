import { Button } from '@/components/ui/button';
import { LoadingButton, LoadingButtonStatus } from '@/components/ui/loading-button';
import { useTranslations } from 'next-intl';
interface StatusButtonProps {
  type: 'wallet-not-connected' | 'not-owner' | 'ongoing' | 'ended' | 'not-started';
  submitStatus: LoadingButtonStatus;
}

export default function EnvelopeStatusExtendEndTimeButton({
  type,
  submitStatus,
}: StatusButtonProps) {
  const tCommon = useTranslations('common');
  const tButton = useTranslations('activities.envelope.extendEndTime.extendEndTimeButton');

  if (type === 'wallet-not-connected') {
    return (
      <Button size="lg" className="h-12 w-full min-w-[140px] text-base" disabled>
        {tButton('walletNotConnected')}
      </Button>
    );
  }

  if (type === 'not-owner') {
    return (
      <Button size="lg" className="h-12 w-full min-w-[140px] text-base" disabled>
        {tButton('notOwner')}
      </Button>
    );
  }

  if (type === 'ongoing') {
    return (
      <LoadingButton
        type="submit"
        size="lg"
        className="h-12 w-full min-w-[140px] text-base"
        status={submitStatus}
        loadingText={tCommon('loading')}
        successText={tCommon('success')}
        errorText={tCommon('error')}
        successIcon={<span className="mr-2 text-base">✅</span>}
      >
        {tButton('extendEndTime')}
      </LoadingButton>
    );
  }

  if (type === 'ended') {
    return (
      <Button size="lg" className="h-12 w-full min-w-[140px] text-base" disabled>
        {tButton('ended')}
      </Button>
    );
  }

  if (type === 'not-started') {
    return (
      <Button size="lg" className="h-12 w-full min-w-[140px] text-base" disabled>
        {tButton('notStarted')}
      </Button>
    );
  }

  return null;
}
