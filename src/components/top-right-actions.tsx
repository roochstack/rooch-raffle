'use client';

import { useAppSession, useWalletHexAddress } from '@/hooks';
import { NETWORK_NAME } from '@/utils/constants';
import {
  useCurrentWallet,
  useWalletStore
} from '@roochnetwork/rooch-sdk-kit';
import { useState } from 'react';
import { HashAvatar } from './hash-avatar';
import { Button } from './ui/button';

import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { WalletConnectDialog } from './wallet-connect-dialog';

export function TopRightActions() {
  const { sessionKey, handlerCreateSessionKey, sessionLoading } = useAppSession();
  const currentWallet = useCurrentWallet();
  const hexAddress = useWalletHexAddress();
  const setWalletDisconnected = useWalletStore((state) => state.setWalletDisconnected);

  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const t = useTranslations();

  return (
    <div className="flex items-center gap-4 text-sm">
      <LanguageSwitcher />
      <div className="cursor-pointer text-foreground/60 hover:text-foreground/80">
        {NETWORK_NAME}
      </div>
      <div>
        {currentWallet.isConnected ? (
          <div className="flex items-center gap-2">
            {sessionKey ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full">
                  <HashAvatar
                    className="h-5 w-5 cursor-pointer rounded-full bg-white transition-all hover:shadow-sm"
                    address={hexAddress}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setWalletDisconnected()}>
                    {t('common.disconnect')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" variant="outline" disabled={sessionLoading} onClick={handlerCreateSessionKey}>
                {t('session.create')}
              </Button>
            )}
          </div>
        ) : currentWallet.isConnecting ? (
          <Button size="sm" disabled>
            {t('common.loading')}
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setConnectModalOpen(true)}>
            {t('common.connect')}
          </Button>
        )}
      </div>
      <WalletConnectDialog
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
      />
    </div>
  );
}
