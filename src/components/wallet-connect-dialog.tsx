'use client';

import { useWallets } from '@roochnetwork/rooch-sdk-kit';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { WalletRow } from './wallet-row';

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectDialog({ open, onOpenChange }: WalletConnectDialogProps) {
  const wallets = useWallets();
  const t = useTranslations();

  const validWallets = useMemo(() => {
    // waiting issue to be fixed: https://github.com/rooch-network/rooch/issues/2779
    return wallets.slice(0, 3);
  }, [wallets]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            {t('wallet.selectWallet')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-1 py-2">
          {validWallets.map((wallet) => (
            <WalletRow
              key={wallet.getName()}
              wallet={wallet}
              closeModal={() => onOpenChange(false)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 