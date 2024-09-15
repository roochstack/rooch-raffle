import { MODULE_ADDRESS } from '@/utils/constants';
import {
  useCreateSessionKey,
  useCurrentSession,
  useCurrentWallet,
} from '@roochnetwork/rooch-sdk-kit';
import { useEffect, useState } from 'react';

export function useAppSession() {
  const sessionKey = useCurrentSession();
  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const [sessionLoading, setSessionLoading] = useState(false);

  const handlerCreateSessionKey = () => {
    if (sessionLoading) {
      return;
    }
    setSessionLoading(true);

    const defaultScopes = [`${MODULE_ADDRESS}::*::*`];
    createSessionKey(
      {
        appName: 'rooch-anki',
        appUrl: 'https://rooch-anki.vercel.app',
        scopes: defaultScopes,
        maxInactiveInterval: 60,
      },
      {
        onSuccess: (result: any) => {
          console.log('session key', result);
        },
        onError: (error: any) => {
          console.error(error);
        },
      }
    ).finally(() => setSessionLoading(false));
  };

  return {
    sessionKey,
    handlerCreateSessionKey,
    sessionLoading,
  };
}

export const useWalletAddress = () => {
  const { wallet } = useCurrentWallet();
  return wallet?.getRoochAddress().toStr() ?? '';
};
