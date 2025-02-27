'use client';

import { useAppSession, useToast, useWalletHexAddress } from '@/hooks';
import { NETWORK_NAME } from '@/utils/constants';
import { useCurrentWallet, useWalletStore } from '@roochnetwork/rooch-sdk-kit';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';

import { Link } from '@/i18n/routing';
import { CopyIcon, UserRoundIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { WalletConnectDialog } from './wallet-connect-dialog';

export function TopRightActions() {
  const { sessionKey, handlerCreateSessionKey, sessionLoading } = useAppSession();
  const currentWallet = useCurrentWallet();
  const hexAddress = useWalletHexAddress();
  const shortHexAddress = useMemo(
    () => `${hexAddress.slice(0, 6)}...${hexAddress.slice(-4)}`,
    [hexAddress]
  );
  const setWalletDisconnected = useWalletStore((state) => state.setWalletDisconnected);

  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const t = useTranslations();
  const { toast } = useToast();

  return (
    <div className="flex items-center gap-4 text-sm">
      <LanguageSwitcher />
      <div className="text-foreground/60">{NETWORK_NAME}</div>
      <div>
        {currentWallet.isConnected ? (
          <div className="flex items-center gap-2">
            {sessionKey ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full text-foreground/60 transition-all hover:text-foreground/80 hover:shadow-sm">
                    <UserRoundIcon strokeWidth={2} className="h-4 w-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="font-mono text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(hexAddress);
                      toast({
                        title: t('common.copied'),
                      });
                    }}
                  >
                    <div>{shortHexAddress}</div>
                    <CopyIcon className="ml-1 h-3 w-3" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/activities">{t('navigation.myActivities')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setWalletDisconnected()}>
                    {t('common.disconnect')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={sessionLoading}
                onClick={handlerCreateSessionKey}
              >
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
      <WalletConnectDialog open={connectModalOpen} onOpenChange={setConnectModalOpen} />
    </div>
  );
}
