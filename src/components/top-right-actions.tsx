'use client';

import { useAppSession } from '@/hooks';
import { useConnectWallet, useCurrentWallet, useWallets } from '@roochnetwork/rooch-sdk-kit';

export function TopRightActions() {
  const { sessionKey, handlerCreateSessionKey, sessionLoading } = useAppSession();

  const wallets = useWallets();
  const currentWallet = useCurrentWallet();
  const { isConnected } = currentWallet;
  const { mutateAsync: connectWallet } = useConnectWallet();

  return (
    <div className="flex items-center gap-4">
      <div>
        {wallets.length === 0 ? (
          <div>
            <button
              onClick={async () => {
                await connectWallet({
                  wallet: wallets[0],
                });
              }}
            >
              Connect Wallet
            </button>
          </div>
        ) : isConnected ? (
          <div>
            {sessionKey ? (
              <span>{currentWallet.wallet!.getRoochAddress().toHexAddress().slice(0, 8)}</span>
            ) : (
              <button disabled={sessionLoading} onClick={handlerCreateSessionKey}>
                Create Session
              </button>
            )}
          </div>
        ) : (
          <div>
            <button
              onClick={async () => {
                await connectWallet({
                  wallet: wallets[0],
                });
              }}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
