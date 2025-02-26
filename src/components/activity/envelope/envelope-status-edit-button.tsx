import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LoadingButton, LoadingButtonStatus } from '@/components/ui/loading-button';

interface StatusButtonProps {
  type: 'not-owner' | 'ongoing' | 'ended' | 'not-started' | 'wallet-not-connected';
  submitStatus: LoadingButtonStatus;
}

export default function EnvelopeStatusEditButton({ type, submitStatus }: StatusButtonProps) {
  const t = useTranslations();

  if (type === 'wallet-not-connected') {
    return (
      <Button size="lg" className="h-12 w-full min-w-[140px] text-base" disabled>
        {t('activities.envelope.edit.editButton.walletNotConnected')}
      </Button>
    );
  }

  if (type === 'not-owner') {
    return (
      <Button size="lg" className="h-12 w-full min-w-[140px] text-base" disabled>
        {t('activities.envelope.edit.editButton.notOwner')}
      </Button>
    );
  }

  if (type === 'ended') {
    return (
      <Button size="lg" className="h-12 w-full min-w-[140px] text-base" disabled>
        {t('activities.envelope.edit.editButton.ended')}
      </Button>
    );
  }

  if (type === 'not-started' || type === 'ongoing') {
    return (
      <LoadingButton
        type="submit"
        size="lg"
        className="h-12 w-full min-w-[140px] text-base"
        status={submitStatus}
        loadingText={t('common.loading')}
        successText={t('common.success')}
        errorText={t('common.error')}
        successIcon={<span className="mr-2 text-base">✅</span>}
      >
        {t('activities.envelope.edit.editButton.edit')}
      </LoadingButton>
    );
  }

  return null;
}
