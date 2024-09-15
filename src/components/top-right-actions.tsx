'use client';

import { useAppSession } from '@/hooks';
import {
  useConnectWallet,
  useCurrentWallet,
  useWallets,
  useWalletStore,
} from '@roochnetwork/rooch-sdk-kit';
import { HashAvatar } from './hash-avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { NETWORK_NAME } from '@/utils/constants';

export function TopRightActions() {
  const { sessionKey, handlerCreateSessionKey, sessionLoading } = useAppSession();
  const wallets = useWallets();
  const currentWallet = useCurrentWallet();
  const { mutateAsync: connectWallet } = useConnectWallet();
  const setWalletDisconnected = useWalletStore((state) => state.setWalletDisconnected);
  const hexAddress = currentWallet.wallet?.getRoochAddress().toHexAddress() || '';

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
          <Button
            size="sm"
            onClick={async () => {
              await connectWallet({
                wallet: wallets[0],
              });
            }}
          >
            连接钱包
          </Button>
        )}
      </div>
    </div>
  );
}
