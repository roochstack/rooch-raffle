'use client';

import { useAppSession, useWalletHexAddress } from '@/hooks';
import { NETWORK_NAME } from '@/utils/constants';
import {
  useCurrentWallet,
  useWallets,
  useWalletStore
} from '@roochnetwork/rooch-sdk-kit';
import { useMemo, useState } from 'react';
import { HashAvatar } from './hash-avatar';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { WalletRow } from './wallet-row';

export function TopRightActions() {
  const { sessionKey, handlerCreateSessionKey, sessionLoading } = useAppSession();
  const wallets = useWallets();
  const currentWallet = useCurrentWallet();
  const hexAddress = useWalletHexAddress();
  const setWalletDisconnected = useWalletStore((state) => state.setWalletDisconnected);

  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const validWallets = useMemo(() => {
    // waiting issue to be fixed: https://github.com/rooch-network/rooch/issues/2779
    return wallets.slice(0, 3);
  }, [wallets]);

  return (
    <div className="flex items-center gap-4 text-sm">
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
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" disabled={sessionLoading} onClick={handlerCreateSessionKey}>
                创建 Session
              </Button>
            )}
          </div>
        ) : currentWallet.isConnecting ? (
          <Button size="sm" disabled>
            连接中...
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setConnectModalOpen(true)}>
            连接钱包
          </Button>
        )}
      </div>
      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>

        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-center">选择钱包</DialogTitle>
          </DialogHeader>
          <div className="grid gap-1 py-2">
            {validWallets.map((wallet) => (
              <WalletRow key={wallet.getName()} wallet={wallet} closeModal={() => setConnectModalOpen(false)} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
